/**
 * String utility functions
 */

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to kebab-case
 */
export function toKebabCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts string to camelCase
 */
export function toCamelCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Truncates string to specified length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  if (maxLength <= 3) return '...'.slice(0, maxLength);
  return str.slice(0, maxLength - 3) + '...';
}