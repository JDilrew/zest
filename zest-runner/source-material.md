# Understanding Jest's Package

## Overview

| File       | Responsibility                                                                  |
| ---------- | ------------------------------------------------------------------------------- |
| testWorker | A specialized `Worker` function that calls into the runner as its job           |
| index      | Create/trigger in-band or parallel test runs                                    |
| runTest    | Run test in isolation, collect results, setup/teardown, check for memory leaks. |

## Breakdown

### testWorker

### index

### runTest
