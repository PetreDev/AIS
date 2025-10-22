import { Chart, ChartConfiguration, registerables } from "chart.js";
import { createCanvas } from "canvas";
import * as fs from "fs";
import * as path from "path";
import { GeneratedPassword } from "../types";

/**
 * Chart generation service using Chart.js for backend visualization
 */
export class ChartGenerator {
  private outputDir: string;

  constructor(outputDir: string = "./charts") {
    this.outputDir = outputDir;
    // Register all Chart.js components
    Chart.register(...registerables);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate entropy comparison chart
   */
  async generateEntropyComparisonChart(
    randomData: number[],
    markovData: number[],
    filename: string = "entropy_comparison.png"
  ): Promise<string> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: ["Random Generator", "Markov Generator"],
        datasets: [
          {
            label: "Average Entropy (bits)",
            data: [
              this.calculateAverage(randomData),
              this.calculateAverage(markovData),
            ],
            backgroundColor: ["#3B82F6", "#10B981"],
            borderColor: ["#1E40AF", "#059669"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Entropy Comparison: Random vs Markov Generators",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Entropy (bits)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generator Type",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Entropy comparison chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate entropy distribution histogram
   */
  async generateEntropyHistogram(
    randomData: number[],
    markovData: number[],
    filename: string = "entropy_histogram.png"
  ): Promise<string> {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    const randomHistogram = this.createHistogram(randomData, 5);
    const markovHistogram = this.createHistogram(markovData, 5);

    const labels = Object.keys(randomHistogram).sort((a, b) => {
      const aNum = parseInt(a.split("-")[0] || "0");
      const bNum = parseInt(b.split("-")[0] || "0");
      return aNum - bNum;
    });

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Random Generator",
            data: labels.map((label) => randomHistogram[label] || 0),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "#3B82F6",
            borderWidth: 1,
          },
          {
            label: "Markov Generator",
            data: labels.map((label) => markovHistogram[label] || 0),
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "#10B981",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Entropy Distribution Histogram",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Frequency",
            },
          },
          x: {
            title: {
              display: true,
              text: "Entropy Range (bits)",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Entropy histogram saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate cracking time comparison chart
   */
  async generateCrackingTimeChart(
    randomData: number[],
    markovData: number[],
    filename: string = "cracking_time_comparison.png"
  ): Promise<string> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: ["Random Generator", "Markov Generator"],
        datasets: [
          {
            label: "Average Cracking Time (years)",
            data: [
              this.calculateAverage(randomData),
              this.calculateAverage(markovData),
            ],
            backgroundColor: ["#EF4444", "#F59E0B"],
            borderColor: ["#DC2626", "#D97706"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Cracking Time Comparison: Random vs Markov Generators",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            type: "logarithmic",
            title: {
              display: true,
              text: "Cracking Time (years, log scale)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generator Type",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Cracking time chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate readability comparison chart
   */
  async generateReadabilityChart(
    randomScore: number,
    markovScore: number,
    filename: string = "readability_comparison.png"
  ): Promise<string> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: ["Random Generator", "Markov Generator"],
        datasets: [
          {
            label: "Readability Score",
            data: [randomScore, markovScore],
            backgroundColor: ["#8B5CF6", "#06B6D4"],
            borderColor: ["#7C3AED", "#0891B2"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Readability Comparison: Random vs Markov Generators",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Readability Score",
            },
          },
          x: {
            title: {
              display: true,
              text: "Generator Type",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Readability chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate security compliance radar chart
   */
  async generateSecurityComplianceChart(
    randomCompliance: any,
    markovCompliance: any,
    filename: string = "security_compliance_radar.png"
  ): Promise<string> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    const config: ChartConfiguration = {
      type: "radar",
      data: {
        labels: [
          "Entropy > 60 bits",
          "Time > 10 years",
          "Both Requirements",
          "Overall Security",
        ],
        datasets: [
          {
            label: "Random Generator",
            data: [
              randomCompliance.entropyAbove60BitsPercentage,
              randomCompliance.timeAbove10YearsPercentage,
              randomCompliance.bothRequirementsMetPercentage,
              (randomCompliance.entropyAbove60BitsPercentage +
                randomCompliance.timeAbove10YearsPercentage +
                randomCompliance.bothRequirementsMetPercentage) /
                3,
            ],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3B82F6",
            borderWidth: 2,
          },
          {
            label: "Markov Generator",
            data: [
              markovCompliance.entropyAbove60BitsPercentage,
              markovCompliance.timeAbove10YearsPercentage,
              markovCompliance.bothRequirementsMetPercentage,
              (markovCompliance.entropyAbove60BitsPercentage +
                markovCompliance.timeAbove10YearsPercentage +
                markovCompliance.bothRequirementsMetPercentage) /
                3,
            ],
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "#10B981",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Security Compliance Comparison",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Compliance Percentage (%)",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Security compliance chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate overall performance comparison chart
   */
  async generateOverallPerformanceChart(
    randomScore: number,
    markovScore: number,
    filename: string = "overall_performance.png"
  ): Promise<string> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    const config: ChartConfiguration = {
      type: "doughnut",
      data: {
        labels: ["Random Generator", "Markov Generator"],
        datasets: [
          {
            data: [randomScore, markovScore],
            backgroundColor: ["#3B82F6", "#10B981"],
            borderColor: ["#1E40AF", "#059669"],
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Overall Performance Score Comparison",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "bottom",
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Overall performance chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate password length distribution chart
   */
  async generateLengthDistributionChart(
    randomLengths: number[],
    markovLengths: number[],
    filename: string = "password_length_distribution.png"
  ): Promise<string> {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    const randomHistogram = this.createHistogram(randomLengths, 1);
    const markovHistogram = this.createHistogram(markovLengths, 1);

    const allLengths = [...new Set([...randomLengths, ...markovLengths])].sort(
      (a, b) => a - b
    );
    const labels = allLengths.map((length) => length.toString());

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Random Generator",
            data: labels.map((label) => randomHistogram[label] || 0),
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
          },
          {
            label: "Markov Generator",
            data: labels.map((label) => markovHistogram[label] || 0),
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Password Length Distribution",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Frequency",
            },
          },
          x: {
            title: {
              display: true,
              text: "Password Length (characters)",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Password length distribution chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate character composition analysis chart
   */
  async generateCharacterCompositionChart(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[],
    filename: string = "character_composition.png"
  ): Promise<string> {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    const randomComposition = this.analyzeCharacterComposition(randomPasswords);
    const markovComposition = this.analyzeCharacterComposition(markovPasswords);

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: ["Uppercase", "Lowercase", "Numbers", "Symbols"],
        datasets: [
          {
            label: "Random Generator",
            data: [
              randomComposition.uppercase,
              randomComposition.lowercase,
              randomComposition.numbers,
              randomComposition.symbols,
            ],
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "#3B82F6",
            borderWidth: 1,
          },
          {
            label: "Markov Generator",
            data: [
              markovComposition.uppercase,
              markovComposition.lowercase,
              markovComposition.numbers,
              markovComposition.symbols,
            ],
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "#10B981",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Character Composition Analysis",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Percentage (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Character Type",
            },
          },
        },
      },
    };

    const chart = new Chart(ctx as any, config);
    const imageBuffer = canvas.toBuffer("image/png");

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`📊 Character composition chart saved: ${filepath}`);
    return filepath;
  }

  /**
   * Helper method to calculate average
   */
  private calculateAverage(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  /**
   * Helper method to create histogram data
   */
  private createHistogram(
    data: number[],
    binSize: number
  ): { [key: string]: number } {
    const histogram: { [key: string]: number } = {};

    data.forEach((value) => {
      const bin = Math.floor(value / binSize) * binSize;
      const binKey = `${bin}-${bin + binSize}`;
      histogram[binKey] = (histogram[binKey] || 0) + 1;
    });

    return histogram;
  }

  /**
   * Helper method to analyze character composition
   */
  private analyzeCharacterComposition(passwords: GeneratedPassword[]): {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  } {
    let totalChars = 0;
    let uppercase = 0;
    let lowercase = 0;
    let numbers = 0;
    let symbols = 0;

    passwords.forEach((pwd) => {
      const password = pwd.password;
      totalChars += password.length;

      for (const char of password) {
        if (/[A-Z]/.test(char)) uppercase++;
        else if (/[a-z]/.test(char)) lowercase++;
        else if (/[0-9]/.test(char)) numbers++;
        else symbols++;
      }
    });

    return {
      uppercase: totalChars > 0 ? (uppercase / totalChars) * 100 : 0,
      lowercase: totalChars > 0 ? (lowercase / totalChars) * 100 : 0,
      numbers: totalChars > 0 ? (numbers / totalChars) * 100 : 0,
      symbols: totalChars > 0 ? (symbols / totalChars) * 100 : 0,
    };
  }
}
