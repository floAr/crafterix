import * as fs from "fs/promises";
import * as path from "path";
import puppeteer from "puppeteer";
import type { Modifier, ModifierTier, ModifierType, ModifierDomain } from "@crafterix/data";

const OUTPUT_DIR = path.join(import.meta.dirname, "../../data/data/modifiers");
const BASE_URL = "https://poe2db.tw/us";

// All item categories to scrape from poe2db
const ITEM_CATEGORIES: Record<string, string[]> = {
  // One-handed weapons
  one_hand_weapon: [
    "Claws",
    "Daggers",
    "Wands",
    "One_Hand_Swords",
    "One_Hand_Axes",
    "One_Hand_Maces",
    "Sceptres",
    "Spears",
    "Flails",
  ],
  // Two-handed weapons
  two_hand_weapon: [
    "Bows",
    "Staves",
    "Two_Hand_Swords",
    "Two_Hand_Axes",
    "Two_Hand_Maces",
    "Quarterstaves",
    "Crossbows",
  ],
  // Armor - body
  body_armour: [
    "Body_Armours_str",
    "Body_Armours_dex",
    "Body_Armours_int",
    "Body_Armours_str_dex",
    "Body_Armours_str_int",
    "Body_Armours_dex_int",
  ],
  // Armor - helmet
  helmet: [
    "Helmets_str",
    "Helmets_dex",
    "Helmets_int",
    "Helmets_str_dex",
    "Helmets_str_int",
    "Helmets_dex_int",
  ],
  // Armor - gloves
  gloves: [
    "Gloves_str",
    "Gloves_dex",
    "Gloves_int",
    "Gloves_str_dex",
    "Gloves_str_int",
    "Gloves_dex_int",
  ],
  // Armor - boots
  boots: [
    "Boots_str",
    "Boots_dex",
    "Boots_int",
    "Boots_str_dex",
    "Boots_str_int",
    "Boots_dex_int",
  ],
  // Shields
  shield: [
    "Shields_str",
    "Shields_str_dex",
    "Shields_str_int",
    "Bucklers",
  ],
  // Off-hand
  quiver: ["Quivers"],
  focus: ["Foci"],
  // Jewelry
  amulet: ["Amulets"],
  ring: ["Rings"],
  belt: ["Belts"],
  // Other
  jewel: ["Jewel"],
  flask: ["Life_Flasks", "Mana_Flasks"],
};

// Raw mod entry from poe2db
interface RawModEntry {
  Name: string;
  Level: string;
  ModGenerationTypeID: string;
  str: string;
  ModFamilyList?: string[];
  mod_no?: string;
  DropChance?: string;
  hover?: string;
}

// Parsed mod with extracted values
interface ParsedModTier {
  name: string;
  requiredLevel: number;
  type: ModifierType;
  displayTemplate: string;
  values: { min: number; max: number }[];
  group: string;
  tags: string[];
  weight: number;
}

/**
 * Extract the display template by replacing numeric ranges with #
 * e.g., "+5—8 to Dexterity" -> "+# to Dexterity"
 */
function extractDisplayTemplate(str: string): { template: string; values: { min: number; max: number }[] } {
  // Remove HTML tags
  const clean = str.replace(/<[^>]+>/g, "").trim();

  // Match patterns like "5—8" or "5-8" or just "5"
  const rangePattern = /(\d+(?:\.\d+)?)\s*[—–-]\s*(\d+(?:\.\d+)?)/g;
  const singlePattern = /(?<!\d[—–-])(\d+(?:\.\d+)?)(?![—–-]\d)/g;

  const values: { min: number; max: number }[] = [];
  let template = clean;

  // First extract ranges
  let match;
  while ((match = rangePattern.exec(clean)) !== null) {
    values.push({
      min: parseFloat(match[1]),
      max: parseFloat(match[2]),
    });
  }

  // Replace ranges with #
  template = template.replace(rangePattern, "#");

  // If no ranges found, look for single values (but be careful with level numbers, etc.)
  if (values.length === 0) {
    const singleMatches = clean.match(singlePattern);
    if (singleMatches) {
      for (const m of singleMatches) {
        const val = parseFloat(m);
        values.push({ min: val, max: val });
      }
      template = template.replace(singlePattern, "#");
    }
  }

  return { template, values };
}

/**
 * Extract tags from mod_no HTML string
 */
function extractTags(modNo: string | undefined): string[] {
  if (!modNo) return [];

  // Extract text from badge spans
  const tagPattern = /<span[^>]*>([^<]+)<\/span>/g;
  const tags: string[] = [];
  let match;

  while ((match = tagPattern.exec(modNo)) !== null) {
    tags.push(match[1].toLowerCase().replace(/\s+/g, "_"));
  }

  return tags;
}

/**
 * Parse weight from DropChance (can be string or number)
 */
function parseWeight(dropChance: string | number | undefined): number {
  if (dropChance === undefined || dropChance === null) return 1000;

  // Handle numeric values directly
  if (typeof dropChance === "number") {
    return Math.round(dropChance) || 1000;
  }

  // Handle string values
  const num = parseFloat(String(dropChance).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 1000 : Math.round(num) || 1000;
}

/**
 * Generate a stable ID from mod name and group
 */
function generateModId(name: string, group: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${cleanName}_${group.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`.substring(0, 64);
}

/**
 * Scrape mods from a single category page
 */
async function scrapeCategoryPage(
  browser: puppeteer.Browser,
  category: string,
  itemTag: string
): Promise<ParsedModTier[]> {
  const page = await browser.newPage();
  const url = `${BASE_URL}/${category}`;

  console.log(`  Fetching ${url}...`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the ModsView to be initialized
    await page.waitForFunction(
      () => typeof (window as any).ModsViewData !== "undefined" || document.querySelector(".mod-table"),
      { timeout: 10000 }
    ).catch(() => {
      // ModsView might be initialized differently
    });

    // Extract the mod data from the page by finding and parsing the ModsView config
    const rawMods = await page.evaluate(() => {
      const results: any[] = [];

      // Find script tags containing ModsView
      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        const content = script.textContent || "";

        // Look for the "normal" array in ModsView config
        // Pattern: "normal":[{...},{...}]
        const normalMatch = content.match(/"normal"\s*:\s*\[([\s\S]*?)\]\s*,\s*"(?:corrupted|desecrated|essence|icon)/);
        if (normalMatch) {
          try {
            // The array content - wrap it back in brackets and parse
            const arrayContent = "[" + normalMatch[1] + "]";

            // Clean up common JS-to-JSON issues
            const cleaned = arrayContent
              // Already has double quotes around keys from the source
              .replace(/,\s*}/g, "}") // Remove trailing commas in objects
              .replace(/,\s*\]/g, "]"); // Remove trailing commas in arrays

            const mods = JSON.parse(cleaned);
            results.push(...mods);
          } catch (e) {
            console.log("Parse error for normal array:", e);
          }
        }
      }

      return results;
    });

    // Parse the raw mods
    const parsedMods: ParsedModTier[] = [];

    for (const raw of rawMods as RawModEntry[]) {
      const { template, values } = extractDisplayTemplate(raw.str || "");

      if (!template || values.length === 0) continue;

      const modType: ModifierType = raw.ModGenerationTypeID === "2" ? "suffix" : "prefix";
      const group = raw.ModFamilyList?.[0] || raw.Name || "unknown";

      parsedMods.push({
        name: raw.Name || "Unknown",
        requiredLevel: parseInt(raw.Level) || 1,
        type: modType,
        displayTemplate: template,
        values,
        group,
        tags: extractTags(raw.mod_no),
        weight: parseWeight(raw.DropChance),
      });
    }

    return parsedMods;
  } catch (error) {
    console.error(`  Error scraping ${category}:`, error);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Group parsed mod tiers into Modifier objects
 */
function groupModTiers(
  parsedTiers: ParsedModTier[],
  itemTag: string
): Modifier[] {
  // Group by display template + type + group (these define a unique mod)
  const modGroups = new Map<string, ParsedModTier[]>();

  for (const tier of parsedTiers) {
    const key = `${tier.type}|${tier.group}|${tier.displayTemplate}`;
    const existing = modGroups.get(key) || [];
    existing.push(tier);
    modGroups.set(key, existing);
  }

  const modifiers: Modifier[] = [];

  for (const [key, tiers] of modGroups) {
    // Sort tiers by required level (descending for tier numbering)
    tiers.sort((a, b) => b.requiredLevel - a.requiredLevel);

    const firstTier = tiers[0];
    const modId = generateModId(firstTier.name, firstTier.group);

    // Determine domain
    let domain: ModifierDomain = "item";
    if (itemTag === "flask") domain = "flask";
    if (itemTag === "jewel") domain = "jewel";

    // Collect all unique tags
    const allTags = new Set<string>();
    for (const t of tiers) {
      for (const tag of t.tags) {
        allTags.add(tag);
      }
    }

    const modifier: Modifier = {
      id: modId,
      name: firstTier.name,
      displayName: firstTier.displayTemplate,
      type: firstTier.type,
      domain,
      group: firstTier.group,
      tags: Array.from(allTags),
      applicableTo: [itemTag],
      tiers: tiers.map((t, idx): ModifierTier => ({
        tier: idx + 1,
        requiredLevel: t.requiredLevel,
        weight: t.weight,
        values: t.values,
      })),
    };

    modifiers.push(modifier);
  }

  return modifiers;
}

/**
 * Merge modifiers across categories (same mod can apply to multiple item types)
 */
function mergeModifiers(allMods: Modifier[]): Modifier[] {
  const mergedMap = new Map<string, Modifier>();

  for (const mod of allMods) {
    // Use displayName + type + group as merge key
    const mergeKey = `${mod.type}|${mod.group}|${mod.displayName}`;

    const existing = mergedMap.get(mergeKey);
    if (existing) {
      // Merge applicableTo arrays
      const newApplicableTo = new Set([...existing.applicableTo, ...mod.applicableTo]);
      existing.applicableTo = Array.from(newApplicableTo);

      // Merge tags
      const newTags = new Set([...existing.tags, ...mod.tags]);
      existing.tags = Array.from(newTags);
    } else {
      mergedMap.set(mergeKey, { ...mod });
    }
  }

  return Array.from(mergedMap.values());
}

export async function scrapeModifiers(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const allModifiers: Modifier[] = [];

    // Scrape each category
    for (const [itemTag, categories] of Object.entries(ITEM_CATEGORIES)) {
      console.log(`\nScraping ${itemTag} categories...`);

      for (const category of categories) {
        const parsed = await scrapeCategoryPage(browser, category, itemTag);
        const grouped = groupModTiers(parsed, itemTag);
        allModifiers.push(...grouped);

        console.log(`    ${category}: ${grouped.length} modifiers`);
      }
    }

    // Merge modifiers that appear across multiple item types
    const merged = mergeModifiers(allModifiers);
    console.log(`\nTotal unique modifiers: ${merged.length}`);

    // Write all modifiers to a single file
    const outputPath = path.join(OUTPUT_DIR, "all-modifiers.json");
    await fs.writeFile(outputPath, JSON.stringify(merged, null, 2));
    console.log(`Wrote ${outputPath}`);

    // Also write per-category files for convenience
    const byCategory = new Map<string, Modifier[]>();
    for (const mod of merged) {
      for (const itemTag of mod.applicableTo) {
        const list = byCategory.get(itemTag) || [];
        list.push(mod);
        byCategory.set(itemTag, list);
      }
    }

    for (const [itemTag, mods] of byCategory) {
      const catPath = path.join(OUTPUT_DIR, `${itemTag}.json`);
      await fs.writeFile(catPath, JSON.stringify(mods, null, 2));
      console.log(`Wrote ${catPath} (${mods.length} modifiers)`);
    }

  } finally {
    await browser.close();
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeModifiers().catch(console.error);
}
