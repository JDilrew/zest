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

/**
 * Resolve test files based on a path argument (file or directory) or default.
 * @param {string|null} pathArg - Path to a file or directory, or null.
 * @param {boolean} silent - If true, suppress error output.
 * @returns {Promise<string[]>} Array of absolute file paths.
 */
export async function resolveTestFiles(pathArg, silent = false) {
  if (pathArg) {
    const fs = await import("fs");
    const pathMod = await import("path");
    const absPath = pathMod.default.resolve(process.cwd(), pathArg);
    if (
      fs.default.existsSync(absPath) &&
      fs.default.statSync(absPath).isDirectory()
    ) {
      return findTestFiles("**/*.test.js", absPath);
    } else if (fs.default.existsSync(absPath)) {
      return [absPath];
    } else {
      if (!silent) console.error(`Path does not exist:`, pathArg);
      process.exit(1);
    }
  } else {
    return findTestFiles();
  }
}

export { findTestFiles };
