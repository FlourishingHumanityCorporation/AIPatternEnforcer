#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');

const FRAMEWORK_CONFIGS = {
  react: {
    name: 'React (Vite)',
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      vite: '^6.0.0',
      '@vitejs/plugin-react': '^4.0.0',
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
    },
    scripts: {
      dev: 'vite --config config/vite.config.ts',
      build: 'vite build --config config/vite.config.ts',
      preview: 'vite preview --config config/vite.config.ts',
    },
    files: {
      'config/vite.config.ts': 'vite-config',
      'src/main.tsx': 'react-main',
      'src/App.tsx': 'react-app',
    },
  },
  nextjs: {
    name: 'Next.js 14',
    dependencies: {
      next: '^14.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
    },
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    files: {
      'next.config.js': 'next-config',
      'app/layout.tsx': 'next-layout',
      'app/page.tsx': 'next-page',
    },
  },
  express: {
    name: 'Express API',
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.5',
      helmet: '^7.0.0',
      'express-rate-limit': '^7.0.0',
    },
    devDependencies: {
      '@types/express': '^4.17.0',
      '@types/cors': '^2.8.0',
      nodemon: '^3.0.0',
    },
    scripts: {
      dev: 'nodemon src/server.ts',
      build: 'tsc',
      start: 'node dist/server.js',
    },
    files: {
      'src/server.ts': 'express-server',
      'src/routes/index.ts': 'express-routes',
    },
  },
};

async function customizeTemplate() {
  console.log(chalk.blue.bold('\n🎨 Customize ProjectTemplate\n'));

  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Choose your framework:',
      choices: [
        { name: 'React (Vite) - Fast, modern web apps', value: 'react' },
        { name: 'Next.js 14 - Full-stack React framework', value: 'nextjs' },
        { name: 'Express API - Backend API server', value: 'express' },
      ],
    },
  ]);

  const config = FRAMEWORK_CONFIGS[framework];
  
  console.log(chalk.blue(`\n📦 Setting up ${config.name}...\n`));

  // Update package.json
  const packageJsonPath = path.resolve('package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Merge dependencies
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...config.dependencies,
  };

  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    ...config.devDependencies,
  };

  // Update scripts
  Object.assign(packageJson.scripts, config.scripts);

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✓ Updated package.json'));

  // Create framework-specific files
  for (const [targetFile, templateFile] of Object.entries(config.files)) {
    const targetPath = path.resolve(targetFile);
    const targetDir = path.dirname(targetPath);

    // Create directory if needed
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy template file
    const templateContent = getTemplateContent(framework, templateFile);
    fs.writeFileSync(targetPath, templateContent);
    console.log(chalk.green(`✓ Created ${targetFile}`));
  }

  // Framework-specific setup
  if (framework === 'nextjs') {
    // Create Next.js specific directories
    const dirs = ['app', 'public', 'styles'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(chalk.green(`✓ Created ${dir}/`));
      }
    });

    // Create .env.local
    fs.writeFileSync('.env.local', '# Environment variables\n');
    console.log(chalk.green('✓ Created .env.local'));
  }

  // Show next steps
  console.log(chalk.blue.bold('\n✅ Template customized successfully!\n'));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.gray('  npm install'));
  console.log(chalk.gray('  npm run dev'));
  console.log(chalk.gray(`\n${getFrameworkTips(framework)}`));
}

function getTemplateContent(framework, filename) {
  const templates = {
    react: {
      'vite-config': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3000,
  },
});`,
      'react-main': `import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'react-app': `import * as React from 'react';

export default function App() {
  return (
    <div>
      <h1>Welcome to ProjectTemplate</h1>
      <p>Start editing src/App.tsx</p>
    </div>
  );
}`,
    },
    nextjs: {
      'next-config': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;`,
      'next-layout': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      'next-page': `export default function HomePage() {
  return (
    <main>
      <h1>Welcome to ProjectTemplate with Next.js</h1>
      <p>Start editing app/page.tsx</p>
    </main>
  );
}`,
    },
    express: {
      'express-server': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
      'express-routes': `import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from ProjectTemplate API!' });
});

export default router;`,
    },
  };

  return templates[framework]?.[filename] || '';
}

function getFrameworkTips(framework) {
  const tips = {
    react: `React Tips:
  - Components go in src/components/
  - Use npm run g:c to generate components
  - Vite config is in config/vite.config.ts`,
    nextjs: `Next.js Tips:
  - Pages go in app/ directory
  - API routes in app/api/
  - Static files in public/`,
    express: `Express Tips:
  - API routes in src/routes/
  - Middleware in src/middleware/
  - Use npm run g:api to generate endpoints`,
  };

  return tips[framework] || '';
}

// Run the customizer
customizeTemplate().catch((err) => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});