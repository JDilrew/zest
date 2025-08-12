import { parseArgs } from "./args.js";
import { resolveTestFiles } from "@heritage/zest-finder";
// import { loadConfig } from "@heritage/zest-config";
import { runZest } from "@heritage/zest-core";

async function runCLI(argv) {
  const { command, pathArg, silent } = parseArgs(argv);

  // // Prefer config from ZEST_CONFIG env, else look for zest.config.js in cwd
  // let configInput = process.env.ZEST_CONFIG;
  // if (!configInput) {
  //   configInput = "zest.config.js";
  // }
  // const config = await loadConfig(configInput);

  // TODO: update args to allow a global config for all contexts
  const tests = await resolveTestFiles(pathArg, silent, true);

  if (command === "test") {
    await runZest(tests, silent);

    // reportStart();
    // const runner = new TestRunner();
    // const results = await runner.runTests(testFiles, undefined, config);
    // reportResults(results);
  } else {
    // eslint-disable-next-line no-console
    console.error("Unknown command:", command);
  }
}

export { runCLI };
