import {
  PasswordGeneratorConfig,
  SecurityMetrics,
  GeneratedPassword,
} from "../types";

/**
 * Random Password Generator with Heuristics
 * Implements entropy estimation, time to crack estimation, and password improvements
 */
export class RandomPasswordGenerator {
  private readonly lowercase = "abcdefghijklmnopqrstuvwxyz";
  private readonly uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private readonly numbers = "0123456789";
  private readonly symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  private readonly similarChars = "0O1lI";
  private readonly ambiguousChars = "{}[]()/\\'\"`~,;.<>";

  /**
   * Generate a random password with heuristics
   * @param config Configuration for password generation
   * @returns Generated password with security metrics
   */
  generatePassword(config: PasswordGeneratorConfig): GeneratedPassword {
    let password = this.generateBasePassword(config);

    // Apply heuristics to improve password strength
    password = this.applyHeuristics(password, config);

    // Calculate security metrics
    const entropy = this.calculateEntropy(password);
    const timeToCrack = this.calculateTimeToCrack(entropy);
    const strengthLevel = this.determineStrengthLevel(entropy);

    return {
      password,
      entropy,
      timeToCrack,
      strengthLevel,
      generationMethod: "heuristic",
    };
  }

  /**
   * Generate base password using random selection
   */
  private generateBasePassword(config: PasswordGeneratorConfig): string {
    let charset = "";
    let password = "";

    // Build character set based on configuration
    if (config.includeLowercase) charset += this.lowercase;
    if (config.includeUppercase) charset += this.uppercase;
    if (config.includeNumbers) charset += this.numbers;
    if (config.includeSymbols) charset += this.symbols;

    // Remove similar characters if configured
    if (config.avoidSimilar) {
      charset = charset
        .split("")
        .filter((char) => !this.similarChars.includes(char))
        .join("");
    }

    // Remove ambiguous characters if configured
    if (config.avoidAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !this.ambiguousChars.includes(char))
        .join("");
    }

    if (charset.length === 0) {
      throw new Error("No character set available for password generation");
    }

    // Generate random password
    for (let i = 0; i < config.length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password;
  }

  /**
   * Apply heuristics to improve password strength
   */
  private applyHeuristics(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    let improved = password;

    // Ensure at least one character from each required category
    improved = this.ensureCharacterCategories(improved, config);

    // Break common patterns
    improved = this.breakCommonPatterns(improved);

    // Avoid sequential characters
    improved = this.avoidSequentialChars(improved);

    // Add entropy if needed
    if (this.calculateEntropy(improved) < 60) {
      improved = this.addEntropy(improved, config);
    }

    return improved;
  }

  /**
   * Ensure password contains at least one character from each required category
   */
  private ensureCharacterCategories(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    let result = password;
    const chars = result.split("");

    // Check and add missing categories
    if (
      config.includeUppercase &&
      !chars.some((c) => this.uppercase.includes(c))
    ) {
      const randomPos = Math.floor(Math.random() * result.length);
      result =
        result.substring(0, randomPos) +
        this.uppercase[Math.floor(Math.random() * this.uppercase.length)] +
        result.substring(randomPos + 1);
    }

    if (
      config.includeLowercase &&
      !chars.some((c) => this.lowercase.includes(c))
    ) {
      const randomPos = Math.floor(Math.random() * result.length);
      result =
        result.substring(0, randomPos) +
        this.lowercase[Math.floor(Math.random() * this.lowercase.length)] +
        result.substring(randomPos + 1);
    }

    if (config.includeNumbers && !chars.some((c) => this.numbers.includes(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      result =
        result.substring(0, randomPos) +
        this.numbers[Math.floor(Math.random() * this.numbers.length)] +
        result.substring(randomPos + 1);
    }

    if (config.includeSymbols && !chars.some((c) => this.symbols.includes(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      result =
        result.substring(0, randomPos) +
        this.symbols[Math.floor(Math.random() * this.symbols.length)] +
        result.substring(randomPos + 1);
    }

    return result;
  }

  /**
   * Break common patterns in password
   */
  private breakCommonPatterns(password: string): string {
    let result = password;

    // Break repeated characters
    result = result.replace(/(.)\1{2,}/g, (match) => {
      const char = match[0];
      if (!char) return match;

      const length = match.length;
      let replacement = char;

      // Replace repeated characters with varied characters
      for (let i = 1; i < length; i++) {
        const alternatives = this.getAlternativeChars(char);
        replacement +=
          alternatives[Math.floor(Math.random() * alternatives.length)];
      }

      return replacement;
    });

    return result;
  }

  /**
   * Avoid sequential characters (abc, 123, etc.)
   */
  private avoidSequentialChars(password: string): string {
    let result = password;
    const chars = result.split("");

    for (let i = 0; i < chars.length - 2; i++) {
      const char1 = chars[i];
      const char2 = chars[i + 1];
      const char3 = chars[i + 2];

      if (char1 && char2 && char3 && this.isSequential(char1, char2, char3)) {
        // Replace middle character with random alternative
        const alternatives = this.getAlternativeChars(char2);
        const randomChar =
          alternatives[Math.floor(Math.random() * alternatives.length)];
        if (randomChar) {
          chars[i + 1] = randomChar;
        }
      }
    }

    return chars.join("");
  }

  /**
   * Add entropy to password if needed
   */
  private addEntropy(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    let result = password;
    const currentEntropy = this.calculateEntropy(result);

    if (currentEntropy < 60) {
      // Add more characters to increase entropy
      const neededLength = Math.ceil(
        60 / Math.log2(this.getCharacterSetSize(config))
      );
      const additionalLength = Math.max(0, neededLength - result.length);

      let charset = "";
      if (config.includeLowercase) charset += this.lowercase;
      if (config.includeUppercase) charset += this.uppercase;
      if (config.includeNumbers) charset += this.numbers;
      if (config.includeSymbols) charset += this.symbols;

      for (let i = 0; i < additionalLength; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
      }
    }

    return result;
  }

  /**
   * Calculate password entropy in bits
   */
  calculateEntropy(password: string): number {
    // Calculate entropy based on actual character set used
    const charsetSize = this.getCharacterSetSizeFromPassword(password);

    // If charset is too small, use theoretical maximum based on configuration
    if (charsetSize < 26) {
      // Use theoretical maximum character set size
      let theoreticalSize = 0;
      if (password.match(/[a-z]/)) theoreticalSize += 26;
      if (password.match(/[A-Z]/)) theoreticalSize += 26;
      if (password.match(/[0-9]/)) theoreticalSize += 10;
      if (password.match(/[^a-zA-Z0-9]/)) theoreticalSize += 32; // Common symbols

      return (
        password.length * Math.log2(Math.max(charsetSize, theoreticalSize))
      );
    }

    return password.length * Math.log2(charsetSize);
  }

  /**
   * Calculate time to crack at different attack speeds
   */
  calculateTimeToCrack(entropy: number): SecurityMetrics["timeToCrack"] {
    const combinations = Math.pow(2, entropy);

    const speeds = {
      slow: Math.pow(10, 6), // 10^6 attempts/s
      medium: Math.pow(10, 9), // 10^9 attempts/s
      fast: Math.pow(10, 12), // 10^12 attempts/s
    };

    // Use the fastest attack speed for worst-case scenario
    const timeInSeconds = combinations / speeds.fast;

    return {
      seconds: timeInSeconds,
      minutes: timeInSeconds / 60,
      hours: timeInSeconds / 3600,
      days: timeInSeconds / 86400,
      years: timeInSeconds / (365.25 * 86400),
    };
  }

  /**
   * Determine password strength level based on entropy
   */
  private determineStrengthLevel(
    entropy: number
  ): SecurityMetrics["strengthLevel"] {
    if (entropy < 30) return "Very Weak";
    if (entropy < 40) return "Weak";
    if (entropy < 50) return "Average";
    if (entropy < 60) return "Strong";
    return "Very Strong";
  }

  /**
   * Get character set size from configuration
   */
  private getCharacterSetSize(config: PasswordGeneratorConfig): number {
    let size = 0;
    if (config.includeLowercase) size += this.lowercase.length;
    if (config.includeUppercase) size += this.uppercase.length;
    if (config.includeNumbers) size += this.numbers.length;
    if (config.includeSymbols) size += this.symbols.length;
    return size;
  }

  /**
   * Get character set size from actual password
   */
  private getCharacterSetSizeFromPassword(password: string): number {
    const uniqueChars = new Set(password.split(""));
    return uniqueChars.size;
  }

  /**
   * Check if three characters are sequential
   */
  private isSequential(char1: string, char2: string, char3: string): boolean {
    const isAlphaSeq = this.isAlphaSequential(char1, char2, char3);
    const isNumericSeq = this.isNumericSequential(char1, char2, char3);
    return isAlphaSeq || isNumericSeq;
  }

  /**
   * Check if three characters are alphabetically sequential
   */
  private isAlphaSequential(
    char1: string,
    char2: string,
    char3: string
  ): boolean {
    const code1 = char1.toLowerCase().charCodeAt(0);
    const code2 = char2.toLowerCase().charCodeAt(0);
    const code3 = char3.toLowerCase().charCodeAt(0);

    return code2 === code1 + 1 && code3 === code2 + 1;
  }

  /**
   * Check if three characters are numerically sequential
   */
  private isNumericSequential(
    char1: string,
    char2: string,
    char3: string
  ): boolean {
    const num1 = parseInt(char1);
    const num2 = parseInt(char2);
    const num3 = parseInt(char3);

    return (
      !isNaN(num1) &&
      !isNaN(num2) &&
      !isNaN(num3) &&
      num2 === num1 + 1 &&
      num3 === num2 + 1
    );
  }

  /**
   * Get alternative characters for a given character
   */
  private getAlternativeChars(char: string): string {
    if (this.lowercase.includes(char)) return this.lowercase;
    if (this.uppercase.includes(char)) return this.uppercase;
    if (this.numbers.includes(char)) return this.numbers;
    if (this.symbols.includes(char)) return this.symbols;
    return this.lowercase + this.uppercase + this.numbers + this.symbols;
  }

  /**
   * Generate multiple passwords for comparison
   */
  generateMultiplePasswords(
    config: PasswordGeneratorConfig,
    count: number = 1000
  ): GeneratedPassword[] {
    const passwords: GeneratedPassword[] = [];

    for (let i = 0; i < count; i++) {
      passwords.push(this.generatePassword(config));
    }

    return passwords;
  }

  /**
   * Get statistics for generated passwords
   */
  getPasswordStatistics(passwords: GeneratedPassword[]) {
    const entropies = passwords.map((p) => p.entropy);
    const avgEntropy =
      entropies.reduce((sum, e) => sum + e, 0) / entropies.length;
    const minEntropy = Math.min(...entropies);
    const maxEntropy = Math.max(...entropies);

    const avgCrackingTime =
      passwords.reduce((sum, p) => sum + p.timeToCrack.years, 0) /
      passwords.length;

    return {
      count: passwords.length,
      averageEntropy: avgEntropy,
      minEntropy,
      maxEntropy,
      averageCrackingTimeYears: avgCrackingTime,
      passwordsAbove60Bits: passwords.filter((p) => p.entropy >= 60).length,
      passwordsAbove10Years: passwords.filter((p) => p.timeToCrack.years >= 10)
        .length,
    };
  }
}
