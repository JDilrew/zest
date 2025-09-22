import { createRequire } from "module";
import { transformSync } from "@babel/core";
import { hoistMockCalls } from "./hoist-plugin.js";

const requireFromHere = createRequire(import.meta.url);

/**
 * Transpile a file from ESM to CommonJS using Babel.
 * @param {string} input - Code to transpile.
 */

function transpileToCommonJS(input, inputFilePath) {
  const transformedInput = transformSync(input, {
    plugins: [hoistMockCalls],
    presets: [
      [
        requireFromHere.resolve("@babel/preset-env"),
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
