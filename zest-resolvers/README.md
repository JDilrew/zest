In Jest, jest-resolve is used to control how modules are loaded when your test files use require or import. Instead of relying solely on Node's default resolution, Jest uses jest-resolve to:

Support custom module directories, aliases, and extensions.
Handle mocks and stubs (e.g., **mocks** folders).
Resolve test environments, runners, and plugins.
Apply custom resolvers if configured.
This allows Jest to provide features like mocking, custom environments, and flexible project setups that go beyond Node's standard module resolution.
