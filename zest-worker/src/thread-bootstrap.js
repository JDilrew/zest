// This file is launched in a worker thread. It loads the target worker module and dispatches method calls from the parent thread.
import { parentPort, workerData } from "worker_threads";

if (!workerData || !workerData.modulePath) {
  throw new Error("No worker module path provided to thread-bootstrap.js");
}

const { modulePath, workerId } = workerData;

const workerModule = await import(modulePath);

globalThis.__WORKER_ID__ = workerId;

parentPort.on("message", async (msg) => {
  try {
    const fn =
      typeof workerModule[msg.method] === "function"
        ? workerModule[msg.method]
        : typeof workerModule.default === "function" && msg.method === "default"
        ? workerModule.default
        : null;
    if (!fn) throw new Error(`Unknown method: ${msg.method}`);
    const result = await fn(msg.args);
    parentPort.postMessage({ workerId, result });
  } catch (error) {
    parentPort.postMessage({ workerId, error: error.message });
  }
});
