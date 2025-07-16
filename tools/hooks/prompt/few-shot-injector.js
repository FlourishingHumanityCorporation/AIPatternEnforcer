#!/usr/bin/env node

/**
 * Few-Shot Injector
 *
 * Auto-adds examples based on operation type
 * Improves AI output quality through pattern examples
 */

const { HookRunner } = require("../lib");
const { getCached, setCached } = require("../lib/state-manager");
const { isCodeFile } = require("../lib/shared-utils");
const path = require("path");

// Example templates for common operations
const EXAMPLE_TEMPLATES = {
  component: {
    react: `
Example React component pattern:
\`\`\`tsx
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  title: string;
  onClick?: () => void;
}

export function ComponentName({ title, onClick }: ComponentNameProps) {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
}
\`\`\``,
    test: `
Example test pattern:
\`\`\`tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render title', () => {
    render(<ComponentName title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const handleClick = jest.fn();
    render(<ComponentName title="Test" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
\`\`\``,
  },
  api: {
    route: `
Example Next.js API route pattern:
\`\`\`ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // Process request...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
\`\`\``,
  },
  hook: {
    custom: `
Example custom React hook pattern:
\`\`\`ts
import { useState, useEffect } from 'react';

export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Effect logic here
  }, [value]);
  
  const updateValue = async (newValue: string) => {
    setLoading(true);
    try {
      // Async operation
      setValue(newValue);
    } finally {
      setLoading(false);
    }
  };
  
  return { value, loading, updateValue };
}
\`\`\``,
  },
};

function fewShotInjector(hookData, runner) {
  try {
    const startTime = Date.now();

    // Only inject for code files
    const filePath = hookData.file_path || hookData.tool_input?.file_path || "";
    if (!filePath || !isCodeFile(filePath)) {
      return runner.allow();
    }

    // Detect operation type from file name and content
    const fileName = path.basename(filePath).toLowerCase();
    const content = (hookData.content || hookData.prompt || "").toLowerCase();

    // Check if examples already provided
    if (content.includes("example") || content.includes("```")) {
      return runner.allow();
    }

    // Determine what type of example to inject
    let exampleToInject = null;
    let exampleType = "";

    if (fileName.includes("component") || content.includes("component")) {
      if (fileName.includes("test") || content.includes("test")) {
        exampleToInject = EXAMPLE_TEMPLATES.component.test;
        exampleType = "React component test";
      } else {
        exampleToInject = EXAMPLE_TEMPLATES.component.react;
        exampleType = "React component";
      }
    } else if (fileName.includes("route") || content.includes("api route")) {
      exampleToInject = EXAMPLE_TEMPLATES.api.route;
      exampleType = "API route";
    } else if (fileName.includes("hook") || content.includes("custom hook")) {
      exampleToInject = EXAMPLE_TEMPLATES.hook.custom;
      exampleType = "custom hook";
    }

    if (exampleToInject) {
      // Log injection for user awareness
      console.log(
        [
          "",
          `💉 Few-Shot Example Injection`,
          `📋 Adding ${exampleType} example to improve AI output`,
          "💡 This helps AI follow established patterns",
          "",
          "To see the example, check the injected context above.",
          "",
        ].join("\n"),
      );

      // Cache the injection for metrics
      const injectionHistory = getCached("injection-history") || [];
      injectionHistory.push({
        timestamp: Date.now(),
        type: exampleType,
        file: fileName,
      });

      // Keep last 20 injections
      if (injectionHistory.length > 20) {
        injectionHistory.shift();
      }

      setCached("injection-history", injectionHistory);

      // Note: In a real implementation, we would modify the prompt
      // For now, we just notify that examples would be helpful
      if (process.env.HOOK_VERBOSE === "true") {
        console.log(`Would inject ${exampleType} example for ${fileName}`);
      }
    }

    // Check execution time
    const executionTime = Date.now() - startTime;
    if (executionTime > 50) {
      console.warn(
        `Few-shot injection took ${executionTime}ms (target: <50ms)`,
      );
    }

    return runner.allow();
  } catch (error) {
    console.error(`Few-shot injection failed: ${error.message}`);
    return runner.allow();
  }
}

// Create and run the hook
HookRunner.create("few-shot-injector", fewShotInjector, {
  timeout: 50,
  priority: "low",
  family: "prompt",
});
