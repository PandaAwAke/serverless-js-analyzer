const estraverse = require('estraverse');

/**
 * 返回一个 node 是否创建一个新的 scope，如果是则返回 scope 名称，否则返回 null
 * @param {any} node 
 * @returns scope 名称 (string)，或 null
 */
function shouldCreatesNewScope(node) {
  if (!(node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'Program')) {
    return null;
  }

  var scopeName = 'anonymous';

  if (node.type === 'FunctionDeclaration') {
    if (node.id && node.id.type === 'Identifier') {
      scopeName = node.id.name;
    }
  } else if (node.type === 'FunctionExpression') {
    if (node.id && node.id.type === 'Identifier') {
      scopeName = node.id.name;
    }
  } else if (node.type === 'Program') {
    scopeName = 'global'
  }

  if (node.type !== 'Program') {
    scopeName += '#' + node.loc.start.line;
  }
  
  return scopeName;
}

/**
 * 寻找一个变量是否在某个 scope 中，成功找到返回 scope 名称，否则返回 null
 * @param {string} varname 变量名
 * @param {array} scopeChain scopeChain
 * @returns scope 名称，失败返回 null
 */
function getVarScope(varname, scopeChain) {
  for (var i = scopeChain.length - 1; i >= 0; i--) {
    var scopeName = scopeChain[i].name;
    var scope = scopeChain[i].scope;
    if (scope.indexOf(varname) !== -1) {
      return scopeName;
    }
  }
  return null;
}

/**
 * 寻找一个 scope 名称对应的 scope，成功找到返回 scope，否则返回 null
 * @param {string} scopeName scope 名
 * @param {array} scopeChain scopeChain
 * @returns scope，失败返回 null
 */
function getScopeByName(scopeName, scopeChain) {
  for (var i = scopeChain.length - 1; i >= 0; i--) {
    var scopeName1 = scopeChain[i].name;
    var scope = scopeChain[i].scope;
    if (scopeName === scopeName1) {
      return scope;
    }
  }
  return null;
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
  /**
   * scopes, 元素是
   * {
   *    name: scope 名,
   *    scope: [variables...]
   * }
   */
  const scopeChain = [];  // scopes，元素是 scopeName, scope]，scope 是一个 variable 字符串列表

  estraverse.traverse(root, {
    enter: function(node, parent) {
      // Create and get scope
      var scopeName = shouldCreatesNewScope(node);
      if (scopeName !== null) {
        scopeChain.push({
          name: scopeName,
          scope: []
        });
      }

      if (scopeChain.length === 0) {
        return;
      }

      var currentScopeName = scopeChain.at(-1).name;
      var currentScope = scopeChain.at(-1).scope;

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
        visitor.enter(node, parent, currentScopeName, currentScope, scopeChain);
      }
    },
    leave: function(node, parent) {
      if (scopeChain.length == 0) {
        return;
      }

      var currentScopeName = scopeChain.at(-1).name;
      var currentScope = scopeChain.at(-1).scope;

      if (visitor.leave) {
        visitor.leave(node, parent, currentScopeName, currentScope, scopeChain);
      }

      // Try to pop the scope
      if (shouldCreatesNewScope(node) != null) {
        scopeChain.pop();
      }
    }
  });
}

module.exports = {
  getVarScope,
  getScopeByName,
  printScope,
  traverseAst,
};
