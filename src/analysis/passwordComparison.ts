import { GeneratedPassword } from "../types";

/**
 * Password Generation Comparison Analyzer
 * Compares random heuristic and Markov chain approaches
 */
export class PasswordComparisonAnalyzer {
  /**
   * Compare two sets of generated passwords
   * @param randomPasswords Passwords from random generator
   * @param markovPasswords Passwords from Markov generator
   * @returns Comparison analysis
   */
  compareApproaches(
    randomPasswords: GeneratedPassword[],
    markovPasswords: GeneratedPassword[]
  ): ComparisonAnalysis {
    const randomStats = this.calculateStatistics(randomPasswords);
    const markovStats = this.calculateStatistics(markovPasswords);

    return {
      random: randomStats,
      markov: markovStats,
      comparison: this.generateComparison(randomStats, markovStats),
      recommendations: this.generateRecommendations(randomStats, markovStats),
    };
  }

  /**
   * Calculate comprehensive statistics for a set of passwords
   */
  private calculateStatistics(
    passwords: GeneratedPassword[]
  ): PasswordStatistics {
    const entropies = passwords.map((p) => p.entropy);
    const crackingTimes = passwords.map((p) => p.timeToCrack.years);

    const entropyStats = this.calculateEntropyStatistics(entropies);
    const timeStats = this.calculateTimeStatistics(crackingTimes);
    const strengthDistribution = this.calculateStrengthDistribution(passwords);
    const readabilityScore = this.calculateReadabilityScore(passwords);

    return {
      count: passwords.length,
      entropy: entropyStats,
      crackingTime: timeStats,
      strengthDistribution,
      readabilityScore,
      securityCompliance: this.calculateSecurityCompliance(passwords),
    };
  }

  /**
   * Calculate entropy statistics
   */
  private calculateEntropyStatistics(entropies: number[]): EntropyStatistics {
    const sorted = [...entropies].sort((a, b) => a - b);
    const n = entropies.length;

    return {
      average: entropies.reduce((sum, e) => sum + e, 0) / n,
      median:
        n % 2 === 0
          ? (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2
          : sorted[Math.floor(n / 2)]!,
      min: Math.min(...entropies),
      max: Math.max(...entropies),
      standardDeviation: this.calculateStandardDeviation(entropies),
      above60Bits: entropies.filter((e) => e >= 60).length,
      above60BitsPercentage:
        (entropies.filter((e) => e >= 60).length / n) * 100,
    };
  }

  /**
   * Calculate time statistics
   */
  private calculateTimeStatistics(times: number[]): TimeStatistics {
    const sorted = [...times].sort((a, b) => a - b);
    const n = times.length;

    return {
      average: times.reduce((sum, t) => sum + t, 0) / n,
      median:
        n % 2 === 0
          ? (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2
          : sorted[Math.floor(n / 2)]!,
      min: Math.min(...times),
      max: Math.max(...times),
      above10Years: times.filter((t) => t >= 10).length,
      above10YearsPercentage: (times.filter((t) => t >= 10).length / n) * 100,
    };
  }

  /**
   * Calculate strength level distribution
   */
  private calculateStrengthDistribution(
    passwords: GeneratedPassword[]
  ): StrengthDistribution {
    const distribution = {
      "Very Weak": 0,
      Weak: 0,
      Average: 0,
      Strong: 0,
      "Very Strong": 0,
    };

    passwords.forEach((p) => {
      distribution[p.strengthLevel]++;
    });

    const total = passwords.length;
    return {
      "Very Weak": (distribution["Very Weak"] / total) * 100,
      Weak: (distribution["Weak"] / total) * 100,
      Average: (distribution["Average"] / total) * 100,
      Strong: (distribution["Strong"] / total) * 100,
      "Very Strong": (distribution["Very Strong"] / total) * 100,
    };
  }

  /**
   * Calculate readability score (subjective measure)
   */
  private calculateReadabilityScore(
    passwords: GeneratedPassword[]
  ): ReadabilityScore {
    let totalScore = 0;

    passwords.forEach((p) => {
      const password = p.password;
      let score = 0;

      // Check for common patterns that make passwords more readable
      if (this.hasCommonWords(password)) score += 2;
      if (this.hasPronounceablePatterns(password)) score += 1;
      if (this.hasReasonableLength(password)) score += 1;
      if (!this.hasExcessiveSymbols(password)) score += 1;
      if (this.hasMixedCase(password)) score += 1;

      totalScore += score;
    });

    const maxScore = passwords.length * 6; // Maximum possible score
    return {
      averageScore: totalScore / passwords.length,
      percentage: (totalScore / maxScore) * 100,
      description: this.getReadabilityDescription(
        totalScore / passwords.length
      ),
    };
  }

  /**
   * Calculate security compliance metrics
   */
  private calculateSecurityCompliance(
    passwords: GeneratedPassword[]
  ): SecurityCompliance {
    const total = passwords.length;

    return {
      entropyAbove60Bits: passwords.filter((p) => p.entropy >= 60).length,
      entropyAbove60BitsPercentage:
        (passwords.filter((p) => p.entropy >= 60).length / total) * 100,
      timeAbove10Years: passwords.filter((p) => p.timeToCrack.years >= 10)
        .length,
      timeAbove10YearsPercentage:
        (passwords.filter((p) => p.timeToCrack.years >= 10).length / total) *
        100,
      bothRequirementsMet: passwords.filter(
        (p) => p.entropy >= 60 && p.timeToCrack.years >= 10
      ).length,
      bothRequirementsMetPercentage:
        (passwords.filter((p) => p.entropy >= 60 && p.timeToCrack.years >= 10)
          .length /
          total) *
        100,
    };
  }

  /**
   * Generate comparison between approaches
   */
  private generateComparison(
    randomStats: PasswordStatistics,
    markovStats: PasswordStatistics
  ): ApproachComparison {
    return {
      entropyComparison: {
        random: randomStats.entropy.average,
        markov: markovStats.entropy.average,
        difference: markovStats.entropy.average - randomStats.entropy.average,
        better:
          markovStats.entropy.average > randomStats.entropy.average
            ? "markov"
            : "random",
      },
      timeComparison: {
        random: randomStats.crackingTime.average,
        markov: markovStats.crackingTime.average,
        difference:
          markovStats.crackingTime.average - randomStats.crackingTime.average,
        better:
          markovStats.crackingTime.average > randomStats.crackingTime.average
            ? "markov"
            : "random",
      },
      readabilityComparison: {
        random: randomStats.readabilityScore.averageScore,
        markov: markovStats.readabilityScore.averageScore,
        difference:
          markovStats.readabilityScore.averageScore -
          randomStats.readabilityScore.averageScore,
        better:
          markovStats.readabilityScore.averageScore >
          randomStats.readabilityScore.averageScore
            ? "markov"
            : "random",
      },
      securityComplianceComparison: {
        random: randomStats.securityCompliance.bothRequirementsMetPercentage,
        markov: markovStats.securityCompliance.bothRequirementsMetPercentage,
        difference:
          markovStats.securityCompliance.bothRequirementsMetPercentage -
          randomStats.securityCompliance.bothRequirementsMetPercentage,
        better:
          markovStats.securityCompliance.bothRequirementsMetPercentage >
          randomStats.securityCompliance.bothRequirementsMetPercentage
            ? "markov"
            : "random",
      },
    };
  }

  /**
   * Generate recommendations based on comparison
   */
  private generateRecommendations(
    randomStats: PasswordStatistics,
    markovStats: PasswordStatistics
  ): Recommendations {
    const recommendations: string[] = [];

    // Entropy recommendations
    if (markovStats.entropy.average > randomStats.entropy.average) {
      recommendations.push(
        "Markov approach generates passwords with higher average entropy"
      );
    } else {
      recommendations.push(
        "Random approach generates passwords with higher average entropy"
      );
    }

    // Time recommendations
    if (markovStats.crackingTime.average > randomStats.crackingTime.average) {
      recommendations.push(
        "Markov approach generates passwords with longer average cracking time"
      );
    } else {
      recommendations.push(
        "Random approach generates passwords with longer average cracking time"
      );
    }

    // Readability recommendations
    if (
      markovStats.readabilityScore.averageScore >
      randomStats.readabilityScore.averageScore
    ) {
      recommendations.push("Markov approach generates more readable passwords");
    } else {
      recommendations.push("Random approach generates more readable passwords");
    }

    // Security compliance recommendations
    if (
      markovStats.securityCompliance.bothRequirementsMetPercentage >
      randomStats.securityCompliance.bothRequirementsMetPercentage
    ) {
      recommendations.push(
        "Markov approach better meets security requirements (60+ bits, 10+ years)"
      );
    } else {
      recommendations.push(
        "Random approach better meets security requirements (60+ bits, 10+ years)"
      );
    }

    // Overall recommendation
    const randomScore = this.calculateOverallScore(randomStats);
    const markovScore = this.calculateOverallScore(markovStats);

    if (markovScore > randomScore) {
      recommendations.push(
        "Overall recommendation: Markov approach is better for this use case"
      );
    } else {
      recommendations.push(
        "Overall recommendation: Random approach is better for this use case"
      );
    }

    return {
      recommendations,
      overallWinner: markovScore > randomScore ? "markov" : "random",
      randomScore,
      markovScore,
    };
  }

  /**
   * Calculate overall score for comparison
   */
  private calculateOverallScore(stats: PasswordStatistics): number {
    const entropyScore = Math.min(stats.entropy.average / 60, 1) * 25; // Max 25 points
    const timeScore = Math.min(stats.crackingTime.average / 10, 1) * 25; // Max 25 points
    const readabilityScore = (stats.readabilityScore.percentage / 100) * 25; // Max 25 points
    const complianceScore =
      (stats.securityCompliance.bothRequirementsMetPercentage / 100) * 25; // Max 25 points

    return entropyScore + timeScore + readabilityScore + complianceScore;
  }

  /**
   * Helper methods for readability calculation
   */
  private hasCommonWords(password: string): boolean {
    const commonWords = [
      "password",
      "admin",
      "user",
      "test",
      "login",
      "welcome",
    ];
    const lower = password.toLowerCase();
    return commonWords.some((word) => lower.includes(word));
  }

  private hasPronounceablePatterns(password: string): boolean {
    // Check for consonant-vowel patterns
    const vowels = "aeiou";
    const consonants = "bcdfghjklmnpqrstvwxyz";

    for (let i = 0; i < password.length - 1; i++) {
      const current = password[i]?.toLowerCase();
      const next = password[i + 1]?.toLowerCase();

      if (
        current &&
        next &&
        consonants.includes(current) &&
        vowels.includes(next)
      ) {
        return true;
      }
    }

    return false;
  }

  private hasReasonableLength(password: string): boolean {
    return password.length >= 8 && password.length <= 20;
  }

  private hasExcessiveSymbols(password: string): boolean {
    const symbolCount = password
      .split("")
      .filter((c) => !/[a-zA-Z0-9]/.test(c)).length;
    return symbolCount > password.length * 0.3; // More than 30% symbols
  }

  private hasMixedCase(password: string): boolean {
    return /[a-z]/.test(password) && /[A-Z]/.test(password);
  }

  private getReadabilityDescription(score: number): string {
    if (score >= 4) return "Very Readable";
    if (score >= 3) return "Readable";
    if (score >= 2) return "Moderately Readable";
    if (score >= 1) return "Less Readable";
    return "Not Readable";
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }
}

// Type definitions for the comparison analysis
export interface ComparisonAnalysis {
  random: PasswordStatistics;
  markov: PasswordStatistics;
  comparison: ApproachComparison;
  recommendations: Recommendations;
}

export interface PasswordStatistics {
  count: number;
  entropy: EntropyStatistics;
  crackingTime: TimeStatistics;
  strengthDistribution: StrengthDistribution;
  readabilityScore: ReadabilityScore;
  securityCompliance: SecurityCompliance;
}

export interface EntropyStatistics {
  average: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  above60Bits: number;
  above60BitsPercentage: number;
}

export interface TimeStatistics {
  average: number;
  median: number;
  min: number;
  max: number;
  above10Years: number;
  above10YearsPercentage: number;
}

export interface StrengthDistribution {
  "Very Weak": number;
  Weak: number;
  Average: number;
  Strong: number;
  "Very Strong": number;
}

export interface ReadabilityScore {
  averageScore: number;
  percentage: number;
  description: string;
}

export interface SecurityCompliance {
  entropyAbove60Bits: number;
  entropyAbove60BitsPercentage: number;
  timeAbove10Years: number;
  timeAbove10YearsPercentage: number;
  bothRequirementsMet: number;
  bothRequirementsMetPercentage: number;
}

export interface ApproachComparison {
  entropyComparison: ComparisonMetric;
  timeComparison: ComparisonMetric;
  readabilityComparison: ComparisonMetric;
  securityComplianceComparison: ComparisonMetric;
}

export interface ComparisonMetric {
  random: number;
  markov: number;
  difference: number;
  better: "random" | "markov";
}

export interface Recommendations {
  recommendations: string[];
  overallWinner: "random" | "markov";
  randomScore: number;
  markovScore: number;
}
