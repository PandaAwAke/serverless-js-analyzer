# Serverless-js-analyzer

这是一个软件分析测试的工具作业。本工具可为 JavaScript 项目进行简单的第三方模块污点分析。



## 工具功能

- 由用户定义一些关注的第三方库，例如 `@aws-sdk` 下的各种功能库，这些库是本工具关注的“污点”
- 由用户选择一个项目文件夹，工具将自动化收集其中合法的 JavaScript 文件
- 工具会自动分析 JavaScript 文件使用的第三方库，并进行污点分析
- 执行污点分析
  - 文字结果：污点分析会给出所有被“污染”的变量、行号和污点传递关系
  - 可视化结果：污点分析会生成一个 graphviz dot 文件以描述污点传递图



## 工具配置

1. 在项目的 ./backend/settings/js-ignore 设定您希望不要检查的 js 文件名规则
2. 在项目的 ./backend/settings/taint-source-modules 设定属于污点的第三方模块名规则



## 项目结构

* `frontend`是前端 vue 项目
* `backend`是后端 express 项目，包含了前端构建产物
* `start.bat`或`start.sh`是该工具的启动脚本
* `example-aws-projects`是收集的一些 github 上的 Serverless AWS Lambda 项目，可用于本工具的测试和展示



## 工具使用

执行`start.bat`或`start.sh`，然后访问`http://localhost:3000`



## 待分析应用收集

在 github 上收集了一些 Serverless 相关项目，最后觉得做 taint analysis 比较合适

[serverless/examples: Serverless Examples – A collection of boilerplates and examples of serverless architectures built with the Serverless Framework on AWS Lambda, Microsoft Azure, Google Cloud Functions, and more. (github.com)](https://github.com/serverless/examples)

[IBM Cloud (github.com)](https://github.com/IBM-Cloud?q=Serverless+openwhisk&type=all&language=&sort=stargazers)

[Amazon Web Services - Labs (github.com)](https://github.com/awslabs?q=serverless&type=all&language=javascript&sort=)

[AWS Samples (github.com)](https://github.com/orgs/aws-samples/repositories?language=javascript&page=1&q=serverless&sort=stargazers&type=all)

最终考虑的是 AWS 相关项目，已存放在本项目的`example-aws-projects`目录下

