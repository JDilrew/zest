// This file is launched in a child process — probably using Node's child_process.fork() — and acts as a dynamic loader + dispatcher for a "worker module".
// It’s a generic wrapper that loads whatever module it's told to, listens for messages from the parent process, calls functions from that module, and sends the results back.
// This file is launched in the child process. It loads the target worker module and dispatches method calls from the parent.

// Get the worker module URL from process arguments (e.g., process.argv[2])
const workerModuleUrl = process.argv[2];

// Use the file URL directly for import()
const workerModule = await import(workerModuleUrl);

process.on("message", async (msg) => {
  try {
    const fn =
      typeof workerModule[msg.method] === "function"
        ? workerModule[msg.method]
        : typeof workerModule.default === "function" && msg.method === "default"
        ? workerModule.default
        : null;
    if (!fn) throw new Error(`Unknown method: ${msg.method}`);
    const result = await fn(msg.args);
    process.send({ result });
  } catch (error) {
    process.send({ error: error.message });
  }
});
