Framework agnostic, its a js testing library need a plugin specifically for pulse, besides that it shouldn't matter

The functionality of a test framework:

1. Efficiently search for test files
2. Run all the tests in parallel
3. Use an assertion framework
4. Isolate tests from each other

# Flow

1. call to the cli with args; test, --silent

# 2a naive approach.

- require the index.js to bring in globals (describe, expect)
- monkey patches node.js modules loading system (we need to follow something more complex here)
- Find files, glob pattern matching

# 2b proper approach.

- spawn workers in parallel
- run everything encapsulated inside of a vm
- create our own global context and module require to allow imports to work..

spying?
As a bonus, could we cover browser - visual tests like playwright?
