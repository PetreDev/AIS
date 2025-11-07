import { Part1PasswordAnalysis } from "./part1-analysis";
import {
  Part2PasswordGeneration,
  DEFAULT_PASSWORD_CONFIG,
} from "./part2-password-generation";
import { PDFReportGenerator } from "./report/pdfReportGenerator";
import { DataFetcher } from "./data/dataFetcher";
import * as fs from "fs";

/**
 * Main script to generate comprehensive PDF report
 * Runs both Part 1 and Part 2 analyses and creates a complete PDF report
 */
async function generateCompleteReport(): Promise<void> {
  console.log("🚀 GENERATING COMPLETE PASSWORD ANALYSIS REPORT");
  console.log("=".repeat(60));

  try {
    // Initialize components
    const part1Analyzer = new Part1PasswordAnalysis();
    const part2Generator = new Part2PasswordGeneration();
    const pdfGenerator = new PDFReportGenerator();
    const dataFetcher = new DataFetcher();

    console.log("\n📊 STEP 1: Running Part 1 - Password Database Analysis");
    console.log("-".repeat(50));

    // Run Part 1 analysis
    const part1Data = await dataFetcher.getData();
    const part1Analysis = part1Analyzer["analyzer"].analyzePasswords(part1Data);

    console.log(
      `✅ Part 1 completed: Analyzed ${part1Analysis.sampleSize} passwords`
    );

    console.log("\n🔐 STEP 2: Running Part 2 - Password Generation Analysis");
    console.log("-".repeat(50));

    // Run Part 2 analysis
    const part2Data = await dataFetcher.getData();
    part2Generator["markovGenerator"].trainModel(part2Data, 1);

    const config = { ...DEFAULT_PASSWORD_CONFIG };

    const randomPasswords = part2Generator[
      "randomGenerator"
    ].generateMultiplePasswords(config, 1000);
    const markovPasswords = part2Generator[
      "markovGenerator"
    ].generateMultiplePasswords(config, 1000);

    const comparison = part2Generator["comparisonAnalyzer"].compareApproaches(
      randomPasswords,
      markovPasswords
    );

    console.log(
      `✅ Part 2 completed: Generated and compared 1,000 passwords from each approach`
    );

    console.log("\n📄 STEP 3: Generating PDF Report");
    console.log("-".repeat(50));

    // Generate comprehensive PDF report
    const reportPath = await pdfGenerator.generateCompleteReport(
      part1Analysis,
      comparison,
      randomPasswords,
      markovPasswords,
      config
    );

    console.log(`✅ PDF report generated: ${reportPath}`);

    // Display summary
    console.log("\n📋 REPORT SUMMARY");
    console.log("=".repeat(60));
    console.log(`📊 Part 1 Analysis:`);
    console.log(
      `  • Sample size: ${part1Analysis.sampleSize.toLocaleString()} passwords`
    );
    console.log(
      `  • Average length: ${part1Analysis.averageLength.toFixed(2)} characters`
    );
    console.log(
      `  • Uppercase letters: ${((part1Analysis.composition.uppercase / part1Analysis.sampleSize) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Lowercase letters: ${((part1Analysis.composition.lowercase / part1Analysis.sampleSize) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Numbers: ${((part1Analysis.composition.numbers / part1Analysis.sampleSize) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Symbols: ${((part1Analysis.composition.symbols / part1Analysis.sampleSize) * 100).toFixed(2)}%`
    );

    console.log(`\n🔐 Part 2 Analysis:`);
    console.log(`  • Random Generator:`);
    console.log(
      `    - Average entropy: ${comparison.random.entropy.average.toFixed(2)} bits`
    );
    console.log(
      `    - Average cracking time: ${comparison.random.crackingTime.average.toFixed(2)} years`
    );
    console.log(
      `    - Security compliance: ${comparison.random.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`
    );
    console.log(`  • Markov Generator:`);
    console.log(
      `    - Average entropy: ${comparison.markov.entropy.average.toFixed(2)} bits`
    );
    console.log(
      `    - Average cracking time: ${comparison.markov.crackingTime.average.toFixed(2)} years`
    );
    console.log(
      `    - Security compliance: ${comparison.markov.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`
    );

    console.log(
      `\n🏆 Overall Winner: ${comparison.recommendations.overallWinner.toUpperCase()}`
    );
    console.log(
      `  Random Score: ${comparison.recommendations.randomScore.toFixed(2)}/100`
    );
    console.log(
      `  Markov Score: ${comparison.recommendations.markovScore.toFixed(2)}/100`
    );

    console.log(`\n✅ Complete report generated successfully!`);
    console.log(`📄 Report saved as: ${reportPath}`);
  } catch (error) {
    console.error("❌ Error generating report:", error);
    throw error;
  }
}

// Run the report generation
if (require.main === module) {
  generateCompleteReport()
    .then(() => {
      console.log("\n🎉 Report generation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Report generation failed:", error);
      process.exit(1);
    });
}

export { generateCompleteReport };
