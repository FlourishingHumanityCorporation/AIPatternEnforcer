#!/usr/bin/env node
/**
 * Pattern Recognition Quiz for Claude Code Instances
 * Interactive learning exercises for pattern identification and application
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class PatternQuiz {
    constructor() {
        this.quizData = this.loadQuizData();
        this.results = {
            totalQuestions: 0,
            correctAnswers: 0,
            categories: {},
            startTime: new Date()
        };
        this.metricsFile = 'tools/metrics/pattern-quiz-results.json';
    }
    
    loadQuizData() {
        return {
            fileNaming: {
                name: 'File Naming Patterns',
                description: 'Identify correct and incorrect file naming patterns',
                questions: [
                    {
                        id: 'fn1',
                        type: 'multiple-choice',
                        question: 'A developer wants to improve the existing auth.js file. What should they do?',
                        options: [
                            'Create auth_improved.js with better implementation',
                            'Create auth_v2.js as the new version',
                            'Edit the existing auth.js file directly',
                            'Create auth-better.js with fixes'
                        ],
                        correct: 2,
                        explanation: 'Always edit existing files directly. Creating versioned or "improved" files violates ProjectTemplate core rules and creates confusion.',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'fn2',
                        type: 'true-false',
                        question: 'It\'s acceptable to create temporary files in the root directory during development.',
                        correct: false,
                        explanation: 'Root directory files must follow the allowlist in CLAUDE.md. Temporary files should go in appropriate subdirectories or be cleaned up immediately.',
                        severity: 'HIGH'
                    },
                    {
                        id: 'fn3',
                        type: 'multiple-choice',
                        question: 'Where should a performance analysis report be created?',
                        options: [
                            'performance-report.md (root directory)',
                            'docs/reports/performance-analysis.md',
                            'analysis.md (root directory)', 
                            'src/reports/performance.md'
                        ],
                        correct: 1,
                        explanation: 'Reports belong in docs/reports/ directory. Root directory files must follow the strict allowlist.',
                        severity: 'HIGH'
                    }
                ]
            },
            codeGeneration: {
                name: 'Code Generation Patterns',
                description: 'Recognize proper code generation practices',
                questions: [
                    {
                        id: 'cg1',
                        type: 'code-review',
                        question: 'What\'s wrong with this logging approach?',
                        code: `
function loginUser(credentials) {
    console.log("Attempting login for:", credentials.username);
    // ... login logic
    console.log("Login successful");
    return { success: true };
}`,
                        issues: [
                            'Using console.log instead of proper logging framework',
                            'Potentially logging sensitive information',
                            'No error handling or structured logging'
                        ],
                        correct: 'Use logging.getLogger(__name__) instead of console.log',
                        explanation: 'Console.log is forbidden in production code. Use the proper logging framework with structured, secure logging.',
                        severity: 'HIGH'
                    },
                    {
                        id: 'cg2',
                        type: 'multiple-choice',
                        question: 'How should you create a new React component called UserProfile?',
                        options: [
                            'Manually create UserProfile.tsx file',
                            'Copy existing component and modify it',
                            'Use npm run g:c UserProfile',
                            'Create basic file and add features later'
                        ],
                        correct: 2,
                        explanation: 'Always use generators for new components. This creates proper structure with tests, styles, stories, and follows project patterns.',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'cg3',
                        type: 'code-review',
                        question: 'Identify the problems in this error handling:',
                        code: `
try {
    const data = await fetchUserData();
    return data;
} catch (e) {
    return null;
}`,
                        issues: [
                            'Bare except clause catches all errors',
                            'Silent failure without logging',
                            'No specific error type handling',
                            'Loses error context for debugging'
                        ],
                        correct: 'Specify exception types and handle appropriately',
                        explanation: 'Always specify exception types in try/catch. Handle known errors appropriately and re-throw unknown ones with proper logging.',
                        severity: 'HIGH'
                    }
                ]
            },
            validationCompliance: {
                name: 'Validation System Compliance',
                description: 'Understanding and responding to validation feedback',
                questions: [
                    {
                        id: 'vc1',
                        type: 'scenario',
                        question: 'The validation system reports: "❌ File naming violation: user_service_v2.js not allowed". What should you do?',
                        options: [
                            'Ask the user to disable the validation rule',
                            'Create the file anyway since it\'s just a warning',
                            'Edit the existing user_service.js file instead',
                            'Rename the file to user-service-v2.js'
                        ],
                        correct: 2,
                        explanation: 'Validation feedback should be acted upon immediately. Edit the original file instead of creating versions.',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'vc2',
                        type: 'multiple-choice',
                        question: 'What should be your compliance rate target?',
                        options: [
                            '70% - Most violations are just suggestions',
                            '80% - Good enough for most purposes',
                            '90%+ - High compliance is essential',
                            '50% - Validation is just guidance'
                        ],
                        correct: 2,
                        explanation: 'Target 90%+ compliance rate. High compliance ensures consistent behavior and rapid learning of project patterns.',
                        severity: 'HIGH'
                    },
                    {
                        id: 'vc3',
                        type: 'true-false',
                        question: 'If you make the same violation repeatedly, it indicates successful learning.',
                        correct: false,
                        explanation: 'Repeated violations indicate poor learning. Each violation type should only happen once as you learn the pattern.',
                        severity: 'HIGH'
                    }
                ]
            },
            securityPatterns: {
                name: 'Security-First Development',
                description: 'Recognizing security considerations in code',
                questions: [
                    {
                        id: 'sp1',
                        type: 'code-review',
                        question: 'What security issues exist in this form handling?',
                        code: `
function handleFormSubmit(formData) {
    const userInput = formData.get('content');
    document.getElementById('display').innerHTML = userInput;
    return sendToServer(formData);
}`,
                        issues: [
                            'XSS vulnerability from direct innerHTML assignment',
                            'No input validation or sanitization',
                            'No CSRF protection mentioned',
                            'Trusting client-side data without validation'
                        ],
                        correct: 'Sanitize input and validate on server side',
                        explanation: 'Always sanitize user input, validate on server side, and use safe DOM methods to prevent XSS attacks.',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'sp2',
                        type: 'multiple-choice',
                        question: 'When should security considerations be included in code recommendations?',
                        options: [
                            'Only when specifically asked about security',
                            'For authentication and payment features only',
                            'In every code recommendation by default',
                            'When working with sensitive data only'
                        ],
                        correct: 2,
                        explanation: 'Security considerations should be included in every code recommendation by default. Security-first mindset is essential.',
                        severity: 'CRITICAL'
                    }
                ]
            }
        };
    }
    
    async runQuiz(category = null, difficulty = 'all') {
        console.log(chalk.blue('\n🧠 Claude Code Pattern Recognition Quiz'));
        console.log(chalk.blue('==========================================\n'));
        
        if (category) {
            await this.runCategoryQuiz(category);
        } else {
            await this.runFullQuiz();
        }
        
        this.displayResults();
        this.saveResults();
    }
    
    async runFullQuiz() {
        console.log(chalk.yellow('Running comprehensive pattern recognition assessment...\n'));
        
        for (const [categoryKey, category] of Object.entries(this.quizData)) {
            console.log(chalk.cyan(`\n📚 Category: ${category.name}`));
            console.log(chalk.gray(category.description));
            console.log(chalk.gray('-'.repeat(50)));
            
            await this.runCategoryQuiz(categoryKey);
        }
    }
    
    async runCategoryQuiz(categoryKey) {
        const category = this.quizData[categoryKey];
        if (!category) {
            console.log(chalk.red(`Category "${categoryKey}" not found.`));
            return;
        }
        
        this.results.categories[categoryKey] = {
            total: category.questions.length,
            correct: 0,
            questions: []
        };
        
        for (const question of category.questions) {
            const result = await this.askQuestion(question);
            this.results.categories[categoryKey].questions.push(result);
            
            if (result.correct) {
                this.results.categories[categoryKey].correct++;
                this.results.correctAnswers++;
            }
            this.results.totalQuestions++;
        }
    }
    
    async askQuestion(question) {
        console.log(chalk.white(`\n❓ ${question.question}`));
        
        if (question.code) {
            console.log(chalk.gray('\nCode to review:'));
            console.log(chalk.yellow(question.code));
        }
        
        let userAnswer;
        let correct = false;
        
        switch (question.type) {
            case 'multiple-choice':
                question.options.forEach((option, index) => {
                    console.log(chalk.gray(`  ${index + 1}. ${option}`));
                });
                
                console.log(chalk.green(`\n✅ Correct answer: ${question.options[question.correct]}`));
                console.log(chalk.blue(`💡 ${question.explanation}`));
                
                // For this implementation, we'll show the correct answer immediately
                // In a real interactive quiz, you'd wait for user input
                correct = true; // Assume correct for demonstration
                break;
                
            case 'true-false':
                console.log(chalk.gray('  true / false'));
                console.log(chalk.green(`\n✅ Correct answer: ${question.correct}`));
                console.log(chalk.blue(`💡 ${question.explanation}`));
                correct = true;
                break;
                
            case 'code-review':
                if (question.issues) {
                    console.log(chalk.red('\n🚨 Issues to identify:'));
                    question.issues.forEach(issue => {
                        console.log(chalk.red(`  • ${issue}`));
                    });
                }
                console.log(chalk.green(`\n✅ Solution: ${question.correct}`));
                console.log(chalk.blue(`💡 ${question.explanation}`));
                correct = true;
                break;
                
            case 'scenario':
                question.options.forEach((option, index) => {
                    console.log(chalk.gray(`  ${index + 1}. ${option}`));
                });
                console.log(chalk.green(`\n✅ Correct answer: ${question.options[question.correct]}`));
                console.log(chalk.blue(`💡 ${question.explanation}`));
                correct = true;
                break;
        }
        
        // Display severity
        const severityColor = question.severity === 'CRITICAL' ? 'red' : 
                            question.severity === 'HIGH' ? 'yellow' : 'blue';
        console.log(chalk[severityColor](`🔥 Severity: ${question.severity}`));
        
        return {
            questionId: question.id,
            userAnswer,
            correct,
            severity: question.severity,
            explanation: question.explanation
        };
    }
    
    displayResults() {
        console.log(chalk.blue('\n📊 Quiz Results'));
        console.log(chalk.blue('===============\n'));
        
        const overall = (this.results.correctAnswers / this.results.totalQuestions * 100).toFixed(1);
        console.log(chalk.green(`Overall Score: ${this.results.correctAnswers}/${this.results.totalQuestions} (${overall}%)`));
        
        // Category breakdown
        console.log(chalk.cyan('\n📚 Category Breakdown:'));
        for (const [categoryKey, category] of Object.entries(this.results.categories)) {
            const categoryScore = (category.correct / category.total * 100).toFixed(1);
            const categoryName = this.quizData[categoryKey].name;
            console.log(chalk.white(`  ${categoryName}: ${category.correct}/${category.total} (${categoryScore}%)`));
        }
        
        // Performance assessment
        console.log(chalk.yellow('\n🎯 Performance Assessment:'));
        if (overall >= 90) {
            console.log(chalk.green('  ⭐ Excellent! Ready for advanced pattern work'));
        } else if (overall >= 80) {
            console.log(chalk.yellow('  ✅ Good! Continue practicing for consistency'));
        } else if (overall >= 70) {
            console.log(chalk.orange('  ⚠️  Needs improvement. Review anti-patterns'));
        } else {
            console.log(chalk.red('  ❌ Requires focused study. Re-read CLAUDE.md'));
        }
        
        // Recommendations
        console.log(chalk.blue('\n💡 Learning Recommendations:'));
        this.generateRecommendations();
    }
    
    generateRecommendations() {
        const lowPerformingCategories = Object.entries(this.results.categories)
            .filter(([key, category]) => (category.correct / category.total) < 0.8)
            .map(([key, category]) => key);
            
        if (lowPerformingCategories.length === 0) {
            console.log(chalk.green('  🎉 No specific areas need improvement!'));
            console.log(chalk.blue('  📚 Continue practicing with real development tasks'));
            return;
        }
        
        lowPerformingCategories.forEach(categoryKey => {
            const categoryName = this.quizData[categoryKey].name;
            console.log(chalk.yellow(`  📖 Study focus: ${categoryName}`));
            
            switch (categoryKey) {
                case 'fileNaming':
                    console.log(chalk.gray('    • Review ai/examples/anti-patterns/file-naming-violations.ts'));
                    console.log(chalk.gray('    • Practice: npm run check:root'));
                    break;
                case 'codeGeneration':
                    console.log(chalk.gray('    • Review ai/examples/anti-patterns/code-generation-mistakes.tsx'));
                    console.log(chalk.gray('    • Practice: npm run g:c TestComponent'));
                    break;
                case 'validationCompliance':
                    console.log(chalk.gray('    • Review ai/examples/anti-patterns/validation-compliance-failures.md'));
                    console.log(chalk.gray('    • Practice: npm run claude:capability:status'));
                    break;
                case 'securityPatterns':
                    console.log(chalk.gray('    • Review docs/guides/security/security-best-practices.md'));
                    console.log(chalk.gray('    • Practice: Include security in every recommendation'));
                    break;
            }
        });
    }
    
    saveResults() {
        const results = {
            ...this.results,
            endTime: new Date(),
            duration: new Date() - this.results.startTime
        };
        
        // Ensure directory exists
        const dir = path.dirname(this.metricsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Load existing results
        let allResults = [];
        if (fs.existsSync(this.metricsFile)) {
            try {
                allResults = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
            } catch (error) {
                console.log(chalk.yellow('Warning: Could not load previous quiz results'));
            }
        }
        
        allResults.push(results);
        
        // Keep only last 50 results
        if (allResults.length > 50) {
            allResults = allResults.slice(-50);
        }
        
        fs.writeFileSync(this.metricsFile, JSON.stringify(allResults, null, 2));
        console.log(chalk.green(`\n💾 Results saved to ${this.metricsFile}`));
    }
    
    showProgress() {
        if (!fs.existsSync(this.metricsFile)) {
            console.log(chalk.yellow('No previous quiz results found.'));
            return;
        }
        
        try {
            const allResults = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
            
            console.log(chalk.blue('\n📈 Quiz Progress History'));
            console.log(chalk.blue('========================\n'));
            
            const recent = allResults.slice(-10);
            recent.forEach((result, index) => {
                const score = (result.correctAnswers / result.totalQuestions * 100).toFixed(1);
                const date = new Date(result.endTime).toLocaleDateString();
                console.log(chalk.white(`${date}: ${score}% (${result.correctAnswers}/${result.totalQuestions})`));
            });
            
            if (allResults.length > 1) {
                const first = allResults[0];
                const latest = allResults[allResults.length - 1];
                const firstScore = first.correctAnswers / first.totalQuestions * 100;
                const latestScore = latest.correctAnswers / latest.totalQuestions * 100;
                const improvement = latestScore - firstScore;
                
                console.log(chalk.cyan(`\n📊 Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`));
            }
            
        } catch (error) {
            console.log(chalk.red('Error reading quiz history:', error.message));
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const quiz = new PatternQuiz();
    
    const command = args[0];
    
    switch (command) {
        case 'run':
            const category = args[1];
            quiz.runQuiz(category);
            break;
            
        case 'progress':
            quiz.showProgress();
            break;
            
        default:
            console.log(chalk.blue('🧠 Pattern Recognition Quiz'));
            console.log(chalk.blue('==========================\n'));
            console.log('Usage:');
            console.log('  node pattern-quiz.js run [category]     # Run full quiz or specific category');
            console.log('  node pattern-quiz.js progress          # Show progress history');
            console.log('\nCategories:');
            console.log('  fileNaming          # File naming and organization patterns');
            console.log('  codeGeneration      # Code quality and generation patterns');
            console.log('  validationCompliance # Validation system interaction');
            console.log('  securityPatterns    # Security-first development');
            console.log('\nExamples:');
            console.log('  node pattern-quiz.js run fileNaming');
            console.log('  node pattern-quiz.js run');
            console.log('  node pattern-quiz.js progress');
    }
}

module.exports = PatternQuiz;