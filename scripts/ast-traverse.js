const estraverse = require('estraverse');

function shouldCreatesNewScope(node) {
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}

/**
 * 寻找一个变量是否在某个 scope 中，成功找到返回 scope 编号，否则返回 -1
 * @param {string} varname 变量名
 * @param {array} scopeChain scopeChain
 * @returns scope 编号，失败返回 -1
 */
function getVarScope(varname, scopeChain) {
  for (var i = scopeChain.length - 1; i >= 0; i--) {
    var scope = scopeChain[i];
    if (scope.indexOf(varname) !== -1) {
      return i;
    }
  }
  return -1;
}

function printScope(scope, node) {
  var varsDisplay = scope.join(', ');
  if (node.type === 'Program') {
    console.log('Variables declared in the global scope:', varsDisplay);
  } else {
    if (node.id && node.id.name) {
      console.log('Variables declared in the function ' + node.id.name + '():', varsDisplay);
    } else {
      console.log('Variables declared in anonymous function:', varsDisplay);
    }
  }
}

function traverseAst(root, visitor) {
  const scopeChain = [];  // scopes

  estraverse.traverse(root, {
    enter: function(node, parent) {
      // Create and get scope
      if (shouldCreatesNewScope(node)) {
        scopeChain.push([]);
      }

      if (scopeChain.length == 0) {
        return;
      }
      var currentScope = scopeChain.at(-1);

      if (node.type === 'VariableDeclarator') {
        // node.id.type 要么是 Identifier，要么是 BindingPattern，目前只考虑 Identifier
        if (node.id.type === 'Identifier') {
          const variableName = node.id.name;
          currentScope.push(variableName);
        } else if (node.id.type === 'ObjectPattern') {
          for (const property of node.id.properties) {
            currentScope.push(property.key.name);
          }
        }
      } else if (node.type === 'ImportDeclaration') {
        // 考虑类似 import * as AWS from 'aws-sdk'; 的语句
        if (node.source.type === 'Literal') {
          for (const specifier of node.specifiers) {
            const asName = specifier.local.name;
            currentScope.push(asName);
          }
        }
      }

      if (visitor.enter) {
        visitor.enter(node, parent, currentScope, scopeChain);
      }
    },
    leave: function(node, parent) {
      if (scopeChain.length == 0) {
        return;
      }
      var currentScope = scopeChain.at(-1);

      if (visitor.leave) {
        visitor.leave(node, parent, currentScope, scopeChain);
      }

      // Try to pop the scope
      if (shouldCreatesNewScope(node)) {
        scopeChain.pop();
      }
    }
  });
}

module.exports = {
  getVarScope,
  printScope,
  traverseAst,
};
