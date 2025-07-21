# Understanding Jest's Package

## Overview

The `jest-environment` package defines the base types and logic for managing test environments in Jest. It provides:

- The core `TestEnvironment` class, which handles setup and teardown for each test file
- Management of the `global` object (where test code runs)
- Integration points for VM isolation and sandboxing
- Hooks for setup and teardown logic

Jest uses environment packages like `jest-environment-node` and `jest-environment-jsdom` to provide specific environments:

- `jest-environment-node`: runs tests in a Node.js context
- `jest-environment-jsdom`: runs tests in a simulated browser using jsdom

Each environment extends the base `TestEnvironment` and customizes globals, setup, and teardown as needed for its context.
