const astTraverse = require('./ast-traverse');

/**
 * 检查 taintIdentifiers 里是否有指定的变量
 * @param {array} taintIdentifiers taintIdentifiers 数组
 * @param {int} scopeIndex 变量 scope
 * @param {string} variableName 变量名
 * @returns true/false
 */
function taintIdentifiersHasVariable(taintIdentifiers, scopeIndex, variableName) {
  for (var ti of taintIdentifiers) {
    if (ti[0] === scopeIndex && ti[1] === variableName) {
      return true;
    }
  }
  return false;
}


/**
 * 收集所有的 taint objects
 * 
 * @param {*} ast ast
 * @param {array} taintSourceIdentifiers taintSourceIdentifiers
 */
function collectTaintObjects(ast, taintSourceIdentifiers) {
  const taintIdentifiers = [...taintSourceIdentifiers];
  var changed = true;   // taintIdentifiers 是否发生变化

  while (changed) {
    /**
     * 没有 CFG，只能用最朴素的方法，关注两种语句
     * 1. VariableDeclarator
     * 2. AssignmentExpression
     */
    const nodeStack = [];   // 栈，存感兴趣的语句和变量，内部元素为 (语句, scope, 变量, 是否污点) 元组
    changed = false;

    astTraverse.traverseAst(ast, {
      enter: function(node, parent, currentScope, scopeChain) {
        if (node.type === 'VariableDeclarator') {
          // node.id.type 要么是 Identifier，要么是 BindingPattern，目前只考虑 Identifier
          if (node.id.type === 'Identifier') {
            const variableName = node.id.name;
            nodeStack.push([node, scopeChain.length - 1, variableName, false]);
          }
        } else if (node.type === 'AssignmentExpression') {
          // node.left 可以是任意 Expression，目前只考虑 Identifier
          if (node.left && node.left.type === 'Identifier') {
            const variableName = node.left.name;
            nodeStack.push([node, scopeChain.length - 1, variableName, false]);
          }
        }
      },
      leave: function(node, parent, currentScope, scopeChain) {
        if (node.type === 'Identifier' &&
            taintIdentifiersHasVariable(taintIdentifiers, astTraverse.getVarScope(node.name, scopeChain), node.name)) {
          // 是污点对象，将栈顶语句的"是否污点"修改为 true
          if (nodeStack.length > 0) {
            nodeStack.at(-1)[3] = true;
          }
        } else if (node.type === 'VariableDeclarator' || node.type === 'AssignmentExpression') {
          if (nodeStack.length > 0 && nodeStack.at(-1)[0] === node) {
            if (nodeStack.at(-1)[3] === true) {   // 应该被记录
              // 将该语句的左变量加入污点集合，不要重复加
              const variableScope = nodeStack.at(-1)[1];
              const variableName = nodeStack.at(-1)[2];
              if (!taintIdentifiersHasVariable(taintIdentifiers, variableScope, variableName)) {
                taintIdentifiers.push([variableScope, variableName]);
                changed = true;
              }
            }
            // 出栈
            nodeStack.pop();
          }
        }
      }
    });
  }

  return taintIdentifiers;
}


/**
 * 收集所有 taint objects 的行号
 * @param {*} ast ast
 * @param {array} taintObjects
 */
function collectTaintObjectsLineNumbers(ast, taintObjects) {
  var taintLineNumberSet = new Set();

  var traverseVariableName = function(node, scopeChain, variableName) {
    var variableScope = astTraverse.getVarScope(variableName, scopeChain);
    if (taintIdentifiersHasVariable(taintObjects, variableScope, variableName)) {
      for (var line = node.loc.start.line; line <= node.loc.end.line; line++) {
        taintLineNumberSet.add(line);
      }
    }
  }

  astTraverse.traverseAst(ast, {
    enter: function(node, parent, currentScope, scopeChain) {
      if (node.type === 'Identifier') {
        var variableName = node.name;
        traverseVariableName(node, scopeChain, variableName);
      } else if (node.type === 'ObjectPattern') {
        for (const property of node.properties) {
          var variableName = property.key.name;
          traverseVariableName(node, scopeChain, variableName);
        }
      }
    },
  });

  return taintLineNumberSet;
}


module.exports = {
  collectTaintObjects,
  collectTaintObjectsLineNumbers,
};
