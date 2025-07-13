// This file contains multiple performance anti-patterns
// that performance-checker.js should detect and block

import { LargeDataset, User, Product, Order } from './types';

export class DataProcessor {
  private cache: Map<string, any> = new Map();

  // O(n²) nested loops - performance-checker.js should flag this
  findDuplicateUsers(users: User[]): User[] {
    const duplicates: User[] = [];
    
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i !== j && users[i].email === users[j].email) {
          duplicates.push(users[i]);
        }
      }
    }
    
    return duplicates;
  }

  // O(n³) triple nested loops - severe performance issue
  correlateUserProductOrders(users: User[], products: Product[], orders: Order[]) {
    const results = [];
    
    for (const user of users) {
      for (const product of products) {
        for (const order of orders) {
          if (order.userId === user.id && order.productId === product.id) {
            results.push({ user, product, order });
          }
        }
      }
    }
    
    return results;
  }

  // Synchronous file operations in loop - blocks event loop
  processMultipleFiles(filePaths: string[]): string[] {
    const fs = require('fs');
    const results: string[] = [];
    
    for (const path of filePaths) {
      // Synchronous read blocks the entire thread
      const content = fs.readFileSync(path, 'utf-8');
      const processed = this.heavyProcessing(content);
      // Synchronous write blocks again
      fs.writeFileSync(path + '.processed', processed);
      results.push(processed);
    }
    
    return results;
  }

  // Inefficient array operations - creates new array each iteration
  buildLargeArray(size: number): number[] {
    let result: number[] = [];
    
    for (let i = 0; i < size; i++) {
      // Creates new array each time - O(n²) memory allocation
      result = [...result, i * 2];
    }
    
    return result;
  }

  // Memory leak - never clears cache
  memoizeWithoutLimit(key: string, computeFn: () => any): any {
    if (!this.cache.has(key)) {
      // No size limit on cache - will grow indefinitely
      this.cache.set(key, computeFn());
    }
    return this.cache.get(key);
  }

  // Blocking recursive function without optimization
  fibonacci(n: number): number {
    if (n <= 1) return n;
    // No memoization - exponential time complexity
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  // Inefficient string concatenation in loop
  generateReport(items: any[]): string {
    let report = '';
    
    for (const item of items) {
      // String concatenation in loop - creates new string each time
      report += `Item: ${item.name}, Price: ${item.price}\n`;
      report += `Description: ${item.description}\n`;
      report += '---\n';
    }
    
    return report;
  }

  // Heavy computation without Web Workers or async
  private heavyProcessing(data: string): string {
    // Simulating CPU-intensive work that blocks the main thread
    for (let i = 0; i < 1000000; i++) {
      data = data.split('').reverse().join('');
    }
    return data;
  }

  // Inefficient sorting with custom comparator
  sortUsersByMultipleFields(users: User[]): User[] {
    // Bubble sort instead of native sort - O(n²)
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length - 1; j++) {
        if (users[j].lastName > users[j + 1].lastName || 
            (users[j].lastName === users[j + 1].lastName && 
             users[j].firstName > users[j + 1].firstName)) {
          const temp = users[j];
          users[j] = users[j + 1];
          users[j + 1] = temp;
        }
      }
    }
    return users;
  }
}