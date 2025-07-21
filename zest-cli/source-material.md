# Understanding Jest's Package

## Overview

The `jest-cli` package is the entry point for running Jest from the command line. Its responsibilities include:

- Parsing command-line arguments and loading configuration files
- Initializing the test runner and delegating control to it
- Handling watch mode, filtering, and test selection (e.g. only run changed or failed tests)
- Managing reporters and output formatting
- Providing helpful error messages, usage info, and interactive features

The CLI package coordinates the test run, but delegates environment setup, test execution, and reporting to other Jest packages (such as `jest-runner`, `jest-environment`, and `jest-reporters`).
