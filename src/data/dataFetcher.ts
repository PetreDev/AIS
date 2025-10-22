import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

/**
 * Data fetcher for PWLDS dataset from GitHub
 * Downloads password data from https://github.com/infinitode/pwlds
 */
export class DataFetcher {
  private readonly baseUrl =
    "https://raw.githubusercontent.com/Infinitode/PWLDS/main/";
  private readonly localDataFile = "./pwlds_combined.csv";
  private readonly sampleSize = 10000;

  /**
   * Check if local data file exists
   */
  hasLocalData(): boolean {
    return fs.existsSync(this.localDataFile);
  }

  /**
   * Get local data file path
   */
  getLocalDataPath(): string {
    return this.localDataFile;
  }

  /**
   * Delete local data file
   */
  deleteLocalData(): void {
    if (fs.existsSync(this.localDataFile)) {
      fs.unlinkSync(this.localDataFile);
      console.log("🗑️ Local data file deleted");
    }
  }

  /**
   * Fetch and combine data from all PWLDS files
   */
  async fetchAndCombineData(): Promise<string> {
    console.log("🌐 Fetching PWLDS data from GitHub...");
    console.log("📡 Source: https://github.com/infinitode/pwlds");

    const files = [
      "pwlds_very_weak.csv",
      "pwlds_weak.csv",
      "pwlds_average.csv",
      "pwlds_strong.csv",
      "pwlds_very_strong.csv",
    ];

    const allPasswords: string[] = [];
    const strengthLevels = [1, 2, 3, 4, 5]; // Corresponding to very_weak, weak, average, strong, very_strong

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const strengthLevel = strengthLevels[i];
      const url = `${this.baseUrl}${file}`;

      console.log(`📥 Downloading ${file}...`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
        }

        const csvText = await response.text();
        const lines = csvText.split("\n").filter((line) => line.trim());

        // Skip header if it exists
        const dataLines = lines[0]?.includes("Password")
          ? lines.slice(1)
          : lines;

        // Parse CSV and add passwords with strength level
        dataLines.forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.length > 0) {
            // If the line contains a comma, it might already have a strength level
            if (trimmedLine.includes(",")) {
              allPasswords.push(trimmedLine);
            } else {
              // Just the password, add our strength level
              allPasswords.push(`${trimmedLine},${strengthLevel}`);
            }
          }
        });

        console.log(`✅ Downloaded ${dataLines.length} passwords from ${file}`);
      } catch (error) {
        console.error(`❌ Error downloading ${file}:`, error);
        throw error;
      }
    }

    console.log(
      `📊 Total passwords collected: ${allPasswords.length.toLocaleString()}`
    );

    // Randomly sample 10,000 passwords
    const sampledPasswords = this.randomSample(allPasswords, this.sampleSize);
    console.log(`🎲 Randomly sampled ${sampledPasswords.length} passwords`);

    // Create combined CSV file
    const csvContent =
      "Password,Strength_Level\n" + sampledPasswords.join("\n");
    fs.writeFileSync(this.localDataFile, csvContent);

    console.log(`💾 Combined data saved to: ${this.localDataFile}`);
    console.log(`📈 Sample distribution:`);

    // Show distribution by strength level
    const distribution = this.getDistribution(sampledPasswords);
    Object.entries(distribution).forEach(([level, count]) => {
      const percentage = ((count / sampledPasswords.length) * 100).toFixed(1);
      const levelName = this.getStrengthLevelName(parseInt(level));
      console.log(`  • ${levelName}: ${count} passwords (${percentage}%)`);
    });

    return this.localDataFile;
  }

  /**
   * Randomly sample passwords using Fisher-Yates shuffle
   */
  private randomSample(passwords: string[], sampleSize: number): string[] {
    if (passwords.length <= sampleSize) {
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
   * Get distribution of passwords by strength level
   */
  private getDistribution(passwords: string[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};

    passwords.forEach((passwordLine) => {
      const parts = passwordLine.split(",");
      const strengthLevel = parts[1];
      if (strengthLevel) {
        const level = parseInt(strengthLevel);
        const levelName = this.getStrengthLevelName(level);
        distribution[levelName] = (distribution[levelName] || 0) + 1;
      }
    });

    return distribution;
  }

  /**
   * Get strength level name
   */
  private getStrengthLevelName(level: number): string {
    const names = {
      1: "Very Weak",
      2: "Weak",
      3: "Average",
      4: "Strong",
      5: "Very Strong",
    };

    // Handle edge cases
    if (isNaN(level) || level < 1 || level > 5) {
      return "Unknown";
    }

    return names[level as keyof typeof names] || "Unknown";
  }

  /**
   * Load passwords from local file
   */
  loadPasswordsFromFile(): string[] {
    if (!this.hasLocalData()) {
      throw new Error("No local data file found. Please fetch data first.");
    }

    console.log(`📂 Loading passwords from local file: ${this.localDataFile}`);

    const content = fs.readFileSync(this.localDataFile, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Skip header
    const dataLines = lines[0]?.includes("Password") ? lines.slice(1) : lines;

    const passwords = dataLines
      .map((line) => {
        const parts = line.split(",");
        const password = parts[0];
        return password ? password.trim() : "";
      })
      .filter((password) => password.length > 0);

    console.log(`📊 Loaded ${passwords.length} passwords from local file`);
    return passwords;
  }

  /**
   * Get or fetch data (fetches if local file doesn't exist)
   */
  async getData(): Promise<string[]> {
    if (this.hasLocalData()) {
      console.log("📂 Using existing local data file");
      return this.loadPasswordsFromFile();
    } else {
      console.log("🌐 Local data file not found, fetching from GitHub...");
      await this.fetchAndCombineData();
      return this.loadPasswordsFromFile();
    }
  }
}
