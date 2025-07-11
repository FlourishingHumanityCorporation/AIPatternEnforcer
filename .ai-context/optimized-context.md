# Optimized Project Context

Generated: Thu Jul 10 19:44:26 PDT 2025
Target: .

## Project Overview

A comprehensive meta-template for AI-assisted software development that solves common challenges and enforces best practices.

````bash
git clone https://github.com/yourusername/project-template.git
cd project-template

npm install

## Key Files and Signatures

### ./src/components/TestButton/index.ts
```typescript
// File: ./src/components/TestButton/index.ts
// Generated: Thu Jul 10 19:44:29 PDT 2025

// Imports:
export { TestButton } from './TestButton';
export type { TestButtonProps } from './TestButton';

// Types & Interfaces:
export type { TestButtonProps } from './TestButton';

// Function Signatures:

// Classes:
````

### ./config/eslint/.eslintrc.base.js

```typescript
// File: ./config/eslint/.eslintrc.base.js
// Generated: Thu Jul 10 19:44:29 PDT 2025

// Imports:

// Types & Interfaces:

// Function Signatures:

// Classes:
```

### ./src/components/TestButton/TestButton.stories.tsx

```typescript
// File: ./src/components/TestButton/TestButton.stories.tsx
// Generated: Thu Jul 10 19:44:29 PDT 2025

// Imports:
import type { Meta, StoryObj } from "@storybook/react";
import { TestButton } from "./TestButton";

// Types & Interfaces:
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default TestButton",
  },
};

// Function Signatures:

// Classes:
```

### ./src/components/TestButton/TestButton.tsx

```typescript
// File: ./src/components/TestButton/TestButton.tsx
// Generated: Thu Jul 10 19:44:29 PDT 2025

// Imports:
import React from 'react';
import styles from './TestButton.module.css';

// Types & Interfaces:
export interface TestButtonProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// Function Signatures:
export const TestButton: React.FC<TestButtonProps> = ({ ... }

// Classes:
```

### ./tools/generators/component-generator.js

```typescript
// File: ./tools/generators/component-generator.js
// Generated: Thu Jul 10 19:44:29 PDT 2025

// Imports:
import styles from './{{name}}.module.css';
import { render, screen, fireEvent } from '@testing-library/react';
import { {{name}} } from './{{name}}';
import { {{name}} } from './{{name}}';
export type { {{name}}Props } from './{{name}}';`

// Types & Interfaces:
export interface {{name}}Props {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default {{name}}',
  },
};
export type { {{name}}Props } from './{{name}}';`
};

// Function Signatures:
const fs = require('fs').promises;
const path = require('path');
const { ... }
const Handlebars = require('handlebars');
const chalk = require('chalk');
export const { ... }
async function generateComponent(name, options) { ... }

// Classes:
```

## Architecture Patterns

### api-design-standards

## Purpose

This guide establishes consistent API design patterns for local development projects. Following these standards ensures APIs are predictable, maintainable, and easy to consume - whether by your frontend, other services, or AI assistants.

## Quick Start

````typescript
// Example well-designed endpoint
// GET /api/users?page=1&limit=20&sort=-createdAt&filter[role]=admin

app.get('/api/users', async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt', filter = {} } = req.query;

  const users = await userService.findAll({
    pagination: { page, limit },
    sort: parseSort(sort),
    filter: parseFilter(filter)
  });

  res.json({
    data: users,
    meta: {
      page,
      limit,
      total: users.total,
      totalPages: Math.ceil(users.total / limit)
    }
  });
});

### data-fetching
## Overview

Patterns for efficient, consistent data fetching across the application.

## Frontend Patterns

### 1. React Query Setup

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
````

### 2. Custom Hooks Pattern

````typescript
// hooks/api/useProjects.ts
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({

### data-modeling-guide
## Purpose
This guide provides practical patterns for designing database schemas in local development environments. It focuses on SQLite as the default choice while providing patterns that work across different databases.

## Quick Start

```sql
-- Example well-designed schema for a blog application
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    status TEXT CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

### error-handling
## Overview

Consistent error handling across the application ensures better debugging, monitoring, and user experience.

## Patterns

### 1. Error Types

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

### state-management
## Overview

State management patterns for maintaining predictable, debuggable application state.

## Frontend State Patterns

### 1. Component State (Local)

Use for UI-only state that doesn't need to be shared.

```typescript
// Good for: form inputs, toggles, temporary UI state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
````

### 2. Context API (Shared)

Use for state that needs to be accessed by multiple components.

```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginCredentials) => {

## Current Git Status
```

M ../AutoTaskTracker/.gitignore
M ../AutoTaskTracker/CLAUDE.md
D ../AutoTaskTracker/PROJECT_STRUCTURE.md
M ../AutoTaskTracker/QUICKSTART.md
M ../AutoTaskTracker/README.md
D ../AutoTaskTracker/VLM_ANALYSIS.md
M ../AutoTaskTracker/autotasktracker.py
M ../AutoTaskTracker/autotasktracker/**init**.py
M ../AutoTaskTracker/autotasktracker/core/**init**.py
M ../AutoTaskTracker/autotasktracker/core/categorizer.py
M ../AutoTaskTracker/autotasktracker/core/database.py
M ../AutoTaskTracker/autotasktracker/core/task_extractor.py
D ../AutoTaskTracker/autotasktracker/core/vlm_integration.py
M ../AutoTaskTracker/autotasktracker/dashboards/**init**.py
M ../AutoTaskTracker/autotasktracker/dashboards/analytics.py
D ../AutoTaskTracker/autotasktracker/dashboards/legacy/adaptive_time_tracker.py
D ../AutoTaskTracker/autotasktracker/dashboards/legacy/context_aware_tracker.py
D ../AutoTaskTracker/autotasktracker/dashboards/legacy/intelligent_task_detector.py
D ../AutoTaskTracker/autotasktracker/dashboards/legacy/smart_time_tracker.py
D ../AutoTaskTracker/autotasktracker/dashboards/legacy/task_board.py
M ../AutoTaskTracker/autotasktracker/dashboards/notifications.py
M ../AutoTaskTracker/autotasktracker/dashboards/task_board.py
M ../AutoTaskTracker/autotasktracker/dashboards/timetracker.py
M ../AutoTaskTracker/autotasktracker/utils/**init**.py
D ../AutoTaskTracker/autotasktracker/utils/config.py
D ../AutoTaskTracker/docs/archive/AUTOMATIC_TASK_DETECTION.md
D ../AutoTaskTracker/docs/archive/DATA_STATUS.md
D ../AutoTaskTracker/docs/archive/IMPLEMENTATION_SUMMARY.md
D ../AutoTaskTracker/docs/archive/LIVE_DEPLOYMENT.md
D ../AutoTaskTracker/docs/archive/ROBUST_TIME_TRACKING.md
D ../AutoTaskTracker/docs/archive/TIME_TRACKING_FEATURES.md
D ../AutoTaskTracker/docs/archive/TIME_TRACKING_LIMITATIONS.md
D ../AutoTaskTracker/docs/archive/functionality_report.md
D ../AutoTaskTracker/docs/archive/missing_features_analysis.md
D ../AutoTaskTracker/docs/deepresearch.md
D ../AutoTaskTracker/docs/plan1.md
D ../AutoTaskTracker/docs/premortem.md
D ../AutoTaskTracker/migrate_to_package.py
M ../AutoTaskTracker/requirements.txt
D ../AutoTaskTracker/scripts/autotask.py
D ../AutoTaskTracker/scripts/start.sh
D ../AutoTaskTracker/scripts/test_data.py
M ../AutoTaskTracker/tests/e2e/conftest.py
D ../AutoTaskTracker/tests/e2e/test_full_journey.py
D ../AutoTaskTracker/tests/e2e/test_headless_integration.py
D ../AutoTaskTracker/tests/test_critical.py
D ../AutoTaskTracker/tests/test_e2e.py
D ../AutoTaskTracker/tests/test_smoke.py
D ../MetaStructure/docs/BESTPRACTICES/Claude.md_bespractices.md
M CLAUDE.md
M package.json
?? ../.DS_Store
?? ../.aider.chat.history.md
?? ../AiTaskTracker/
?? ../Atlas/
?? ../AuthorGPT/
?? ../Auto-Cursor/
?? ../Auto-Cursor_v2/
?? ../Auto-GPT/
?? ../AutoTaskTracker/.env.example
?? ../AutoTaskTracker/.github/
?? ../AutoTaskTracker/.pre-commit-config.yaml
?? ../AutoTaskTracker/.python-version
?? ../AutoTaskTracker/CONFIGURATION_AUDIT_REPORT.md
?? ../AutoTaskTracker/CONFIGURATION_GUIDE.md
?? ../AutoTaskTracker/LICENSE
?? ../AutoTaskTracker/NEXT_STEPS_FUNCTIONAL.md
?? ../AutoTaskTracker/POSTGRESQL_ONLY.md
?? ../AutoTaskTracker/TECHNICAL_DEBT_CONFIG.md
?? ../AutoTaskTracker/autotask.py
?? ../AutoTaskTracker/autotasktracker/README.md
?? ../AutoTaskTracker/autotasktracker/ai/
?? ../AutoTaskTracker/autotasktracker/cli/
?? ../AutoTaskTracker/autotasktracker/comparison/
?? ../AutoTaskTracker/autotasktracker/config.py
?? ../AutoTaskTracker/autotasktracker/config_backup_20250706_142916.py
?? ../AutoTaskTracker/autotasktracker/core/README.md
?? ../AutoTaskTracker/autotasktracker/core/config_manager.py
?? ../AutoTaskTracker/autotasktracker/core/error_handler.py
?? ../AutoTaskTracker/autotasktracker/core/exceptions.py
?? ../AutoTaskTracker/autotasktracker/core/pensieve_adapter.py
?? ../AutoTaskTracker/autotasktracker/core/time_tracker.py
?? ../AutoTaskTracker/autotasktracker/core/timezone_manager.py
?? ../AutoTaskTracker/autotasktracker/dashboards/achievement_board.py
?? ../AutoTaskTracker/autotasktracker/dashboards/advanced_analytics.py
?? ../AutoTaskTracker/autotasktracker/dashboards/ai_task_dashboard.py
?? ../AutoTaskTracker/autotasktracker/dashboards/api.py
?? ../AutoTaskTracker/autotasktracker/dashboards/base.py
?? ../AutoTaskTracker/autotasktracker/dashboards/cache.py
?? ../AutoTaskTracker/autotasktracker/dashboards/cache.py.mutation_backup
?? ../AutoTaskTracker/autotasktracker/dashboards/components/
?? ../AutoTaskTracker/autotasktracker/dashboards/launcher.py
?? ../AutoTaskTracker/autotasktracker/dashboards/realtime_dashboard.py
?? ../AutoTaskTracker/autotasktracker/dashboards/templates.py
?? ../AutoTaskTracker/autotasktracker/dashboards/timetracker.py.mutation_backup
?? ../AutoTaskTracker/autotasktracker/dashboards/utils.py
?? ../AutoTaskTracker/autotasktracker/dashboards/vlm_monitor.py
?? ../AutoTaskTracker/autotasktracker/dashboards/websocket_client.py
?? ../AutoTaskTracker/autotasktracker/factories.py
?? ../AutoTaskTracker/autotasktracker/interfaces.py
?? ../AutoTaskTracker/autotasktracker/pensieve/
?? ../AutoTaskTracker/autotasktracker/utils/debug_capture.py
?? ../AutoTaskTracker/autotasktracker/utils/streamlit_helpers.py
?? ../AutoTaskTracker/backups/
?? ../AutoTaskTracker/db_manager.py
?? ../AutoTaskTracker/deterministic_test_results.json
?? ../AutoTaskTracker/docker-compose.yml
?? ../AutoTaskTracker/docs/METRICS_EXPLAINED.md
?? ../AutoTaskTracker/docs/README.md
?? ../AutoTaskTracker/docs/SCREENSHOT_SELECTION_IMPROVEMENT.md
?? ../AutoTaskTracker/docs/architecture/
?? ../AutoTaskTracker/docs/components/
?? "../AutoTaskTracker/docs/concepts & components/"
?? ../AutoTaskTracker/docs/features/
?? ../AutoTaskTracker/docs/guides/
?? ../AutoTaskTracker/docs/import_fixes_summary.md
?? ../AutoTaskTracker/docs/meta/
?? ../AutoTaskTracker/docs/plans/
?? ../AutoTaskTracker/docs/setup/
?? ../AutoTaskTracker/dual_model_migration.sql
?? ../AutoTaskTracker/examples/
?? ../AutoTaskTracker/final_dashboard.py
?? ../AutoTaskTracker/pensieve_health_summary.json
?? ../AutoTaskTracker/quick_dashboard.py
?? ../AutoTaskTracker/scripts/AUDIT_REPORT.md
?? ../AutoTaskTracker/scripts/AUTO_PROCESSOR_README.md
?? ../AutoTaskTracker/scripts/ai/
?? ../AutoTaskTracker/scripts/analysis/
?? ../AutoTaskTracker/scripts/apply_temporary_timezone_fix.py
?? ../AutoTaskTracker/scripts/autotask
?? ../AutoTaskTracker/scripts/backup_vlm_config.py
?? ../AutoTaskTracker/scripts/benchmark_vlm_memory.py
?? ../AutoTaskTracker/scripts/check_dashboard_live.py
?? ../AutoTaskTracker/scripts/check_metrics.py
?? ../AutoTaskTracker/scripts/clear_all_caches.py
?? ../AutoTaskTracker/scripts/dashboard_manager.py
?? ../AutoTaskTracker/scripts/dashboard_status.sh
?? ../AutoTaskTracker/scripts/debug_current_query.py
?? ../AutoTaskTracker/scripts/debug_current_screenshot.py
?? ../AutoTaskTracker/scripts/debug_data_flow.py
?? ../AutoTaskTracker/scripts/debug_screenshots.py
?? ../AutoTaskTracker/scripts/debug_task_query.py
?? ../AutoTaskTracker/scripts/debug_timezone.py
?? ../AutoTaskTracker/scripts/debug_ui_display.py
?? ../AutoTaskTracker/scripts/debug_window_retrieval.py
?? ../AutoTaskTracker/scripts/debug_window_titles.py
?? ../AutoTaskTracker/scripts/deployment/
?? ../AutoTaskTracker/scripts/diagnose_timezone_issue.py
?? ../AutoTaskTracker/scripts/extend_dual_model_schema.py
?? ../AutoTaskTracker/scripts/fast_batch_processor.py
?? ../AutoTaskTracker/scripts/final_integrity_check.py
?? ../AutoTaskTracker/scripts/fix_missing_metadata.py
?? ../AutoTaskTracker/scripts/fix_timezone_offset.py
?? ../AutoTaskTracker/scripts/fix_window_titles.py
?? ../AutoTaskTracker/scripts/generate_embeddings.py
?? ../AutoTaskTracker/scripts/get_metrics.py
?? ../AutoTaskTracker/scripts/memos_autotask.env
?? ../AutoTaskTracker/scripts/memos_autotask.sh
?? ../AutoTaskTracker/scripts/pensieve_health_check.py
?? ../AutoTaskTracker/scripts/processing/
?? ../AutoTaskTracker/scripts/quality_assurance.py
?? ../AutoTaskTracker/scripts/run_ai_task_dashboard.py
?? ../AutoTaskTracker/scripts/run_ocr_processing.py
?? ../AutoTaskTracker/scripts/setup_environment_config.sh
?? ../AutoTaskTracker/scripts/setup_permanent_config.sh
?? ../AutoTaskTracker/scripts/setup_postgresql.sh
?? ../AutoTaskTracker/scripts/show_test_improvements.py
?? ../AutoTaskTracker/scripts/sql/
?? ../AutoTaskTracker/scripts/start_all.sh
?? ../AutoTaskTracker/scripts/start_auto_processor.py
?? ../AutoTaskTracker/scripts/start_dual_model_processor.py
?? ../AutoTaskTracker/scripts/start_processor.sh
?? ../AutoTaskTracker/scripts/stop_all.sh
?? ../AutoTaskTracker/scripts/test_clean_install.py
?? ../AutoTaskTracker/scripts/test_db_queries.py
?? ../AutoTaskTracker/scripts/test_deterministic_vlm.py
?? ../AutoTaskTracker/scripts/test_dual_model_workflow.py
?? ../AutoTaskTracker/scripts/test_session_processor.py
?? ../AutoTaskTracker/scripts/test_vlm_temperature.py
?? ../AutoTaskTracker/scripts/testing/
?? ../AutoTaskTracker/scripts/utils/
?? ../AutoTaskTracker/scripts/validate_vlm_models.py
?? ../AutoTaskTracker/scripts/verify_fix.py
?? ../AutoTaskTracker/scripts/verify_grouping.py
?? ../AutoTaskTracker/setup.py
?? ../AutoTaskTracker/setup.sh
?? ../AutoTaskTracker/tests/TESTING.md
?? ../AutoTaskTracker/tests/TESTING_IMPROVEMENTS_REPORT.md
?? ../AutoTaskTracker/tests/TEST_NAMING_CONVENTIONS.md
?? ../AutoTaskTracker/tests/TEST_PLAN.md
?? ../AutoTaskTracker/tests/**init**.py
?? ../AutoTaskTracker/tests/assets/
?? ../AutoTaskTracker/tests/conftest.py
?? ../AutoTaskTracker/tests/e2e/test_complete_user_journey.py
?? ../AutoTaskTracker/tests/e2e/test_headless_environment.py
?? ../AutoTaskTracker/tests/functional/
?? ../AutoTaskTracker/tests/health/
?? ../AutoTaskTracker/tests/infrastructure/
?? ../AutoTaskTracker/tests/integration/
?? ../AutoTaskTracker/tests/performance/
?? ../AutoTaskTracker/tests/run_functional_tests.py
?? ../AutoTaskTracker/tests/security/
?? ../AutoTaskTracker/tests/test_timezone_fix.py
?? ../AutoTaskTracker/tests/tools/
?? ../AutoTaskTracker/tests/ui/
?? ../AutoTaskTracker/tests/unit/
?? ../AutoTaskTracker/tests/utils/
?? ../AutoTaskTracker/validation_results.json
?? ../AutoTaskTracker/verify_config.py
?? ../AutoTaskTracker/vlm_backup_20250706_223113/
?? ../AutoTaskTracker/vlm_memory_benchmark.json
?? ../DatingAppAttempt3/
?? ../DatingAppDataExctraor/
?? ../DatingAppExtractor/
?? ../DocsToFineTune/
?? ../Flowise/
?? ../GithubDataSetBuilder/
?? ../KindleScrapper/
?? ../LOGGING_STATUS_REPORT.md
?? ../MailMiner/
?? ../MetaGPT/
?? ../MindfulAccess/
?? "../PR Website/"
?? ../PersonalContext/
?? ../Playground/
?? .ai-context/
?? .env.example
?? .vscode/
?? debug-snapshot-20250710-194202.md
?? package-lock.json
?? src/
?? test-snapshot.md
?? ../ReorderScales/
?? "../SSD Reports/"
?? ../ScrapeAudio/
?? ../ScreenInteractionRecorder/
?? ../SimpleOCR/
?? ../TaxSimulator/
?? ../TradeRepublic/
?? ../UltraSkill/
?? ../VistaFlow/
?? ../WebsiteScrapper/
?? ../codebase-to-pdf-converter/
?? ../customersupportapp/
?? ../my_reflection_app/
?? ../prefmate/
?? ../takeoff-cursor-course/

```

```
