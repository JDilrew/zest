import path from "path";

export function parseArgs(argv) {
  let command = null;
  let pathArg = null;
  let silent = false;
  let cwdFlag = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--silent") {
      silent = true;
    } else if (a === "--cwd") {
      cwdFlag = argv[++i]; // next token is the cwd value
    } else if (!command && a === "test") {
      command = "test";
    } else if (!pathArg && !a.startsWith("--") && a !== "test") {
      pathArg = a; // positional path
    }
  }

  if (!command) command = "test";

  // Prefer where the user ran the command from, not where the binary lives
  const invokedFrom = cwdFlag
    ? cwdFlag
    : process.env.INIT_CWD || // npm/yarn/pnpm set this to the original cwd
      process.cwd(); // fallback

  // Resolve the target path (positional arg or default to the invoking dir)
  const targetPath = path.resolve(invokedFrom, pathArg ?? ".");

  return { command, pathArg: targetPath, silent, invokedFrom };
}
