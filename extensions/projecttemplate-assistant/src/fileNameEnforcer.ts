import * as path from "path";
const glob = require("glob");

export interface FileViolation {
  file: string;
  reason: string;
  suggestion: string;
  type?: 'filename' | 'content' | 'document-type';
  line?: string;
}

export class FileNameEnforcer {
  private improvedPatterns = [
    /_improved\./,
    /_enhanced\./,
    /_v\d+\./,
    /_updated\./,
    /_new\./,
    /_refactored\./,
    /_final\./,
    /_copy\./,
    /_backup\./,
    /_old\./,
    /_temp\./,
    /_tmp\./,
    /_test_v\d+\./,
    /_FIXED\./,
    /_COMPLETE\./,
  ];

  private bannedDocumentPatterns = {
    endings: [
      'SUMMARY.md',
      'REPORT.md', 
      'COMPLETE.md',
      'COMPLETION.md',
      'FIXED.md',
      'DONE.md',
      'FINISHED.md',
      'STATUS.md',
      'FINAL.md'
    ],
    patterns: [
      /^COMPLETE[-_]/i,
      /^DONE[-_]/i,
      /^FIXED[-_]/i,
      /^FINISHED[-_]/i,
      /^FINAL[-_]/i,
      /[-_]COMPLETE$/i,
      /[-_]SUMMARY$/i,
      /[-_]REPORT$/i,
      /[-_]STATUS$/i,
      /[-_]FINAL$/i
    ]
  };

  private ignorePatterns = [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".git/**",
    "coverage/**",
    ".next/**",
    "out/**",
    ".vscode/**",
    "extensions/**",
  ];

  checkFile(filePath: string): FileViolation | null {
    const fileName = path.basename(filePath);

    // Check if file should be ignored
    for (const ignorePattern of this.ignorePatterns) {
      if (this.matchesPattern(filePath, ignorePattern)) {
        return null;
      }
    }

    // Check for banned document types (markdown files only)
    if (fileName.endsWith('.md')) {
      const bannedCheck = this.checkBannedDocument(fileName);
      if (bannedCheck) {
        return {
          file: filePath,
          type: 'document-type',
          reason: bannedCheck.reason,
          suggestion: bannedCheck.suggestion,
        };
      }
    }

    // Check for improved/enhanced patterns
    for (const pattern of this.improvedPatterns) {
      if (pattern.test(fileName)) {
        return {
          file: filePath,
          type: 'filename',
          reason: `Matches pattern: ${pattern.source}`,
          suggestion: this.suggestBetterName(filePath),
        };
      }
    }

    return null;
  }

  async checkWorkspace(workspacePath: string): Promise<FileViolation[]> {
    const violations: FileViolation[] = [];

    return new Promise((resolve, reject) => {
      glob(
        "**/*",
        {
          cwd: workspacePath,
          ignore: this.ignorePatterns,
          nodir: true,
        },
        (err: Error | null, files: string[]) => {
          if (err) {
            reject(err);
            return;
          }

          for (const file of files) {
            const fullPath = path.join(workspacePath, file);
            const violation = this.checkFile(fullPath);
            if (violation) {
              violations.push(violation);
            }
          }

          resolve(violations);
        },
      );
    });
  }

  private suggestBetterName(filePath: string): string {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    // Remove common suffixes
    let suggested = base;

    // Remove version suffixes
    suggested = suggested.replace(/_v\d+$/, "");

    // Remove status suffixes
    const suffixesToRemove = [
      "_improved",
      "_enhanced",
      "_updated",
      "_new",
      "_refactored",
      "_final",
      "_copy",
      "_backup",
      "_old",
      "_temp",
      "_tmp",
      "_test_v\\d+",
      "_FIXED",
      "_COMPLETE",
    ];

    for (const suffix of suffixesToRemove) {
      const regex = new RegExp(suffix + "$", "i");
      suggested = suggested.replace(regex, "");
    }

    // Remove numbered copies like (1), (2)
    suggested = suggested.replace(/\s*\(\d+\)$/, "");

    // If the suggested name is empty or just underscores, use a generic name
    if (!suggested || suggested.match(/^_+$/)) {
      suggested = "renamed-file";
    }

    return path.join(dir, suggested + ext);
  }

  private checkBannedDocument(fileName: string): { reason: string; suggestion: string } | null {
    const upperName = fileName.toUpperCase();

    // Check exact endings
    for (const ending of this.bannedDocumentPatterns.endings) {
      if (upperName.endsWith(ending.toUpperCase())) {
        return {
          reason: `Banned document type: ${ending}`,
          suggestion: 'Delete this file or convert to technical documentation without status markers'
        };
      }
    }

    // Check patterns
    for (const pattern of this.bannedDocumentPatterns.patterns) {
      if (pattern.test(fileName)) {
        return {
          reason: `Matches banned document pattern: ${pattern}`,
          suggestion: 'Use descriptive names without status/completion indicators'
        };
      }
    }

    return null;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".");

    return new RegExp(regexPattern).test(filePath);
  }
}
