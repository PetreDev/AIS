import * as fs from "fs";
import csv from "csv-parser";
import { RandomPasswordGenerator } from "./generators/randomGenerator";
import { MarkovPasswordGenerator } from "./generators/markovGenerator";
import { PasswordComparisonAnalyzer } from "./analysis/passwordComparison";
import { PasswordGeneratorConfig, GeneratedPassword } from "./types";
import { DataFetcher } from "./data/dataFetcher";

/**
 * Part 2: Password Generation Using Computational Intelligence Approaches
 * Implements both Random Generator with Heuristics and Markov Chain Generator
 */
export class Part2PasswordGeneration {
  private randomGenerator: RandomPasswordGenerator;
  private markovGenerator: MarkovPasswordGenerator;
  private comparisonAnalyzer: PasswordComparisonAnalyzer;
  private dataFetcher: DataFetcher;

  constructor() {
    this.randomGenerator = new RandomPasswordGenerator();
    this.markovGenerator = new MarkovPasswordGenerator();
    this.comparisonAnalyzer = new PasswordComparisonAnalyzer();
    this.dataFetcher = new DataFetcher();
  }

  /**
   * Read passwords from CSV file for Markov training
   * @param filePath Path to CSV file
   * @param sampleSize Number of passwords to sample
   * @returns Promise<string[]> Random sample of passwords
   */
  async readPasswordsForTraining(
    filePath: string,
    sampleSize: number = 10000
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const allPasswords: string[] = [];

      console.log(`📊 Reading passwords for training from: ${filePath}`);

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row: any) => {
          const password =
            row["Password"] || row["password"] || row["pass"] || row["pwd"];
          if (
            password &&
            typeof password === "string" &&
            password.length >= 3
          ) {
            allPasswords.push(password);
          }
        })
        .on("end", () => {
          if (allPasswords.length === 0) {
            reject(new Error(`No passwords found in ${filePath}`));
            return;
          }

          console.log(`📈 Total passwords loaded: ${allPasswords.length}`);

          // Get random sample
          const randomSample = this.getRandomSample(allPasswords, sampleSize);
          console.log(`🎲 Training sample size: ${randomSample.length}`);
          resolve(randomSample);
        })
        .on("error", (error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Get random sample using Fisher-Yates shuffle
   */
  private getRandomSample(passwords: string[], sampleSize: number): string[] {
    if (passwords.length === 0) {
      throw new Error("No passwords provided for sampling");
    }

    if (sampleSize >= passwords.length) {
      return [...passwords];
    }

    const shuffled = [...passwords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    return shuffled.slice(0, sampleSize);
  }

  /**
   * Run complete Part 2 analysis
   */
  async runPasswordGenerationAnalysis(): Promise<void> {
    console.log(`🔐 PASSWORD GENERATION ANALYSIS - PART 2`);
    console.log(`${"=".repeat(60)}`);

    try {
      // Get training data from GitHub or local file
      console.log(`📊 Fetching training data from GitHub PWLDS dataset...`);
      const trainingPasswords = await this.dataFetcher.getData();
      console.log(
        `📈 Total training passwords: ${trainingPasswords.length.toLocaleString()}`
      );

      // Train Markov model
      console.log(`\n🧠 Training Markov model...`);
      this.markovGenerator.trainModel(trainingPasswords, 1); // First-order Markov model

      // Configuration for password generation
      const config: PasswordGeneratorConfig = {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        avoidSimilar: true,
        avoidAmbiguous: false,
      };

      console.log(`\n⚙️ Password generation configuration:`);
      console.log(`  • Length: ${config.length}`);
      console.log(`  • Include uppercase: ${config.includeUppercase}`);
      console.log(`  • Include lowercase: ${config.includeLowercase}`);
      console.log(`  • Include numbers: ${config.includeNumbers}`);
      console.log(`  • Include symbols: ${config.includeSymbols}`);
      console.log(`  • Avoid similar characters: ${config.avoidSimilar}`);

      // Generate passwords using both approaches
      console.log(
        `\n🎲 Generating passwords using Random Generator with Heuristics...`
      );
      const randomPasswords = this.randomGenerator.generateMultiplePasswords(
        config,
        1000
      );

      console.log(`🧠 Generating passwords using Markov Chain Generator...`);
      const markovPasswords = this.markovGenerator.generateMultiplePasswords(
        config,
        1000
      );

      // Display sample passwords
      this.displaySamplePasswords(randomPasswords, markovPasswords);

      // Perform comparison analysis
      console.log(`\n📊 Performing comparison analysis...`);
      const comparison = this.comparisonAnalyzer.compareApproaches(
        randomPasswords,
        markovPasswords
      );

      // Display results
      this.displayComparisonResults(comparison);

      // Generate detailed report
      this.generateDetailedReport(comparison, randomPasswords, markovPasswords);

      console.log(`\n✅ Password generation analysis complete!`);
    } catch (error) {
      console.error("❌ Error during password generation analysis:", error);
      throw error;
    }
  }

  /**
   * Load training data from multiple CSV files
   */
  private async loadTrainingData(csvFiles: string[]): Promise<string[]> {
    const allPasswords: string[] = [];

    for (const file of csvFiles) {
      try {
        const passwords = await this.readPasswordsForTraining(file, 2000); // 2000 per file
        allPasswords.push(...passwords);
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error);
      }
    }

    if (allPasswords.length === 0) {
      throw new Error("No passwords loaded from any file");
    }

    console.log(`📊 Total training passwords: ${allPasswords.length}`);
    return allPasswords;
  }

  /**
   * Display sample passwords from both approaches
   */
  private displaySamplePasswords(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): void {
    console.log(`\n📋 SAMPLE PASSWORDS (First 10 from each approach):`);
    console.log(`${"=".repeat(60)}`);

    console.log(`\n🎲 Random Generator with Heuristics:`);
    randomPasswords.slice(0, 10).forEach((pwd, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${pwd.password} (${pwd.entropy.toFixed(1)} bits, ${pwd.timeToCrack.years.toFixed(1)} years)`
      );
    });

    console.log(`\n🧠 Markov Chain Generator:`);
    markovPasswords.slice(0, 10).forEach((pwd, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${pwd.password} (${pwd.entropy.toFixed(1)} bits, ${pwd.timeToCrack.years.toFixed(1)} years)`
      );
    });
  }

  /**
   * Display comparison results
   */
  private displayComparisonResults(comparison: any): void {
    console.log(`\n📊 COMPARISON RESULTS`);
    console.log(`${"=".repeat(60)}`);

    // Entropy comparison
    console.log(`\n🔢 ENTROPY ANALYSIS:`);
    console.log(
      `  Random Generator:     ${comparison.random.entropy.average.toFixed(2)} bits (avg)`
    );
    console.log(
      `  Markov Generator:     ${comparison.markov.entropy.average.toFixed(2)} bits (avg)`
    );
    console.log(
      `  Difference:           ${comparison.comparison.entropyComparison.difference.toFixed(2)} bits`
    );
    console.log(
      `  Better approach:      ${comparison.comparison.entropyComparison.better.toUpperCase()}`
    );

    // Time to crack comparison
    console.log(`\n⏱️  CRACKING TIME ANALYSIS:`);
    console.log(
      `  Random Generator:     ${comparison.random.crackingTime.average.toFixed(2)} years (avg)`
    );
    console.log(
      `  Markov Generator:     ${comparison.markov.crackingTime.average.toFixed(2)} years (avg)`
    );
    console.log(
      `  Difference:           ${comparison.comparison.timeComparison.difference.toFixed(2)} years`
    );
    console.log(
      `  Better approach:      ${comparison.comparison.timeComparison.better.toUpperCase()}`
    );

    // Readability comparison
    console.log(`\n📖 READABILITY ANALYSIS:`);
    console.log(
      `  Random Generator:     ${comparison.random.readabilityScore.averageScore.toFixed(2)} (avg score)`
    );
    console.log(
      `  Markov Generator:     ${comparison.markov.readabilityScore.averageScore.toFixed(2)} (avg score)`
    );
    console.log(
      `  Difference:           ${comparison.comparison.readabilityComparison.difference.toFixed(2)}`
    );
    console.log(
      `  Better approach:      ${comparison.comparison.readabilityComparison.better.toUpperCase()}`
    );

    // Security compliance
    console.log(`\n🔒 SECURITY COMPLIANCE:`);
    console.log(
      `  Random (60+ bits):    ${comparison.random.securityCompliance.entropyAbove60BitsPercentage.toFixed(1)}%`
    );
    console.log(
      `  Markov (60+ bits):    ${comparison.markov.securityCompliance.entropyAbove60BitsPercentage.toFixed(1)}%`
    );
    console.log(
      `  Random (10+ years):   ${comparison.random.securityCompliance.timeAbove10YearsPercentage.toFixed(1)}%`
    );
    console.log(
      `  Markov (10+ years):    ${comparison.markov.securityCompliance.timeAbove10YearsPercentage.toFixed(1)}%`
    );
    console.log(
      `  Random (both):        ${comparison.random.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`
    );
    console.log(
      `  Markov (both):        ${comparison.markov.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`
    );

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    comparison.recommendations.recommendations.forEach(
      (rec: string, i: number) => {
        console.log(`  ${i + 1}. ${rec}`);
      }
    );

    console.log(
      `\n🏆 OVERALL WINNER: ${comparison.recommendations.overallWinner.toUpperCase()}`
    );
    console.log(
      `  Random Score: ${comparison.recommendations.randomScore.toFixed(2)}`
    );
    console.log(
      `  Markov Score: ${comparison.recommendations.markovScore.toFixed(2)}`
    );
  }

  /**
   * Generate detailed report
   */
  private generateDetailedReport(
    comparison: any,
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): void {
    const report = {
      timestamp: new Date().toISOString(),
      configuration: {
        passwordLength: 12,
        characterSet: "uppercase, lowercase, numbers, symbols",
        avoidSimilar: true,
        avoidAmbiguous: false,
      },
      trainingData: {
        totalPasswords: randomPasswords.length + markovPasswords.length,
        markovModelOrder: 1,
      },
      results: {
        random: {
          count: randomPasswords.length,
          averageEntropy: comparison.random.entropy.average,
          averageCrackingTime: comparison.random.crackingTime.average,
          entropyAbove60Bits:
            comparison.random.securityCompliance.entropyAbove60BitsPercentage,
          timeAbove10Years:
            comparison.random.securityCompliance.timeAbove10YearsPercentage,
          bothRequirementsMet:
            comparison.random.securityCompliance.bothRequirementsMetPercentage,
          readabilityScore: comparison.random.readabilityScore.averageScore,
        },
        markov: {
          count: markovPasswords.length,
          averageEntropy: comparison.markov.entropy.average,
          averageCrackingTime: comparison.markov.crackingTime.average,
          entropyAbove60Bits:
            comparison.markov.securityCompliance.entropyAbove60BitsPercentage,
          timeAbove10Years:
            comparison.markov.securityCompliance.timeAbove10YearsPercentage,
          bothRequirementsMet:
            comparison.markov.securityCompliance.bothRequirementsMetPercentage,
          readabilityScore: comparison.markov.readabilityScore.averageScore,
        },
        comparison: comparison.comparison,
        recommendations: comparison.recommendations,
      },
    };

    // Save report to JSON file
    const reportFile = "password_generation_report.json";
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);

    // Generate histogram data for entropy distribution
    this.generateEntropyHistogram(randomPasswords, markovPasswords);
  }

  /**
   * Generate entropy histogram data
   */
  private generateEntropyHistogram(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): void {
    const randomEntropies = randomPasswords.map((p) => p.entropy);
    const markovEntropies = markovPasswords.map((p) => p.entropy);

    const histogramData = {
      random: this.createHistogramData(randomEntropies),
      markov: this.createHistogramData(markovEntropies),
    };

    const histogramFile = "entropy_histogram_data.json";
    fs.writeFileSync(histogramFile, JSON.stringify(histogramData, null, 2));
    console.log(`📊 Entropy histogram data saved to: ${histogramFile}`);
  }

  /**
   * Create histogram data from entropy values
   */
  private createHistogramData(entropies: number[]): { [key: string]: number } {
    const histogram: { [key: string]: number } = {};
    const binSize = 5; // 5-bit bins

    entropies.forEach((entropy) => {
      const bin = Math.floor(entropy / binSize) * binSize;
      const binKey = `${bin}-${bin + binSize}`;
      histogram[binKey] = (histogram[binKey] || 0) + 1;
    });

    return histogram;
  }
}
