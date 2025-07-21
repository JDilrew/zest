# Understanding Jest's Package

## Overview

The `jest` CLI package is the entry point for running Jest from the command line. Its responsibilities include:

- Parsing command-line arguments and loading configuration files
- Setting up the Node.js process environment (env vars, working directory, etc.)
- Initializing the test runner and environment
- Handling watch mode, filtering, and test selection (e.g. only run changed or failed tests)
- Managing reporters and output formatting
- Orchestrating the full test lifecycle: discovery, execution, reporting, and exit status
- Providing helpful error messages, usage info, and interactive features

The CLI package ties together all the core Jest components (runner, environment, circus, reporters) and provides a user-friendly interface for running and managing tests.
