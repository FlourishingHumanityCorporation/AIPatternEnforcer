#!/usr/bin/env node

/**
 * Claude Code Hook: Enterprise Antibody
 * 
 * Actively prevents enterprise patterns from being introduced into local-only projects.
 * Based on GOAL.md's extensive list of features to EXCLUDE, this hook blocks
 * multi-tenant, authentication, monitoring, and other enterprise complexities.
 * 
 * This hook is essential because AI often defaults to "production-ready" code
 * with unnecessary complexity for simple local projects.
 * 
 * Blocks:
 * - Multi-tenant architectures
 * - Complex authentication systems  
 * - User management features
 * - Audit logging and compliance
 * - Production monitoring
 * - Team collaboration features
 * 
 * Usage: Called by Claude Code before Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const path = require('path');

// Enterprise patterns grouped by category (from GOAL.md)
const ENTERPRISE_PATTERNS = {
  // Authentication & User Management
  auth: {
    patterns: [
      /class.*(?:Auth|Authentication)(?:Manager|Service|Provider)/i,
      /implement.*(?:OAuth|SAML|SSO|OpenID)/i,
      /(?:User|Account)(?:Registration|SignUp|Login)(?:Controller|Service)/i,
      /(?:Password|Credential)(?:Reset|Recovery|Manager)/i,
      /Multi(?:Factor|TwoFactor)Auth/i,
      /(?:Session|Token)Manager/i,
      /RoleBasedAccess|RBAC|Permission(?:Manager|Service)/i,
      /import.*(?:@clerk|@auth0|supabase\/auth|firebase\/auth)/i,
      /createUserWithEmailAndPassword|signInWithEmailAndPassword/i,
      /\.addRole\(|\.hasPermission\(|\.checkAccess\(/i
    ],
    message: 'Authentication & user management not needed',
    suggestion: 'Use mockUser from lib/auth.ts for local development'
  },

  // Infrastructure & DevOps
  infrastructure: {
    patterns: [
      /(?:Docker|Kubernetes|k8s)(?:Config|Deployment|Service)/i,
      /(?:CI|CD)Pipeline|GitHub(?:Actions|Workflows)/i,
      /(?:staging|production)(?:Config|Environment|Deploy)/i,
      /(?:LoadBalancer|AutoScaling|Cluster)(?:Config|Manager)/i,
      /(?:CDN|CloudFront|Cloudflare)(?:Config|Setup)/i,
      /(?:Migration|Rollback)(?:Manager|Service|Script)/i,
      /(?:Backup|Disaster)Recovery/i,
      /HealthCheck(?:Endpoint|Service)|\/health|\/status/i,
      /GracefulShutdown|ProcessManager/i,
      /terraform|ansible|helm|flux/i
    ],
    message: 'Infrastructure complexity not needed',
    suggestion: 'Keep it simple - run locally with npm run dev'
  },

  // Monitoring & Observability
  monitoring: {
    patterns: [
      /(?:APM|ApplicationPerformance)(?:Monitor|Tracking)/i,
      /(?:Distributed)?Tracing(?:Service|Provider)/i,
      /(?:Log|Logs)(?:Aggregation|Aggregator|Shipper)/i,
      /(?:Metric|Metrics)(?:Collector|Exporter|Dashboard)/i,
      /import.*(?:@sentry|@datadog|@newrelic|winston|pino)/i,
      /(?:Error|Exception)(?:Tracking|Reporter|Handler)Service/i,
      /(?:Uptime|Availability)Monitor/i,
      /RealUserMonitoring|RUM(?:Service|Provider)/i,
      /opentelemetry|jaeger|prometheus|grafana/i,
      /\.setCustomMetric\(|\.recordMetric\(|\.trackEvent\(/i
    ],
    message: 'Production monitoring not needed',
    suggestion: 'Use console.log for debugging local projects'
  },

  // Security & Compliance
  compliance: {
    patterns: [
      /(?:SOC2|HIPAA|GDPR|PCI)(?:Compliance|Audit|Manager)/i,
      /AuditLog(?:ger|ging|Service)|AuditTrail/i,
      /(?:Data)?Encryption(?:AtRest|InTransit|Service)/i,
      /IP(?:Whitelist|Allowlist|Restriction)/i,
      /(?:DDoS|DDOS)(?:Protection|Mitigation)/i,
      /(?:WAF|WebApplicationFirewall)(?:Config|Rules)/i,
      /SecurityHeaders(?:Middleware|Config)/i,
      /PenetrationTest(?:ing|Suite|Scanner)/i,
      /ComplianceOfficer|DataProtectionOfficer/i,
      /\.encrypt\(|\.decrypt\(|\.hash\(|\.sanitize\(/i
    ],
    message: 'Enterprise security features not needed',
    suggestion: 'Basic security is built-in, no compliance needed for local projects'
  },

  // Team & Collaboration
  team: {
    patterns: [
      /CodeReview(?:Workflow|Process|Manager)/i,
      /(?:Team|Shared)(?:Documentation|Wiki|Knowledge)/i,
      /(?:Shared|Team)(?:Environment|Workspace|Development)/i,
      /FeatureFlag(?:s|Service|Manager)|LaunchDarkly/i,
      /(?:AB|Split)Test(?:ing|Service|Framework)/i,
      /(?:Multi|Team)(?:Developer|Tenant|User)(?:Git|Workflow)/i,
      /ProjectManagement(?:Integration|Sync)|Jira|Asana/i,
      /CollaborationService|TeamSync|SharedState/i,
      /\.addTeamMember\(|\.inviteUser\(|\.shareWith\(/i
    ],
    message: 'Team features not needed',
    suggestion: 'This is a single-person local project'
  },

  // Business Features
  business: {
    patterns: [
      /(?:Payment|Billing|Subscription)(?:Service|Manager|Processor)/i,
      /(?:Stripe|PayPal|Square)(?:Integration|Service|Client)/i,
      /(?:Invoice|Receipt)(?:Generator|Service|Manager)/i,
      /(?:Admin|Management)(?:Dashboard|Portal|Panel)/i,
      /CustomerSupport(?:Tool|System|Dashboard)/i,
      /(?:Email|SMS)(?:Notification|Campaign|Service)/i,
      /Marketing(?:Analytics|Automation|Campaign)/i,
      /Referral(?:System|Program|Manager)/i,
      /\.createSubscription\(|\.processPayment\(|\.generateInvoice\(/i,
      /import.*(?:stripe|@paypal|square)/i
    ],
    message: 'Business features not needed',
    suggestion: 'Focus on core AI functionality for local use'
  },

  // API & Integration
  api: {
    patterns: [
      /GraphQL(?:Server|Schema|Resolver)|Apollo(?:Server|Client)/i,
      /(?:API|Rest)(?:Versioning|Version)(?:Manager|Middleware)/i,
      /(?:Swagger|OpenAPI)(?:Documentation|Generator|Config)/i,
      /Webhook(?:Service|Manager|Handler|Processor)/i,
      /RateLimit(?:ing|er)(?:Service|Middleware)|ThrottleService/i,
      /APIGateway(?:Config|Pattern|Service)/i,
      /(?:OAuth|OAuth2)(?:Provider|Integration|Flow)/i,
      /EventDriven(?:Architecture|System)|EventBus|MessageQueue/i,
      /\.addWebhook\(|\.registerEndpoint\(|\.versionAPI\(/i,
      /import.*(?:@apollo|graphql|swagger)/i
    ],
    message: 'Complex API patterns not needed',
    suggestion: 'Use simple REST endpoints with Next.js API routes'
  },

  // Data & Analytics  
  analytics: {
    patterns: [
      /DataWarehouse(?:Service|Connector|ETL)/i,
      /ETL(?:Pipeline|Process|Service)|DataPipeline/i,
      /BusinessIntelligence|BI(?:Tool|Dashboard|Service)/i,
      /(?:Redis|Memcached)Cluster(?:Config|Manager)/i,
      /(?:Read)?Replica(?:Manager|Configuration|Setup)/i,
      /(?:Database)?Shard(?:ing|Manager|Strategy)/i,
      /ChangeDataCapture|CDC(?:Service|Stream)/i,
      /AnalyticsEngine|DataLake|BigQuery/i,
      /\.runETL\(|\.syncToWarehouse\(|\.aggregateMetrics\(/i
    ],
    message: 'Enterprise data features not needed',
    suggestion: 'Use local PostgreSQL with simple queries'
  }
};

// Additional catch-all patterns
const GENERAL_ENTERPRISE_PATTERNS = [
  /(?:Enterprise|Production|Scalable)(?:App|Application|System)/i,
  /MultiTenant|Tenant(?:Manager|Service|Resolver)/i,
  /(?:High)?Availability|Redundancy|Failover/i,
  /OrganizationService|WorkspaceManager|AccountHierarchy/i,
  /CompanySettings|OrganizationConfig|TenantConfig/i
];

function detectEnterprisePatterns(content, filePath) {
  const detectedPatterns = [];
  
  // Check categorized patterns
  for (const [category, config] of Object.entries(ENTERPRISE_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(content)) {
        const match = content.match(pattern);
        detectedPatterns.push({
          category,
          pattern: pattern.source,
          match: match[0],
          message: config.message,
          suggestion: config.suggestion
        });
      }
    }
  }
  
  // Check general patterns
  for (const pattern of GENERAL_ENTERPRISE_PATTERNS) {
    if (pattern.test(content)) {
      const match = content.match(pattern);
      detectedPatterns.push({
        category: 'general',
        pattern: pattern.source,
        match: match[0],
        message: 'Enterprise complexity detected',
        suggestion: 'Keep it simple for local development'
      });
    }
  }
  
  return detectedPatterns;
}

// Read from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';
    const content = toolInput.content || toolInput.new_string || '';
    
    // Skip if no content to check
    if (!content) {
      process.exit(0);
    }
    
    // Detect enterprise patterns
    const detectedPatterns = detectEnterprisePatterns(content, filePath);
    
    if (detectedPatterns.length > 0) {
      // Group by category for cleaner output
      const byCategory = {};
      detectedPatterns.forEach(detection => {
        if (!byCategory[detection.category]) {
          byCategory[detection.category] = [];
        }
        byCategory[detection.category].push(detection);
      });
      
      let message = `🚫 Enterprise Pattern Blocked\n\n`;
      message += `This is a LOCAL-ONLY project. No enterprise features needed!\n\n`;
      
      // Show first few detections
      let shown = 0;
      for (const [category, detections] of Object.entries(byCategory)) {
        if (shown >= 3) break;
        
        const detection = detections[0];
        message += `❌ Detected: ${detection.match}\n`;
        message += `   Category: ${category}\n`;
        message += `   Issue: ${detection.message}\n`;
        message += `   ✅ ${detection.suggestion}\n\n`;
        shown++;
      }
      
      if (detectedPatterns.length > shown) {
        message += `... and ${detectedPatterns.length - shown} more enterprise patterns\n\n`;
      }
      
      message += `💡 Remember the KISS principle:\n`;
      message += `   • Single user, local development only\n`;
      message += `   • No authentication needed (use mockUser)\n`;
      message += `   • No monitoring or compliance\n`;
      message += `   • Focus on AI functionality\n\n`;
      
      message += `📖 See GOAL.md for the complete exclusion list`;
      
      // Exit code 2 blocks the operation
      console.error(message);
      process.exit(2);
    }
    
    // No enterprise patterns detected
    process.exit(0);
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.error(`Hook error: ${error.message}`);
    process.exit(0);
  }
});

// Handle timeout
setTimeout(() => {
  console.error('Hook timeout - allowing operation');
  process.exit(0);
}, 2000); // Slightly longer timeout due to more patterns

module.exports = { 
  ENTERPRISE_PATTERNS,
  GENERAL_ENTERPRISE_PATTERNS,
  detectEnterprisePatterns
};