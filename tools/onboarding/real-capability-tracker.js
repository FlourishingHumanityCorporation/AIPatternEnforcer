#!/usr/bin/env node
/**
 * Real Capability Tracker
 * Uses actual validation results instead of fake metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RealCapabilityTracker {
    constructor() {
        this.realMetricsFile = 'tools/metrics/real-capability-metrics.json';
        this.validationReportFile = 'tools/metrics/real-validation-report.json';
        
        // Real capability levels based on actual compliance
        this.levels = {
            0: {
                name: 'Critical Issues',
                description: 'Major violations preventing basic operation',
                threshold: {
                    maxCriticalViolations: Infinity,
                    maxTotalViolations: Infinity,
                    minTestCoverage: 0
                }
            },
            1: {
                name: 'Basic Compliance',
                description: 'No critical violations, working on warnings',
                threshold: {
                    maxCriticalViolations: 0,
                    maxTotalViolations: 1000,
                    minTestCoverage: 20
                }
            },
            2: {
                name: 'Good Standing',
                description: 'Minimal violations, decent test coverage',
                threshold: {
                    maxCriticalViolations: 0,
                    maxTotalViolations: 100,
                    minTestCoverage: 50
                }
            },
            3: {
                name: 'Near Production',
                description: 'Very few violations, good test coverage',
                threshold: {
                    maxCriticalViolations: 0,
                    maxTotalViolations: 10,
                    minTestCoverage: 70
                }
            },
            4: {
                name: 'Production Ready',
                description: 'Fully compliant with all standards',
                threshold: {
                    maxCriticalViolations: 0,
                    maxTotalViolations: 0,
                    minTestCoverage: 80
                }
            }
        };
    }
    
    getRealValidationStatus() {
        try {
            // Run real validation and get report
            execSync('npm run validate:real', { stdio: 'pipe' });
        } catch (error) {
            // Validation exits with error when violations found, that's ok
        }
        
        // Read the validation report
        if (fs.existsSync(this.validationReportFile)) {
            const report = JSON.parse(fs.readFileSync(this.validationReportFile, 'utf8'));
            return report;
        }
        
        return null;
    }
    
    calculateRealLevel(validationReport) {
        if (!validationReport) return 0;
        
        const summary = validationReport.summary;
        const testCoverage = this.getTestCoverage(validationReport);
        
        // Check each level from highest to lowest
        for (let level = 4; level >= 0; level--) {
            const threshold = this.levels[level].threshold;
            
            if (summary.criticalFailures <= threshold.maxCriticalViolations &&
                summary.totalViolations <= threshold.maxTotalViolations &&
                testCoverage >= threshold.minTestCoverage) {
                return level;
            }
        }
        
        return 0;
    }
    
    getTestCoverage(validationReport) {
        const testDetails = validationReport.details['Test Coverage'];
        if (testDetails && testDetails.details) {
            const match = testDetails.details.match(/(\d+\.?\d*)%/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    }
    
    generateRealMetrics() {
        const validationReport = this.getRealValidationStatus();
        if (!validationReport) {
            console.error('Failed to get validation report');
            return null;
        }
        
        const realLevel = this.calculateRealLevel(validationReport);
        const levelInfo = this.levels[realLevel];
        
        const metrics = {
            timestamp: new Date().toISOString(),
            realLevel,
            levelName: levelInfo.name,
            levelDescription: levelInfo.description,
            compliance: {
                criticalFailures: validationReport.summary.criticalFailures,
                totalViolations: validationReport.summary.totalViolations,
                passedChecks: validationReport.summary.passedChecks,
                totalChecks: validationReport.summary.totalChecks,
                testCoverage: this.getTestCoverage(validationReport) + '%'
            },
            violations: {
                logging: validationReport.details['Logging Compliance']?.violations || 0,
                linting: validationReport.details['Linting']?.violations || 0,
                documentation: validationReport.details['Documentation Standards']?.violations || 0,
                imports: validationReport.details['Import Standards']?.violations || 0
            },
            readinessLevel: validationReport.summary.readinessLevel,
            recommendations: validationReport.recommendations || []
        };
        
        // Save real metrics
        fs.writeFileSync(this.realMetricsFile, JSON.stringify(metrics, null, 2));
        
        return metrics;
    }
    
    compareWithFakeMetrics() {
        // Get fake metrics from original system
        const fakeMetricsFile = 'tools/metrics/claude-capability-metrics.json';
        const fakeValidationFile = 'tools/metrics/claude-onboarding-validation.json';
        
        let fakeMetrics = {};
        let fakeValidation = {};
        
        if (fs.existsSync(fakeMetricsFile)) {
            fakeMetrics = JSON.parse(fs.readFileSync(fakeMetricsFile, 'utf8'));
        }
        
        if (fs.existsSync(fakeValidationFile)) {
            fakeValidation = JSON.parse(fs.readFileSync(fakeValidationFile, 'utf8'));
        }
        
        const realMetrics = this.generateRealMetrics();
        
        const comparison = {
            timestamp: new Date().toISOString(),
            fake: {
                level: fakeMetrics.currentLevel || 'Unknown',
                readinessLevel: fakeValidation.readinessLevel || 'Unknown',
                claimedCompliance: fakeValidation.validationDetails || {},
                reportedViolations: 0
            },
            real: {
                level: realMetrics.realLevel,
                levelName: realMetrics.levelName,
                readinessLevel: realMetrics.readinessLevel,
                actualCompliance: realMetrics.compliance,
                actualViolations: realMetrics.violations,
                totalViolations: realMetrics.compliance.totalViolations
            },
            discrepancies: {
                levelDifference: (fakeMetrics.currentLevel || 0) - realMetrics.realLevel,
                violationsDifference: realMetrics.compliance.totalViolations - 0,
                falseReadiness: fakeValidation.readinessLevel === 'production' && 
                               realMetrics.readinessLevel !== 'production'
            }
        };
        
        // Save comparison
        const comparisonFile = 'tools/metrics/fake-vs-real-comparison.json';
        fs.writeFileSync(comparisonFile, JSON.stringify(comparison, null, 2));
        
        return comparison;
    }
    
    displayStatus() {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('          REAL CAPABILITY STATUS REPORT');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const realMetrics = this.generateRealMetrics();
        if (!realMetrics) {
            console.error('Failed to generate real metrics');
            return;
        }
        
        console.log(`Current Level: ${realMetrics.realLevel} - ${realMetrics.levelName}`);
        console.log(`Description: ${realMetrics.levelDescription}`);
        console.log(`\nCompliance Status:`);
        console.log(`  ✓ Passed Checks: ${realMetrics.compliance.passedChecks}/${realMetrics.compliance.totalChecks}`);
        console.log(`  ✗ Critical Failures: ${realMetrics.compliance.criticalFailures}`);
        console.log(`  ⚠ Total Violations: ${realMetrics.compliance.totalViolations}`);
        console.log(`  📊 Test Coverage: ${realMetrics.compliance.testCoverage}`);
        
        console.log(`\nViolation Breakdown:`);
        console.log(`  - Logging: ${realMetrics.violations.logging}`);
        console.log(`  - Linting: ${realMetrics.violations.linting}`);
        console.log(`  - Documentation: ${realMetrics.violations.documentation}`);
        console.log(`  - Imports: ${realMetrics.violations.imports}`);
        
        console.log(`\nReadiness: ${realMetrics.readinessLevel.toUpperCase()}`);
        
        if (realMetrics.recommendations.length > 0) {
            console.log(`\nTop Recommendations:`);
            realMetrics.recommendations.slice(0, 3).forEach((rec, i) => {
                console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
            });
        }
        
        console.log('\n═══════════════════════════════════════════════════════\n');
    }
}

// CLI interface
if (require.main === module) {
    const tracker = new RealCapabilityTracker();
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            tracker.displayStatus();
            break;
        case 'compare':
            const comparison = tracker.compareWithFakeMetrics();
            console.log('\nFAKE vs REAL Comparison:');
            console.log(JSON.stringify(comparison, null, 2));
            break;
        case 'metrics':
            const metrics = tracker.generateRealMetrics();
            console.log(JSON.stringify(metrics, null, 2));
            break;
        default:
            console.log('Usage: node real-capability-tracker.js [status|compare|metrics]');
    }
}

module.exports = RealCapabilityTracker;