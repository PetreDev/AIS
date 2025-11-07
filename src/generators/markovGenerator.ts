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
  private readonly similarChars = "0O1lI";
  private readonly ambiguousChars = "{}[]()/\\'\"`~,;.<>";

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
    const timeToCrack = this.calculateTimeToCrack(password, config);
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

    improved = this.sanitizeToAllowedCharacters(improved, config);

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
    const chars = password.split("");

    const ensureCategory = (
      isRequired: boolean,
      predicate: (char: string) => boolean,
      poolProvider: () => string[]
    ) => {
      if (!isRequired) {
        return;
      }
      if (chars.some((char) => predicate(char))) {
        return;
      }
      if (chars.length === 0) {
        return;
      }
      const index = Math.floor(Math.random() * chars.length);
      chars[index] = this.getRandomFromChars(poolProvider(), config);
    };

    ensureCategory(
      config.includeUppercase,
      (c) => this.isUppercase(c),
      () => this.getUppercaseChars()
    );
    ensureCategory(
      config.includeLowercase,
      (c) => this.isLowercase(c),
      () => this.getLowercaseChars()
    );
    ensureCategory(
      config.includeNumbers,
      (c) => this.isNumber(c),
      () => this.getNumberChars()
    );
    ensureCategory(
      config.includeSymbols,
      (c) => this.isSymbol(c),
      () => this.getSymbolChars()
    );

    return chars.join("");
  }

  /**
   * Ensure required characters are present
   */
  private ensureRequiredCharacters(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    const chars = password.split("");

    const counts = {
      uppercase: chars.filter((c) => this.isUppercase(c)).length,
      lowercase: chars.filter((c) => this.isLowercase(c)).length,
      numbers: chars.filter((c) => this.isNumber(c)).length,
      symbols: chars.filter((c) => this.isSymbol(c)).length,
    };

    const minimums = {
      uppercase: config.includeUppercase ? 1 : 0,
      lowercase: config.includeLowercase ? 1 : 0,
      numbers: config.includeNumbers ? 2 : 0,
      symbols: config.includeSymbols ? 2 : 0,
    };

    const findReplacementIndex = (targetType: keyof typeof counts): number => {
      const length = chars.length;

      const canReplace = (index: number): boolean => {
        const currentChar = chars[index];
        if (currentChar === undefined) {
          return false;
        }
        const currentType = this.getCharacterType(currentChar);
        if (!currentType) return true;
        if (currentType === targetType) return false;
        return counts[currentType] - 1 >= minimums[currentType];
      };

      for (let attempt = 0; attempt < length * 2; attempt++) {
        const index = Math.floor(Math.random() * length);
        if (canReplace(index)) {
          return index;
        }
      }

      for (let index = 0; index < length; index++) {
        if (canReplace(index)) {
          return index;
        }
      }

      return Math.floor(Math.random() * length);
    };

    const replaceChar = (
      index: number,
      newChar: string,
      newType: keyof typeof counts
    ) => {
      const currentChar = chars[index];
      if (currentChar !== undefined) {
        const currentType = this.getCharacterType(currentChar);
        if (currentType) {
          counts[currentType] -= 1;
        }
      }
      chars[index] = newChar;
      counts[newType] += 1;
    };

    const ensureType = (type: keyof typeof counts, pool: string[]) => {
      const required = minimums[type];
      while (counts[type] < required) {
        const index = findReplacementIndex(type);
        replaceChar(index, this.getRandomFromChars(pool, config), type);
      }
    };

    if (config.includeSymbols) {
      ensureType("symbols", this.getSymbolChars());
    }

    if (config.includeNumbers) {
      ensureType("numbers", this.getNumberChars());
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
      if (neededLength > result.length && result.length < config.length) {
        const maxLength = Math.min(neededLength, config.length);
        while (result.length < maxLength) {
          result += this.getRandomCharacter(config);
        }
      }
    }

    return result.slice(0, config.length);
  }

  private sanitizeToAllowedCharacters(
    password: string,
    config: PasswordGeneratorConfig
  ): string {
    const allowedPool = this.buildAllowedCharacterPool(config);
    if (allowedPool.length === 0) {
      throw new Error(
        "No allowed characters available for password generation"
      );
    }
    const allowedSet = new Set(allowedPool);
    const sanitized = password
      .split("")
      .map((char) =>
        allowedSet.has(char) ? char : this.getRandomFromPool(allowedPool)
      )
      .join("");
    return sanitized.slice(0, config.length);
  }

  private buildAllowedCharacterPool(config: PasswordGeneratorConfig): string[] {
    let pool: string[] = [];
    if (config.includeLowercase) {
      pool = pool.concat(this.getLowercaseChars());
    }
    if (config.includeUppercase) {
      pool = pool.concat(this.getUppercaseChars());
    }
    if (config.includeNumbers) {
      pool = pool.concat(this.getNumberChars());
    }
    if (config.includeSymbols) {
      pool = pool.concat(this.getSymbolChars());
    }
    if (pool.length === 0) {
      pool = pool.concat(this.getLowercaseChars());
    }
    const filtered = this.filterCharsForConfig(pool, config);
    return filtered.length > 0 ? filtered : [...pool];
  }

  private filterCharsForConfig(
    chars: string[],
    config: PasswordGeneratorConfig
  ): string[] {
    let filtered = [...chars];
    if (config.avoidSimilar) {
      filtered = filtered.filter((char) => !this.similarChars.includes(char));
    }
    if (config.avoidAmbiguous) {
      filtered = filtered.filter((char) => !this.ambiguousChars.includes(char));
    }
    return filtered;
  }

  private getRandomFromPool(pool: string[]): string {
    if (pool.length === 0) {
      return "a";
    }
    const index = Math.floor(Math.random() * pool.length);
    return pool[index] ?? pool[0] ?? "a";
  }

  private getRandomFromChars(
    chars: string[],
    config: PasswordGeneratorConfig
  ): string {
    const filtered = this.filterCharsForConfig(chars, config);
    const pool = filtered.length > 0 ? filtered : [...chars];
    return this.getRandomFromPool(pool);
  }

  private getCharacterType(
    char: string
  ): "uppercase" | "lowercase" | "numbers" | "symbols" | null {
    if (this.isUppercase(char)) return "uppercase";
    if (this.isLowercase(char)) return "lowercase";
    if (this.isNumber(char)) return "numbers";
    if (this.isSymbol(char)) return "symbols";
    return null;
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
  calculateTimeToCrack(
    password: string,
    config: PasswordGeneratorConfig
  ): SecurityMetrics["timeToCrack"] {
    const charsetSize = Math.max(
      this.getCharacterSetSize(config),
      this.getCharacterSetSizeFromPassword(password),
      1
    );

    const combinations = Math.pow(charsetSize, password.length);

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
    if (config.includeLowercase) size += this.getLowercaseChars().length;
    if (config.includeUppercase) size += this.getUppercaseChars().length;
    if (config.includeNumbers) size += this.getNumberChars().length;
    if (config.includeSymbols) size += this.getSymbolChars().length;
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
    const pool = this.buildAllowedCharacterPool(config);
    return this.getRandomFromPool(pool);
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
