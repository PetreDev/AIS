import { Part2PasswordGeneration } from "../part2-password-generation";
import { VisualizationService } from "./visualizationService";
import { DataFetcher } from "../data/dataFetcher";
import * as fs from "fs";

/**
 * Main script to generate visualizations and PDF report
 */
async function main() {
  console.log("🎨 PASSWORD ANALYSIS VISUALIZATION & PDF GENERATION");
  console.log("=".repeat(60));

  try {
    // Initialize services
    const passwordGeneration = new Part2PasswordGeneration();
    const visualizationService = new VisualizationService();
    const dataFetcher = new DataFetcher();

    // Run password generation analysis
    console.log("\n🔐 Running password generation analysis...");
    await passwordGeneration.runPasswordGenerationAnalysis();

    // Load the generated report data
    console.log("\n📊 Loading analysis results...");
    const reportData = JSON.parse(
      fs.readFileSync("./password_generation_report.json", "utf8")
    );

    // Load the generated passwords (we need to regenerate them for visualization)
    console.log("\n🎲 Regenerating passwords for visualization...");

    // Get training data from GitHub or local file
    const trainingPasswords = await dataFetcher.getData();

    // Train Markov model
    passwordGeneration["markovGenerator"].trainModel(trainingPasswords, 1);

    // Generate passwords for visualization
    const config = {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      avoidSimilar: true,
      avoidAmbiguous: false,
    };

    const randomPasswords = passwordGeneration[
      "randomGenerator"
    ].generateMultiplePasswords(config, 1000);
    const markovPasswords = passwordGeneration[
      "markovGenerator"
    ].generateMultiplePasswords(config, 1000);

    // Generate complete visualization and PDF report
    console.log("\n🎨 Generating visualizations and PDF report...");
    const pdfPath = await visualizationService.generateCompleteReport(
      reportData,
      randomPasswords,
      markovPasswords
    );

    // Generate additional analysis charts
    console.log("\n📈 Generating additional analysis charts...");
    const additionalCharts =
      await visualizationService.generateAdditionalCharts(
        randomPasswords,
        markovPasswords
      );

    console.log("\n✅ VISUALIZATION AND PDF GENERATION COMPLETE!");
    console.log("=".repeat(60));
    console.log(`📄 PDF Report: ${pdfPath}`);
    console.log(`📁 Charts Directory: ./charts/`);
    console.log(`📊 Total Charts Generated: ${6 + additionalCharts.length}`);
    console.log("\n📋 Generated Files:");
    console.log(
      "  • password_analysis_complete_report.pdf - Complete PDF report"
    );
    console.log(
      "  • ./charts/entropy_comparison.png - Entropy comparison chart"
    );
    console.log(
      "  • ./charts/entropy_histogram.png - Entropy distribution histogram"
    );
    console.log(
      "  • ./charts/cracking_time_comparison.png - Cracking time comparison"
    );
    console.log(
      "  • ./charts/readability_comparison.png - Readability comparison"
    );
    console.log(
      "  • ./charts/security_compliance_radar.png - Security compliance radar"
    );
    console.log(
      "  • ./charts/overall_performance.png - Overall performance comparison"
    );
    console.log(
      "  • ./charts/password_length_distribution.png - Password length distribution"
    );
    console.log(
      "  • ./charts/character_composition.png - Character composition analysis"
    );
  } catch (error) {
    console.error("❌ Error during visualization generation:", error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

export { main };
