/**
 * 此文件用于找出一个项目目录下的所有后端 js 文件
 * 
 * 有如下规则：
 * 1. 不检查 TypeScript 文件，文件后缀名必须为 .js
 * 2. 根据 js-ignore 文件进行过滤，不考虑其中定义的文件名规则
 * 3. 不考虑以 "." 开头的文件名
 * 4. 不考虑不能被 esprima 解析的文件名
 */

const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

const ignoreFilePath = './settings/js-ignore';

function readJsIgnoreFile() {
  if (fs.existsSync(ignoreFilePath)) {
    return fs.readFileSync(ignoreFilePath, 'utf-8').split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

const ignoreRules = readJsIgnoreFile();

/**
 * 检测文件名是否符合忽略规则
 * @param {string} filePath 文件路径
 * @param {string[]} ignoreRules 忽略规则
 * @returns true/false
 */
function isFileIgnored(filePath, ignoreRules) {
  for (const rule of ignoreRules) {
    if (rule && !rule.startsWith('#')) {
      const regex = new RegExp(`^.*${rule.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
      if (regex.test(filePath)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 检测文件是否能被 esprima 解析
 * @param {string} filePath 文件路径
 * @returns true/false
 */
function fileCanBeParsed(filePath) {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    esprima.parseScript(sourceCode, {
      tolerant: true,   // 语法错误容忍
      loc: true         // 给出语句定位
    });
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * 递归搜索指定目录下所有的符合规定的 JavaScript 文件列表
 * @param {string} dir 目录路径
 * @param {string[]} fileList 最终文件列表
 * @returns 文件列表
 */
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (isFileIgnored(filePath, ignoreRules)) {
      return;
    }

    if (path.basename(filePath).startsWith(".")) {
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (path.extname(filePath).toLowerCase() === '.js') {
      if (fileCanBeParsed(filePath)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

module.exports = {
  findJsFiles,
}

