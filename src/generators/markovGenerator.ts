import {
  PasswordGeneratorConfig,
  SecurityMetrics,
  GeneratedPassword,
} from "../types";

/**
 * Markov Chain Password Generator
 * Builds n-gram models from password database and generates natural-looking passwords
 */
export class MarkovPasswordGenerator {
  private model: Map<string, Map<string, number>> = new Map();
  private startStates: Map<string, number> = new Map();
  private order: number = 1; // First-order Markov model (bigrams)
  private trainingData: string[] = [];

  /**
   * Train the Markov model on password database
   * @param passwords Array of passwords to train on
   * @param order Order of Markov model (default: 1 for bigrams)
   */
  trainModel(passwords: string[], order: number = 1): void {
    this.order = order;
    this.trainingData = passwords;
    this.model.clear();
    this.startStates.clear();

    console.log(
      `🧠 Training Markov model (order ${order}) on ${passwords.length} passwords...`
    );

    for (const password of passwords) {
      if (password.length < order + 1) continue;

      // Record start states
      const startState = password.substring(0, order);
      this.startStates.set(
        startState,
        (this.startStates.get(startState) || 0) + 1
      );

      // Record transitions
      for (let i = 0; i < password.length - order; i++) {
        const currentState = password.substring(i, i + order);
        const nextChar = password[i + order];

        if (!nextChar) continue;

        if (!this.model.has(currentState)) {
          this.model.set(currentState, new Map());
        }

        const transitions = this.model.get(currentState)!;
        transitions.set(nextChar, (transitions.get(nextChar) || 0) + 1);
      }
    }

    // Convert counts to probabilities
    this.normalizeProbabilities();

    console.log(`✅ Markov model trained with ${this.model.size} states`);
  }

  /**
   * Normalize transition counts to probabilities
   */
  private normalizeProbabilities(): void {
    for (const [state, transitions] of this.model) {
      const total = Array.from(transitions.values()).reduce(
        (sum: number, count: number) => sum + count,
        0
      );

      for (const [nextChar, count] of transitions) {
        transitions.set(nextChar, count / total);
      }
    }

    // Normalize start state probabilities
    const totalStarts = Array.from(this.startStates.values()).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    for (const [state, count] of this.startStates) {
      this.startStates.set(state, count / totalStarts);
    }
  }

  /**
   * Generate a password using the Markov model
   * @param config Configuration for password generation
   * @returns Generated password with security metrics
   */
  generatePassword(config: PasswordGeneratorConfig): GeneratedPassword {
    let password = this.generateBasePassword(config);

    // Apply improvements to ensure security requirements
    password = this.applySecurityImprovements(password, config);

    // Calculate security metrics
    const entropy = this.calculateEntropy(password);
    const timeToCrack = this.calculateTimeToCrack(entropy);
    const strengthLevel = this.determineStrengthLevel(entropy);

    return {
      password,
      entropy,
      timeToCrack,
      strengthLevel,
      generationMethod: "markov",
    };
  }

  /**
   * Generate base password using Markov chain
   */
  private generateBasePassword(config: PasswordGeneratorConfig): string {
    if (this.model.size === 0) {
      throw new Error("Markov model not trained. Call trainModel() first.");
    }

    // Select random start state
    const startState = this.selectRandomStartState();
    let password = startState;

    // Generate characters using Markov chain
    let currentState = startState;
    const maxLength = config.length;

    while (password.length < maxLength) {
      const nextChar = this.selectNextCharacter(currentState);
      if (nextChar === null) break;

      password += nextChar;
      currentState = password.substring(password.length - this.order);
    }

    // Ensure minimum length
    while (password.length < config.length) {
      const randomChar = this.getRandomCharacter(config);
      password += randomChar;
    }

    return password;
  }

  /**
   * Select random start state based on probabilities
   */
  private selectRandomStartState(): string {
    const random = Math.random();
    let cumulative = 0;

    for (const [state, probability] of this.startStates) {
      cumulative += probability;
      if (random <= cumulative) {
        return state;
      }
    }

    // Fallback to first state if something goes wrong
    const firstState = Array.from(this.startStates.keys())[0];
    return firstState || "a";
  }

  /**
   * Select next character based on current state
   */
  private selectNextCharacter(currentState: string): string | null {
    const transitions = this.model.get(currentState);
    if (!transitions || transitions.size === 0) {
      return null;
    }

    const random = Math.random();
    let cumulative = 0;

    for (const [nextChar, probability] of transitions) {
      cumulative += probability;
      if (random <= cumulative) {
        return nextChar;
      }
    }

    return null;
  }

  /**
   * Apply security improvements to ensure requirements
   */
  private applySecurityImprovements(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    let improved = password;

    // Ensure at least one character from each required category
    improved = this.ensureCharacterCategories(improved, config);

    // Add symbols and numbers if required but missing
    improved = this.ensureRequiredCharacters(improved, config);

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
    if (config.includeUppercase && !chars.some((c) => this.isUppercase(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      const uppercaseChar = this.getRandomUppercase();
      result =
        result.substring(0, randomPos) +
        uppercaseChar +
        result.substring(randomPos + 1);
    }

    if (config.includeLowercase && !chars.some((c) => this.isLowercase(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      const lowercaseChar = this.getRandomLowercase();
      result =
        result.substring(0, randomPos) +
        lowercaseChar +
        result.substring(randomPos + 1);
    }

    if (config.includeNumbers && !chars.some((c) => this.isNumber(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      const numberChar = this.getRandomNumber();
      result =
        result.substring(0, randomPos) +
        numberChar +
        result.substring(randomPos + 1);
    }

    if (config.includeSymbols && !chars.some((c) => this.isSymbol(c))) {
      const randomPos = Math.floor(Math.random() * result.length);
      const symbolChar = this.getRandomSymbol();
      result =
        result.substring(0, randomPos) +
        symbolChar +
        result.substring(randomPos + 1);
    }

    return result;
  }

  /**
   * Ensure required characters are present
   */
  private ensureRequiredCharacters(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    let result = password;

    // Count current character types
    const counts = {
      uppercase: result.split("").filter((c) => this.isUppercase(c)).length,
      lowercase: result.split("").filter((c) => this.isLowercase(c)).length,
      numbers: result.split("").filter((c) => this.isNumber(c)).length,
      symbols: result.split("").filter((c) => this.isSymbol(c)).length,
    };

    // Add more characters if needed for security
    if (config.includeSymbols && counts.symbols < 2) {
      result += this.getRandomSymbol();
    }

    if (config.includeNumbers && counts.numbers < 2) {
      result += this.getRandomNumber();
    }

    return result;
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

      for (let i = 0; i < additionalLength; i++) {
        result += this.getRandomCharacter(config);
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
    if (config.includeLowercase) size += 26;
    if (config.includeUppercase) size += 26;
    if (config.includeNumbers) size += 10;
    if (config.includeSymbols) size += 32; // Common symbols
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
   * Get random character based on configuration
   */
  private getRandomCharacter(config: PasswordGeneratorConfig): string {
    const chars = [];
    if (config.includeLowercase) chars.push(...this.getLowercaseChars());
    if (config.includeUppercase) chars.push(...this.getUppercaseChars());
    if (config.includeNumbers) chars.push(...this.getNumberChars());
    if (config.includeSymbols) chars.push(...this.getSymbolChars());

    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars[randomIndex] || "a";
  }

  /**
   * Character type checking methods
   */
  private isUppercase(char: string): boolean {
    return char >= "A" && char <= "Z";
  }

  private isLowercase(char: string): boolean {
    return char >= "a" && char <= "z";
  }

  private isNumber(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isSymbol(char: string): boolean {
    return (
      !this.isUppercase(char) && !this.isLowercase(char) && !this.isNumber(char)
    );
  }

  /**
   * Character generation methods
   */
  private getRandomUppercase(): string {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }

  private getRandomLowercase(): string {
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  private getRandomNumber(): string {
    return Math.floor(Math.random() * 10).toString();
  }

  private getRandomSymbol(): string {
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex] || "!";
  }

  private getLowercaseChars(): string[] {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
  }

  private getUppercaseChars(): string[] {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }

  private getNumberChars(): string[] {
    return Array.from({ length: 10 }, (_, i) => i.toString());
  }

  private getSymbolChars(): string[] {
    return "!@#$%^&*()_+-=[]{}|;:,.<>?".split("");
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

  /**
   * Get model statistics for analysis
   */
  getModelStatistics() {
    const totalStates = this.model.size;
    const totalTransitions = Array.from(this.model.values()).reduce(
      (sum, transitions) => sum + transitions.size,
      0
    );

    const startStates = this.startStates.size;

    return {
      totalStates,
      totalTransitions,
      startStates,
      averageTransitionsPerState: totalTransitions / totalStates,
      modelOrder: this.order,
      trainingDataSize: this.trainingData.length,
    };
  }
}
