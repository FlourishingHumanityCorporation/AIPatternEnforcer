#!/usr/bin/env node

const readline = require("readline");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Stack recommendations database
const STACK_RECOMMENDATIONS = {
  "web-app-simple": {
    name: "Simple Web Application",
    backend: "Node.js + Express",
    frontend: "Vite + React",
    database: "SQLite + Prisma",
    deployment: "Vercel + Railway",
    reasoning: "Fast setup, great developer experience, minimal complexity"
  },
  "web-app-complex": {
    name: "Complex Web Application",
    backend: "Node.js + Next.js API Routes",
    frontend: "Next.js 14 (App Router)",
    database: "PostgreSQL + Prisma",
    deployment: "Vercel + Supabase",
    reasoning: "Full-stack framework, excellent performance, scalable"
  },
  "data-analysis": {
    name: "Data Analysis Tool",
    backend: "Python + FastAPI",
    frontend: "Streamlit or Jupyter",
    database: "SQLite + Pandas",
    deployment: "Streamlit Cloud",
    reasoning: "Best data manipulation libraries, interactive notebooks"
  },
  "desktop-app": {
    name: "Desktop Application",
    backend: "Node.js + Electron",
    frontend: "Vite + React",
    database: "SQLite + better-sqlite3",
    deployment: "GitHub Releases",
    reasoning: "Native feel, web technologies, cross-platform"
  },
  "api-only": {
    name: "API Server",
    backend: "Node.js + Express",
    frontend: "None (API only)",
    database: "PostgreSQL + Prisma",
    deployment: "Railway + Render",
    reasoning: "Simple, fast, excellent ecosystem"
  },
  "real-time-app": {
    name: "Real-time Application",
    backend: "Node.js + Socket.io",
    frontend: "Vite + React + Socket.io",
    database: "Redis + PostgreSQL",
    deployment: "Railway + Vercel",
    reasoning: "WebSocket support, real-time updates, scalable"
  },
  "cli-tool": {
    name: "CLI Tool",
    backend: "Go or Node.js",
    frontend: "Terminal UI",
    database: "SQLite or JSON files",
    deployment: "GitHub Releases",
    reasoning: "Single binary, fast startup, cross-platform"
  },
  "learning-project": {
    name: "Learning Project",
    backend: "Whatever you want to learn",
    frontend: "Whatever you want to learn",
    database: "SQLite (simple)",
    deployment: "GitHub Pages + Netlify",
    reasoning: "Focus on learning, not production concerns"
  },
  "local-ai-app": {
    name: "Local AI Application",
    backend: "Python + FastAPI + local AI models",
    frontend: "Vite + React + Electron",
    database: "SQLite + file storage",
    deployment: "Desktop app distribution",
    reasoning: "Local processing, AI integration, desktop-first"
  }
};

class StackDecisionWizard {
  constructor() {
    this.answers = {};
    this.recommendation = null;
  }

  async start() {
    logger.info(
      chalk.blue.bold("\n🚀 ProjectTemplate Stack Decision Wizard\n"));

    logger.info(
      chalk.gray(
        "This wizard will help you choose the right technology stack for your project.\n"
      ));


    try {
      await this.askQuestions();
      this.generateRecommendation();
      this.displayRecommendation();
      await this.offerToSaveDecision();
    } catch (error) {
      logger.error(chalk.red("Error:", error.message));
    } finally {
      rl.close();
    }
  }

  async askQuestions() {
    // Project type
    this.answers.projectType = await this.askChoice(
      "What type of project are you building?",
      [
      "Web application (frontend + backend)",
      "API server only",
      "Desktop application",
      "Data analysis tool",
      "Real-time application (chat, collaboration)",
      "CLI tool",
      "Learning/experimental project"]

    );

    // Project scope
    this.answers.projectScope = await this.askChoice(
      "How would you describe your project?",
      [
      "Simple - like a personal blog, todo list, or basic website",
      "Medium - like an online store, team dashboard, or booking system",
      "Complex - like a social media platform, marketplace, or enterprise tool"]

    );

    // Team size
    this.answers.teamSize = await this.askChoice("What's your team size?", [
    "Solo developer",
    "Small team (2-5 people)",
    "Large team (6+ people)"]
    );

    // Experience level
    this.answers.experience = await this.askChoice(
      "What's your coding experience?",
      [
      "New to coding - I'm just getting started",
      "Some experience - I can build basic apps",
      "Experienced - I've built several projects before"]

    );

    // Performance expectations
    this.answers.performance = await this.askChoice(
      "How many people do you expect to use your project?",
      [
      "Just me or a few friends (hobby project)",
      "A small group or local business (dozens of users)",
      "Many people or growing business (hundreds+ users)"]

    );

    // Time constraint
    this.answers.timeConstraint = await this.askChoice(
      "What's your timeline?",
      [
      "No rush - I'm learning and experimenting",
      "A few months - I want to build something real",
      "As fast as possible - I need to launch quickly"]

    );

    // Data requirements
    if (this.answers.projectType !== "CLI tool") {
      this.answers.dataRequirements = await this.askChoice(
        "What kind of data will you store?",
        [
        "Simple - user accounts, posts, basic lists",
        "Moderate - products, orders, user relationships",
        "Complex - analytics, large files, complex reports"]

      );
    }

    // Learning goals
    this.answers.learningGoals = await this.askInput(
      "Any specific technologies you want to learn? (optional)"
    );
  }

  async askChoice(question, choices) {
    logger.info(chalk.cyan(`\n${question}`));
    choices.forEach((choice, index) => {
      logger.info(chalk.gray(`  ${index + 1}. ${choice}`));
    });

    const answer = await this.askInput(
      chalk.yellow("Your choice (1-" + choices.length + ")")
    );
    const choiceIndex = parseInt(answer) - 1;

    if (choiceIndex >= 0 && choiceIndex < choices.length) {
      return choices[choiceIndex];
    } else {
      logger.info(chalk.red("Invalid choice. Please try again."));
      return this.askChoice(question, choices);
    }
  }

  async askInput(question) {
    return new Promise((resolve) => {
      rl.question(question + ": ", (answer) => {
        resolve(answer.trim());
      });
    });
  }

  generateRecommendation() {
    const {
      projectType,
      projectScope,
      teamSize,
      experience,
      performance,
      timeConstraint,
      dataRequirements,
      learningGoals
    } = this.answers;

    // Decision logic
    let recommendationKey = "web-app-simple"; // default

    if (projectType.includes("API server")) {
      recommendationKey = "api-only";
    } else if (projectType.includes("Desktop")) {
      recommendationKey = "desktop-app";
    } else if (projectType.includes("Data analysis")) {
      recommendationKey = "data-analysis";
    } else if (projectType.includes("Real-time")) {
      recommendationKey = "real-time-app";
    } else if (projectType.includes("CLI")) {
      recommendationKey = "cli-tool";
    } else if (projectType.includes("Learning")) {
      recommendationKey = "learning-project";
    } else if (projectType.includes("Web application")) {
      // Web app - decide between simple and complex
      if (
      projectScope.includes("Complex") ||
      performance.includes("hundreds+"))
      {
        recommendationKey = "web-app-complex";
      } else {
        recommendationKey = "web-app-simple";
      }
    }

    this.recommendation = STACK_RECOMMENDATIONS[recommendationKey];

    // Customize recommendation based on specific answers
    this.customizeRecommendation();
  }

  customizeRecommendation() {
    const { experience, performance, dataRequirements, learningGoals } =
    this.answers;

    // Adjust based on experience level
    if (experience.includes("New to coding")) {
      if (this.recommendation.backend.includes("Node.js")) {
        this.recommendation.backend = "Node.js + Express (beginner-friendly)";
      }
      this.recommendation.reasoning += ", great for beginners";
    }

    // Adjust based on performance needs
    if (performance.includes("hundreds+")) {
      if (this.recommendation.backend.includes("Node.js")) {
        this.recommendation.backend = this.recommendation.backend.replace(
          "Express",
          "Fastify (high performance)"
        );
      }
      this.recommendation.reasoning += ", optimized for performance";
    }

    // Adjust based on data requirements
    if (dataRequirements && dataRequirements.includes("Complex")) {
      this.recommendation.database = this.recommendation.database.replace(
        "SQLite",
        "PostgreSQL"
      );
      this.recommendation.reasoning += ", suitable for complex data";
    }

    // Consider learning goals
    if (learningGoals && learningGoals.toLowerCase().includes("python")) {
      this.recommendation.backend = "Python + FastAPI (learning goal)";
      this.recommendation.reasoning += ", matches your learning goals";
    }
    if (learningGoals && learningGoals.toLowerCase().includes("go")) {
      this.recommendation.backend = "Go + Gin (learning goal)";
      this.recommendation.reasoning += ", matches your learning goals";
    }
  }

  async displayRecommendation() {
    logger.info(chalk.green.bold("\n🎯 RECOMMENDED STACK\n"));
    logger.info(chalk.blue.bold(`Project Type: ${this.recommendation.name}`));
    logger.info(chalk.yellow(`Backend:    ${this.recommendation.backend}`));
    logger.info(chalk.yellow(`Frontend:   ${this.recommendation.frontend}`));
    logger.info(chalk.yellow(`Database:   ${this.recommendation.database}`));
    logger.info(chalk.yellow(`Deployment: ${this.recommendation.deployment}`));
    logger.info(chalk.gray(`\nReasoning: ${this.recommendation.reasoning}`));

    // Additional recommendations
    logger.info(chalk.blue.bold("\n📋 QUICK START STEPS\n"));
    this.displayQuickStartSteps();

    logger.info(chalk.blue.bold("\n🔗 HELPFUL RESOURCES\n"));
    this.displayHelpfulResources();

    // Ask if they want to set up the template
    const setupChoice = await this.askChoice(
      "\nWould you like to set up this template now?",
      ["Yes, set it up", "No, just show recommendations"]
    );

    if (setupChoice.includes("Yes")) {
      await this.setupTemplate();
    }
  }

  displayQuickStartSteps() {
    const steps = this.getQuickStartSteps();
    steps.forEach((step, index) => {
      logger.info(chalk.gray(`  ${index + 1}. ${step}`));
    });
  }

  getQuickStartSteps() {
    const backend = this.recommendation.backend;
    const frontend = this.recommendation.frontend;

    const steps = [];

    if (backend.includes("Node.js")) {
      steps.push("Initialize Node.js project: npm init -y");
      steps.push("Install dependencies: npm install express cors dotenv");
      if (frontend.includes("React")) {
        steps.push(
          "Create React app: npm create vite@latest frontend -- --template react-ts"
        );
      } else if (frontend.includes("Next.js")) {
        steps.push(
          "Create Next.js app: npx create-next-app@latest --typescript"
        );
      }
    } else if (backend.includes("Python")) {
      steps.push("Create virtual environment: python -m venv venv");
      steps.push("Activate environment: source venv/bin/activate");
      steps.push("Install FastAPI: pip install fastapi uvicorn");
      if (frontend.includes("Streamlit")) {
        steps.push("Install Streamlit: pip install streamlit");
      }
    } else if (backend.includes("Go")) {
      steps.push("Initialize Go module: go mod init your-project");
      steps.push("Install Gin: go get github.com/gin-gonic/gin");
    }

    if (this.recommendation.database.includes("SQLite")) {
      steps.push("Setup database: Install Prisma or your preferred ORM");
    } else if (this.recommendation.database.includes("PostgreSQL")) {
      steps.push("Setup PostgreSQL: Use Docker or cloud service");
    }

    steps.push("Copy ProjectTemplate structure for best practices");
    steps.push("Start coding and iterate quickly!");

    return steps;
  }

  displayHelpfulResources() {
    logger.info(
      chalk.gray("  • docs/newproject_decisions/ - Detailed decision matrices"));

    logger.info(chalk.gray("  • docs/guides/ - Setup and development guides"));
    logger.info(chalk.gray("  • examples/ - Code examples and patterns"));
    logger.info(chalk.gray("  • CLAUDE.md - AI assistant instructions"));
  }

  async offerToSaveDecision() {
    const save = await this.askInput(
      chalk.cyan("\nSave this decision to your project? (y/n)")
    );

    if (save.toLowerCase() === "y" || save.toLowerCase() === "yes") {
      await this.saveDecision();
    }

    logger.info(chalk.green("\n✅ Decision wizard complete!"));
    logger.info(
      chalk.gray(
        "Run `npm run choose-stack` anytime to use this wizard again.\n"
      ));

  }

  async saveDecision() {
    const decision = {
      timestamp: new Date().toISOString(),
      project_type: this.recommendation.name,
      answers: this.answers,
      recommendation: this.recommendation,
      quick_start_steps: this.getQuickStartSteps()
    };

    const decisionPath = path.join(
      process.cwd(),
      "docs",
      "decisions",
      "stack-decision.json"
    );

    try {
      // Ensure directory exists
      const dir = path.dirname(decisionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(decisionPath, JSON.stringify(decision, null, 2));
      logger.info(chalk.green(`✅ Decision saved to ${decisionPath}`));
    } catch (error) {
      logger.info(chalk.red(`❌ Could not save decision: ${error.message}`));
    }
  }

  async setupTemplate() {
    logger.info(chalk.blue.bold("\n🚀 Setting up your template...\n"));

    // Determine which template to use based on recommendation
    let framework = 'react'; // default

    if (this.recommendation.frontend.includes('Next.js')) {
      framework = 'nextjs';
    } else if (this.recommendation.backend.includes('Express') && !this.recommendation.frontend.includes('React')) {
      framework = 'express';
    }

    try {
      // Run the template customizer
      logger.info(chalk.gray(`Running template customization for ${framework}...`));
      execSync(`node ${path.join(__dirname, 'template-customizer.js')} --framework ${framework}`, {
        stdio: 'inherit'
      });

      logger.info(chalk.green.bold("\n✅ Template setup complete!\n"));
      logger.info(chalk.white("Next steps:"));
      logger.info(chalk.gray("  npm install"));
      logger.info(chalk.gray("  npm run dev"));
    } catch (error) {
      logger.error(chalk.red("\n❌ Error setting up template:"), error.message);
      logger.info(chalk.yellow("\nYou can manually run:"));
      logger.info(chalk.gray(`  npm run template:${framework}`));
    }
  }
}

// Run the wizard
if (require.main === module) {
  const wizard = new StackDecisionWizard();
  wizard.start();
}

module.exports = StackDecisionWizard;