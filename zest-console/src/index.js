class BaseConsole {
  getBuffer() {
    return undefined;
  }
}

export { BaseConsole };
export { SilentConsole } from "./SilentConsole.js";
export { BufferConsole } from "./BufferConsole.js";
export { getConsoleOutput } from "./getConsoleOutput.js";
