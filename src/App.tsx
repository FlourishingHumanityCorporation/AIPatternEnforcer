import * as React from 'react';
import './styles/app.css';
import { TestButton } from './components/TestButton';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to ProjectTemplate</h1>
        <p>A meta-project template for AI-assisted development</p>
      </header>
      
      <main className="app-main">
        <section className="getting-started">
          <h2>Getting Started</h2>
          <p>Generate your first component:</p>
          <pre>
            <code>npm run g:c MyComponent</code>
          </pre>
          
          <div style={{ marginTop: '1rem' }}>
            <p>Example generated component:</p>
            <TestButton onClick={() => alert('Generated component works!')}>
              Click me - I'm a generated component!
            </TestButton>
          </div>
          
          <h3>Available Commands</h3>
          <ul>
            <li><code>npm run dev</code> - Start development server</li>
            <li><code>npm test</code> - Run tests</li>
            <li><code>npm run g:c</code> - Generate component (interactive)</li>
            <li><code>npm run setup:guided</code> - Guided setup wizard</li>
            <li><code>npm run check:all</code> - Run all enforcement checks</li>
          </ul>
        </section>
        
        <section className="resources">
          <h3>Documentation</h3>
          <ul>
            <li><a href="/QUICK-START.md">Quick Start Guide</a></li>
            <li><a href="/docs/guides/ai-development/ai-assistant-setup.md">AI Assistant Setup</a></li>
            <li><a href="/DOCS_INDEX.md">Complete Documentation Index</a></li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;