const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

const awsTaintCollector = require('../scripts/collectors/require-import-collector');
const taintAnalysis = require('../scripts/taint-analysis');
const output = require('../scripts/output');


test('生成单个文件分析结果', () => {
  const fileName = 'changelog_2.js';

  if (!fileName.endsWith('.js')) {
    return;
  }
  const dir = './test/testcases';
  const filePath = path.join(dir, fileName);
  const sourceCode = fs.readFileSync(filePath, 'utf-8');

  var ast = esprima.parseScript(sourceCode, {loc: true, tolerant: true});

  var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);

  var taintEdges = [];
  var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources, taintEdges);
  var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

  var taintLineNumbers = [...taintLineNumberSet];

  if (taintObjects.length > 0) {
    // 只有非空结果会输出
    output.writeOutputFile(dir, fileName, taintObjects, taintLineNumbers, taintEdges);
    output.writeTaintGraphDot(dir, fileName, taintObjects, taintEdges);
  }
});

test('为 testcases 文件夹下的文件自动生成分析结果', () => {
  const dir = './test/testcases';
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileName = path.basename(filePath);
    if (!fileName.endsWith('.js')) {
      return;
    }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');

    var ast = esprima.parseScript(sourceCode, {loc: true, tolerant: true});

    var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
    var taintEdges = [];
    var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources, taintEdges);
    var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

    var taintLineNumbers = [...taintLineNumberSet];

    if (taintObjects.length > 0) {
      // 只有非空结果会输出
      output.writeOutputFile(dir, fileName, taintObjects, taintLineNumbers, taintEdges);
      output.writeTaintGraphDot(dir, fileName, taintObjects, taintEdges);
    }
  });
});
