//TODO: unused
import { hoistMockCalls } from "./hoist-plugin.js";

// Force custom execution order of plugins and presets
const zestPreset = {
  plugins: [hoistMockCalls],
  presets: [],
};

// @babel/core requires us to export a function
const zestPresetPlugin = () => zestPreset;
export { zestPresetPlugin };
