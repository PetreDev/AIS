# Password Analysis and Generation System

A comprehensive TypeScript-based system for analyzing password databases and generating secure passwords using both random and Markov chain approaches. This project is part of an advanced information security course assignment.

## 🎯 Project Overview

This system consists of two main components:

1. **Part 1: Password Database Analysis** - Analyzes real-world password datasets to understand patterns, composition, and security characteristics
2. **Part 2: Password Generation Analysis** - Compares random vs. Markov chain-based password generation methods for security and usability

## 📊 Features

### Password Database Analysis (Part 1)

- **Dataset Processing**: Automatically fetches and processes password datasets from GitHub
- **Statistical Analysis**: Comprehensive analysis of password composition, length distribution, and character frequency
- **Security Metrics**: Entropy calculations and security assessment
- **Visualization**: Generates detailed reports with charts and statistics

### Password Generation Analysis (Part 2)

- **Dual Generation Methods**:
  - Random password generation
  - Markov chain-based generation
- **Security Comparison**: Entropy analysis and cracking time estimation
- **Usability Assessment**: Readability scoring for generated passwords
- **Performance Metrics**: Comprehensive comparison between generation methods

## 🛠️ Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Dependencies**:
  - `csv-parser`: CSV file processing
  - `pdfkit`: PDF report generation
  - `canvas`: Chart generation
  - `chart.js`: Data visualization

## 📁 Project Structure

```
task_1/
├── src/
│   ├── analysis/           # Password analysis modules
│   │   ├── passwordAnalyzer.ts
│   │   └── passwordComparison.ts
│   ├── data/              # Data fetching and processing
│   │   └── dataFetcher.ts
│   ├── generators/        # Password generation algorithms
│   │   ├── markovGenerator.ts
│   │   └── randomGenerator.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── main.ts            # Main application entry point
│   ├── part1-analysis.ts  # Part 1 implementation
│   ├── part2-password-generation.ts  # Part 2 implementation
│   └── generateReport.ts  # Report generation utilities
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task_1
```

2. Install dependencies:

```bash
npm install
```

### Usage

The application supports several commands:

#### Run Part 1 (Password Database Analysis)

```bash
npm run analyze
# or
npm start part1
```

#### Run Part 2 (Password Generation Analysis)

```bash
npm run generate
# or
npm start part2
```

#### Run Both Parts

```bash
npm run all
# or
npm start both
```

#### Generate Complete Report

```bash
npm run report
```

## 📈 Output Files

The system generates several output files:

- `part1_analysis_report.json` - Detailed analysis results from Part 1
- `password_generation_report.json` - Password generation comparison results
- `password_analysis_complete_report.pdf` - Comprehensive PDF report
- `pwlds_combined.csv` - Combined password dataset
- `entropy_histogram_data.json` - Entropy distribution data

## 🔍 Key Analysis Metrics

### Password Composition Analysis

- Character type distribution (uppercase, lowercase, numbers, symbols)
- Length frequency analysis
- Character frequency analysis
- Security entropy calculations

### Generation Method Comparison

- **Entropy Analysis**: Measures password unpredictability
- **Cracking Time Estimation**: Estimates time to crack passwords
- **Readability Scoring**: Assesses password memorability
- **Security Compliance**: Checks against security requirements (60+ bits entropy, 10+ years cracking time)

## 📊 Sample Results

Based on the analysis of 10,000 passwords from the GitHub PWLDS dataset:

- **Average Length**: 11.71 characters
- **Character Distribution**:
  - Lowercase: 98.35%
  - Uppercase: 54.88%
  - Numbers: 43.69%
  - Symbols: 53.66%

### Generation Method Performance

- **Markov Chain Approach**: Higher entropy (86.08 bits), better readability (3.61), longer cracking time
- **Random Approach**: Lower entropy (78.63 bits), lower readability (2.90), shorter cracking time
- **Recommendation**: Markov approach performs better overall for security and usability

## 🔧 Development

### Scripts Available

- `npm start` - Run the main application
- `npm run analyze` - Run password database analysis
- `npm run generate` - Run password generation analysis
- `npm run all` - Run both analyses
- `npm run report` - Generate complete report

### Data Sources

The system automatically fetches password datasets from:

- GitHub PWLDS (Password Word Lists Dataset): https://github.com/infinitode/pwlds

## 📝 License

This project is part of an academic assignment for advanced information security coursework.

## 🤝 Contributing

This is an academic project. For questions or issues, please contact the course instructor or teaching assistants.

---

**Note**: This system is designed for educational purposes in the context of information security research and analysis. The password datasets used are publicly available and intended for security research.
