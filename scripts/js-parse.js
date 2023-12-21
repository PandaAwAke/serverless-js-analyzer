const esprima = require('esprima');
const fs = require('fs');

// 读取 JavaScript 源文件
const sourceCode = fs.readFileSync('your_file.js', 'utf-8');

// 解析源代码
const ast = esprima.parseScript(sourceCode, {
  tolerant: true,   // 语法错误容忍
  loc: true         // 给出语句定位
});

