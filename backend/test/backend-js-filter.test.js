const backendJsFilter = require('../scripts/backend-js-filter');

test('应该正常找出指定目录中被 js-ignore 过滤后的所有js文件', () => {
  const directoryToSearch = 'E:\\dev\\Serverless\\serverless-testing-framework\\applications\\AWS Lambda'; // 替换成要搜索的目录路径
  const jsFiles = backendJsFilter.findJsFiles(directoryToSearch);
  console.log(jsFiles.join('\n'));
});

