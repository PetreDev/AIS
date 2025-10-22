import { PasswordAnalysis } from "../types";
import * as fs from "fs";

/**
 * Part 1: Password Database Analysis
 * Analyzes password characteristics from database samples
 */
export class PasswordAnalyzer {
  /**
   * Analyze password characteristics from a sample
   * @param passwords Array of passwords to analyze
   * @returns PasswordAnalysis object with comprehensive statistics
   */
  analyzePasswords(passwords: string[]): PasswordAnalysis {
    if (passwords.length === 0) {
      throw new Error("No passwords provided for analysis");
    }

    // Calculate average length
    const totalLength = passwords.reduce((sum, pwd) => sum + pwd.length, 0);
    const averageLength = totalLength / passwords.length;

    // Calculate composition statistics
    const composition = {
      uppercase: 0,
      lowercase: 0,
      numbers: 0,
      symbols: 0,
    };

    const lengthFrequency: { [key: number]: number } = {};
    const characterFrequency: { [key: string]: number } = {};

    passwords.forEach((password) => {
      // Check character types
      if (/[A-Z]/.test(password)) composition.uppercase++;
      if (/[a-z]/.test(password)) composition.lowercase++;
      if (/\d/.test(password)) composition.numbers++;
      if (/[^A-Za-z0-9]/.test(password)) composition.symbols++;

      // Count length frequency
      const length = password.length;
      lengthFrequency[length] = (lengthFrequency[length] || 0) + 1;

      // Count character frequency
      for (const char of password) {
        characterFrequency[char] = (characterFrequency[char] || 0) + 1;
      }
    });

    return {
      sampleSize: passwords.length,
      averageLength,
      composition,
      lengthFrequency,
      characterFrequency,
      samplePasswords: passwords.slice(0, 20), // First 20 for display
    };
  }

  /**
   * Display analysis results in a formatted way
   * @param analysis Analysis results to display
   */
  displayAnalysis(analysis: PasswordAnalysis): void {
    console.log("\n=== PASSWORD ANALYSIS RESULTS ===\n");

    console.log(`Sample size: ${analysis.sampleSize} passwords`);
    console.log(
      `Average password length: ${analysis.averageLength.toFixed(2)} characters\n`
    );

    console.log("Sample passwords (first 20):");
    analysis.samplePasswords.forEach((pwd, index) => {
      console.log(`${index + 1}. ${pwd}`);
    });

    console.log("\n=== CHARACTER COMPOSITION ===");
    const total = analysis.sampleSize;
    console.log(
      `Passwords containing uppercase letters: ${((analysis.composition.uppercase / total) * 100).toFixed(2)}%`
    );
    console.log(
      `Passwords containing lowercase letters: ${((analysis.composition.lowercase / total) * 100).toFixed(2)}%`
    );
    console.log(
      `Passwords containing numbers: ${((analysis.composition.numbers / total) * 100).toFixed(2)}%`
    );
    console.log(
      `Passwords containing symbols: ${((analysis.composition.symbols / total) * 100).toFixed(2)}%`
    );

    console.log("\n=== MOST COMMON PASSWORD LENGTHS ===");
    const sortedLengths = Object.entries(analysis.lengthFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedLengths.forEach(([length, count]) => {
      const percentage = ((count / total) * 100).toFixed(2);
      console.log(`Length ${length}: ${count} passwords (${percentage}%)`);
    });

    console.log("\n=== MOST COMMON CHARACTERS ===");
    const sortedChars = Object.entries(analysis.characterFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedChars.forEach(([char, count]) => {
      const percentage = ((count / total) * 100).toFixed(2);
      const displayChar = char === " " ? "[space]" : char;
      console.log(`'${displayChar}': ${count} occurrences (${percentage}%)`);
    });
  }

  /**
   * Generate Chart.js HTML visualization
   * @param analysis Analysis results to visualize
   * @param outputPath Path to save the HTML file
   */
  generateChartJSVisualization(
    analysis: PasswordAnalysis,
    outputPath: string = "password_analysis_charts.html"
  ): void {
    // Prepare data for charts
    const sortedLengths = Object.entries(analysis.lengthFrequency)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .slice(0, 20); // Top 20 lengths

    const sortedChars = Object.entries(analysis.characterFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 15); // Top 15 characters

    const compositionData = [
      {
        label: "Uppercase Letters",
        value: (
          (analysis.composition.uppercase / analysis.sampleSize) *
          100
        ).toFixed(1),
      },
      {
        label: "Lowercase Letters",
        value: (
          (analysis.composition.lowercase / analysis.sampleSize) *
          100
        ).toFixed(1),
      },
      {
        label: "Numbers",
        value: (
          (analysis.composition.numbers / analysis.sampleSize) *
          100
        ).toFixed(1),
      },
      {
        label: "Symbols",
        value: (
          (analysis.composition.symbols / analysis.sampleSize) *
          100
        ).toFixed(1),
      },
    ];

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Analysis - Chart.js Visualization</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .stat-label {
            color: #666;
            font-size: 1.1em;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            padding: 30px;
        }
        .chart-container {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .chart-title {
            font-size: 1.4em;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
        }
        .sample-passwords {
            background: white;
            padding: 30px;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        .sample-passwords h3 {
            color: #333;
            margin-bottom: 20px;
        }
        .password-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 10px;
        }
        .password-item {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            border-left: 4px solid #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Analysis Dashboard</h1>
            <p>Interactive visualization of password database analysis</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${analysis.sampleSize.toLocaleString()}</div>
                <div class="stat-label">Sample Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.averageLength.toFixed(2)}</div>
                <div class="stat-label">Average Length</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${((analysis.composition.uppercase / analysis.sampleSize) * 100).toFixed(1)}%</div>
                <div class="stat-label">Uppercase Letters</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${((analysis.composition.lowercase / analysis.sampleSize) * 100).toFixed(1)}%</div>
                <div class="stat-label">Lowercase Letters</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${((analysis.composition.numbers / analysis.sampleSize) * 100).toFixed(1)}%</div>
                <div class="stat-label">Numbers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${((analysis.composition.symbols / analysis.sampleSize) * 100).toFixed(1)}%</div>
                <div class="stat-label">Symbols</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">📏 Password Length Distribution</div>
                <div class="chart-wrapper">
                    <canvas id="lengthChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">🔤 Most Common Characters</div>
                <div class="chart-wrapper">
                    <canvas id="charChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">🥧 Character Composition</div>
                <div class="chart-wrapper">
                    <canvas id="compositionChart"></canvas>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">📊 Length Frequency Trend</div>
                <div class="chart-wrapper">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </div>

        <div class="sample-passwords">
            <h3>📋 Sample Passwords (First 20)</h3>
            <div class="password-grid">
                ${analysis.samplePasswords
                  .map(
                    (pwd, index) =>
                      `<div class="password-item">${index + 1}. ${pwd}</div>`
                  )
                  .join("")}
            </div>
        </div>
    </div>

    <script>
        // Chart.js configuration
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#666';

        // Password Length Distribution Chart
        const lengthCtx = document.getElementById('lengthChart').getContext('2d');
        new Chart(lengthCtx, {
            type: 'bar',
            data: {
                labels: [${sortedLengths.map(([length]) => length).join(", ")}],
                datasets: [{
                    label: 'Number of Passwords',
                    data: [${sortedLengths.map(([, count]) => count).join(", ")}],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Character Frequency Chart
        const charCtx = document.getElementById('charChart').getContext('2d');
        new Chart(charCtx, {
            type: 'bar',
            data: {
                labels: [${sortedChars.map(([char]) => `'${char === " " ? "[space]" : char}'`).join(", ")}],
                datasets: [{
                    label: 'Character Frequency',
                    data: [${sortedChars.map(([, count]) => count).join(", ")}],
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Character Composition Pie Chart
        const compositionCtx = document.getElementById('compositionChart').getContext('2d');
        new Chart(compositionCtx, {
            type: 'doughnut',
            data: {
                labels: [${compositionData.map((d) => `'${d.label}'`).join(", ")}],
                datasets: [{
                    data: [${compositionData.map((d) => d.value).join(", ")}],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });

        // Length Frequency Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [${sortedLengths.map(([length]) => length).join(", ")}],
                datasets: [{
                    label: 'Password Count',
                    data: [${sortedLengths.map(([, count]) => count).join(", ")}],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(outputPath, htmlContent);
    console.log(`📊 Chart.js visualization saved: ${outputPath}`);
    console.log(
      `🌐 Open ${outputPath} in your browser to view interactive charts`
    );
  }
}
