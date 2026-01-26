import { scrapeItemBases } from "./scrape-items.js";
import { scrapeModifiers } from "./scrape-modifiers.js";
import { scrapeCurrency } from "./scrape-currency.js";

async function main() {
  console.log("Crafterix Data Scraper");
  console.log("======================\n");

  const args = process.argv.slice(2);
  const target = args[0] || "all";

  try {
    if (target === "all" || target === "items") {
      console.log("Scraping item bases...");
      await scrapeItemBases();
    }

    if (target === "all" || target === "mods") {
      console.log("Scraping modifiers...");
      await scrapeModifiers();
    }

    if (target === "all" || target === "currency") {
      console.log("Scraping currency...");
      await scrapeCurrency();
    }

    console.log("\nScraping complete!");
  } catch (error) {
    console.error("Scraping failed:", error);
    process.exit(1);
  }
}

main();
