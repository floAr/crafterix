import * as fs from "fs/promises";
import * as path from "path";
import type { ItemBase } from "@crafterix/data";

const OUTPUT_DIR = path.join(import.meta.dirname, "../../data/data/items");

export async function scrapeItemBases(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // TODO: Implement actual scraping from poe2db.tw
  // For MVP: Focus on Body Armour (str)

  const placeholder: ItemBase[] = [
    {
      id: "plate_vest",
      name: "Plate Vest",
      category: "body_armour",
      attribute: "str",
      itemLevel: 1,
      requiredLevel: 1,
      implicitMods: [],
      affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
      tags: ["body_armour", "armour", "str_armour"],
    },
  ];

  const outputPath = path.join(OUTPUT_DIR, "body-armour-str.json");
  await fs.writeFile(outputPath, JSON.stringify(placeholder, null, 2));
  console.log(`  Wrote ${outputPath}`);
}
