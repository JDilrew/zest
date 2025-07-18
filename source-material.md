# Understanding Jest's Package

## Bigger picture

1. User runs Jest via CLI (`jest` package`)
2. CLI parses arguments, loads config, and sets up the environment
3. Build the haste-map (`jest-worker`) to index all files and dependencies
4. Setup the test environment (`jest-environment`, e.g. `jsdom` or `node`) based on the config
5. Discover test files (using globs and config)
6. Detect file changes and track previously failed tests (for watch mode and prioritization)
7. Create a test runner instance (`jest-runner`)
8. For each test file:
   - Use `jest-circus` (the test execution engine) to:
     - Register and organize tests and `describe` blocks
     - Run global setup/teardown (`beforeAll`, `afterAll`)
     - For each `describe` block:
       - Run per-`describe` setup/teardown (`beforeEach`, `afterEach`)
       - Mock modules/functions as needed (`jest.mock`, `jest.spyOn`)
       - Isolate test code in the environment (sandbox)
       - Intercept and capture logging/console output (e.g. `console.log`, `console.error`) from the VM
       - Execute test code (sync or async)
       - Track and collect results/errors
     - Perform snapshot testing (capture and compare output with stored snapshots)
   - Transform code if needed (`jest-transform`)
   - Perform leak detection (e.g. check for global variable leaks, open handles)
9. Run tests in parallel using a worker pool for isolation and speed
10. Collect and aggregate coverage data (if enabled)
11. Aggregate and report results (`jest-reporters`)
12. Output results, coverage, captured logs, leak warnings, and snapshot diffs to the terminal or other reporters
13. Exit with appropriate status code

> Jest orchestrates the entire test lifecycle: from file discovery and environment setup,
> through test execution, mocking, coverage collection, file change detection, prioritization, logging interception, leak detection, snapshot testing, parallelization, and reporting.
> The CLI, runner, and circus engine work together to provide isolation,
> reliability, coverage, prioritization, leak detection, parallel execution, and rich reporting.

## Stripped back MVP (to learn Jest's architecture)

1. Build a file index (haste-map, e.g. jest-worker)
2. Setup the test environment (jest-environment, e.g. jsdom or node)
3. Discover test files (using globs and config)
4. Create a test runner instance (jest-runner)
5. For each test file:
   - Implement a minimal test execution engine (jest-circus) to handle:
     - Running tests, hooks, and describe blocks
     - Managing async and sync test execution
     - Tracking results and errors
   - Transform code if needed (jest-transform)
   - Apply global setup/teardown (beforeAll, afterAll)
   - For each describe block:
     - Apply per-describe setup/teardown (beforeEach, afterEach)
     - Mock modules/functions as needed (jest.mock, jest.spyOn)
     - Isolate in environment (sandbox)
     - Execute test code
     - Collect results
6. Aggregate and report results (jest-reporters)

> The key is to build a simple `jest-circus` engine that can run tests and hooks in a predictable order,
> handle errors, and report results, mirroring Jest's core execution model.
