import fs from "fs";
import path, { resolve as pResolve } from "path";
import moduleBuiltin from "module";

const CORE = new Set(
  moduleBuiltin.builtinModules.map((m) => m.replace(/^node:/, ""))
);

class ZestResolver {
  constructor(options = {}) {
    const {
      rootDir = process.cwd(),
      extensions = [".js", ".jsx", ".ts", ".tsx", ".json"],
      moduleDirectories = ["node_modules"],
      moduleNameMapper = [],
    } = options;

    this.rootDir = rootDir;
    this.extensions = extensions;
    this.moduleDirectories = moduleDirectories;
    this.moduleNameMapper = moduleNameMapper;
    this._cache = new Map();
  }

  resolveTestFile(testFile) {
    return pResolve(this.rootDir, testFile);
  }

  resolveModule(moduleName, baseDir = this.rootDir) {
    const res = this.resolve(moduleName, {
      basedir: baseDir,
      mocks: undefined,
    });
    return res.path || null;
  }

  normalize(request, basedir = this.rootDir) {
    if (request.startsWith(".") || request.startsWith("/")) {
      return path.resolve(basedir, request);
    }
    return request;
  }

  resolve(request, opts = {}) {
    const {
      basedir = this.rootDir,
      mocks = undefined,
      moduleNameMapper = this.moduleNameMapper,
      extensions = this.extensions,
      moduleDirectories = this.moduleDirectories,
    } = opts;

    const cacheKey = JSON.stringify({
      r: request,
      b: basedir,
      e: extensions,
      m: moduleDirectories,
      map: moduleNameMapper.map(([re, to]) => [re.source, re.flags, to]),
      hasMocks: !!mocks && mocks.size,
    });
    const cached = this._cache.get(cacheKey);
    if (cached) return cached;

    const coreName = request.replace(/^node:/, "");
    if (CORE.has(coreName)) {
      const out = {
        path: undefined,
        isNodeModule: true,
        isCore: true,
        isMocked: false,
      };
      this._cache.set(cacheKey, out);
      return out;
    }

    const normalizedKey = this.normalize(request, basedir);
    let isMocked = false;
    let mockKey;
    if (mocks && (mocks.has(normalizedKey) || mocks.has(request))) {
      isMocked = true;
      mockKey = mocks.has(normalizedKey) ? normalizedKey : request;
    }

    const mapped = this._applyMapper(request, moduleNameMapper, basedir);
    const effective = mapped || request;

    let abs;
    if (effective.startsWith(".") || effective.startsWith("/")) {
      abs = this._resolveAsFileOrDir(
        this.normalize(effective, basedir),
        extensions
      );
    } else {
      abs = this._resolveInNodeModules(
        basedir,
        effective,
        extensions,
        moduleDirectories
      );
    }

    const result = {
      path: abs || undefined,
      isNodeModule: !!abs && abs.includes(`${path.sep}node_modules${path.sep}`),
      isCore: false,
      isMocked,
      mockKey,
    };
    this._cache.set(cacheKey, result);
    return result;
  }

  _applyMapper(request, mapper, basedir) {
    for (const [re, target] of mapper) {
      const m = request.match(re);
      if (m) {
        const replaced = request.replace(re, target);
        // Support <rootDir> token like Jest
        const rootReplaced = replaced.replace(/<rootDir>/g, this.rootDir);
        return this.normalize(rootReplaced, basedir);
      }
    }
    return null;
  }

  _fileExists(p) {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  }
  _dirExists(p) {
    try {
      return fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  }

  _tryFile(p, exts) {
    if (this._fileExists(p)) return p;
    for (const ext of exts) {
      if (this._fileExists(p + ext)) return p + ext;
    }
    return null;
  }

  _resolveAsFileOrDir(abs, exts) {
    const asFile = this._tryFile(abs, exts);
    if (asFile) return asFile;

    if (this._dirExists(abs)) {
      // package.json "exports"/"main" (very simplified)
      const pkgJson = path.join(abs, "package.json");
      if (this._fileExists(pkgJson)) {
        try {
          const data = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
          const mainField = data.module || data.browser || data.main;
          if (mainField) {
            const cand = path.resolve(abs, mainField);
            const mf =
              this._tryFile(cand, exts) ||
              this._tryFile(path.join(cand, "index"), exts);
            if (mf) return mf;
          }
        } catch {
          // ignore invalid JSON
        }
      }
      // index fallback
      const idx = this._tryFile(path.join(abs, "index"), exts);
      if (idx) return idx;
    }
    return null;
  }

  _resolveInNodeModules(fromDir, request, exts, moduleDirs) {
    let dir = fromDir;
    while (true) {
      for (const md of moduleDirs) {
        const base = path.join(dir, md, request);
        const hit = this._resolveAsFileOrDir(base, exts);
        if (hit) return hit;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }
}

export { ZestResolver };
