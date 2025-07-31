function hoistMockCalls({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const body = path.get("body");
        const directives = [];
        const importDecls = [];
        const mockCalls = [];
        const otherNodes = [];

        body.forEach((nodePath) => {
          if (nodePath.isDirective()) {
            directives.push(nodePath.node);
          } else if (nodePath.isImportDeclaration()) {
            importDecls.push(nodePath.node);
          } else if (
            nodePath.isExpressionStatement() &&
            nodePath.get("expression").isCallExpression() &&
            nodePath.get("expression.callee").matchesPattern("zest.mock")
          ) {
            mockCalls.push(nodePath.node);
          } else {
            otherNodes.push(nodePath.node);
          }
        });

        path.node.body = [
          ...directives,
          ...mockCalls,
          ...importDecls,
          ...otherNodes,
        ];
      },
    },
  };
}

export { hoistMockCalls };
