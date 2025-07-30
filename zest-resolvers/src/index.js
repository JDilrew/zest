import { resolve } from "path";

class ZestResolver {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
  }

  resolveTestFile(testFile) {
    return resolve(this.rootDir, testFile);
  }

  resolveModule(moduleName, baseDir = this.rootDir) {
    try {
      return require.resolve(moduleName, { paths: [baseDir] });
    } catch (err) {
      return null;
    }
  }
}

export { ZestResolver };
