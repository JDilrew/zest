import os from "os";

class DeviceInfo {
  getCpuInfo() {
    return os.cpus();
  }

  availableParallelism() {
    return os.availableParallelism;
  }

  getOSInfo() {
    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      type: os.type(),
    };
  }

  getGpuInfo() {
    try {
      if (os.platform() === "win32") {
        // Windows: use wmic
        const output = execSync("wmic path win32_VideoController get name", {
          encoding: "utf8",
        });
        return output
          .split("\n")
          .slice(1)
          .map((line) => line.trim())
          .filter(Boolean);
      } else if (os.platform() === "linux") {
        // Linux: use lspci
        const output = execSync("lspci | grep VGA", { encoding: "utf8" });
        return output
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else if (os.platform() === "darwin") {
        // macOS: use system_profiler
        const output = execSync("system_profiler SPDisplaysDataType", {
          encoding: "utf8",
        });
        return output;
      } else {
        return "Not implemented for this OS";
      }
    } catch (err) {
      return "Could not determine GPU info";
    }
  }

  getMemoryInfo() {
    return {
      total: os.totalmem(),
      free: os.freemem(),
    };
  }

  getCpuThreads() {
    return os.cpus().length;
  }

  getCpuCores() {
    // This is a best-effort guess: count unique core ids
    const cpus = os.cpus();
    const coreIds = new Set(cpus.map((cpu) => cpu.model + cpu.speed));
    return coreIds.size;
  }
}

export default DeviceInfo;
