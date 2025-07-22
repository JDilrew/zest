import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function loadConfig(configInput) {
  // If configInput is a JSON string, parse it
  if (typeof configInput === "string") {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(configInput);
      if (typeof parsed === "object" && parsed !== null) {
        return applyDefaults(parsed);
      }
    } catch (jsonErr) {
      // Not JSON, treat as file path
      const absPath = path.isAbsolute(configInput)
        ? configInput
        : path.resolve(process.cwd(), configInput);
      if (fs.existsSync(absPath)) {
        try {
          const configUrl = pathToFileURL(absPath).href;
          const config = await import(configUrl);
          return applyDefaults(config.default || config);
        } catch (fileErr) {
          throw new Error(`Failed to load config file: ${fileErr.message}`);
        }
      } else {
        throw new Error(`Config file not found: ${absPath}`);
      }
    }
  }

  // If configInput is an object, use it
  if (typeof configInput === "object" && configInput !== null) {
    return applyDefaults(configInput);
  }

  // If no configInput, try to find zest.config.js
  const defaultPath = path.resolve(process.cwd(), "zest.config.js");
  if (fs.existsSync(defaultPath)) {
    try {
      const configUrl = pathToFileURL(defaultPath).href;
      const config = await import(configUrl);
      return applyDefaults(config.default || config);
    } catch (err) {
      throw new Error(`Failed to load default config: ${err.message}`);
    }
  }

  // No config found, use defaults
  return applyDefaults({});
}

function applyDefaults(config) {
  return {
    testRunner: "juice",
    testEnvironment: config.testEnvironment || "node",
    testMatch: config.testMatch || ["**/*.test.js"],
    useWorkerThreads:
      config.useWorkerThreads !== undefined
        ? config.useWorkerThreads
        : (config.testEnvironment || "node") === "node",
    maxWorkers: config.maxWorkers || 1,
  };
}

export { loadConfig };
