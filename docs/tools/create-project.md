# Create Project Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Command Line Interface](#command-line-interface)
5. [Interactive Setup Process](#interactive-setup-process)
6. [Project Creation Process](#project-creation-process)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)
9. [Output and Results](#output-and-results)
10. [Integration with Development Workflow](#integration-with-development-workflow)
11. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
12. [API and Programmatic Usage](#api-and-programmatic-usage)
13. [Development and Contributing](#development-and-contributing)

## Overview

Project creation tool that generates new projects from the ProjectTemplate base. Provides interactive setup with customization options, handles file copying, dependency management, and initial git repository setup.

**Tool Type**: Project Creation CLI  
**Language**: JavaScript (Node.js)  
**Dependencies**: `inquirer`, `chalk`, `fs`, `path`, `child_process`  
**Location**: `tools/generators/project-init/create-project.js`

## Quick Start

```bash
# Run the project creator
node tools/generators/project-init/create-project.js

# Follow interactive prompts to create new project
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate as the base template
- Git installed (for repository initialization)
- npm/yarn for dependency management
- Write permissions to target directory

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # Installs inquirer, chalk dependencies
```

### Template Structure
The tool copies essential files from the current ProjectTemplate:
```text
Template Files Copied:
├── src/                    # Source code
├── public/                 # Static assets
├── config/                 # Configuration files
├── scripts/                # Development scripts
├── tools/                  # Development tools
├── templates/              # Code generation templates
├── ai/                     # AI integration configs
├── docs/                   # Documentation
├── tests/                  # Test files
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── index.html             # HTML entry point
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── CLAUDE.md              # AI assistant instructions
├── QUICK-START.md         # Quick start guide
└── DOCS_INDEX.md          # Documentation index
```

## Command Line Interface

### Basic Syntax
```bash
node tools/generators/project-init/create-project.js
```

**Note**: This tool is designed to be interactive and takes no command line arguments. All configuration is done through prompts.

### Interactive Prompts
The tool guides you through:
1. Project name validation
2. Target directory selection
3. Project description
4. Git repository initialization
5. Dependency installation preferences

## Interactive Setup Process

### Step 1: Project Name
```text
? Project name: my-awesome-project

Validation:
- Required field
- Only lowercase letters, numbers, and hyphens
- Used for package.json name field
```

### Step 2: Project Location
```text
? Where to create the project: ./my-awesome-project

Default: ./{project-name}
- Can be relative or absolute path
- Directory will be created if it doesn't exist
- Prompts for overwrite if directory exists
```

### Step 3: Project Description
```text
? Project description: A new project based on ProjectTemplate

Default: "A new project based on ProjectTemplate"
- Used in package.json description field
- Used in generated README.md
```

### Step 4: Git Repository
```text
? Initialize git repository? (Y/n) Yes

Options:
- Creates git repository with git init
- Makes initial commit with all template files
- Skipped if git is not available
```

### Step 5: Dependencies
```text
? Install dependencies now? (Y/n) Yes

Options:
- Runs npm install in new project directory
- Can be skipped for faster setup
- Dependencies can be installed later manually
```

### Step 6: Overwrite Confirmation
```text
Directory /path/to/project already exists. Overwrite? (y/N) No

Safety:
- Defaults to No to prevent accidental data loss
- Removes existing directory completely if Yes
- Operation cancelled if No
```

## Project Creation Process

### Phase 1: Directory Setup
1. **Validate target directory**
2. **Handle existing directory** (prompt for overwrite)
3. **Create target directory** (if needed)
4. **Set up directory structure**

### Phase 2: File Copying
1. **Copy template files** selectively
2. **Skip build artifacts** (node_modules, dist, coverage, .git, .DS_Store)
3. **Preserve file permissions** and structure
4. **Handle nested directories** recursively

### Phase 3: Customization
1. **Generate custom package.json**:
   - Set project name and description
   - Update version to 0.1.0
   - Mark as private
   - Remove template-specific scripts
   - Update Vite configuration paths

2. **Generate custom README.md**:
   - Project-specific title and description
   - Reference to ProjectTemplate origin
   - Standard getting started instructions
   - Available scripts documentation

### Phase 4: Git Initialization
1. **Initialize git repository** (`git init`)
2. **Stage all files** (`git add .`)
3. **Create initial commit** with descriptive message
4. **Set up for future development**

### Phase 5: Dependency Installation
1. **Run npm install** in project directory
2. **Install all dependencies** from package.json
3. **Set up development environment**
4. **Prepare for immediate development**

## Usage Examples

### Example 1: Basic Project Creation
```bash
node tools/generators/project-init/create-project.js

# Interactive session:
🚀 Create New Project from ProjectTemplate

? Project name: my-react-app
? Where to create the project: ./my-react-app
? Project description: A React application for user management
? Initialize git repository? Yes
? Install dependencies now? Yes

📁 Creating project at /path/to/my-react-app...

  Copying src...
  Copying public...
  Copying config...
  Copying scripts...
  Copying tools...
  Copying templates...
  Copying ai...
  Copying docs...
  Copying tests...

📦 Initializing git repository...
[main (root-commit) abc123] Initial commit from ProjectTemplate

📦 Installing dependencies...
[npm install output]

✅ Project created successfully!

Next steps:
  cd my-react-app
  npm run dev

Happy coding! 🎉
```

### Example 2: Without Git/Dependencies
```bash
node tools/generators/project-init/create-project.js

# Interactive session:
? Project name: quick-prototype
? Where to create the project: ./prototype
? Project description: Quick prototype project
? Initialize git repository? No
? Install dependencies now? No

📁 Creating project at /path/to/prototype...
[file copying output]

✅ Project created successfully!

Next steps:
  cd prototype
  npm install
  npm run dev
```

### Example 3: Overwrite Existing Directory
```bash
node tools/generators/project-init/create-project.js

? Project name: existing-project
? Where to create the project: ./existing-project
Directory /path/to/existing-project already exists. Overwrite? Yes

Removing existing directory...
📁 Creating project at /path/to/existing-project...
[project creation continues]
```

## Configuration

### Template Source
```javascript
// Template directory (current ProjectTemplate installation)
const templateDir = path.resolve(__dirname, '../../..');

// Items copied from template
const itemsToCopy = [
  'src', 'public', 'config', 'scripts', 'tools', 'templates',
  'ai', 'docs', 'tests', '.eslintrc.json', '.prettierrc',
  'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore',
  'README.md', 'CLAUDE.md', 'QUICK-START.md', 'DOCS_INDEX.md'
];
```

### Package.json Customization
```javascript
const newPackageJson = {
  ...templatePackageJson,
  name: projectName,
  version: '0.1.0',
  description: description,
  private: true,
};

// Remove template-specific scripts
delete newPackageJson.scripts['create-project'];
delete newPackageJson.scripts['cleanup:template'];

// Update Vite configuration paths
// Removes --config config/vite.config.ts from scripts
```

### Generated README Template
```markdown
# {projectName}

{description}

This project was created from [ProjectTemplate](https://github.com/your-org/project-template).

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run g:c ComponentName` - Generate a new component
- `npm run check:all` - Run all enforcement checks

## Documentation

- [Quick Start Guide](QUICK-START.md)
- [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)
- [Complete Documentation](DOCS_INDEX.md)
```

## Output and Results

### Successful Creation
```text
🚀 Create New Project from ProjectTemplate

📁 Creating project at /Users/developer/my-project...

  Copying src...
  Copying public...
  Copying config...
  Copying scripts...
  Copying tools...
  Copying templates...
  Copying ai...
  Copying docs...
  Copying tests...

📦 Initializing git repository...
[main (root-commit) a1b2c3d] Initial commit from ProjectTemplate
 X files changed, Y insertions(+)

📦 Installing dependencies...
[npm install output showing package installations]

✅ Project created successfully!

Next steps:
  cd my-project
  npm run dev

Happy coding! 🎉
```

### Project Structure Created
```text
my-project/
├── src/                    # Application source code
├── public/                 # Static assets
├── config/                 # Build and tool configurations
├── scripts/                # Development and build scripts
├── tools/                  # Development tools and generators
├── templates/              # Code generation templates
├── ai/                     # AI integration configurations
├── docs/                   # Project documentation
├── tests/                  # Test files and test utilities
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier code formatting
├── .gitignore             # Git ignore patterns
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build tool configuration
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
├── README.md              # Project documentation
├── CLAUDE.md              # AI assistant instructions
├── QUICK-START.md         # Quick start guide
└── DOCS_INDEX.md          # Documentation navigation
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to main ProjectTemplate `package.json`:
```json
{
  "scripts": {
    "create-project": "node tools/generators/project-init/create-project.js",
    "new-project": "node tools/generators/project-init/create-project.js"
  }
}
```

### Team Workflow
```bash
# 1. Developer wants to start new project
npm run create-project

# 2. Follow interactive prompts
# 3. New project ready for development
cd new-project-name
npm run dev

# 4. Start development immediately with all tools available
npm run g:c MyComponent  # Generate components
npm run check:all        # Run enforcement checks
```

### CI/CD Integration
```bash
# For automated project creation (testing)
echo "test-project\n./test-output\nTest project\nn\nn\n" | npm run create-project
```

### Project Template Updates
When ProjectTemplate is updated:
1. New projects automatically get latest features
2. Tools and configurations are inherited
3. Documentation is up-to-date
4. All enforcement rules are included

## Error Handling and Troubleshooting

### Common Issues

#### Invalid Project Name
```text
Project name should only contain lowercase letters, numbers, and hyphens
```
**Solutions**:
```bash
# Valid names
my-project        ✅
user-dashboard    ✅
api-service-v2    ✅

# Invalid names  
My-Project        ❌ (uppercase)
my_project        ❌ (underscore)
my project        ❌ (space)
```

#### Directory Access Issues
```text
❌ Error: EACCES: permission denied, mkdir '/restricted/path'
```
**Solutions**:
```bash
# Use accessible directory
? Where to create the project: ~/projects/my-project

# Check permissions
ls -la /path/to/parent/directory

# Use sudo if necessary (not recommended)
sudo node tools/generators/project-init/create-project.js
```

#### Git Initialization Fails
```text
❌ Error: Command failed: git init
```
**Solutions**:
```bash
# Check git installation
git --version

# Install git if missing
# macOS: brew install git
# Ubuntu: sudo apt install git
# Windows: Download from git-scm.com

# Skip git initialization
? Initialize git repository? No
```

#### npm install Fails
```text
❌ Error: Command failed: npm install
```
**Solutions**:
```bash
# Check npm/node versions
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Use different package manager
cd new-project && yarn install

# Install manually later
? Install dependencies now? No
```

### Debug Mode
Add debug logging by modifying the script temporarily:
```javascript
// Add at beginning of functions
console.log('Debug: Current directory:', process.cwd());
console.log('Debug: Template directory:', templateDir);
console.log('Debug: Target directory:', targetDir);
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const { spawn } = require('child_process');
const path = require('path');

// Programmatic project creation
function createProject(config) {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, 'tools/generators/project-init/create-project.js');
    
    // Create input for prompts
    const input = [
      config.name,
      config.path || `./${config.name}`,
      config.description || 'Generated project',
      config.git ? 'y' : 'n',
      config.install ? 'y' : 'n'
    ].join('\n') + '\n';

    const child = spawn('node', [script], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    child.stdin.write(input);
    child.stdin.end();

    child.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Project creation failed with code ${code}`));
    });
  });
}

// Usage
await createProject({
  name: 'my-api',
  path: './projects/my-api',
  description: 'REST API for user management',
  git: true,
  install: true
});
```

### Batch Project Creation
```javascript
const projects = [
  { name: 'frontend-app', description: 'React frontend application' },
  { name: 'backend-api', description: 'Express API backend' },
  { name: 'admin-dashboard', description: 'Admin management interface' }
];

for (const project of projects) {
  console.log(`Creating ${project.name}...`);
  await createProject(project);
  console.log(`✅ ${project.name} created successfully`);
}
```

## Development and Contributing

### Project Structure
```text
tools/generators/project-init/create-project.js
├── Main execution function (createProject)
├── Interactive prompts (inquirer)
├── File copying logic (copyRecursive)
├── Package.json customization
├── README generation
├── Git initialization
└── Error handling
```

### Adding New Features

#### Custom Template Selection
```javascript
// Add template selection prompt
const { template } = await inquirer.prompt([
  {
    type: 'list',
    name: 'template',
    message: 'Select project template:',
    choices: [
      { name: 'React Application', value: 'react' },
      { name: 'API Server', value: 'api' },
      { name: 'Full Stack', value: 'fullstack' }
    ]
  }
]);

// Modify copying logic based on template
```

#### Additional Customization Options
```javascript
// Add more configuration prompts
const { features } = await inquirer.prompt([
  {
    type: 'checkbox',
    name: 'features',
    message: 'Select features to include:',
    choices: [
      { name: 'TypeScript', value: 'typescript' },
      { name: 'Testing Setup', value: 'testing' },
      { name: 'Storybook', value: 'storybook' },
      { name: 'Docker', value: 'docker' }
    ]
  }
]);
```

### Testing the Tool
```bash
# Test basic creation
mkdir /tmp/test-projects
cd /tmp/test-projects
node /path/to/project-template/tools/generators/project-init/create-project.js

# Test with various inputs
# Test overwrite functionality
# Test git and npm options
# Cleanup test directories
```

### Code Quality Guidelines
- Use proper error handling for all file operations
- Validate all user inputs thoroughly
- Provide clear, actionable error messages
- Handle interruption gracefully (Ctrl+C)
- Maintain compatibility across platforms (Windows, macOS, Linux)

## Related Tools and Documentation

- **template-customizer.js**: Framework-specific customization after project creation
- **enhanced-component-generator.js**: Generate components in the new project
- **generator-wrapper.js**: Analytics tracking for generation processes
- **Project Setup Guide**: docs/guides/onboarding/project-setup.md
- **AI Assistant Setup**: docs/guides/ai-development/ai-assistant-setup.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines