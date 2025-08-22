import { transformSync } from "@babel/core";
import { hoistMockCalls } from "./hoist-plugin.js";

/**
 * Transpile a file from ESM to CommonJS using Babel.
 * @param {string} input - Code to transpile.
 */

function transpileToCommonJS(input, inputFilePath) {
  const transformedInput = transformSync(input, {
    plugins: [hoistMockCalls],
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

  return transformedInput.code;
}

export { transpileToCommonJS };
