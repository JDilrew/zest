# zest-environment (MVP)

A minimal test environment manager for a Jest-like test runner. This package is inspired by `jest-environment` and is designed to help you learn how Jest isolates and manages test environments.

## Responsibilities

- Sets up and tears down a sandboxed environment for each test file
- Provides global objects (e.g. `global`, `window`, `document` if using jsdom)
- Optionally supports custom environment setup (e.g. node, jsdom)
- Cleans up after tests to prevent leaks

## MVP Implementation Plan

1. **Create a base environment class**
   - Handles setup and teardown
   - Exposes a `global` object for tests
2. **Implement a Node environment**
   - Just exposes Node globals
3. **(Optional) Implement a jsdom environment**
   - Uses jsdom to provide `window` and `document`
4. **Expose setup/teardown hooks**
   - `setup()` before tests, `teardown()` after
5. **Document how to use in a test runner**

## Example Usage

```js
const Env = require("zest-environment");
const env = new Env();
await env.setup();
// run tests in env.global
await env.teardown();
```

---

This MVP will help you understand how Jest manages isolation and globals for each test file.
