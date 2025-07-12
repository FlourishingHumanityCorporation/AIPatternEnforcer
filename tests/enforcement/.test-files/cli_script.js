#!/usr/bin/env node

function main() {
  console.log("CLI output is allowed");
  console.log("Usage: script.js [options]");
}

if (require.main === module) {
  main();
}