#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

// Simple component generator for the starter
async function generateComponent(name) {
  if (!name) {
    console.error("Please provide a component name");
    process.exit(1);
  }

  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    console.error("Component name must be in PascalCase (e.g., MyComponent)");
    process.exit(1);
  }

  const componentDir = path.join(__dirname, "..", "components", name);

  try {
    await fs.mkdir(componentDir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory: ${error.message}`);
    process.exit(1);
  }

  // Component template
  const componentContent = `import React from 'react';
import styles from './${name}.module.css';

export interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({ children, className = '' }) => {
  return (
    <div className={\`\${styles.container} \${className}\`}>
      {children}
    </div>
  );
};
`;

  // Test template
  const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders children correctly', () => {
    render(<${name}>Test Content</${name}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<${name} className="custom-class">Content</${name}>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;

  // CSS template
  const cssContent = `.container {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--background);
  color: var(--foreground);
}
`;

  // Index template
  const indexContent = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;

  // Write files
  const files = [
    { name: `${name}.tsx`, content: componentContent },
    { name: `${name}.test.tsx`, content: testContent },
    { name: `${name}.module.css`, content: cssContent },
    { name: "index.ts", content: indexContent },
  ];

  for (const file of files) {
    const filePath = path.join(componentDir, file.name);
    try {
      await fs.writeFile(filePath, file.content);
      console.log(`✅ Created ${file.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${file.name}: ${error.message}`);
    }
  }

  console.log(`\n✨ Component ${name} generated successfully!`);
  console.log(`📁 Location: components/${name}/`);
}

// Get component name from command line
const componentName = process.argv[2];
generateComponent(componentName);
