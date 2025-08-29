import { parseArgs } from "./args.js";
import { resolveTestFiles } from "@heritage/zest-finder";
import { runZest } from "@heritage/zest-core";

async function runCLI(argv) {
  const { command, pathArg, silent } = parseArgs(argv);

  // TODO: update args to allow a global config for all contexts
  const tests = await resolveTestFiles(pathArg, silent, true);

  if (command === "test") {
    await runZest(tests, silent);
  } else {
    // eslint-disable-next-line no-console
    console.error("Unknown command:", command);
  }
}

export { runCLI };
