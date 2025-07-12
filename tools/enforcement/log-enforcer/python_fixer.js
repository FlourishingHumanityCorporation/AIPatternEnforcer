#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Python auto-fixer for logging violations
 */
class PythonLogFixer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Python AST transformation script
   */
  getPythonFixerScript() {
    return `
import ast
import sys
import json

class LoggingFixer(ast.NodeTransformer):
    def __init__(self):
        self.changes = []
        self.has_logging_import = False
        self.has_logger_instance = False
        self.logger_var_name = 'logger'
        self.imports_added = []
        
    def check_imports(self, tree):
        """Check existing imports first"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name == 'logging':
                        self.has_logging_import = True
            elif isinstance(node, ast.ImportFrom):
                if node.module and 'logging' in node.module:
                    self.has_logging_import = True
            elif isinstance(node, ast.Assign):
                if isinstance(node.value, ast.Call):
                    if (hasattr(node.value.func, 'attr') and 
                        node.value.func.attr == 'getLogger' and
                        hasattr(node.value.func, 'value') and
                        hasattr(node.value.func.value, 'id') and
                        node.value.func.value.id == 'logging'):
                        self.has_logger_instance = True
                        # Get logger variable name
                        if node.targets and hasattr(node.targets[0], 'id'):
                            self.logger_var_name = node.targets[0].id
    
    def visit_Module(self, node):
        # Check existing imports first
        self.check_imports(node)
        
        # Transform the tree
        node = self.generic_visit(node)
        
        # Add missing imports at the top
        if self.changes and not self.has_logging_import:
            import_node = ast.Import(names=[ast.alias(name='logging', asname=None)])
            node.body.insert(0, import_node)
            self.imports_added.append('import logging')
            
        # Add logger instance if needed
        if self.changes and not self.has_logger_instance:
            # Add after imports
            insert_pos = 0
            for i, child in enumerate(node.body):
                if isinstance(child, (ast.Import, ast.ImportFrom)):
                    insert_pos = i + 1
                else:
                    break
                    
            logger_assignment = ast.parse(
                f'{self.logger_var_name} = logging.getLogger(__name__)'
            ).body[0]
            
            node.body.insert(insert_pos, logger_assignment)
            self.imports_added.append(f'{self.logger_var_name} = logging.getLogger(__name__)')
            
        return node
    
    def visit_Call(self, node):
        # Transform print() calls
        if hasattr(node.func, 'id') and node.func.id == 'print':
            # Convert to logger.info()
            new_call = ast.Call(
                func=ast.Attribute(
                    value=ast.Name(id=self.logger_var_name, ctx=ast.Load()),
                    attr='info',
                    ctx=ast.Load()
                ),
                args=node.args,
                keywords=[]
            )
            
            self.changes.append({
                'line': node.lineno,
                'column': node.col_offset,
                'old': 'print',
                'new': f'{self.logger_var_name}.info',
                'type': 'print_to_logger'
            })
            
            return new_call
            
        return self.generic_visit(node)

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        tree = ast.parse(content)
        fixer = LoggingFixer()
        
        # Transform the AST
        new_tree = fixer.visit(tree)
        
        # Generate new code
        import astor
        new_code = astor.to_source(new_tree)
        
        return {
            'success': True,
            'changes': fixer.changes,
            'imports_added': fixer.imports_added,
            'original_content': content,
            'fixed_content': new_code
        }
        
    except ImportError:
        # astor not available, use simpler approach
        return fix_file_simple(filepath)
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'changes': []
        }

def fix_file_simple(filepath):
    """Simple regex-based fixer when AST tools aren't available"""
    import re
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\\n')
        new_lines = []
        changes = []
        imports_added = []
        
        # Check if logging is already imported
        has_logging = any('import logging' in line for line in lines)
        has_logger = any('logging.getLogger' in line for line in lines)
        
        # Add imports if needed
        if not has_logging:
            # Find where to insert import
            insert_pos = 0
            for i, line in enumerate(lines):
                if line.strip().startswith(('import ', 'from ')):
                    insert_pos = i + 1
                elif line.strip() and not line.strip().startswith('#'):
                    break
                    
            lines.insert(insert_pos, 'import logging')
            imports_added.append('import logging')
            
        if not has_logger:
            # Add logger instance
            logger_line = 'logger = logging.getLogger(__name__)'
            # Find position after imports
            insert_pos = 0
            for i, line in enumerate(lines):
                if line.strip().startswith(('import ', 'from ')):
                    insert_pos = i + 1
                elif line.strip() and not line.strip().startswith('#'):
                    break
                    
            lines.insert(insert_pos, logger_line)
            imports_added.append(logger_line)
        
        # Fix print statements
        for i, line in enumerate(lines):
            # Simple regex to find print() calls
            print_pattern = r'\\bprint\\s*\\('
            if re.search(print_pattern, line):
                new_line = re.sub(r'\\bprint\\s*\\(', 'logger.info(', line)
                if new_line != line:
                    changes.append({
                        'line': i + 1,
                        'old': line.strip(),
                        'new': new_line.strip(),
                        'type': 'print_to_logger'
                    })
                    line = new_line
                    
            new_lines.append(line)
        
        return {
            'success': True,
            'changes': changes,
            'imports_added': imports_added,
            'original_content': content,
            'fixed_content': '\\n'.join(new_lines)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'changes': []
        }

if __name__ == '__main__':
    filepath = sys.argv[1]
    dry_run = len(sys.argv) > 2 and sys.argv[2] == '--dry-run'
    
    result = fix_file(filepath)
    
    if result['success'] and not dry_run and result['changes']:
        # Write the fixed content back to the file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(result['fixed_content'])
    
    print(json.dumps(result))
`;
  }

  /**
   * Fix violations in a Python file
   */
  async fixFile(filepath, options = {}) {
    const dryRun = options.dryRun || false;
    
    // Create temporary Python script
    const tempScript = path.join(__dirname, '.fixer_temp.py');
    fs.writeFileSync(tempScript, this.getPythonFixerScript());
    
    try {
      // Run Python fixer
      const args = ['"' + tempScript + '"', '"' + filepath + '"'];
      if (dryRun) args.push('--dry-run');
      
      const output = execSync(`python ${args.join(' ')}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const result = JSON.parse(output);
      
      // Add filepath to result
      result.filepath = filepath;
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        changes: [],
        filepath
      };
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempScript)) {
        fs.unlinkSync(tempScript);
      }
    }
  }

  /**
   * Fix violations in multiple Python files
   */
  async fixFiles(filepaths, options = {}) {
    const results = await Promise.all(
      filepaths.map(filepath => this.fixFile(filepath, options))
    );
    
    return {
      files: results,
      summary: this.generateFixSummary(results)
    };
  }

  /**
   * Generate fix summary
   */
  generateFixSummary(results) {
    const totalFiles = results.length;
    const successfulFixes = results.filter(r => r.success).length;
    const failedFixes = results.filter(r => !r.success).length;
    const totalChanges = results.reduce((sum, r) => sum + (r.changes?.length || 0), 0);
    
    const changesByType = {};
    results.forEach(r => {
      if (r.changes) {
        r.changes.forEach(change => {
          changesByType[change.type] = (changesByType[change.type] || 0) + 1;
        });
      }
    });
    
    return {
      totalFiles,
      successfulFixes,
      failedFixes,
      totalChanges,
      changesByType
    };
  }

  /**
   * Generate preview of changes
   */
  generatePreview(results) {
    let preview = '';
    
    results.forEach(result => {
      if (result.changes && result.changes.length > 0) {
        preview += `\\n📄 ${result.filepath}\\n`;
        result.changes.forEach(change => {
          preview += `   Line ${change.line}: ${change.old} → ${change.new}\\n`;
        });
        
        if (result.imports_added && result.imports_added.length > 0) {
          preview += `   Added imports: ${result.imports_added.join(', ')}\\n`;
        }
      }
    });
    
    return preview;
  }
}

module.exports = PythonLogFixer;