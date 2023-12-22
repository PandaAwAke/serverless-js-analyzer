var express = require('express');
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

var jsFilter = require('../scripts/backend-js-filter');
const awsTaintCollector = require('../scripts/require-import-collector');
const taintAnalysis = require('../scripts/taint-analysis');
const output = require('../scripts/output');


function copyAllJsFilesToOutputDir(dir, outputDir) {
  var fileList = [];
  jsFilter.findJsFiles(dir, fileList);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);  
  }

  // 统计文件名出现的次数
  let nameCount = {};
  fileList.forEach(file => {
    const fileName = path.basename(file);
    const baseName = path.parse(fileName).name;
    if (!nameCount[baseName]) {
      nameCount[baseName] = 1;
    } else {
      nameCount[baseName] += 1;
    }
  });

  // 复制文件到目标文件夹
  fileList.forEach(file => {
    const fileName = path.basename(file);
    const baseName = path.parse(fileName).name;
    const ext = path.parse(fileName).ext;
    let newFileName;
    if (nameCount[baseName] > 1) {
      // 如果文件名重复，添加后缀
      newFileName = `${baseName}_${nameCount[baseName]}${ext}`;
      nameCount[baseName] -= 1;
    } else {
      newFileName = fileName;
    }
    const destinationPath = path.join(outputDir, newFileName);
    fs.copyFileSync(file, destinationPath);
  });
}

function analyzeDir(dir) {
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
}

var router = express.Router();

router.get('/analyze', function(req, res, next) {
  var directory = req.query.dir;
  if (directory) {
    var outputDir = path.join(directory, 'output');
    try {
      copyAllJsFilesToOutputDir(directory, outputDir);
      analyzeDir(outputDir);
    } catch(e) {
      console.log(e)
    }

    res.send('Success');
    return;
  }
  res.send(400);
});

// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
