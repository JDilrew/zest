import { sync } from "glob";

/**
 * Find all test files matching a pattern.
 * @param {string} pattern - Glob pattern for test files.
 * @param {string} [cwd=process.cwd()] - Directory to search from.
 * @returns {string[]} Array of absolute file paths.
 */
function findTestFiles(pattern = "**/*.test.js", cwd = process.cwd()) {
  return sync(pattern, { cwd, absolute: true });
}

export { findTestFiles };
