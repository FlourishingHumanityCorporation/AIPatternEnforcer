#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { program } = require("commander");

// Simple logger for console output
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
};

async function createProject(options = {}) {
  logger.info(
    chalk.blue.bold("\n🚀 Create New Project from ProjectTemplate\n"),
  );

  // Get project details (interactive mode or from CLI options)
  const answers =
    options.interactive !== false
      ? await inquirer.prompt([
          {
            type: "input",
            name: "projectName",
            message: "Project name:",
            validate: (input) => {
              if (!input.trim()) return "Project name is required";
              if (!/^[a-z0-9-]+$/.test(input)) {
                return "Project name should only contain lowercase letters, numbers, and hyphens";
              }
              return true;
            },
          },
          {
            type: "input",
            name: "projectPath",
            message: "Where to create the project:",
            default: (answers) => `./${answers.projectName}`,
          },
          {
            type: "input",
            name: "description",
            message: "Project description:",
            default: "A new project based on ProjectTemplate",
          },
          {
            type: "confirm",
            name: "useGit",
            message: "Initialize git repository?",
            default: true,
          },
          {
            type: "confirm",
            name: "installDeps",
            message: "Install dependencies now?",
            default: true,
          },
        ])
      : {
          projectName: options.projectName || "my-project",
          projectPath:
            options.projectPath || `./${options.projectName || "my-project"}`,
          description:
            options.description || "A new project based on ProjectTemplate",
          useGit: options.skipGit !== true,
          installDeps: options.noDeps !== true,
        };

  const { projectName, projectPath, description, useGit, installDeps } =
    answers;
  const targetDir = path.resolve(projectPath);
  const templateDir = path.resolve(__dirname, "../../..");

  // Determine template to use
  const templateName = options.template || "nextjs-app-router";
  const templatePath = path.join(templateDir, "templates", templateName);

  // Validate template exists
  if (!fs.existsSync(templatePath)) {
    logger.error(chalk.red(`❌ Template '${templateName}' not found!`));
    logger.info(chalk.cyan("Available templates:"));
    const templatesDir = path.join(templateDir, "templates");
    if (fs.existsSync(templatesDir)) {
      const availableTemplates = fs
        .readdirSync(templatesDir)
        .filter((item) =>
          fs.statSync(path.join(templatesDir, item)).isDirectory(),
        )
        .filter((item) => !item.startsWith("."));
      availableTemplates.forEach((template) => {
        logger.info(chalk.gray(`  - ${template}`));
      });
    }
    process.exit(1);
  }

  logger.info(chalk.blue(`📋 Using template: ${templateName}\n`));

  // Check if target directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory ${targetDir} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      logger.info(chalk.yellow("✖ Operation cancelled"));
      process.exit(0);
    }

    logger.info(chalk.yellow(`Removing existing directory...`));
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  logger.info(chalk.blue(`\n📁 Creating project at ${targetDir}...\n`));

  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy all files from the selected template
  logger.info(chalk.blue(`📂 Copying template files from ${templateName}...`));

  const templateFiles = fs.readdirSync(templatePath);
  templateFiles.forEach((item) => {
    const sourcePath = path.join(templatePath, item);
    const targetPath = path.join(targetDir, item);

    if (fs.existsSync(sourcePath)) {
      logger.info(chalk.gray(`  Copying ${item}...`));
      copyRecursive(sourcePath, targetPath);
    }
  });

  // Create customized package.json
  const templatePackageJsonPath = path.join(templatePath, "package.json");
  const templatePackageJson = JSON.parse(
    fs.readFileSync(templatePackageJsonPath, "utf8"),
  );

  const newPackageJson = {
    ...templatePackageJson,
    name: projectName,
    version: "0.1.0",
    description: description,
    private: true,
  };

  // Remove template-specific scripts
  delete newPackageJson.scripts["create-project"];
  delete newPackageJson.scripts["cleanup:template"];

  // Update Vite scripts to use root-level config
  if (newPackageJson.scripts["dev"]) {
    newPackageJson.scripts["dev"] = newPackageJson.scripts["dev"].replace(
      "--config config/vite.config.ts",
      "",
    );
  }
  if (newPackageJson.scripts["build"]) {
    newPackageJson.scripts["build"] = newPackageJson.scripts["build"].replace(
      "--config config/vite.config.ts",
      "",
    );
  }
  if (newPackageJson.scripts["preview"]) {
    newPackageJson.scripts["preview"] = newPackageJson.scripts[
      "preview"
    ].replace("--config config/vite.config.ts", "");
  }

  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(newPackageJson, null, 2),
  );

  // Update README
  const readmeContent = `# ${projectName}

${description}

This project was created from [ProjectTemplate](https://github.com/your-org/project-template).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm test\` - Run tests
- \`npm run build\` - Build for production
- \`npm run g:c ComponentName\` - Generate a new component
- \`npm run check:all\` - Run all enforcement checks

## Documentation

- [Quick Start Guide](QUICK-START.md)
- [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)
- [Complete Documentation](DOCS_INDEX.md)
`;

  fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent);

  // Initialize git repository (do this before npm install to avoid husky issues)
  if (useGit) {
    logger.info(chalk.blue("\n📦 Initializing git repository..."));
    try {
      execSync("git init", { cwd: targetDir, stdio: "inherit" });
      logger.info(chalk.green("✓ Git repository initialized"));
    } catch (error) {
      logger.warn(
        chalk.yellow("⚠ Git initialization failed. Continuing without git."),
      );
      useGit = false;
    }
  }

  // Install dependencies
  if (installDeps) {
    logger.info(chalk.blue("\n📦 Installing dependencies..."));
    try {
      execSync("npm install", { cwd: targetDir, stdio: "inherit" });
      logger.info(chalk.green("✓ Dependencies installed successfully"));
    } catch (error) {
      logger.error(chalk.red("✗ Failed to install dependencies"));
      logger.error(
        chalk.yellow("You can install them manually with: npm install"),
      );
    }
  }

  // Create initial commit after dependencies are installed
  if (useGit) {
    try {
      execSync("git add .", { cwd: targetDir, stdio: "inherit" });
      execSync('git commit -m "Initial commit from ProjectTemplate"', {
        cwd: targetDir,
        stdio: "inherit",
      });
      logger.info(chalk.green("✓ Initial commit created"));
    } catch (error) {
      logger.warn(chalk.yellow("⚠ Failed to create initial commit"));
    }
  }

  logger.info(chalk.green.bold(`\n✅ Project created successfully!\n`));
  logger.info(chalk.white("Next steps:"));
  logger.info(chalk.gray(`  cd ${projectPath}`));
  if (!installDeps) {
    logger.info(chalk.gray("  npm install"));
  }
  logger.info(chalk.gray("  npm run dev"));
  logger.info(chalk.gray("\nHappy coding! 🎉\n"));
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    const files = fs.readdirSync(source);

    files.forEach((file) => {
      // Skip node_modules, dist, coverage, and other build artifacts
      if (
        file === "node_modules" ||
        file === "dist" ||
        file === "coverage" ||
        file === ".git" ||
        file === ".DS_Store"
      ) {
        return;
      }

      copyRecursive(path.join(source, file), path.join(target, file));
    });
  } else {
    fs.copyFileSync(source, target);
  }
}

// Handle errors gracefully
process.on("unhandledRejection", (err) => {
  logger.error(chalk.red("\n❌ Error:"), err.message);
  process.exit(1);
});

// CLI program configuration
program
  .name("create-project")
  .description("Create a new project from AIPatternEnforcer templates")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Template to use", "nextjs-app-router")
  .option("-p, --path <path>", "Project path")
  .option("-d, --description <description>", "Project description")
  .option("-y, --yes", "Skip interactive prompts")
  .option("--skip-git", "Skip git initialization")
  .option("--no-deps", "Skip dependency installation")
  .option("--debug", "Enable debug mode")
  .action(async (name, options) => {
    const projectOptions = {
      projectName: name,
      projectPath: options.path,
      description: options.description,
      interactive: !options.yes,
      skipGit: options.skipGit,
      noDeps: options.noDeps,
      debug: options.debug,
      template: options.template,
    };

    await createProject(projectOptions);
  });

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();

  // Add detailed template information
  logger.info(chalk.cyan("\n🎨 Available Templates:\n"));

  const templatesDir = path.join(__dirname, "../../..", "templates");
  if (fs.existsSync(templatesDir)) {
    const templates = fs
      .readdirSync(templatesDir)
      .filter((item) =>
        fs.statSync(path.join(templatesDir, item)).isDirectory(),
      )
      .filter((item) => !item.startsWith("."));

    templates.forEach((template) => {
      const templatePath = path.join(templatesDir, template);
      const packageJsonPath = path.join(templatePath, "package.json");

      let description = "Next.js project template";
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8"),
          );
          description = packageJson.description || description;
        } catch (e) {
          // Use default description if package.json is invalid
        }
      }

      logger.info(chalk.bold(`  ${template}`));
      logger.info(chalk.gray(`    ${description}`));
      logger.info("");
    });
  }

  logger.info(chalk.cyan("💡 Usage Examples:\n"));
  logger.info(chalk.gray("  # Interactive mode"));
  logger.info(chalk.gray("  npm run create-project\n"));
  logger.info(chalk.gray("  # Non-interactive with template"));
  logger.info(
    chalk.gray(
      "  npm run create-project my-app --template ai-chat-interface --yes\n",
    ),
  );
  logger.info(chalk.gray("  # Custom path and skip git"));
  logger.info(
    chalk.gray(
      "  npm run create-project my-app --path ./projects/my-app --skip-git\n",
    ),
  );

  process.exit(0);
}

// Parse command line arguments
program.parse(process.argv);
