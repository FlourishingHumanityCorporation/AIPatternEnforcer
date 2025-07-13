// This file contains multiple security vulnerabilities that should be blocked

export function processUserData(userInput) {
  // XSS vulnerability - direct innerHTML assignment with concatenation
  document.getElementById('content').innerHTML = userInput + '<div>more content</div>';
  
  // Code injection - eval usage
  eval('console.log(' + userInput + ')');
  
  // Hardcoded credentials
  const apiKey = 'sk-1234567890abcdef1234567890abcdef';
  const password = 'MySecretPassword123!';
  
  // SQL injection potential
  const query = 'SELECT * FROM users WHERE id = ' + userInput;
  
  // Weak random for security
  const token = Math.random() + 'security_token';
  
  return { query, token, apiKey };
}

// Performance issues that should be caught
export function inefficientProcess(items) {
  // O(n²) nested loops
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i].id === items[j].parentId) {
        items[i].children.push(items[j]);
      }
    }
  }
  
  // Inefficient chained operations
  return items
    .map(item => ({ ...item, processed: true }))
    .filter(item => item.isActive)
    .map(item => item.name);
}