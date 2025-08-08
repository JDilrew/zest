# Intro

The core-functionality of a js testing framework:

1. Efficiently search for test files
2. Run all the tests in parallel
3. Use an assertion framework
4. Isolate tests from each other

# Usage

1. Run `yarn install` at the root.
2. Run `yarn test:jsdom` or `yarn test:node`
3. call to the cli with args; test, --silent

## Stripped back MVP (to learn Jest's architecture)

1. Build a file index (haste-map, e.g. jest-worker)
2. Setup the test environment (jest-environment, e.g. jsdom or node)
3. Discover test files (using globs and config)
4. Create a test runner instance (jest-runner)
5. For each test file:
   - Create a runtime environment (jest-runtime) for isolation and mocking
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
