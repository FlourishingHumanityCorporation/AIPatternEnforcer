import { capitalize, toKebabCase, toCamelCase, truncate } from './string-utils';

describe('string-utils', () => {
  describe('capitalize', () => {
    it('capitalizes first letter of lowercase string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('handles single character', () => {
      expect(capitalize('h')).toBe('H');
    });
  });

  describe('toKebabCase', () => {
    it('converts camelCase to kebab-case', () => {
      expect(toKebabCase('camelCase')).toBe('camel-case');
    });

    it('converts PascalCase to kebab-case', () => {
      expect(toKebabCase('PascalCase')).toBe('pascal-case');
    });

    it('converts spaces to hyphens', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
    });

    it('converts underscores to hyphens', () => {
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });

    it('handles empty string', () => {
      expect(toKebabCase('')).toBe('');
    });

    it('handles already kebab-case string', () => {
      expect(toKebabCase('already-kebab')).toBe('already-kebab');
    });
  });

  describe('toCamelCase', () => {
    it('converts kebab-case to camelCase', () => {
      expect(toCamelCase('kebab-case')).toBe('kebabCase');
    });

    it('converts snake_case to camelCase', () => {
      expect(toCamelCase('snake_case')).toBe('snakeCase');
    });

    it('converts spaces to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
    });

    it('handles empty string', () => {
      expect(toCamelCase('')).toBe('');
    });

    it('converts PascalCase to camelCase', () => {
      expect(toCamelCase('PascalCase')).toBe('pascalCase');
    });

    it('handles already camelCase string', () => {
      expect(toCamelCase('alreadyCamel')).toBe('alreadyCamel');
    });
  });

  describe('truncate', () => {
    it('truncates long string with ellipsis', () => {
      expect(truncate('this is a long string', 10)).toBe('this is...');
    });

    it('returns original string if shorter than max length', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    it('returns original string if equal to max length', () => {
      expect(truncate('exactly10!', 10)).toBe('exactly10!');
    });

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('handles very short max length', () => {
      expect(truncate('hello', 3)).toBe('...');
    });

    it('handles max length of 3 exactly', () => {
      expect(truncate('hello', 4)).toBe('h...');
    });
  });
});