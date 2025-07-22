import { run } from "./runner.js";

export async function runTest([config, testFile]) {
  try {
    return await run(config, testFile);
  } catch (error) {
    return {
      success: false,
      errorMessage: error.message,
      matcherResults: [],
    };
  }
}
