import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";
import { createCanvas } from "canvas";
import { PasswordAnalysis } from "../types";
import { ComparisonAnalysis } from "../analysis/passwordComparison";
import { GeneratedPassword } from "../types";

/**
 * PDF Report Generator for Password Analysis Assignment
 * Creates comprehensive PDF reports with visualizations
 */
export class PDFReportGenerator {
  private doc: PDFKit.PDFDocument;
  private currentY: number = 0;
  private pageWidth: number = 612; // Letter size width
  private pageHeight: number = 792; // Letter size height
  private margin: number = 50;
  private randomPasswords: GeneratedPassword[] = [];
  private markovPasswords: GeneratedPassword[] = [];

  constructor() {
    this.doc = new (PDFDocument as any)({
      size: "LETTER",
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin,
      },
    });
  }

  /**
   * Generate complete PDF report
   */
  async generateCompleteReport(
    part1Analysis: PasswordAnalysis,
    part2Comparison: ComparisonAnalysis,
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): Promise<string> {
    const outputPath = "password_analysis_complete_report.pdf";

    console.log(`📄 Creating PDF file: ${outputPath}`);

    // Store password data for use in appendices
    this.randomPasswords = randomPasswords;
    this.markovPasswords = markovPasswords;

    // Pipe the PDF to a file
    const stream = fs.createWriteStream(outputPath);
    this.doc.pipe(stream);

    // Generate all sections
    await this.generateTitlePage();
    await this.generateTableOfContents();
    await this.generatePart1Analysis(part1Analysis);
    await this.generatePart2Analysis(
      part2Comparison,
      randomPasswords,
      markovPasswords
    );
    await this.generateConclusions(part2Comparison);
    await this.generateAppendices();

    // Finalize the PDF
    this.doc.end();

    // Wait for the stream to finish
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log(`📄 Complete PDF report generated: ${outputPath}`);
        resolve(outputPath);
      });
      stream.on("error", (error) => {
        console.error(`❌ Error creating PDF: ${error}`);
        reject(error);
      });
    });
  }

  /**
   * Generate title page
   */
  private async generateTitlePage(): Promise<void> {
    this.doc.fontSize(24).font("Helvetica-Bold");
    this.doc.text("Password Analysis and Generation", this.margin, 200, {
      align: "center",
    });

    this.doc.fontSize(18).font("Helvetica");
    this.doc.text("Computational Intelligence Approaches", this.margin, 250, {
      align: "center",
    });

    this.doc.fontSize(16);
    this.doc.text("Assignment Report", this.margin, 300, {
      align: "center",
    });

    this.doc.fontSize(14);
    this.doc.text("Advanced Information Security", this.margin, 400, {
      align: "center",
    });

    this.doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      this.margin,
      450,
      {
        align: "center",
      }
    );

    this.doc.text("Analysis of Password Security using", this.margin, 500, {
      align: "center",
    });
    this.doc.text("Random Heuristics vs Markov Chains", this.margin, 520, {
      align: "center",
    });

    this.addNewPage();
  }

  /**
   * Generate table of contents
   */
  private async generateTableOfContents(): Promise<void> {
    this.doc.fontSize(20).font("Helvetica-Bold");
    this.doc.text("Table of Contents", this.margin, this.margin);

    this.currentY = 100;
    this.doc.fontSize(14).font("Helvetica");

    const tocItems = [
      "1. Executive Summary",
      "2. Part 1: Password Database Analysis",
      "  2.1 Dataset Overview",
      "  2.2 Statistical Analysis",
      "  2.3 Character Composition Analysis",
      "  2.4 Length Distribution Analysis",
      "  2.5 Most Common Characters",
      "3. Part 2: Password Generation Analysis",
      "  3.1 Random Generator with Heuristics",
      "  3.2 Markov Chain Generator",
      "  3.3 Comparative Analysis",
      "  3.4 Security Metrics Comparison",
      "  3.5 Readability Analysis",
      "4. Conclusions and Recommendations",
      "5. Appendices",
    ];

    tocItems.forEach((item) => {
      this.doc.text(item, this.margin, this.currentY);
      this.currentY += 20;
    });

    this.addNewPage();
  }

  /**
   * Generate Part 1 analysis section
   */
  private async generatePart1Analysis(
    analysis: PasswordAnalysis
  ): Promise<void> {
    this.doc.fontSize(20).font("Helvetica-Bold");
    this.doc.text(
      "Part 1: Password Database Analysis",
      this.margin,
      this.margin
    );
    this.currentY = 100;

    // Dataset overview
    this.checkPageBreak(50);
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("2.1 Dataset Overview", this.margin, this.currentY);
    this.currentY += 30;

    this.checkPageBreak(30);
    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      `Sample Size: ${analysis.sampleSize.toLocaleString()} passwords`,
      this.margin,
      this.currentY
    );
    this.currentY += 20;
    this.doc.text(
      `Average Length: ${analysis.averageLength.toFixed(2)} characters`,
      this.margin,
      this.currentY
    );
    this.currentY += 30;

    // Statistical analysis
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("2.2 Statistical Analysis", this.margin, this.currentY);
    this.currentY += 30;

    // Character composition
    this.doc.fontSize(14).font("Helvetica-Bold");
    this.doc.text("Character Composition:", this.margin, this.currentY);
    this.currentY += 20;

    const total = analysis.sampleSize;
    const composition = [
      `Uppercase Letters: ${((analysis.composition.uppercase / total) * 100).toFixed(2)}%`,
      `Lowercase Letters: ${((analysis.composition.lowercase / total) * 100).toFixed(2)}%`,
      `Numbers: ${((analysis.composition.numbers / total) * 100).toFixed(2)}%`,
      `Symbols: ${((analysis.composition.symbols / total) * 100).toFixed(2)}%`,
    ];

    composition.forEach((line) => {
      this.doc.text(line, this.margin + 20, this.currentY);
      this.currentY += 15;
    });

    this.currentY += 20;

    // Generate composition pie chart
    await this.generateCompositionChart(analysis);
    this.addNewPage();

    // Length distribution
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("2.4 Length Distribution Analysis", this.margin, this.margin);
    this.currentY = 100;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text("Most Common Password Lengths:", this.margin, this.currentY);
    this.currentY += 20;

    const sortedLengths = Object.entries(analysis.lengthFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);

    sortedLengths.forEach(([length, count]) => {
      const percentage = (((count as number) / total) * 100).toFixed(2);
      this.doc.text(
        `Length ${length}: ${count} passwords (${percentage}%)`,
        this.margin + 20,
        this.currentY
      );
      this.currentY += 15;
    });

    this.currentY += 20;

    // Generate length distribution chart
    await this.generateLengthDistributionChart(analysis);
    this.addNewPage();

    // Most common characters
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("2.5 Most Common Characters", this.margin, this.margin);
    this.currentY = 100;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      "Top 15 Most Frequent Characters:",
      this.margin,
      this.currentY
    );
    this.currentY += 20;

    const sortedChars = Object.entries(analysis.characterFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 15);

    sortedChars.forEach(([char, count]) => {
      const percentage = (((count as number) / total) * 100).toFixed(2);
      const displayChar = char === " " ? "[space]" : char;
      this.doc.text(
        `'${displayChar}': ${count} occurrences (${percentage}%)`,
        this.margin + 20,
        this.currentY
      );
      this.currentY += 15;
    });

    this.currentY += 20;

    // Generate character frequency chart
    await this.generateCharacterFrequencyChart(analysis);
    this.addNewPage();
  }

  /**
   * Generate Part 2 analysis section
   */
  private async generatePart2Analysis(
    comparison: ComparisonAnalysis,
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): Promise<void> {
    this.doc.fontSize(20).font("Helvetica-Bold");
    this.doc.text(
      "Part 2: Password Generation Analysis",
      this.margin,
      this.margin
    );
    this.currentY = 100;

    // Random generator section
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text(
      "3.1 Random Generator with Heuristics",
      this.margin,
      this.currentY
    );
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text("Configuration:", this.margin, this.currentY);
    this.currentY += 20;
    this.doc.text("• Length: 12 characters", this.margin + 20, this.currentY);
    this.currentY += 15;
    this.doc.text(
      "• Character set: uppercase, lowercase, numbers, symbols",
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      "• Avoid similar characters: enabled",
      this.margin + 20,
      this.currentY
    );
    this.currentY += 30;

    // Markov generator section
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("3.2 Markov Chain Generator", this.margin, this.currentY);
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text("Configuration:", this.margin, this.currentY);
    this.currentY += 20;
    this.doc.text(
      "• Model order: 1 (bigrams)",
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      "• Training data: 10,000 passwords from PWLDS dataset",
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      "• Generation method: probability-based character selection",
      this.margin + 20,
      this.currentY
    );
    this.currentY += 30;

    // Comparative analysis
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("3.3 Comparative Analysis", this.margin, this.currentY);
    this.currentY += 30;

    // Entropy comparison
    this.doc.fontSize(14).font("Helvetica-Bold");
    this.doc.text("Entropy Analysis:", this.margin, this.currentY);
    this.currentY += 20;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      `Random Generator: ${comparison.random.entropy.average.toFixed(2)} bits (average)`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Markov Generator: ${comparison.markov.entropy.average.toFixed(2)} bits (average)`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Difference: ${comparison.comparison.entropyComparison.difference.toFixed(2)} bits`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Better approach: ${comparison.comparison.entropyComparison.better.toUpperCase()}`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 30;

    // Time to crack comparison
    this.doc.fontSize(14).font("Helvetica-Bold");
    this.doc.text("Cracking Time Analysis:", this.margin, this.currentY);
    this.currentY += 20;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      `Random Generator: ${comparison.random.crackingTime.average.toFixed(2)} years (average)`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Markov Generator: ${comparison.markov.crackingTime.average.toFixed(2)} years (average)`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Difference: ${comparison.comparison.timeComparison.difference.toFixed(2)} years`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Better approach: ${comparison.comparison.timeComparison.better.toUpperCase()}`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 30;

    // Generate entropy comparison chart
    await this.generateEntropyComparisonChart(randomPasswords, markovPasswords);
    this.addNewPage();

    // Security compliance
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("3.4 Security Metrics Comparison", this.margin, this.margin);
    this.currentY = 100;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      "Security Compliance (60+ bits, 10+ years):",
      this.margin,
      this.currentY
    );
    this.currentY += 20;

    this.doc.text(`Random Generator:`, this.margin + 20, this.currentY);
    this.currentY += 15;
    this.doc.text(
      `  • Entropy more than 60 bits: ${comparison.random.securityCompliance.entropyAbove60BitsPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `  • Time more than 10 years: ${comparison.random.securityCompliance.timeAbove10YearsPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `  • Both requirements: ${comparison.random.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 30;

    this.doc.text(`Markov Generator:`, this.margin + 20, this.currentY);
    this.currentY += 15;
    this.doc.text(
      `  • Entropy ≥60 bits: ${comparison.markov.securityCompliance.entropyAbove60BitsPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `  • Time ≥10 years: ${comparison.markov.securityCompliance.timeAbove10YearsPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `  • Both requirements: ${comparison.markov.securityCompliance.bothRequirementsMetPercentage.toFixed(1)}%`,
      this.margin + 40,
      this.currentY
    );
    this.currentY += 30;

    // Readability analysis
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("3.5 Readability Analysis", this.margin, this.currentY);
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      `Random Generator: ${comparison.random.readabilityScore.averageScore.toFixed(2)} (average score)`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Markov Generator: ${comparison.markov.readabilityScore.averageScore.toFixed(2)} (average score)`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Difference: ${comparison.comparison.readabilityComparison.difference.toFixed(2)}`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Better approach: ${comparison.comparison.readabilityComparison.better.toUpperCase()}`,
      this.margin,
      this.currentY
    );
    this.currentY += 30;

    // Generate security compliance chart
    await this.generateSecurityComplianceChart(comparison);
    this.addNewPage();
  }

  /**
   * Generate conclusions section
   */
  private async generateConclusions(
    comparison: ComparisonAnalysis
  ): Promise<void> {
    this.doc.fontSize(20).font("Helvetica-Bold");
    this.doc.text(
      "4. Conclusions and Recommendations",
      this.margin,
      this.margin
    );
    this.currentY = 100;

    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("4.1 Key Findings", this.margin, this.currentY);
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      "Based on the comprehensive analysis of 1,000 generated passwords from each approach:",
      this.margin,
      this.currentY
    );
    this.currentY += 30;

    // Key findings
    const findings = [
      `• ${comparison.comparison.entropyComparison.better.toUpperCase()} approach generates passwords with higher average entropy`,
      `• ${comparison.comparison.timeComparison.better.toUpperCase()} approach generates passwords with longer average cracking time`,
      `• ${comparison.comparison.readabilityComparison.better.toUpperCase()} approach generates more readable passwords`,
      `• ${comparison.comparison.securityComplianceComparison.better.toUpperCase()} approach better meets security requirements (60+ bits, 10+ years)`,
    ];

    findings.forEach((finding) => {
      this.doc.text(finding, this.margin, this.currentY);
      this.currentY += 20;
    });

    this.currentY += 30;

    // Recommendations
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("4.2 Recommendations", this.margin, this.currentY);
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text(
      "Based on the analysis, the following recommendations are made:",
      this.margin,
      this.currentY
    );
    this.currentY += 20;

    comparison.recommendations.recommendations.forEach((rec, i) => {
      this.doc.text(`${i + 1}. ${rec}`, this.margin, this.currentY);
      this.currentY += 20;
    });

    this.currentY += 30;

    // Overall winner
    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("4.3 Overall Winner", this.margin, this.currentY);
    this.currentY += 30;

    this.doc.fontSize(14).font("Helvetica-Bold");
    this.doc.text(
      `${comparison.recommendations.overallWinner.toUpperCase()} APPROACH WINS`,
      this.margin,
      this.currentY
    );
    this.currentY += 30;

    this.doc.fontSize(12).font("Helvetica");
    this.doc.text("Scoring:", this.margin, this.currentY);
    this.currentY += 20;
    this.doc.text(
      `Random Score: ${comparison.recommendations.randomScore.toFixed(2)}/100`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 15;
    this.doc.text(
      `Markov Score: ${comparison.recommendations.markovScore.toFixed(2)}/100`,
      this.margin + 20,
      this.currentY
    );
    this.currentY += 30;

    this.doc.text(
      "The winning approach demonstrates superior performance across multiple security and usability metrics.",
      this.margin,
      this.currentY
    );
  }

  /**
   * Generate appendices
   */
  private async generateAppendices(): Promise<void> {
    this.addNewPage();
    this.doc.fontSize(20).font("Helvetica-Bold");
    this.doc.text("5. Appendices", this.margin, this.margin);
    this.currentY = 100;

    this.doc.fontSize(16).font("Helvetica-Bold");
    this.doc.text("5.1 Sample Generated Passwords", this.margin, this.currentY);
    this.currentY += 30;

    this.addText("Random Generator (first 10):", this.margin, 12, "Helvetica");
    this.currentY += 10;

    // Display actual random passwords from the analysis
    const randomPasswords = this.getRandomPasswords();
    for (let i = 0; i < Math.min(10, randomPasswords.length); i++) {
      const password = randomPasswords[i];
      if (password) {
        this.checkPageBreak(20);
        this.doc.fontSize(10).font("Helvetica");
        this.doc.text(
          `${i + 1}. ${password.password} (${password.entropy.toFixed(1)} bits, ${password.timeToCrack.years.toFixed(1)} years)`,
          this.margin + 20,
          this.currentY
        );
        this.currentY += 12;
      }
    }

    this.currentY += 20;
    this.addText("Markov Generator (first 10):", this.margin, 12, "Helvetica");
    this.currentY += 10;

    // Display actual markov passwords from the analysis
    const markovPasswords = this.getMarkovPasswords();
    for (let i = 0; i < Math.min(10, markovPasswords.length); i++) {
      const password = markovPasswords[i];
      if (password) {
        this.checkPageBreak(20);
        this.doc.fontSize(10).font("Helvetica");
        this.doc.text(
          `${i + 1}. ${password.password} (${password.entropy.toFixed(1)} bits, ${password.timeToCrack.years.toFixed(1)} years)`,
          this.margin + 20,
          this.currentY
        );
        this.currentY += 12;
      }
    }
  }

  /**
   * Generate composition pie chart
   */
  private async generateCompositionChart(
    analysis: PasswordAnalysis
  ): Promise<void> {
    const canvas = createCanvas(300, 200);
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 300, 200);

    // Draw pie chart
    const centerX = 150;
    const centerY = 100;
    const radius = 70;
    const total = analysis.sampleSize;

    const data = [
      {
        label: "Uppercase",
        value: analysis.composition.uppercase,
        color: "#667eea",
      },
      {
        label: "Lowercase",
        value: analysis.composition.lowercase,
        color: "#764ba2",
      },
      {
        label: "Numbers",
        value: analysis.composition.numbers,
        color: "#f093fb",
      },
      {
        label: "Symbols",
        value: analysis.composition.symbols,
        color: "#4facfe",
      },
    ];

    let currentAngle = 0;
    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Add legend
    let legendY = 15;
    data.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(15, legendY, 12, 12);
      ctx.fillStyle = "#000000";
      ctx.font = "10px Arial";
      ctx.fillText(
        `${item.label}: ${((item.value / total) * 100).toFixed(1)}%`,
        32,
        legendY + 10
      );
      legendY += 18;
    });

    // Add chart to PDF
    const imageBuffer = canvas.toBuffer("image/png");
    this.doc.image(imageBuffer, this.margin, this.currentY, {
      width: 300,
      height: 200,
    });
    this.currentY += 220;
  }

  /**
   * Generate length distribution chart
   */
  private async generateLengthDistributionChart(
    analysis: PasswordAnalysis
  ): Promise<void> {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 250);

    const sortedLengths = Object.entries(analysis.lengthFrequency)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .slice(0, 15);

    const maxCount = Math.max(
      ...sortedLengths.map(([, count]) => count as number)
    );
    const barWidth = 400 / sortedLengths.length;
    const maxHeight = 200;

    // Draw bars
    sortedLengths.forEach(([length, count], index) => {
      const barHeight = ((count as number) / maxCount) * maxHeight;
      const x = index * barWidth;
      const y = 250 - barHeight - 15;

      ctx.fillStyle = "#667eea";
      ctx.fillRect(x + 3, y, barWidth - 6, barHeight);

      // Add labels
      ctx.fillStyle = "#000000";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(length, x + barWidth / 2, 245);
    });

    // Add title
    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Password Length Distribution", 200, 12);

    // Add chart to PDF
    const imageBuffer = canvas.toBuffer("image/png");
    this.doc.image(imageBuffer, this.margin, this.currentY, {
      width: 400,
      height: 250,
    });
    this.currentY += 270;
  }

  /**
   * Generate character frequency chart
   */
  private async generateCharacterFrequencyChart(
    analysis: PasswordAnalysis
  ): Promise<void> {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 250);

    const sortedChars = Object.entries(analysis.characterFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);

    const maxCount = Math.max(
      ...sortedChars.map(([, count]) => count as number)
    );
    const barWidth = 400 / sortedChars.length;
    const maxHeight = 200;

    // Draw bars
    sortedChars.forEach(([char, count], index) => {
      const barHeight = ((count as number) / maxCount) * maxHeight;
      const x = index * barWidth;
      const y = 250 - barHeight - 15;

      ctx.fillStyle = "#764ba2";
      ctx.fillRect(x + 3, y, barWidth - 6, barHeight);

      // Add labels
      ctx.fillStyle = "#000000";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      const displayChar = char === " " ? "[space]" : char;
      ctx.fillText(displayChar, x + barWidth / 2, 245);
    });

    // Add title
    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Most Common Characters", 200, 12);

    // Add chart to PDF
    const imageBuffer = canvas.toBuffer("image/png");
    this.doc.image(imageBuffer, this.margin, this.currentY, {
      width: 400,
      height: 250,
    });
    this.currentY += 270;
  }

  /**
   * Generate entropy comparison chart
   */
  private async generateEntropyComparisonChart(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): Promise<void> {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 250);

    // Create histogram data
    const randomEntropies = randomPasswords.map((p) => p.entropy);
    const markovEntropies = markovPasswords.map((p) => p.entropy);

    const binSize = 5;
    const bins: { [key: string]: { random: number; markov: number } } = {};

    // Create bins
    [...randomEntropies, ...markovEntropies].forEach((entropy) => {
      const bin = Math.floor(entropy / binSize) * binSize;
      const binKey = `${bin}-${bin + binSize}`;
      if (!bins[binKey]) {
        bins[binKey] = { random: 0, markov: 0 };
      }
    });

    // Count frequencies
    randomEntropies.forEach((entropy) => {
      const bin = Math.floor(entropy / binSize) * binSize;
      const binKey = `${bin}-${bin + binSize}`;
      if (bins[binKey]) {
        bins[binKey].random++;
      }
    });

    markovEntropies.forEach((entropy) => {
      const bin = Math.floor(entropy / binSize) * binSize;
      const binKey = `${bin}-${bin + binSize}`;
      if (bins[binKey]) {
        bins[binKey].markov++;
      }
    });

    const binEntries = Object.entries(bins).sort(
      (a, b) => parseInt(a[0]) - parseInt(b[0])
    );
    const maxCount = Math.max(
      ...binEntries.map(([, data]) => Math.max(data.random, data.markov))
    );

    const barWidth = 400 / binEntries.length;
    const maxHeight = 200;

    // Draw bars
    binEntries.forEach(([bin, data], index) => {
      const randomHeight = (data.random / maxCount) * maxHeight;
      const markovHeight = (data.markov / maxCount) * maxHeight;
      const x = index * barWidth;

      // Random bars
      ctx.fillStyle = "#667eea";
      ctx.fillRect(
        x + 3,
        250 - randomHeight - 15,
        (barWidth - 6) / 2,
        randomHeight
      );

      // Markov bars
      ctx.fillStyle = "#764ba2";
      ctx.fillRect(
        x + 3 + (barWidth - 6) / 2,
        250 - markovHeight - 15,
        (barWidth - 6) / 2,
        markovHeight
      );

      // Add labels
      ctx.fillStyle = "#000000";
      ctx.font = "7px Arial";
      ctx.textAlign = "center";
      ctx.fillText(bin, x + barWidth / 2, 245);
    });

    // Add title and legend
    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Entropy Distribution Comparison", 200, 12);

    // Legend
    ctx.fillStyle = "#667eea";
    ctx.fillRect(15, 15, 12, 12);
    ctx.fillStyle = "#000000";
    ctx.font = "10px Arial";
    ctx.fillText("Random", 32, 25);

    ctx.fillStyle = "#764ba2";
    ctx.fillRect(100, 15, 12, 12);
    ctx.fillStyle = "#000000";
    ctx.fillText("Markov", 117, 25);

    // Add chart to PDF
    const imageBuffer = canvas.toBuffer("image/png");
    this.doc.image(imageBuffer, this.margin, this.currentY, {
      width: 400,
      height: 250,
    });
    this.currentY += 270;
  }

  /**
   * Generate security compliance chart
   */
  private async generateSecurityComplianceChart(
    comparison: ComparisonAnalysis
  ): Promise<void> {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 250);

    const categories = [
      "Entropy ≥60 bits",
      "Time ≥10 years",
      "Both Requirements",
    ];
    const randomValues = [
      comparison.random.securityCompliance.entropyAbove60BitsPercentage,
      comparison.random.securityCompliance.timeAbove10YearsPercentage,
      comparison.random.securityCompliance.bothRequirementsMetPercentage,
    ];
    const markovValues = [
      comparison.markov.securityCompliance.entropyAbove60BitsPercentage,
      comparison.markov.securityCompliance.timeAbove10YearsPercentage,
      comparison.markov.securityCompliance.bothRequirementsMetPercentage,
    ];

    const maxValue = Math.max(...randomValues, ...markovValues);
    const barWidth = 400 / categories.length;
    const maxHeight = 200;

    // Draw bars
    categories.forEach((category, index) => {
      const randomHeight = ((randomValues[index] || 0) / maxValue) * maxHeight;
      const markovHeight = ((markovValues[index] || 0) / maxValue) * maxHeight;
      const x = index * barWidth;

      // Random bars
      ctx.fillStyle = "#667eea";
      ctx.fillRect(
        x + 5,
        250 - randomHeight - 15,
        (barWidth - 10) / 2,
        randomHeight
      );

      // Markov bars
      ctx.fillStyle = "#764ba2";
      ctx.fillRect(
        x + 5 + (barWidth - 10) / 2,
        250 - markovHeight - 15,
        (barWidth - 10) / 2,
        markovHeight
      );

      // Add labels
      ctx.fillStyle = "#000000";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(category, x + barWidth / 2, 245);
    });

    // Add title and legend
    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Security Compliance Comparison (%)", 200, 12);

    // Legend
    ctx.fillStyle = "#667eea";
    ctx.fillRect(15, 15, 12, 12);
    ctx.fillStyle = "#000000";
    ctx.font = "10px Arial";
    ctx.fillText("Random", 32, 25);

    ctx.fillStyle = "#764ba2";
    ctx.fillRect(100, 15, 12, 12);
    ctx.fillStyle = "#000000";
    ctx.fillText("Markov", 117, 25);

    // Add chart to PDF
    const imageBuffer = canvas.toBuffer("image/png");
    this.doc.image(imageBuffer, this.margin, this.currentY, {
      width: 400,
      height: 250,
    });
    this.currentY += 270;
  }

  /**
   * Add new page
   */
  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  /**
   * Check if we need a new page and add one if necessary
   */
  private checkPageBreak(requiredSpace: number = 50): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  /**
   * Add text with proper spacing and page break handling
   */
  private addText(
    text: string,
    x: number = this.margin,
    fontSize: number = 12,
    font: string = "Helvetica"
  ): void {
    this.checkPageBreak(20);
    this.doc.fontSize(fontSize).font(font);
    this.doc.text(text, x, this.currentY);
    this.currentY += fontSize + 5;
  }

  /**
   * Get random passwords for display
   */
  private getRandomPasswords(): GeneratedPassword[] {
    return this.randomPasswords;
  }

  /**
   * Get markov passwords for display
   */
  private getMarkovPasswords(): GeneratedPassword[] {
    return this.markovPasswords;
  }
}
