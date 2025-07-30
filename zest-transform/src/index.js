import { transformSync } from "@babel/core";

/**
 * Transpile a file from ESM to CommonJS using Babel.
 * @param {string} input - Code to transpile.
 */
function transpileToCommonJS(input, inputFilePath) {
  const result = transformSync(input, {
    presets: [
      [
        "@babel/preset-env",
        {
          modules: "commonjs",
        },
      ],
    ],
    sourceMaps: "inline",
    filename: inputFilePath, // if you have it
  });

  return result.code;
}

export { transpileToCommonJS };
