import { Part1PasswordAnalysis } from "./part1-analysis";
import { Part2PasswordGeneration } from "./part2-password-generation";
import { DataFetcher } from "./data/dataFetcher";
import * as fs from "fs";

/**
 * Main application for Password Analysis and Generation
 * Supports both Part 1 (Analysis) and Part 2 (Generation)
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "part1";

  // Check if CSV files exist, if not, fetch data automatically
  const csvFiles = fs
    .readdirSync(".")
    .filter((file) => file.startsWith("pwlds_") && file.endsWith(".csv"))
    .sort();

  if (csvFiles.length === 0) {
    console.log(
      "📥 No pwlds CSV files found. Automatically fetching data from GitHub..."
    );
    console.log("🌐 Source: https://github.com/infinitode/pwlds");

    try {
      const dataFetcher = new DataFetcher();
      await dataFetcher.fetchAndCombineData();
      console.log("✅ Data successfully fetched and combined!");
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      console.log("\nManual download commands:");
      console.log(
        "curl -o pwlds_very_weak.csv https://raw.githubusercontent.com/infinitode/pwlds/main/pwlds_very_weak.csv"
      );
      console.log(
        "curl -o pwlds_weak.csv https://raw.githubusercontent.com/infinitode/pwlds/main/pwlds_weak.csv"
      );
      console.log(
        "curl -o pwlds_average.csv https://raw.githubusercontent.com/infinitode/pwlds/main/pwlds_average.csv"
      );
      console.log(
        "curl -o pwlds_strong.csv https://raw.githubusercontent.com/infinitode/pwlds/main/pwlds_strong.csv"
      );
      console.log(
        "curl -o pwlds_very_strong.csv https://raw.githubusercontent.com/infinitode/pwlds/main/pwlds_very_strong.csv"
      );
      return;
    }
  }

  switch (command.toLowerCase()) {
    case "part1":
    case "analysis":
      console.log("🔍 Running Part 1: Password Database Analysis");
      const analyzer = new Part1PasswordAnalysis();
      await analyzer.runCombinedAnalysis();
      break;

    case "part2":
    case "generation":
      console.log("🔐 Running Part 2: Password Generation Analysis");
      const generator = new Part2PasswordGeneration();
      await generator.runPasswordGenerationAnalysis();
      break;

    case "both":
    case "all":
      console.log("🚀 Running Both Parts: Analysis and Generation");
      console.log("\n" + "=".repeat(60));
      console.log("PART 1: PASSWORD DATABASE ANALYSIS");
      console.log("=".repeat(60));
      const analyzer1 = new Part1PasswordAnalysis();
      await analyzer1.runCombinedAnalysis();

      console.log("\n" + "=".repeat(60));
      console.log("PART 2: PASSWORD GENERATION ANALYSIS");
      console.log("=".repeat(60));
      const generator1 = new Part2PasswordGeneration();
      await generator1.runPasswordGenerationAnalysis();
      break;

    default:
      console.log("❌ Unknown command. Available commands:");
      console.log("  part1, analysis    - Run password database analysis");
      console.log("  part2, generation - Run password generation analysis");
      console.log("  both, all         - Run both analyses");
      console.log("\nUsage: npm start [command]");
      console.log("Example: npm start part2");
      break;
  }
}

main().catch(console.error);
