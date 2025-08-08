import chalk from "chalk";

function getConsoleOutput(buffer) {
  const logEntries = buffer.reduce((output, { type, message }) => {
    message = message
      .split("\n")
      .map((line) => line)
      .join("\n");

    let typeMessage = `console.${type}`;

    if (type === "warn") {
      message = chalk.yellow(message);
      typeMessage = chalk.yellow(typeMessage);
    } else if (type === "error") {
      message = chalk.red(message);
      typeMessage = chalk.red(typeMessage);
    }

    return output + chalk.dim(typeMessage) + "\n" + message.trimEnd() + "\n\n";
  }, "");

  return logEntries.trimEnd() + "\n";
}

export { getConsoleOutput };
