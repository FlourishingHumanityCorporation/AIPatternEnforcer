import React, { useState, useEffect } from 'react';

// This component has multiple issues that should trigger hooks:
// 1. Security vulnerability (innerHTML injection)
// 2. Performance anti-pattern (missing dependency array)
// 3. Missing tests (test-first-enforcer should catch this)

interface VulnerableComponentProps {
  userInput: string;
  data: any[];
}

export const VulnerableComponent: React.FC<VulnerableComponentProps> = ({ userInput, data }) => {
  const [content, setContent] = useState('');
  
  // Security vulnerability - XSS via innerHTML (intentionally vulnerable for demo)
  useEffect(() => {
    const element = document.getElementById('output');
    if (element) {
      element.innerHTML = userInput + '<script>alert("XSS")</script>';
    }
  }, [userInput]); // Fixed ESLint warning

  // Performance anti-pattern - missing dependency array (fixed)
  useEffect(() => {
    setContent(userInput);
  }, [userInput]); // Fixed ESLint warning 

  // Another performance issue - inefficient array operations
  const processedData = data
    .map(item => ({ ...item, processed: true }))
    .filter(item => item.isActive)
    .map(item => item.displayName);

  return (
    <div>
      <div id="output" />
      <div>{content}</div>
      <ul>
        {processedData.map(name => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
};