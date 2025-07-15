/**
 * Common patterns used across hooks
 */
class PatternLibrary {
  // File naming patterns
  static get FORBIDDEN_FILE_PATTERNS() {
    return [
      /_improved\./i,
      /_enhanced\./i,
      /_v2\./i,
      /_v\d+\./i,
      /_fixed\./i,
      /_updated\./i,
      /_new\./i,
      /_final\./i,
      /_refactored\./i,
      /_optimized\./i,
    ];
  }

  // Code patterns that indicate enterprise features
  static get ENTERPRISE_PATTERNS() {
    return {
      auth: [
        /class.*(?:Auth|Authentication)(?:Manager|Service|Provider)/i,
        /(?:User|Account)(?:Registration|SignUp|Login)(?:Controller|Service)/i,
        /Multi(?:Factor|TwoFactor)Auth/i,
        /(?:Session|Token)Manager/i,
      ],
      monitoring: [
        /(?:APM|ApplicationPerformance)(?:Monitor|Tracking)/i,
        /(?:Error|Exception)(?:Tracking|Reporter|Handler)Service/i,
        /import.*(?:@sentry|@datadog|@newrelic)/i,
      ],
      infrastructure: [
        /(?:Docker|Kubernetes|k8s)(?:Config|Deployment|Service)/i,
        /(?:CI|CD)Pipeline|GitHub(?:Actions|Workflows)/i,
        /(?:LoadBalancer|AutoScaling|Cluster)(?:Config|Manager)/i,
      ],
    };
  }

  // Local development patterns (good)
  static get LOCAL_PATTERNS() {
    return [
      /localhost|127\.0\.0\.1/,
      /\.env\.local|\.env\.development/,
      /sqlite|:memory:/i,
      /mockUser|testUser|demoUser/i,
      /NODE_ENV.*development/i,
    ];
  }

  // Security vulnerability patterns
  static get SECURITY_PATTERNS() {
    return {
      sqlInjection: [
        /SELECT.*\+.*FROM/i,
        /INSERT.*\+.*VALUES/i,
        /DELETE.*\+.*WHERE/i,
        /UPDATE.*\+.*SET/i,
      ],
      xss: [
        /innerHTML.*\+/i,
        /document\.write.*\+/i,
        /eval\s*\(/i,
        /dangerouslySetInnerHTML/i,
      ],
      hardcodedSecrets: [
        /password\s*=\s*['"]/i,
        /api_key\s*=\s*['"]/i,
        /secret\s*=\s*['"]/i,
        /token\s*=\s*['"]/i,
      ],
    };
  }

  /**
   * Test if content matches any pattern in a category
   */
  static matchesCategory(content, category) {
    const patterns = this[category] || [];
    return patterns.some((pattern) => pattern.test(content));
  }

  /**
   * Find all matches for a pattern category
   */
  static findMatches(content, patterns) {
    const matches = [];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        matches.push({
          pattern: pattern.source,
          match: match[0],
          index: match.index,
        });
      }
    }
    return matches;
  }
}

module.exports = PatternLibrary;
