// This file contains multiple security vulnerabilities and bad patterns
// that should be caught by the Claude Code hooks

export class UserProfileManager {
  constructor() {
    // Hardcoded credentials - security-scan.js should catch this
    this.apiKey = 'sk-1234567890abcdef';
    this.dbPassword = 'admin123';
    this.jwtSecret = 'super-secret-key';
  }

  // XSS vulnerability - security-scan.js should block this
  displayUserBio(userBio) {
    document.getElementById('bio-container').innerHTML = userBio;
    // Even worse - concatenating user input
    document.body.innerHTML += '<div class="user-bio">' + userBio + '</div>';
  }

  // SQL injection vulnerability - security-scan.js should catch this
  async getUserByName(userName) {
    const query = `SELECT * FROM users WHERE name = '${userName}'`;
    return await db.query(query);
  }

  // Code injection with eval - major security issue
  processUserCommand(command) {
    eval(`this.${command}()`);
  }

  // Command injection vulnerability
  async generateReport(fileName) {
    const { exec } = require('child_process');
    exec(`cat ${fileName} | grep user`, (error, stdout) => {
      console.log(stdout);
    });
  }

  // Path traversal vulnerability
  async readUserFile(filePath) {
    const fs = require('fs');
    // No validation of filePath - could be ../../etc/passwd
    return fs.readFileSync(`/user/data/${filePath}`, 'utf-8');
  }

  // Insecure random token generation
  generateSessionToken() {
    return Math.random().toString(36).substr(2);
  }

  // Sensitive data in URLs
  sendPasswordResetEmail(email, token) {
    const resetUrl = `https://example.com/reset?token=${token}&email=${email}`;
    console.log(`Sending reset URL: ${resetUrl}`);
  }

  // Prototype pollution vulnerability
  updateUserSettings(settings) {
    for (let key in settings) {
      this.constructor.prototype[key] = settings[key];
    }
  }
}