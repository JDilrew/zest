import { createContext, runInContext } from "vm";

const context = { mock, fruit, squeeze, taste };
createContext(context);
runInContext(code, context);

const customRequire = (fileName) => {
  const code = fs.readFileSync(join(dirname(testFile), fileName), "utf8");

  // Define a function in the `vm` context and return it.
  const moduleFactory = runInContext(
    `(function(module) {${code}})`,
    environment.getVmContext()
  );

  const module = { exports: {} };

  // Run the sandboxed function with our module object.
  moduleFactory(module);
  return module.exports;
};
