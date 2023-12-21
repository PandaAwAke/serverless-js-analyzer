const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

const awsTaintCollector = require('../scripts/collectors/aws-taint-collector');
const taintAnalysis = require('../scripts/taint-analysis');


test('生成单个文件分析结果', () => {
  const fileName = 'changelog_2.js';

  if (fileName.endsWith('.txt')) {
    return;
  }
  const dir = './test/testcases';
  const filePath = path.join(dir, fileName);
  const sourceCode = fs.readFileSync(filePath, 'utf-8');

  var ast = esprima.parseScript(sourceCode, {loc: true, tolerant: true});

  var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
  var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources);
  var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

  var taintLineNumbers = [...taintLineNumberSet];

  var outputString = 'Taint objects:\n';
  for (var obj of taintObjects) {
    outputString += `[scope: ${obj[0]}, var: ${obj[1]}]\n`;
  }

  outputString += '\n';
  outputString += 'Taint lines:\n';
  
  var count = 0;
  for (var lineNumber of taintLineNumbers) {
    if (count > 0) {
      if (count % 8 == 0) {
        outputString += ',\n';
      } else {
        outputString += ', ';
      }
    }
    outputString += lineNumber;
    count++;
  }

  outputString += '\n';

  fs.writeFileSync(path.join(dir, fileName + '-result.txt'), outputString);
});

test('为 testcases 文件夹下的文件自动生成分析结果', () => {
  const dir = './test/testcases';
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (filePath.endsWith('.txt')) {
      return;
    }
    const fileName = path.basename(filePath);
    const sourceCode = fs.readFileSync(filePath, 'utf-8');

    var ast = esprima.parseScript(sourceCode, {loc: true, tolerant: true});

    var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
    var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources);
    var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

    var taintLineNumbers = [...taintLineNumberSet];

    var outputString = 'Taint objects:\n';
    for (var obj of taintObjects) {
      outputString += `[scope: ${obj[0]}, var: ${obj[1]}]\n`;
    }

    outputString += '\n';
    outputString += 'Taint lines:\n';
    
    var count = 0;
    for (var lineNumber of taintLineNumbers) {
      if (count > 0) {
        if (count % 8 == 0) {
          outputString += ',\n';
        } else {
          outputString += ', ';
        }
      }
      outputString += lineNumber;
      count++;
    }

    outputString += '\n';

    fs.writeFileSync(path.join(dir, fileName + '-result.txt'), outputString);
  });
});
