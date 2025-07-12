#!/usr/bin/env node
/**
 * Check Actual Documentation Coverage
 * 
 * This script checks if documentation files exist for tools and scripts
 * in the expected locations (docs/tools/ and docs/scripts/)
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(fullPath, pattern));
    } else if (stat.isFile() && pattern.test(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkDocumentationCoverage() {
  const projectRoot = process.cwd();
  
  // Find all tool and script files
  const toolFiles = findFiles(path.join(projectRoot, 'tools'), /\.js$/);
  const scriptFiles = findFiles(path.join(projectRoot, 'scripts'), /\.(js|sh)$/);
  
  // Find all documentation files
  const toolDocs = findFiles(path.join(projectRoot, 'docs/tools'), /\.md$/);
  const scriptDocs = findFiles(path.join(projectRoot, 'docs/scripts'), /\.md$/);
  
  // Create maps for easier lookup
  const toolDocMap = new Map();
  toolDocs.forEach(doc => {
    const basename = path.basename(doc, '.md');
    toolDocMap.set(basename, doc);
  });
  
  const scriptDocMap = new Map();
  scriptDocs.forEach(doc => {
    const basename = path.basename(doc, '.md');
    scriptDocMap.set(basename, doc);
  });
  
  // Check coverage for tools
  const toolCoverage = {
    total: toolFiles.length,
    documented: 0,
    missing: []
  };
  
  toolFiles.forEach(file => {
    const basename = path.basename(file, path.extname(file));
    if (toolDocMap.has(basename)) {
      toolCoverage.documented++;
    } else {
      toolCoverage.missing.push(file);
    }
  });
  
  // Check coverage for scripts
  const scriptCoverage = {
    total: scriptFiles.length,
    documented: 0,
    missing: []
  };
  
  scriptFiles.forEach(file => {
    const basename = path.basename(file, path.extname(file));
    if (scriptDocMap.has(basename)) {
      scriptCoverage.documented++;
    } else {
      scriptCoverage.missing.push(file);
    }
  });
  
  // Calculate percentages
  const toolPercentage = toolCoverage.total > 0 
    ? Math.round((toolCoverage.documented / toolCoverage.total) * 100) 
    : 0;
    
  const scriptPercentage = scriptCoverage.total > 0 
    ? Math.round((scriptCoverage.documented / scriptCoverage.total) * 100) 
    : 0;
    
  const overallTotal = toolCoverage.total + scriptCoverage.total;
  const overallDocumented = toolCoverage.documented + scriptCoverage.documented;
  const overallPercentage = overallTotal > 0 
    ? Math.round((overallDocumented / overallTotal) * 100) 
    : 0;
  
  // Display results
  console.log('\n📊 Actual Documentation Coverage Report');
  console.log('=====================================\n');
  
  logger.info(`📁 Tools Coverage: ${toolPercentage}% (${toolCoverage.documented}/${toolCoverage.total})`);
  logger.info(`   Documentation files found: ${toolDocs.length}`);
  if (toolCoverage.missing.length > 0 && toolCoverage.missing.length <= 10) {
    logger.info('   Missing documentation for:');
    toolCoverage.missing.forEach(file => {
      logger.info(`     - ${path.relative(projectRoot, file)}`);
    });
  } else if (toolCoverage.missing.length > 10) {
    logger.info(`   Missing documentation for ${toolCoverage.missing.length} files`);
  }
  
  logger.info(`\n📁 Scripts Coverage: ${scriptPercentage}% (${scriptCoverage.documented}/${scriptCoverage.total})`);
  logger.info(`   Documentation files found: ${scriptDocs.length}`);
  if (scriptCoverage.missing.length > 0 && scriptCoverage.missing.length <= 10) {
    logger.info('   Missing documentation for:');
    scriptCoverage.missing.forEach(file => {
      logger.info(`     - ${path.relative(projectRoot, file)}`);
    });
  } else if (scriptCoverage.missing.length > 10) {
    logger.info(`   Missing documentation for ${scriptCoverage.missing.length} files`);
  }
  
  logger.info(`\n📊 Overall Coverage: ${overallPercentage}% (${overallDocumented}/${overallTotal})`);
  
  if (overallPercentage >= 80) {
    logger.info('\n✅ Coverage target of 80% has been reached!');
  } else {
    const needed = Math.ceil(overallTotal * 0.8) - overallDocumented;
    logger.info(`\n⚠️  Need to document ${needed} more files to reach 80% coverage`);
  }
  
  // List of documented files not matching any code files
  const orphanedDocs = [];
  toolDocMap.forEach((docPath, basename) => {
    const hasMatchingFile = toolFiles.some(file => 
      path.basename(file, path.extname(file)) === basename
    );
    if (!hasMatchingFile) {
      orphanedDocs.push(docPath);
    }
  });
  
  if (orphanedDocs.length > 0) {
    logger.info('\n📝 Documentation files without matching code files:');
    orphanedDocs.forEach(doc => {
      logger.info(`   - ${path.relative(projectRoot, doc)}`);
    });
  }
  
  return {
    tools: toolCoverage,
    scripts: scriptCoverage,
    overall: {
      total: overallTotal,
      documented: overallDocumented,
      percentage: overallPercentage
    }
  };
}

// Run if called directly
if (require.main === module) {
  checkDocumentationCoverage();
}

module.exports = { checkDocumentationCoverage };