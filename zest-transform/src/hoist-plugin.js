function hoistMockCalls({ types: t }) {
  return {
    pre() {
      this.mockCalls = [];
    },
    visitor: {
      ExpressionStatement(path) {
        if (
          path.get("expression").isCallExpression() &&
          path.get("expression.callee").matchesPattern("zest.mock")
        ) {
          this.mockCalls.push(path.node);
          path.remove(); // take it out of its original spot
        }
      },
    },
    post(state) {
      const program = state.path;
      // Stick mocks at the top, above everything else
      program.node.body = [...this.mockCalls, ...program.node.body];
    },
  };
}

export { hoistMockCalls };
