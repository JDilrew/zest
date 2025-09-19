import { parseArgs } from "./args.js";
import { resolveTestFiles } from "@jdilrew/zest-finder";
import { runZest } from "@jdilrew/zest-core";

async function runCLI(argv) {
  const { command, pathArg, silent } = parseArgs(argv);

  // TODO: update args to allow a global config for all contexts
  const tests = await resolveTestFiles(pathArg, silent, true);

  if (command === "test") {
    const results = await runZest(tests, silent);

    // If any file-level result failed, mark overall as failed
    const allPassed = results.every((r) => r.success);

    return allPassed;
  } else {
    // eslint-disable-next-line no-console
    console.error("Unknown command:", command);
    return false;
  }
}

export { runCLI };
