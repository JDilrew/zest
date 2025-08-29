import { sync } from "glob";
import path from "path";
import fs from "fs";

function findTestFiles(
  pattern = "**/*.test.js",
  cwd = process.cwd(),
  findConfig = false
) {
  const files = sync(pattern, { cwd, absolute: true });
  const contextMap = new Map();
  const configMap = new Map();

  for (const file of files) {
    // Find nearest package.json up the directory tree
    let dir = path.dirname(file);
    let found = false;
    let lastDir = null;
    let pkgPath = null;
    let configPath = null;
    while (dir !== lastDir) {
      const tryPkg = path.join(dir, "package.json");

      if (fs.existsSync(tryPkg)) {
        pkgPath = tryPkg;
        if (findConfig) {
          const tryConfig = path.join(dir, "zest.config.js");
          if (fs.existsSync(tryConfig)) configPath = tryConfig;
        }
        break;
      }

      if (findConfig && !configPath) {
        const tryConfig = path.join(dir, "zest.config.js");
        if (fs.existsSync(tryConfig)) configPath = tryConfig;
      }

      lastDir = dir;
      dir = path.dirname(dir);
    }

    // If no package.json found, group under 'default'
    const contextKey = pkgPath || "default";

    if (!contextMap.has(contextKey)) contextMap.set(contextKey, []);
    contextMap.get(contextKey).push(file);

    if (findConfig && configPath) configMap.set(contextKey, configPath);
  }

  // Return as array of { context, files, config? }
  return Array.from(contextMap.entries()).map(([context, files]) => {
    const obj = { context, files };

    if (findConfig && configMap.has(context))
      obj.config = configMap.get(context);

    return obj;
  });
}

async function resolveTestFiles(pathArg, silent = false, findConfig = false) {
  if (!pathArg) {
    return findTestFiles("**/*.test.js", process.cwd(), findConfig);
  }

  const absPath = path.resolve(process.cwd(), pathArg);

  if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
    return findTestFiles("**/*.test.js", absPath, findConfig);
  } else if (fs.existsSync(absPath)) {
    // Single file: find its context
    return findTestFiles(absPath, path.dirname(absPath), findConfig);
  } else {
    if (!silent) console.error(`Path does not exist:`, pathArg);
    process.exit(1);
  }
}

export { findTestFiles, resolveTestFiles };
