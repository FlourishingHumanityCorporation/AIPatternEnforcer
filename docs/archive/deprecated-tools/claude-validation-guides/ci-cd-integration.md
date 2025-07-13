# CI/CD Integration for Claude Validation

## Table of Contents

1. [GitHub Actions Integration](#github-actions-integration)
  2. [Automatic PR Validation](#automatic-pr-validation)
  3. [Manual Full Scan](#manual-full-scan)
4. [GitLab CI Integration](#gitlab-ci-integration)
5. [Jenkins Integration](#jenkins-integration)
6. [CircleCI Integration](#circleci-integration)
7. [Generic CI Integration](#generic-ci-integration)
  8. [Exit Codes for CI](#exit-codes-for-ci)
  9. [JSON Output for Processing](#json-output-for-processing)
10. [Docker Integration](#docker-integration)
11. [Optimal Practices](#optimal-practices)

## GitHub Actions Integration

The Claude validation system integrates with GitHub Actions to automatically check pull requests for anti-patterns.

### Automatic PR Validation

Every pull request is automatically checked for:
- Files with `_improved`, `_enhanced`, `_v2` suffixes
- Announcement-style content in documentation
- Other Claude-specific anti-patterns

See `.github/workflows/claude-validation.yml` for the implementation.

### Manual Full Scan

Trigger a full codebase scan:
1. Go to Actions tab in GitHub
2. Select "Claude Code Validation" workflow
3. Click "Run workflow" and set `validate_all` to `true`

## GitLab CI Integration

Add to `.gitlab-ci.yml`:

```yaml
claude-validation:
  stage: test
  image: node:18
  script:
    - npm ci
    - |
      # Check changed files for anti-patterns
      for file in $(git diff --name-only origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME...HEAD); do
        if echo "$file" | grep -E '(_improved|_enhanced|_v2)\.(js|ts|py)$'; then
          echo "❌ Anti-pattern in filename: $file"
          exit 1
        fi
      done
    - npm run claude:test
  only:
    - merge_requests
```

## Jenkins Integration

```groovy
pipeline {
    agent any
    stages {
        stage('Claude Validation') {
            steps {
                script {
                    def changedFiles = sh(
                        script: "git diff --name-only origin/${env.CHANGE_TARGET}...HEAD",
                        returnStdout: true
                    ).trim().split('\n')
                    
                    def violations = []
                    changedFiles.each { file ->
                        if (file =~ /(_improved|_enhanced|_v2)\.(js|ts|py)$/) {
                            violations.add(file)
                        }
                    }
                    
                    if (violations) {
                        error "Claude anti-patterns found: ${violations.join(', ')}"
                    }
                }
                sh 'npm run claude:test'
            }
        }
    }
}
```

## CircleCI Integration

Add to `.circleci/config.yml`:

```yaml
version: 2.1
jobs:
  claude-validation:
    docker:
      - image: node:18
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Check Claude anti-patterns
          command: |
            # For PRs, check only changed files
            if [ -n "$CIRCLE_PR_NUMBER" ]; then
              CHANGED_FILES=$(git diff --name-only origin/main...HEAD)
              for file in $CHANGED_FILES; do
                if echo "$file" | grep -E '(_improved|_enhanced|_v2)\.(js|ts|py)$'; then
                  echo "❌ Anti-pattern: $file"
                  exit 1
                fi
              done
            fi
      - run:
          name: Run validation tests
          command: npm run claude:test

workflows:
  validation:
    jobs:
      - claude-validation
```

## Generic CI Integration

For any CI system, use these commands:

```bash
# Check specific files
echo "$FILE_CONTENT" | node tools/claude-validation/validate-claude.js - --quiet

# Batch validate responses
npm run claude:validate:batch responses/ --output json

# Check staged files (pre-commit)
./tools/claude-validation/pre-commit-hook.sh

# Full test suite
npm run claude:test
```

### Exit Codes for CI

- `0`: All validations passed
- `1`: Validation failures found
- `2`: Error occurred

### JSON Output for Processing

```bash
# Get JSON output for custom processing
npm run claude:validate:batch responses/ --output json > results.json

# Example JSON structure:
{
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 2,
    "avgScore": 85.5
  },
  "results": [
    {
      "file": "response1.txt",
      "passed": false,
      "score": 70,
      "violations": ["Never create improved/enhanced/v2 versions"]
    }
  ]
}
```

## Docker Integration

```dockerfile
# Add to your Dockerfile for containerized validation
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Run validation as part of build
RUN npm run claude:test

# Or as entrypoint for validation container
ENTRYPOINT ["npm", "run", "claude:validate"]
```

## Optimal Practices

1. **Early Detection**: Run validation in CI before code review
2. **Non-Blocking**: Consider warnings vs errors for gradual adoption
3. **Metrics Collection**: Export validation stats for tracking improvement
4. **Custom Rules**: Extend validation for project-specific patterns