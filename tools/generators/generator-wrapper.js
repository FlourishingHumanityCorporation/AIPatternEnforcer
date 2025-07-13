#!/usr/bin/env node

/**
 * Generator Wrapper
 * Adds analytics tracking to all generators
 */

const { spawn } = require('child_process');
const path = require('path');
const GeneratorAnalytics = require('../metrics/generator-analytics');

async function runGeneratorWithAnalytics() {
  const analytics = new GeneratorAnalytics();
  await analytics.init();

  // Parse command line to determine generator type
  const args = process.argv.slice(2);
  const scriptName = args[0];
  const generatorArgs = args.slice(1);

  // Map script names to generator types
  const generatorMap = {
    'enhanced-component-generator.js': 'component-enhanced',
    'component-generator.js': 'component-basic',
    'api-generator.js': 'api',
    'feature-generator.js': 'feature',
    'hook-generator.js': 'hook'
  };

  const generatorType = generatorMap[path.basename(scriptName)] || 'unknown';
  const componentName = generatorArgs.find((arg) => !arg.startsWith('-')) || 'Unknown';

  // Start tracking
  const sessionId = await analytics.trackStart(generatorType, componentName);

  // Run the actual generator
  const generatorPath = path.join(__dirname, scriptName);
  const child = spawn('node', [generatorPath, ...generatorArgs], {
    stdio: 'inherit',
    env: { ...process.env, GENERATOR_SESSION_ID: sessionId }
  });

  // Track completion
  child.on('close', async (code) => {
    const success = code === 0;

    // Try to determine files created (basic heuristic)
    let filesCreated = 0;
    if (success) {
      // Assume standard file creation based on generator type
      if (generatorType.includes('component')) {
        filesCreated = 4; // component, test, styles, index
      } else if (generatorType === 'api') {
        filesCreated = 5; // routes, controller, service, types, tests
      } else if (generatorType === 'feature') {
        filesCreated = 3; // index, README, component
      } else if (generatorType === 'hook') {
        filesCreated = 3; // hook, test, index
      }
    }

    await analytics.trackComplete(sessionId, {
      success,
      filesCreated,
      error: success ? null : `Process exited with code ${code}`
    });

    process.exit(code);
  });

  // Handle interruption
  process.on('SIGINT', async () => {
    await analytics.trackComplete(sessionId, {
      success: false,
      error: 'User interrupted'
    });
    process.exit(1);
  });
}

// Run wrapper
runGeneratorWithAnalytics().catch((error) => {
  logger.error('Analytics wrapper error:', error);
  process.exit(1);
});