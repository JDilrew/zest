# Understanding Jest's Package

## Overview

The `haste-map` package is used by Jest to efficiently index and track all files in a project. On the surface, its responsibilities include:

- Scanning the file system to discover all files (source, tests, dependencies)
- Building a fast lookup table for module names, paths, and dependencies
- Tracking file changes and updates for watch mode
- Supporting custom module resolution (e.g. handling mocks, aliases)
- Providing APIs for the test runner to quickly find and load files

`haste-map` is a key part of Jest's performance and reliability, enabling fast test discovery, dependency tracking, and incremental test execution.
