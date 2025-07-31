import { transformSync } from "@babel/core";
import { hoistMockCalls } from "./hoist-plugin.js";

/**
 * Transpile a file from ESM to CommonJS using Babel.
 * @param {string} input - Code to transpile.
 */

function transpileToCommonJS(input, inputFilePath) {
  // First pass: ESM to CommonJS
  const firstPass = transformSync(input, {
    presets: [
      [
        "@babel/preset-env",
        {
          modules: "commonjs",
        },
      ],
    ],
    sourceMaps: "inline",
    filename: inputFilePath,
  });

  // Second pass: Hoist mocks above require
  const secondPass = transformSync(firstPass.code, {
    plugins: [hoistMockCalls],
    sourceMaps: "inline",
    filename: inputFilePath,
  });

  return secondPass.code;
}

export { transpileToCommonJS };
