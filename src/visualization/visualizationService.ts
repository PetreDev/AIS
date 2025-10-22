import { ChartGenerator } from "./chartGenerator";
import { PDFGenerator } from "./pdfGenerator";
import * as fs from "fs";
import { GeneratedPassword } from "../types";
import { DataFetcher } from "../data/dataFetcher";

/**
 * Main visualization service that coordinates chart generation and PDF creation
 */
export class VisualizationService {
  private chartGenerator: ChartGenerator;
  private pdfGenerator: PDFGenerator;
  private dataFetcher: DataFetcher;

  constructor() {
    this.chartGenerator = new ChartGenerator("./charts");
    this.pdfGenerator = new PDFGenerator();
    this.dataFetcher = new DataFetcher();
  }

  /**
   * Generate all visualizations and PDF report
   */
  async generateCompleteReport(
    reportData: any,
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): Promise<string> {
    console.log("🎨 Starting visualization generation...");

    // Extract data for visualizations
    const randomEntropies = randomPasswords.map((p) => p.entropy);
    const markovEntropies = markovPasswords.map((p) => p.entropy);
    const randomCrackingTimes = randomPasswords.map((p) => p.timeToCrack.years);
    const markovCrackingTimes = markovPasswords.map((p) => p.timeToCrack.years);

    const chartPaths: string[] = [];

    try {
      // Generate all charts
      console.log("📊 Generating entropy comparison chart...");
      const entropyChart =
        await this.chartGenerator.generateEntropyComparisonChart(
          randomEntropies,
          markovEntropies,
          "entropy_comparison.png"
        );
      chartPaths.push(entropyChart);

      console.log("📊 Generating entropy histogram...");
      const histogramChart = await this.chartGenerator.generateEntropyHistogram(
        randomEntropies,
        markovEntropies,
        "entropy_histogram.png"
      );
      chartPaths.push(histogramChart);

      console.log("📊 Generating cracking time comparison...");
      const crackingTimeChart =
        await this.chartGenerator.generateCrackingTimeChart(
          randomCrackingTimes,
          markovCrackingTimes,
          "cracking_time_comparison.png"
        );
      chartPaths.push(crackingTimeChart);

      console.log("📊 Generating readability comparison...");
      const readabilityChart =
        await this.chartGenerator.generateReadabilityChart(
          reportData.results.random.readabilityScore,
          reportData.results.markov.readabilityScore,
          "readability_comparison.png"
        );
      chartPaths.push(readabilityChart);

      console.log("📊 Generating security compliance radar chart...");
      const securityChart =
        await this.chartGenerator.generateSecurityComplianceChart(
          reportData.results.random,
          reportData.results.markov,
          "security_compliance_radar.png"
        );
      chartPaths.push(securityChart);

      console.log("📊 Generating overall performance chart...");
      const performanceChart =
        await this.chartGenerator.generateOverallPerformanceChart(
          reportData.results.recommendations.randomScore,
          reportData.results.recommendations.markovScore,
          "overall_performance.png"
        );
      chartPaths.push(performanceChart);

      // Generate PDF report
      console.log("📄 Generating PDF report...");
      const pdfPath = await this.pdfGenerator.generateReport(
        reportData,
        chartPaths,
        "./password_analysis_complete_report.pdf"
      );

      console.log("✅ Complete visualization and PDF generation finished!");
      console.log(`📁 Charts saved in: ./charts/`);
      console.log(`📄 PDF report saved: ${pdfPath}`);

      return pdfPath;
    } catch (error) {
      console.error("❌ Error generating visualizations:", error);
      throw error;
    }
  }

  /**
   * Generate additional analysis charts
   */
  async generateAdditionalCharts(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): Promise<string[]> {
    const chartPaths: string[] = [];

    try {
      // Generate password length distribution
      console.log("📊 Generating password length distribution...");
      const randomLengths = randomPasswords.map((p) => p.password.length);
      const markovLengths = markovPasswords.map((p) => p.password.length);

      const lengthChart =
        await this.chartGenerator.generateLengthDistributionChart(
          randomLengths,
          markovLengths,
          "password_length_distribution.png"
        );
      chartPaths.push(lengthChart);

      // Generate character composition analysis
      console.log("📊 Generating character composition analysis...");
      const compositionChart =
        await this.chartGenerator.generateCharacterCompositionChart(
          randomPasswords,
          markovPasswords,
          "character_composition.png"
        );
      chartPaths.push(compositionChart);

      return chartPaths;
    } catch (error) {
      console.error("❌ Error generating additional charts:", error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup(): void {
    try {
      // Remove chart files if they exist
      const chartDir = "./charts";
      if (fs.existsSync(chartDir)) {
        const files = fs.readdirSync(chartDir);
        files.forEach((file) => {
          if (file.endsWith(".png")) {
            fs.unlinkSync(`${chartDir}/${file}`);
          }
        });
        console.log("🧹 Cleaned up temporary chart files");
      }
    } catch (error) {
      console.warn("⚠️ Warning: Could not clean up temporary files:", error);
    }
  }
}
