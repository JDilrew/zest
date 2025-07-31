/**
 * Type definition for a mock registration. Used by the runtime.
 * @typedef {Object} MockRegistration
 * @property {string} moduleName
 * @property {*} mockImpl
 */

/**
 * Helper to create a mock registration object (for type safety/intellisense).
 * @param {string} moduleName
 * @param {*} mockImpl
 * @returns {MockRegistration}
 */
function createMockRegistration(moduleName, mockImpl) {
  return { moduleName, mockImpl };
}

export { createMockRegistration };
