#!/usr/bin/env node
import DeviceInfo from "../src/index.js";

const device = new DeviceInfo();

const arg = process.argv[2];

function main() {
  switch (arg) {
    case "cpu":
      console.log(device.getCpuInfo());
      break;
    case "os":
      console.log(device.getOSInfo());
      break;
    case "gpu":
      console.log(device.getGpuInfo());
      break;
    case "mem":
    case "memory":
      console.log(device.getMemoryInfo());
      break;
    default:
      console.log("Usage: device <cpu|os|gpu|mem>");
  }
}

main();
