/**
 * Core types and interfaces for the password analysis and generation system
 */

export interface PasswordAnalysis {
  sampleSize: number;
  averageLength: number;
  composition: {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
  lengthFrequency: { [key: number]: number };
  characterFrequency: { [key: string]: number };
  samplePasswords: string[];
}

export interface SecurityMetrics {
  entropy: number;
  timeToCrack: {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    years: number;
  };
  strengthLevel: "Very Weak" | "Weak" | "Average" | "Strong" | "Very Strong";
}

export interface PasswordGeneratorConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidSimilar: boolean;
  avoidAmbiguous: boolean;
}

export interface MarkovChainModel {
  states: { [key: string]: number };
  transitions: { [key: string]: { [key: string]: number } };
  order: number;
}

export interface GeneratedPassword {
  password: string;
  entropy: number;
  timeToCrack: SecurityMetrics["timeToCrack"];
  strengthLevel: SecurityMetrics["strengthLevel"];
  generationMethod: "heuristic" | "markov";
}
