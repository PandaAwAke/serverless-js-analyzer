const astTraverse = require('../ast-traverse');

/**
 * 收集所有 Serverless 相关的入口对象 (污点分析的 sources)
 * @param {any} node 
 * @returns 所有 aws 污点对象，是一个列表，每个元素是
 * {
 *    scopeName: scope 名,
 *    variable: 变量名
 * }
 */
function collectTaintSourceObjects(ast) {
  // 匹配 require 括号内的正则表达式，匹配成功就算 aws 对象
  const AWS_REQUIRE_REGEX_PATTERNS = [
    '@?aws-sdk.*',
    'dynamodb.*'
  ];

  const taintSourceIdentifiers = [];

  astTraverse.traverseAst(ast, {
    enter: function(node, parent, currentScopeName, currentScope, scopeChain) {
      if (node.type === 'VariableDeclaration') {
        // 考虑类似 const xxx = require('@aws-sdk/...') 的语句
        // xxx 是一个 source
        for (const declaration of node.declarations) {
          if (declaration.init && declaration.init.type === 'CallExpression') {
            const callee = declaration.init.callee;   // 一般是 {type: "Identifier", name: "require"}
            if (callee.type === 'Identifier' && callee.name === 'require' &&
                declaration.init.arguments.length > 0 && declaration.init.arguments[0].type === 'Literal') {
              const requireName = declaration.init.arguments[0].value;
              for (const regex of AWS_REQUIRE_REGEX_PATTERNS) {
                if (new RegExp(regex).test(requireName.trim())) { // 匹配成功
                  if (declaration.id.type === 'ObjectPattern') {
                    // 类似 const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); 的语句
                    // declaration.id 是 ObjectPattern，需要取出其中的 declaration.id.properties
                    for (const property of declaration.id.properties) {
                      // property.key 或 property.value 应该是一样的 Identifier，用哪个都行
                      taintSourceIdentifiers.push({
                        scopeName: currentScopeName,
                        variable: property.key.name,
                      });
                    }
                  } else if (declaration.id.type === 'Identifier') {
                    taintSourceIdentifiers.push({
                      scopeName: currentScopeName,
                      variable: declaration.id.name,
                    });
                  }
                  break;
                }
              }
            }
          }
        }
      } else if (node.type === 'ImportDeclaration') {
        // 考虑类似 import * as AWS from 'aws-sdk'; 的语句
        if (node.source.type === 'Literal') {
          const importName = node.source.value;
          for (const regex of AWS_REQUIRE_REGEX_PATTERNS) {
            if (new RegExp(regex).test(importName.trim())) {  // 匹配成功
              for (const specifier of node.specifiers) {
                const asName = specifier.local.name;
                taintSourceIdentifiers.push({
                  scopeName: currentScopeName,
                  variable: asName,
                });
              }
              break;
            }
          }
        }
      }
    }
  });

  return taintSourceIdentifiers;
}

module.exports = {
  collectTaintSourceObjects,
};
