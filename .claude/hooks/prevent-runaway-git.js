#!/usr/bin/env node

/**
 * Prevent Runaway Git Operations Hook
 * 
 * Prevents Claude Code from executing rapid-fire git operations that could
 * cause data loss like the git reset loop that happened.
 * 
 * Blocks: git reset, git rebase, git checkout when executed too frequently
 */

const fs = require('fs');
const path = require('path');

const RATE_LIMIT_FILE = '/tmp/claude_git_operations.json';
const MAX_GIT_OPS_PER_MINUTE = 5;
const DANGEROUS_COMMANDS = ['git reset', 'git rebase', 'git checkout', 'git clean'];

function loadGitOperations() {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf8'));
    }
  } catch (error) {
    // If file is corrupted, start fresh
  }
  return [];
}

function saveGitOperations(operations) {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(operations));
}

function filterRecentOperations(operations) {
  const oneMinuteAgo = Date.now() - (60 * 1000);
  return operations.filter(op => op.timestamp > oneMinuteAgo);
}

function isDangerousGitCommand(command) {
  return DANGEROUS_COMMANDS.some(dangerous => command.includes(dangerous));
}

function main() {
  try {
    const input = JSON.parse(process.argv[2] || '{}');
    const { command } = input;
    
    if (!command || !isDangerousGitCommand(command)) {
      // Not a dangerous git command, allow it
      process.exit(0);
    }
    
    // Load and filter recent operations
    const operations = loadGitOperations();
    const recentOps = filterRecentOperations(operations);
    
    // Check if we're over the limit
    if (recentOps.length >= MAX_GIT_OPS_PER_MINUTE) {
      console.error('🚨 RUNAWAY GIT AUTOMATION DETECTED!');
      console.error('');
      console.error(`Too many dangerous git operations (${recentOps.length}) in the last minute.`);
      console.error(`Maximum allowed: ${MAX_GIT_OPS_PER_MINUTE}`);
      console.error('');
      console.error('This is the EXACT pattern that caused your data loss earlier!');
      console.error('');
      console.error('Recent operations:');
      recentOps.forEach(op => {
        console.error(`  ${new Date(op.timestamp).toISOString()}: ${op.command}`);
      });
      console.error('');
      console.error('❌ BLOCKED: ' + command);
      console.error('');
      console.error('To reset the limit (if this is legitimate):');
      console.error(`  rm ${RATE_LIMIT_FILE}`);
      console.error('');
      console.error('To check for runaway processes:');
      console.error('  ps aux | grep claude');
      
      process.exit(1);
    }
    
    // Record this operation and allow it
    recentOps.push({
      timestamp: Date.now(),
      command: command,
      cwd: process.cwd()
    });
    
    saveGitOperations(recentOps);
    console.log(`✅ Git operation approved: ${command}`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error in prevent-runaway-git hook:', error.message);
    // On error, be conservative and allow the operation
    process.exit(0);
  }
}

main();