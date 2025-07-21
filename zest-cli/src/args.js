export function parseArgs(argv) {
  let command = null;
  let pathArg = null;
  let silent = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--silent") {
      silent = true;
    } else if (!command && argv[i] === "test") {
      command = "test";
    } else if (!pathArg && !argv[i].startsWith("--") && argv[i] !== "test") {
      pathArg = argv[i];
    }
  }
  if (!command) command = "test";
  return { command, pathArg, silent };
}
