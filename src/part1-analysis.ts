import * as fs from "fs";
import csv from "csv-parser";
import { PasswordAnalyzer } from "./analysis/passwordAnalyzer";
import { DataFetcher } from "./data/dataFetcher";

/**
 * Part 1: Password Database Analysis
 * Focused implementation for the assignment requirements
 */
export class Part1PasswordAnalysis {
  private analyzer: PasswordAnalyzer;
  private dataFetcher: DataFetcher;

  constructor() {
    this.analyzer = new PasswordAnalyzer();
    this.dataFetcher = new DataFetcher();
  }

  /**
   * Read passwords from CSV file with random sampling
   * @param filePath Path to CSV file
   * @param sampleSize Number of passwords to sample (default: 10000)
   * @returns Promise<string[]> Random sample of passwords
   */
  async readRandomPasswords(
    filePath: string,
    sampleSize: number = 10000
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const allPasswords: string[] = [];

      console.log(`📊 Reading passwords from: ${filePath}`);

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row: any) => {
          // Try different column names
          const password =
            row["Password"] || row["password"] || row["pass"] || row["pwd"];
          if (password && typeof password === "string") {
            allPasswords.push(password);
          }
        })
        .on("end", () => {
          if (allPasswords.length === 0) {
            reject(new Error(`No passwords found in ${filePath}`));
            return;
          }

          console.log(`📈 Total passwords loaded: ${allPasswords.length}`);

          // Get random sample using Fisher-Yates shuffle
          const randomSample = this.getRandomSample(allPasswords, sampleSize);
          console.log(`🎲 Random sample size: ${randomSample.length}`);
          resolve(randomSample);
        })
        .on("error", (error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Read combined random sample from multiple CSV files
   * @param filePaths Array of CSV file paths
   * @param totalSampleSize Total number of passwords to sample across all files
   * @returns Promise<string[]> Combined random sample
   */
  async readCombinedRandomSample(
    filePaths: string[],
    totalSampleSize: number = 10000
  ): Promise<string[]> {
    const allPasswords: string[] = [];

    for (const filePath of filePaths) {
      try {
        const passwords = await this.readRandomPasswords(filePath, 50000); // Read more to ensure good sampling
        allPasswords.push(...passwords);
      } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error);
      }
    }

    if (allPasswords.length === 0) {
      throw new Error("No passwords loaded from any file");
    }

    console.log(`📊 Total passwords across all files: ${allPasswords.length}`);

    // Get random sample from combined pool
    const randomSample = this.getRandomSample(allPasswords, totalSampleSize);
    console.log(`🎲 Combined random sample size: ${randomSample.length}`);

    return randomSample;
  }

  /**
   * Get random sample using Fisher-Yates shuffle algorithm
   * @param passwords Array of all passwords
   * @param sampleSize Number of passwords to sample
   * @returns Random sample of passwords
   */
  private getRandomSample(passwords: string[], sampleSize: number): string[] {
    if (passwords.length === 0) {
      throw new Error("No passwords provided for sampling");
    }

    if (sampleSize >= passwords.length) {
      console.log(
        `Sample size (${sampleSize}) is larger than total passwords (${passwords.length}). Using all passwords.`
      );
      return [...passwords];
    }

    // Fisher-Yates shuffle algorithm for unbiased sampling
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
   * Display analysis results in a formatted way
   * @param analysis Analysis results
   */
  private displayAnalysisResults(analysis: any): void {
    console.log(`\n📊 ANALYSIS RESULTS`);
    console.log(`${"=".repeat(40)}`);

    console.log(
      `Sample size: ${analysis.sampleSize.toLocaleString()} passwords`
    );
    console.log(
      `Average password length: ${analysis.averageLength.toFixed(2)} characters`
    );

    console.log(`\n🔤 CHARACTER COMPOSITION:`);
    const total = analysis.sampleSize;
    console.log(
      `  • Uppercase letters: ${((analysis.composition.uppercase / total) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Lowercase letters: ${((analysis.composition.lowercase / total) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Numbers: ${((analysis.composition.numbers / total) * 100).toFixed(2)}%`
    );
    console.log(
      `  • Symbols: ${((analysis.composition.symbols / total) * 100).toFixed(2)}%`
    );

    console.log(`\n📏 MOST COMMON PASSWORD LENGTHS:`);
    const sortedLengths = Object.entries(analysis.lengthFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);

    sortedLengths.forEach(([length, count]) => {
      const countNum = count as number;
      const percentage = ((countNum / total) * 100).toFixed(2);
      console.log(
        `  • Length ${length}: ${countNum.toLocaleString()} passwords (${percentage}%)`
      );
    });

    console.log(`\n🔤 MOST COMMON CHARACTERS:`);
    const sortedChars = Object.entries(analysis.characterFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);

    sortedChars.forEach(([char, count]) => {
      const countNum = count as number;
      const percentage = ((countNum / total) * 100).toFixed(2);
      const displayChar = char === " " ? "[space]" : char;
      console.log(
        `  • '${displayChar}': ${countNum.toLocaleString()} occurrences (${percentage}%)`
      );
    });
  }

  /**
   * Combined run: fetch 10,000 passwords from GitHub and analyze
   */
  async runCombinedAnalysis(): Promise<void> {
    console.log(
      `🔐 PASSWORD DATABASE ANALYSIS - PART 1 (GitHub Data - 10,000 sample)`
    );
    console.log(`${"=".repeat(60)}`);

    try {
      // Get data from GitHub or local file
      const sample = await this.dataFetcher.getData();

      // Show 20 sample passwords
      console.log(`\n📋 Sample passwords (first 20):`);
      sample
        .slice(0, 20)
        .forEach((pwd: string, i: number) =>
          console.log(`${(i + 1).toString().padStart(2)}. ${pwd}`)
        );

      // Analyze
      console.log(`\n📊 Analyzing password characteristics...`);
      const analysis = this.analyzer.analyzePasswords(sample);

      // Display results
      this.displayAnalysisResults(analysis);

      // Generate JSON report for Part 1
      this.generatePart1Report(analysis, ["GitHub PWLDS Dataset"]);

      console.log(`\n✅ Combined analysis complete!`);
    } catch (error) {
      console.error("❌ Error during analysis:", error);
      throw error;
    }
  }

  /**
   * Generate Part 1 analysis report in JSON format
   */
  private generatePart1Report(analysis: any, csvFiles: string[]): void {
    const report = {
      timestamp: new Date().toISOString(),
      part: "Part 1 - Password Database Analysis",
      dataset: {
        totalFiles: csvFiles.length,
        files: csvFiles,
        sampleSize: analysis.sampleSize,
        averageLength: analysis.averageLength,
      },
      composition: {
        uppercase: (
          (analysis.composition.uppercase / analysis.sampleSize) *
          100
        ).toFixed(2),
        lowercase: (
          (analysis.composition.lowercase / analysis.sampleSize) *
          100
        ).toFixed(2),
        numbers: (
          (analysis.composition.numbers / analysis.sampleSize) *
          100
        ).toFixed(2),
        symbols: (
          (analysis.composition.symbols / analysis.sampleSize) *
          100
        ).toFixed(2),
      },
      lengthFrequency: analysis.lengthFrequency,
      characterFrequency: analysis.characterFrequency,
      samplePasswords: analysis.samplePasswords,
    };

    // Save report to JSON file
    const reportFile = "part1_analysis_report.json";
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Part 1 analysis report saved to: ${reportFile}`);
  }
}
