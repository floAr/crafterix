import * as fs from "fs/promises";
import * as path from "path";
import puppeteer from "puppeteer";

const OUTPUT_DIR = path.join(import.meta.dirname, "../../data/data/currency");
const IMAGES_DIR = path.join(import.meta.dirname, "../../data/assets/currency");
const BASE_URL = "https://poe2db.tw/us";

// All currency items to scrape
const CURRENCIES = {
  // Basic Orbs
  orbs: [
    "Orb_of_Transmutation",
    "Greater_Orb_of_Transmutation",
    "Perfect_Orb_of_Transmutation",
    "Orb_of_Augmentation",
    "Greater_Orb_of_Augmentation",
    "Perfect_Orb_of_Augmentation",
    "Orb_of_Alchemy",
    "Orb_of_Chance",
    "Regal_Orb",
    "Greater_Regal_Orb",
    "Perfect_Regal_Orb",
    "Exalted_Orb",
    "Greater_Exalted_Orb",
    "Perfect_Exalted_Orb",
    "Orb_of_Annulment",
    "Chaos_Orb",
    "Greater_Chaos_Orb",
    "Perfect_Chaos_Orb",
    "Divine_Orb",
    "Vaal_Orb",
    "Orb_of_Alteration",
    "Blessed_Orb",
    "Gemcutter's_Prism",
    "Glassblower's_Bauble",
    "Armourer's_Scrap",
    "Blacksmith's_Whetstone",
    "Jeweller's_Orb",
    "Orb_of_Binding",
    "Orb_of_Horizons",
    "Orb_of_Scouring",
  ],

  // Essences
  essences: [
    // Lesser
    "Lesser_Essence_of_the_Body",
    "Lesser_Essence_of_the_Mind",
    "Lesser_Essence_of_Enhancement",
    "Lesser_Essence_of_Abrasion",
    "Lesser_Essence_of_Flames",
    "Lesser_Essence_of_Ice",
    "Lesser_Essence_of_Electricity",
    "Lesser_Essence_of_Ruin",
    "Lesser_Essence_of_Battle",
    "Lesser_Essence_of_Sorcery",
    "Lesser_Essence_of_Haste",
    "Lesser_Essence_of_the_Infinite",
    "Lesser_Essence_of_Seeking",
    "Lesser_Essence_of_Insulation",
    "Lesser_Essence_of_Thawing",
    "Lesser_Essence_of_Grounding",
    "Lesser_Essence_of_Alacrity",
    "Lesser_Essence_of_Opulence",
    "Lesser_Essence_of_Command",
    // Normal
    "Essence_of_the_Body",
    "Essence_of_the_Mind",
    "Essence_of_Enhancement",
    "Essence_of_Abrasion",
    "Essence_of_Flames",
    "Essence_of_Ice",
    "Essence_of_Electricity",
    "Essence_of_Ruin",
    "Essence_of_Battle",
    "Essence_of_Sorcery",
    "Essence_of_Haste",
    "Essence_of_the_Infinite",
    "Essence_of_Seeking",
    "Essence_of_Insulation",
    "Essence_of_Thawing",
    "Essence_of_Grounding",
    "Essence_of_Alacrity",
    "Essence_of_Opulence",
    "Essence_of_Command",
    // Greater
    "Greater_Essence_of_the_Body",
    "Greater_Essence_of_the_Mind",
    "Greater_Essence_of_Enhancement",
    "Greater_Essence_of_Abrasion",
    "Greater_Essence_of_Flames",
    "Greater_Essence_of_Ice",
    "Greater_Essence_of_Electricity",
    "Greater_Essence_of_Ruin",
    "Greater_Essence_of_Battle",
    "Greater_Essence_of_Sorcery",
    "Greater_Essence_of_Haste",
    "Greater_Essence_of_the_Infinite",
    "Greater_Essence_of_Seeking",
    "Greater_Essence_of_Insulation",
    "Greater_Essence_of_Thawing",
    "Greater_Essence_of_Grounding",
    "Greater_Essence_of_Alacrity",
    "Greater_Essence_of_Opulence",
    "Greater_Essence_of_Command",
    // Perfect
    "Perfect_Essence_of_the_Body",
    "Perfect_Essence_of_the_Mind",
    "Perfect_Essence_of_Enhancement",
    "Perfect_Essence_of_Abrasion",
    "Perfect_Essence_of_Flames",
    "Perfect_Essence_of_Ice",
    "Perfect_Essence_of_Electricity",
    "Perfect_Essence_of_Ruin",
    "Perfect_Essence_of_Battle",
    "Perfect_Essence_of_Sorcery",
    "Perfect_Essence_of_Haste",
    "Perfect_Essence_of_the_Infinite",
    "Perfect_Essence_of_Seeking",
    "Perfect_Essence_of_Insulation",
    "Perfect_Essence_of_Thawing",
    "Perfect_Essence_of_Grounding",
    "Perfect_Essence_of_Alacrity",
    "Perfect_Essence_of_Opulence",
    "Perfect_Essence_of_Command",
    // Corrupted
    "Essence_of_Hysteria",
    "Essence_of_Delirium",
    "Essence_of_Horror",
    "Essence_of_Insanity",
    "Essence_of_the_Abyss",
  ],

  // Omens
  omens: [
    "Omen_of_Sinistral_Alchemy",
    "Omen_of_Dextral_Alchemy",
    "Omen_of_Amelioration",
    "Omen_of_Whittling",
    "Omen_of_Resurgence",
    "Omen_of_Greater_Exaltation",
    "Omen_of_the_Ancients",
    "Omen_of_Refreshment",
    "Omen_of_Connections",
    "Omen_of_Jewellery",
    "Omen_of_Abyssal_Echoes",
    "Omen_of_Blanching",
    "Omen_of_Fortune",
    "Omen_of_Corruption",
    "Omen_of_Soul_Rending",
    "Omen_of_Annihilation",
  ],
};

interface CurrencyInfo {
  id: string;
  name: string;
  imageUrl: string | null;
  localImage: string | null;
}

/**
 * Extract image URL from a currency page
 */
async function extractImageUrl(
  page: puppeteer.Page,
  currencyId: string
): Promise<string | null> {
  const url = `${BASE_URL}/${currencyId}`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Find the image URL - usually in an img tag with cdn.poe2db.tw
    const imageUrl = await page.evaluate(() => {
      // Look for images with the CDN URL
      const imgs = document.querySelectorAll('img[src*="cdn.poe2db.tw"]');
      for (const img of imgs) {
        const src = img.getAttribute("src");
        if (src && src.includes("/2DItems/")) {
          return src;
        }
      }

      // Also check for data-src (lazy loading)
      const lazyImgs = document.querySelectorAll('img[data-src*="cdn.poe2db.tw"]');
      for (const img of lazyImgs) {
        const src = img.getAttribute("data-src");
        if (src && src.includes("/2DItems/")) {
          return src;
        }
      }

      return null;
    });

    return imageUrl;
  } catch (error) {
    console.error(`  Error extracting image for ${currencyId}:`, error);
    return null;
  }
}

/**
 * Download an image from URL to local file
 */
async function downloadImage(
  imageUrl: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`  Failed to download: ${response.status}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`  Download error:`, error);
    return false;
  }
}

/**
 * Convert currency ID to a clean filename
 */
function toFilename(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function scrapeCurrency(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    const allCurrencies: CurrencyInfo[] = [];

    // Process each category
    for (const [category, items] of Object.entries(CURRENCIES)) {
      console.log(`\nScraping ${category}...`);

      for (const itemId of items) {
        process.stdout.write(`  ${itemId}... `);

        const imageUrl = await extractImageUrl(page, itemId);

        let localImage: string | null = null;

        if (imageUrl) {
          // Determine file extension from URL
          const ext = imageUrl.endsWith(".webp") ? "webp" : "png";
          const filename = `${toFilename(itemId)}.${ext}`;
          const outputPath = path.join(IMAGES_DIR, filename);

          const success = await downloadImage(imageUrl, outputPath);
          if (success) {
            localImage = `assets/currency/${filename}`;
            console.log(`OK (${filename})`);
          } else {
            console.log("download failed");
          }
        } else {
          console.log("no image found");
        }

        allCurrencies.push({
          id: toFilename(itemId),
          name: itemId.replace(/_/g, " "),
          imageUrl,
          localImage,
        });
      }
    }

    // Write currency info JSON
    const outputPath = path.join(OUTPUT_DIR, "currency-images.json");
    await fs.writeFile(outputPath, JSON.stringify(allCurrencies, null, 2));
    console.log(`\nWrote ${outputPath}`);

    // Summary
    const withImages = allCurrencies.filter((c) => c.localImage).length;
    console.log(`\nDownloaded ${withImages}/${allCurrencies.length} images`);

  } finally {
    await browser.close();
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeCurrency().catch(console.error);
}
