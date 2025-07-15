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

  // COMPREHENSIVE ENTERPRISE PATTERNS (consolidated from multiple hooks)
  static get ENTERPRISE_PATTERNS() {
    return {
      // Authentication & User Management (from enterprise-antibody + mock-data-enforcer)
      auth: [
        /class.*(?:Auth|Authentication)(?:Manager|Service|Provider)/i,
        /implement.*(?:OAuth|SAML|SSO|OpenID)/i,
        /(?:User|Account)(?:Registration|SignUp|Login)(?:Controller|Service)/i,
        /(?:Password|Credential)(?:Reset|Recovery|Manager)/i,
        /Multi(?:Factor|TwoFactor)Auth/i,
        /(?:Session|Token)Manager/i,
        /RoleBasedAccess|RBAC|Permission(?:Manager|Service)/i,
        /import.*(?:@clerk|@auth0|supabase\/auth|firebase\/auth)/i,
        /createUserWithEmailAndPassword|signInWithEmailAndPassword/i,
        /signInWithPopup|signInWithRedirect|signOut/i,
        /verifyIdToken|createCustomToken|setCustomUserClaims/i,
        /generateAuthToken|validateAuthToken|refreshToken/i,
        /\.addRole\(|\.hasPermission\(|\.checkAccess\(/i,
        /(?:create|update|delete)User(?:Account|Profile|Data)/gi,
        /(?:register|signup|signin)(?:User|WithEmail|WithPhone)/gi,
        /(?:create|destroy|validate)Session/gi,
        /(?:set|get|clear)(?:Session|Cookie)(?:Data)?/gi,
        /express-session|cookie-session|iron-session/gi,
        /jwt\.(?:sign|verify|decode)/gi,
        /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
        /CREATE\s+TABLE\s+(?:users|accounts|sessions)/gi,
        /(?:INSERT|UPDATE|DELETE).*(?:users|accounts).*WHERE/gi,
        /(?:hash|verify)Password|bcrypt|argon2|scrypt/gi,
        /password(?:Reset|Recovery|Change)Token/gi,
        /from\s+["'](?:next-auth|@auth\/|passport|jsonwebtoken)["']/gi,
      ],
      
      // Infrastructure & DevOps
      infrastructure: [
        /(?:Docker|Kubernetes|k8s)(?:Config|Deployment|Service)/i,
        /(?:CI|CD)Pipeline|GitHub(?:Actions|Workflows)/i,
        /(?:staging|production)(?:Config|Environment|Deploy)/i,
        /(?:LoadBalancer|AutoScaling|Cluster)(?:Config|Manager)/i,
        /(?:CDN|CloudFront|Cloudflare)(?:Config|Setup)/i,
        /(?:Migration|Rollback)(?:Manager|Service|Script)/i,
        /(?:Backup|Disaster)Recovery/i,
        /HealthCheck(?:Endpoint|Service)|\/health|\/status/i,
        /GracefulShutdown|ProcessManager/i,
        /terraform|ansible|helm|flux/i,
      ],
      
      // Monitoring & Observability
      monitoring: [
        /(?:APM|ApplicationPerformance)(?:Monitor|Tracking)/i,
        /(?:Distributed)?Tracing(?:Service|Provider)/i,
        /(?:Log|Logs)(?:Aggregation|Aggregator|Shipper)/i,
        /(?:Metric|Metrics)(?:Collector|Exporter|Dashboard)/i,
        /import.*(?:@sentry|@datadog|@newrelic|winston|pino)/i,
        /(?:Error|Exception)(?:Tracking|Reporter|Handler)Service/i,
        /(?:Uptime|Availability)Monitor/i,
        /RealUserMonitoring|RUM(?:Service|Provider)/i,
        /opentelemetry|jaeger|prometheus|grafana/i,
        /\.setCustomMetric\(|\.recordMetric\(|\.trackEvent\(/i,
      ],
      
      // Security & Compliance
      compliance: [
        /(?:SOC2|HIPAA|GDPR|PCI)(?:Compliance|Audit|Manager)/i,
        /AuditLog(?:ger|ging|Service)|AuditTrail/i,
        /(?:Data)?Encryption(?:AtRest|InTransit|Service)/i,
        /IP(?:Whitelist|Allowlist|Restriction)/i,
        /(?:DDoS|DDOS)(?:Protection|Mitigation)/i,
        /(?:WAF|WebApplicationFirewall)(?:Config|Rules)/i,
        /SecurityHeaders(?:Middleware|Config)/i,
        /PenetrationTest(?:ing|Suite|Scanner)/i,
        /ComplianceOfficer|DataProtectionOfficer/i,
        /\.encrypt\(|\.decrypt\(|\.hash\(|\.sanitize\(/i,
      ],
      
      // Team & Collaboration
      team: [
        /CodeReview(?:Workflow|Process|Manager)/i,
        /(?:Team|Shared)(?:Documentation|Wiki|Knowledge)/i,
        /(?:Shared|Team)(?:Environment|Workspace|Development)/i,
        /FeatureFlag(?:s|Service|Manager)|LaunchDarkly/i,
        /(?:AB|Split)Test(?:ing|Service|Framework)/i,
        /(?:Multi|Team)(?:Developer|Tenant|User)(?:Git|Workflow)/i,
        /ProjectManagement(?:Integration|Sync)|Jira|Asana/i,
        /CollaborationService|TeamSync|SharedState/i,
        /\.addTeamMember\(|\.inviteUser\(|\.shareWith\(/i,
      ],
      
      // Business Features
      business: [
        /(?:Payment|Billing|Subscription)(?:Service|Manager|Processor)/i,
        /(?:Stripe|PayPal|Square)(?:Integration|Service|Client)/i,
        /(?:Invoice|Receipt)(?:Generator|Service|Manager)/i,
        /(?:Admin|Management)(?:Dashboard|Portal|Panel)/i,
        /CustomerSupport(?:Tool|System|Dashboard)/i,
        /(?:Email|SMS)(?:Notification|Campaign|Service)/i,
        /Marketing(?:Analytics|Automation|Campaign)/i,
        /Referral(?:System|Program|Manager)/i,
        /\.createSubscription\(|\.processPayment\(|\.generateInvoice\(/i,
        /import.*(?:stripe|@paypal|square)/i,
      ],
      
      // API & Integration
      api: [
        /GraphQL(?:Server|Schema|Resolver)|Apollo(?:Server|Client)/i,
        /(?:API|Rest)(?:Versioning|Version)(?:Manager|Middleware)/i,
        /(?:Swagger|OpenAPI)(?:Documentation|Generator|Config)/i,
        /Webhook(?:Service|Manager|Handler|Processor)/i,
        /RateLimit(?:ing|er)(?:Service|Middleware)|ThrottleService/i,
        /APIGateway(?:Config|Pattern|Service)/i,
        /(?:OAuth|OAuth2)(?:Provider|Integration|Flow)/i,
        /EventDriven(?:Architecture|System)|EventBus|MessageQueue/i,
        /\.addWebhook\(|\.registerEndpoint\(|\.versionAPI\(/i,
        /import.*(?:@apollo|graphql|swagger)/i,
      ],
      
      // Data & Analytics
      analytics: [
        /DataWarehouse(?:Service|Connector|ETL)/i,
        /ETL(?:Pipeline|Process|Service)|DataPipeline/i,
        /BusinessIntelligence|BI(?:Tool|Dashboard|Service)/i,
        /(?:Redis|Memcached)Cluster(?:Config|Manager)/i,
        /(?:Read)?Replica(?:Manager|Configuration|Setup)/i,
        /(?:Database)?Shard(?:ing|Manager|Strategy)/i,
        /ChangeDataCapture|CDC(?:Service|Stream)/i,
        /AnalyticsEngine|DataLake|BigQuery/i,
        /\.runETL\(|\.syncToWarehouse\(|\.aggregateMetrics\(/i,
      ],
      
      // Production Data Patterns (from mock-data-enforcer)
      production: [
        /mongodb\+srv:\/\/|postgresql:\/\/.*\.amazonaws\.com/gi,
        /(?:cosmos|dynamo)db\..*\.azure|aws/gi,
        /firestore|realtime.*database|supabase\.co/gi,
        /https:\/\/api\..*\.(?:com|io|net)(?!.*localhost)/gi,
        /production.*endpoint|prod.*api.*url/gi,
        /(?:sendgrid|mailgun|postmark|ses).*api/gi,
        /smtp\.(?:gmail|outlook|yahoo)/gi,
        /stripe\.com\/v1|paypal\.com.*\/payments/gi,
        /(?:payment|billing|subscription).*processor/gi,
      ],
      
      // General Enterprise Indicators
      general: [
        /(?:Enterprise|Production|Scalable)(?:App|Application|System)/i,
        /MultiTenant|Tenant(?:Manager|Service|Resolver)/i,
        /(?:High)?Availability|Redundancy|Failover/i,
        /OrganizationService|WorkspaceManager|AccountHierarchy/i,
        /CompanySettings|OrganizationConfig|TenantConfig/i,
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

  // COMPREHENSIVE SECURITY PATTERNS (consolidated from security-scan.js)
  static get SECURITY_PATTERNS() {
    return {
      // XSS Vulnerabilities
      xss: [
        /(?:innerHTML|outerHTML)\s*=\s*[^;]+\+/gi,
        /document\.write\s*\(/gi,
        /dangerouslySetInnerHTML/i,
      ],
      
      // Code Injection
      codeInjection: [
        /eval\s*\(/gi,
        /new\s+Function\s*\(/gi,
      ],
      
      // SQL Injection
      sqlInjection: [
        /SELECT\s+.+\s+FROM\s+.+\s+WHERE\s+.+\+/gi,
        /INSERT.*\+.*VALUES/i,
        /DELETE.*\+.*WHERE/i,
        /UPDATE.*\+.*SET/i,
      ],
      
      // Hardcoded Secrets
      hardcodedSecrets: [
        /password\s*[:=]\s*['"][\w\d!@#$%^&*]{8,}['"]/gi,
        /api[_-]?key\s*[:=]\s*['"][\w\d-]{20,}['"]/gi,
        /secret\s*[:=]\s*['"][\w\d]{16,}['"]/gi,
        /token\s*[:=]\s*['"][\w\d!@#$%^&*]{16,}['"]/gi,
      ],
      
      // URL/Fetch Vulnerabilities
      urlInjection: [
        /fetch\s*\(\s*['`"][^'`"]*\$\{[^}]*\}[^'`"]*['`"]/gi,
        /window\.location\.href\s*=\s*[^;]+\+/gi,
      ],
      
      // Insecure Storage
      insecureStorage: [
        /localStorage\.setItem\s*\(\s*['"].*token.*['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"].*token.*['"]/gi,
      ],
      
      // Weak Cryptography
      weakCrypto: [
        /Math\.random\s*\(\s*\).*(?:password|token|secret|key)/gi,
      ],
    };
  }

  // SCOPE PATTERNS (from scope-limiter.js)
  static get SCOPE_CREEP_PATTERNS() {
    return [
      {
        pattern: /also.*(?:add|create|update|fix|refactor)|while.*(?:we're|you're).*at.*it/gi,
        issue: 'Scope creep: "Also" or "while we\'re at it" additions',
        suggestion: "Make separate requests for additional tasks",
      },
      {
        pattern: /(?:improve|optimize|enhance|refactor).*(?:entire|whole|all)/gi,
        issue: "Scope creep: Attempting to improve entire codebase",
        suggestion: "Focus on specific, targeted changes",
      },
      {
        pattern: /(?:migrate|convert|upgrade).*(?:all|entire|everything)/gi,
        issue: "Scope creep: Large-scale migration in single request",
        suggestion: "Break migration into smaller, focused steps",
      },
      {
        pattern: /(?:add|implement).*(?:authentication|database|api|routing).*(?:and|plus|also)/gi,
        issue: "Scope creep: Multiple major features in one request",
        suggestion: "Implement one major feature at a time",
      },
    ];
  }
  
  static get GOOD_SCOPE_PATTERNS() {
    return [
      {
        pattern: /only.*(?:change|modify|update|fix)|just.*(?:add|create|update)/gi,
        description: "Explicit scope limitation",
      },
      {
        pattern: /single.*(?:function|component|file|change)/gi,
        description: "Single-item focus",
      },
      {
        pattern: /minimal.*change|smallest.*possible/gi,
        description: "Minimal change principle",
      },
      {
        pattern: /don't.*(?:change|modify|touch|update).*(?:other|existing)/gi,
        description: "Explicit preservation instruction",
      },
    ];
  }
  
  // API PATTERNS (from api-validator.js)
  static get IMPORT_PATTERNS() {
    return [
      {
        pattern: /import\s+(?:.*\s+from\s+)?['`"]([^'`"]+)['`"]/gi,
        type: "ES6 import",
      },
      {
        pattern: /require\s*\(\s*['`"]([^'`"]+)['`"]\s*\)/gi,
        type: "CommonJS require",
      },
      {
        pattern: /import\s*\(\s*['`"]([^'`"]+)['`"]\s*\)/gi,
        type: "Dynamic import",
      },
    ];
  }
  
  static get API_ENDPOINT_PATTERNS() {
    return [
      {
        pattern: /fetch\s*\(\s*['`"]\/api\/([^'`"]+)['`"]/gi,
        type: "API endpoint",
        basePath: "pages/api/",
      },
      {
        pattern: /axios\.[get|post|put|delete|patch]+\s*\(\s*['`"]\/api\/([^'`"]+)['`"]/gi,
        type: "Axios API call",
        basePath: "pages/api/",
      },
    ];
  }
  
  // HALLUCINATED API PATTERNS
  static get HALLUCINATED_API_PATTERNS() {
    return [
      {
        pattern: /\buseServerState\s*\(/g,
        message: "useServerState is not a real React hook",
        suggestion: "Use useState, useEffect, or a data fetching library",
      },
      {
        pattern: /\bautoSave\s*\(/g,
        message: "autoSave is not a standard API",
        suggestion: "Implement auto-save functionality explicitly",
      },
      {
        pattern: /console\.table\s*\(/g,
        message: "console.table should not be used in production",
        suggestion: "Use proper logging: logger.info()",
      },
      {
        pattern: /fetch\s*\(\s*['`"](?!https?:\/\/|\/)[^'`"]+['`"]/g,
        message: "Potentially invalid fetch URL",
        suggestion: "Ensure URL is absolute or starts with /",
      },
    ];
  }
  
  // ROOT DIRECTORY PATTERNS (from block-root-mess.js)
  static get ALLOWED_ROOT_FILES() {
    return new Set([
      // Meta-project Documentation
      "README.md", "LICENSE", "CLAUDE.md", "CONTRIBUTING.md",
      "SETUP.md", "FRICTION-MAPPING.md", "QUICK-START.md", 
      "USER-JOURNEY.md", "DOCS_INDEX.md",
      
      // Meta-project Configuration
      "package.json", "package-lock.json", "tsconfig.json",
      ".eslintrc.json", ".prettierrc", ".env", ".env.example", ".gitignore",
      
      // CI/CD (allowed since it's for the meta-project)
      ".github", ".husky", ".vscode",
    ]);
  }
  
  static get DIRECTORY_SUGGESTIONS() {
    return {
      // Application code patterns
      app: "templates/nextjs-app-router/app/",
      components: "templates/[framework]/components/",
      lib: "templates/[framework]/lib/",
      pages: "templates/nextjs-pages/pages/",
      src: "templates/[framework]/src/",
      
      // Config files that belong in templates
      "next.config.js": "templates/nextjs-app-router/",
      "vite.config.js": "templates/react-vite/",
      "tailwind.config.js": "templates/[framework]/",
      "postcss.config.js": "templates/[framework]/",
      "jest.config.js": "templates/[framework]/",
      
      // Documentation that's not meta-project level
      "CHANGELOG.md": "docs/reports/",
      "TODO.md": "docs/plans/",
      "NOTES.md": "docs/notes/",
      
      // Build artifacts
      dist: "templates/[framework]/dist/ (or add to .gitignore)",
      build: "templates/[framework]/build/ (or add to .gitignore)",
      ".next": "templates/nextjs-app-router/.next/ (or add to .gitignore)",
    };
  }
  
  // CONSOLE REPLACEMENT PATTERNS (from fix-console-logs.js)
  static get CONSOLE_REPLACEMENTS() {
    return {
      "console.log": "logger.info",
      "console.error": "logger.error",
      "console.warn": "logger.warn",
      "console.info": "logger.info",
      "console.debug": "logger.debug",
    };
  }
  
  // MOCK DATA PATTERNS (consolidated)
  static get GOOD_MOCK_PATTERNS() {
    return [
      /mockUser|testUser|demoUser|localUser/i,
      /getMockData|generateTestData|seedData/i,
      /localStorage.*mock|sessionStorage.*demo/i,
      /sqlite|:memory:|localhost.*postgres/i,
      /\.env\.local|\.env\.development/i,
    ];
  }
  
  // LOCALHOST ENFORCEMENT PATTERNS (from localhost-enforcer.js)
  static get LOCAL_ONLY_PATTERNS() {
    return {
      // Database connections
      database: {
        remote: [
          /mongodb\+srv:\/\//gi,
          /\.mongodb\.net/gi,
          /\.amazonaws\.com.*:5432/gi,
          /\.database\.azure/gi,
          /\.supabase\.co/gi,
          /\.planetscale\.com/gi,
          /\.neon\.tech(?!.*localhost)/gi,
          /postgres:\/\/(?!localhost|127\.0\.0\.1|postgres:|:memory:)/gi,
          /mysql:\/\/(?!localhost|127\.0\.0\.1|root@localhost)/gi,
          /host=["'](?!localhost|127\.0\.0\.1)[\w\.-]+["']/gi,
          /DATABASE_URL.*=.*(?!localhost|127\.0\.0\.1|sqlite)https?:/gi,
        ],
        local: [
          "postgresql://localhost",
          "postgres://localhost:5432", 
          "mysql://localhost:3306",
          "sqlite:./dev.db",
          ":memory:",
          "file:./local.db",
        ],
        message: "Use local database only",
      },
      
      // API endpoints
      endpoints: {
        remote: [
          /(?:API|ENDPOINT).*_URL.*=.*https:\/\/(?!localhost|127\.0\.0\.1)/gi,
          /baseURL.*:.*["']https:\/\/(?!localhost|127\.0\.0\.1)/gi,
          /fetch\(["']https:\/\/(?!localhost|127\.0\.0\.1).*api/gi,
          /https:\/\/api\..*\.(?:com|io|net|org)(?!.*mock|.*test)/gi,
          /wss:\/\/(?!localhost|127\.0\.0\.1)/gi,
          /\.vercel\.app|\.netlify\.app|\.herokuapp\.com/gi,
          /\.railway\.app|\.render\.com|\.fly\.io/gi,
        ],
        local: [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://localhost:8080",
          "/api/",
          "ws://localhost",
        ],
        message: "Use localhost URLs only",
      },
      
      // Cloud services
      services: {
        remote: [
          /aws-sdk|@aws-sdk|amazonaws\.com/gi,
          /s3\..*\.amazonaws|cloudfront\.net/gi,
          /googleapis\.com|cloud\.google\.com/gi,
          /storage\.googleapis|firebaseapp\.com/gi,
          /\.blob\.core\.windows\.net|\.azure\.com/gi,
          /cloudinary\.com|imgix\.net|fastly\.net/gi,
          /unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare/gi,
          /sentry\.io|datadog\.com|newrelic\.com/gi,
          /logrocket\.com|bugsnag\.com/gi,
        ],
        local: [
          "Local file system",
          "public/ directory",
          "localhost services",
          "SQLite for storage",
        ],
        message: "Use local services only",
      },
      
      // Environment configurations
      environment: {
        remote: [
          /NODE_ENV.*=.*["']production["']/gi,
          /NEXT_PUBLIC_ENV.*=.*["']production["']/gi,
          /\.env\.production/gi,
          /process\.env\.(?:PROD|PRODUCTION|STAGING)/gi,
          /VERCEL_|NETLIFY_|HEROKU_|RENDER_/gi,
          /CI=true|CI_COMMIT|GITHUB_ACTIONS/gi,
        ],
        local: [
          "NODE_ENV=development",
          ".env.local",
          ".env.development",
          "Local environment only",
        ],
        message: "Use development environment only",
      },
    };
  }
  
  static get GOOD_LOCAL_PATTERNS() {
    return [
      /localhost|127\.0\.0\.1/,
      /\.env\.local|\.env\.development/,
      /sqlite|:memory:/i,
      /public\/|static\/|assets\//,
      /NODE_ENV.*development/i,
      /mockServiceWorker/i,
    ];
  }
  
  // VECTOR DB PATTERNS (from vector-db-hygiene.js)
  static get EMBEDDING_DIMENSIONS() {
    return {
      "text-embedding-ada-002": 1536,
      "text-embedding-3-small": 1536,
      "text-embedding-3-large": 3072,
      "all-MiniLM-L6-v2": 384,
      "all-mpnet-base-v2": 768,
      "e5-large-v2": 1024,
    };
  }
  
  static get VECTOR_PATTERNS() {
    return {
      embedding_generation: [
        /openai\.embeddings\.create/i,
        /embeddings\.create/i,
        /generateEmbedding/i,
        /getEmbedding/i,
        /embed\(/i,
      ],
      vector_storage: [
        /INSERT.*embedding/i,
        /UPDATE.*embedding/i,
        /CREATE TABLE.*embedding/i,
        /vector\s*\[\s*\d+\s*\]/i,
        /pgvector/i,
      ],
      vector_queries: [
        /<->|<#>|<=>/, // pgvector operators
        /ORDER BY.*<->|<#>|<=>/,
        /cosine_similarity/i,
        /euclidean_distance/i,
        /dot_product/i,
        /similarity_search/i,
      ],
      vector_indexes: [
        /CREATE INDEX.*USING ivfflat/i,
        /CREATE INDEX.*USING hnsw/i,
        /ivfflat|hnsw/i,
        /vector_cosine_ops|vector_l2_ops|vector_ip_ops/i,
      ],
    };
  }
  
  static get VECTOR_ANTI_PATTERNS() {
    return {
      single_embedding_inserts: [
        /INSERT.*embedding.*VALUES.*\n.*INSERT.*embedding/i,
        /(?:^|\n).*INSERT.*embedding.*(?:\n.*INSERT.*embedding.*){2,}/m,
      ],
      hardcoded_dimensions: [/vector\[\s*(?!1536|768|384|1024|3072)\d+\s*\]/i],
      unindexed_similarity: [
        /ORDER BY.*<->(?!.*INDEX)/i,
        /WHERE.*<->.*<(?!.*INDEX)/i,
      ],
      inefficient_queries: [
        /SELECT \* FROM.*ORDER BY.*<->/i,
        /ORDER BY.*<->.*LIMIT \d{3,}/i,
        /WHERE.*<->.*< 0\.\d{4,}/i,
      ],
      embedding_injection: [
        /embedding.*\$\{|embedding.*\+.*\'/i,
        /vector.*\$\{|vector.*\+.*\'/i,
      ],
    };
  }
  
  // PERFORMANCE PATTERNS (from performance-guardian.js)
  static get PERFORMANCE_LIMITS() {
    return {
      maxNestedLoops: 3,
      maxComplexityScore: 15,
      maxFileSize: 1000,
      maxImportCount: 20,
      maxFunctionLength: 50,
    };
  }
  
  static get BLOAT_PATTERNS() {
    return {
      redundantImports: /import.*from ['"'].*['"'];?\s*import.*from ['"'].*['"'];/g,
      longFunctions: /function\s+\w+[^{]*{[^}]{2000,}}/g,
      deepNesting: /{\s*{\s*{\s*{\s*{/g,
      duplicateLogic: /(if\s*\([^)]+\)\s*{[^}]+})\s*\1/g,
    };
  }
  
  static get COMPLEXITY_PATTERNS() {
    return {
      nestedLoops: /for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)/g,
      tripleNested: /for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)\s*{[^{}]*for\s*\([^)]*\)/g,
      recursiveWithLoop: /(function\s+\w+[^{]*{[^}]*for\s*\([^)]*\)[^}]*\w+\s*\([^)]*\))/g,
      arrayMethods: /\.(map|filter|reduce|forEach|find|some|every)\s*\([^)]*\)\s*\.\s*(map|filter|reduce)/g,
    };
  }
  
  static get HEAVY_IMPORTS() {
    return {
      lodash: /import.*from ['"']lodash['"'];?/,
      momentjs: /import.*from ['"']moment['"'];?/,
      entireReact: /import \* as React from ['"']react['"'];?/,
      entireNext: /import \* as Next from ['"']next['"'];?/,
      heavyLibs: /import.*from ['"'](@ant-design|@material-ui|react-bootstrap)['"'];?/,
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
  
  /**
   * Find enterprise patterns with suggestions
   */
  static findEnterprisePatterns(content, filePath) {
    const detectedPatterns = [];
    
    // Check categorized patterns
    for (const [category, patterns] of Object.entries(this.ENTERPRISE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          const match = content.match(pattern);
          detectedPatterns.push({
            category,
            pattern: pattern.source,
            match: match[0],
            message: this.getEnterpriseMessage(category),
            suggestion: this.getEnterpriseSuggestion(category),
          });
        }
      }
    }
    
    return detectedPatterns;
  }
  
  /**
   * Get enterprise category message
   */
  static getEnterpriseMessage(category) {
    const messages = {
      auth: "Authentication & user management not needed",
      infrastructure: "Infrastructure complexity not needed", 
      monitoring: "Production monitoring not needed",
      compliance: "Enterprise security features not needed",
      team: "Team features not needed",
      business: "Business features not needed",
      api: "Complex API patterns not needed",
      analytics: "Enterprise data features not needed",
      production: "Production data sources not needed",
      general: "Enterprise complexity detected",
    };
    return messages[category] || "Enterprise feature not needed";
  }
  
  /**
   * Get enterprise category suggestion
   */
  static getEnterpriseSuggestion(category) {
    const suggestions = {
      auth: "Use mockUser from lib/auth.ts for local development",
      infrastructure: "Keep it simple - run locally with npm run dev",
      monitoring: "Use console.log for debugging local projects",
      compliance: "Basic security is built-in, no compliance needed for local projects",
      team: "This is a single-person local project",
      business: "Focus on core AI functionality for local use",
      api: "Use simple REST endpoints with Next.js API routes",
      analytics: "Use local PostgreSQL with simple queries",
      production: "Use local data sources (SQLite, localhost PostgreSQL)",
      general: "Keep it simple for local development",
    };
    return suggestions[category] || "Keep it simple for local development";
  }
}

module.exports = PatternLibrary;
