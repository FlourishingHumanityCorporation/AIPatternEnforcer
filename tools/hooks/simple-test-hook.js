#!/usr/bin/env node

// Simple test hook that always logs when called
const fs = require('fs');

// Log that hook was called
const timestamp = new Date().toISOString();
fs.writeFileSync('simple-test-hook-called.txt', timestamp);

// Always exit with success
process.exit(0);