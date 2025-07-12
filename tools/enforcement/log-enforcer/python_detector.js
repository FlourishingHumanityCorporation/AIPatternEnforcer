#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Python AST-based detector for logging violations
 */
class PythonLogDetector {
  constructor(options = {}) {
    this.allowedPatterns = options.allowedPatterns || [];
    this.testFilePatterns = options.testFilePatterns || [
      '**/test_*.py',
      '**/*_test.py',
      '**/tests/**/*.py',
      '**/testing/**/*.py'
    ];
    this.cliFilePatterns = options.cliFilePatterns || [
      '**/cli.py',
      '**/cli/**/*.py',
      '**/__main__.py',
      '**/scripts/**/*.py'
    ];
    this.violations = [];
    this.cache = new Map();
  }

  /**
   * Python AST analysis script
   */
  getPythonAnalyzerScript() {
    return `
import ast
import sys
import json

class PrintDetector(ast.NodeVisitor):
    def __init__(self):
        self.violations = []
        self.has_logging_import = False
        self.has_logger_instance = False
        self.logger_names = set()
        
    def visit_Import(self, node):
        for alias in node.names:
            if alias.name == 'logging':
                self.has_logging_import = True
        self.generic_visit(node)
        
    def visit_ImportFrom(self, node):
        if node.module and 'logging' in node.module:
            self.has_logging_import = True
        self.generic_visit(node)
        
    def visit_Assign(self, node):
        # Detect logger = logging.getLogger(__name__)
        if isinstance(node.value, ast.Call):
            if hasattr(node.value.func, 'attr') and node.value.func.attr == 'getLogger':
                if hasattr(node.value.func, 'value') and hasattr(node.value.func.value, 'id'):
                    if node.value.func.value.id == 'logging':
                        self.has_logger_instance = True
                        # Track logger variable names
                        for target in node.targets:
                            if hasattr(target, 'id'):
                                self.logger_names.add(target.id)
        self.generic_visit(node)
        
    def visit_Call(self, node):
        # Detect print() calls
        if hasattr(node.func, 'id') and node.func.id == 'print':
            # Check if it's in a comment or string
            line = node.lineno
            col = node.col_offset
            
            # Get the actual line content to check context
            violation = {
                'line': line,
                'column': col,
                'type': 'print_statement',
                'message': 'Use logging instead of print()'
            }
            
            # Extract the print content for auto-fix
            if node.args:
                violation['content'] = 'print_call'  # Simplified for now
                
            self.violations.append(violation)
            
        self.generic_visit(node)

def analyze_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        tree = ast.parse(content)
        detector = PrintDetector()
        detector.visit(tree)
        
        return {
            'violations': detector.violations,
            'has_logging_import': detector.has_logging_import,
            'has_logger_instance': detector.has_logger_instance,
            'logger_names': list(detector.logger_names)
        }
    except Exception as e:
        return {
            'error': str(e),
            'violations': []
        }

if __name__ == '__main__':
    filepath = sys.argv[1]
    result = analyze_file(filepath)
    print(json.dumps(result))
`;
  }

  /**
   * Check if file should be excluded based on patterns
   */
  shouldExcludeFile(filepath) {
    const normalizedPath = filepath.replace(/\\/g, '/');
    
    // Check if it's a test file
    for (const pattern of this.testFilePatterns) {
      if (this.matchesPattern(normalizedPath, pattern)) {
        return { exclude: true, reason: 'test_file' };
      }
    }
    
    // Check if it's a CLI file
    for (const pattern of this.cliFilePatterns) {
      if (this.matchesPattern(normalizedPath, pattern)) {
        return { exclude: true, reason: 'cli_file' };
      }
    }
    
    return { exclude: false };
  }

  /**
   * Simple glob pattern matching
   */
  matchesPattern(filepath, pattern) {
    // Convert glob to regex
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    return new RegExp(regex).test(filepath);
  }

  /**
   * Analyze a Python file for logging violations
   */
  async analyzeFile(filepath) {
    // Check cache first
    const stats = fs.statSync(filepath);
    const cacheKey = `${filepath}:${stats.mtime.getTime()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check if file should be excluded
    const exclusion = this.shouldExcludeFile(filepath);
    if (exclusion.exclude) {
      const result = {
        filepath,
        excluded: true,
        exclusionReason: exclusion.reason,
        violations: []
      };
      this.cache.set(cacheKey, result);
      return result;
    }
    
    // Create temporary Python script
    const tempScript = path.join(__dirname, '.analyzer_temp.py');
    fs.writeFileSync(tempScript, this.getPythonAnalyzerScript());
    
    try {
      // Run Python analyzer
      const output = execSync(`python "${tempScript}" "${filepath}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const analysis = JSON.parse(output);
      
      const result = {
        filepath,
        excluded: false,
        violations: analysis.violations || [],
        hasLoggingImport: analysis.has_logging_import,
        hasLoggerInstance: analysis.has_logger_instance,
        loggerNames: analysis.logger_names || []
      };
      
      // Add filepath to violations
      result.violations = result.violations.map(v => ({
        ...v,
        filepath
      }));
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      const result = {
        filepath,
        excluded: false,
        error: error.message,
        violations: []
      };
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempScript)) {
        fs.unlinkSync(tempScript);
      }
    }
  }

  /**
   * Analyze multiple Python files
   */
  async analyzeFiles(filepaths) {
    const results = await Promise.all(
      filepaths.map(filepath => this.analyzeFile(filepath))
    );
    
    return {
      files: results,
      summary: this.generateSummary(results)
    };
  }

  /**
   * Generate analysis summary
   */
  generateSummary(results) {
    const totalFiles = results.length;
    const excludedFiles = results.filter(r => r.excluded).length;
    const analyzedFiles = totalFiles - excludedFiles;
    const filesWithViolations = results.filter(r => !r.excluded && r.violations.length > 0).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    
    return {
      totalFiles,
      excludedFiles,
      analyzedFiles,
      filesWithViolations,
      totalViolations,
      exclusionReasons: this.countExclusionReasons(results)
    };
  }

  /**
   * Count exclusion reasons
   */
  countExclusionReasons(results) {
    const reasons = {};
    results.filter(r => r.excluded).forEach(r => {
      reasons[r.exclusionReason] = (reasons[r.exclusionReason] || 0) + 1;
    });
    return reasons;
  }
}

module.exports = PythonLogDetector;