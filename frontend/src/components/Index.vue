<template>
  <div class="container">
    <h2>JavaScript 第三方模块污点分析工具</h2>
    本系统可为 JavaScript 项目进行第三方模块污点分析。
    <br>
    <h3>工具功能</h3>
    <ul>
      <li>
        由用户定义一些关注的第三方库，例如 @aws-sdk 下的各种功能库，这些库是本工具关注的“污点”
      </li>
      <li>
        由用户选择一个项目文件夹，工具将自动化收集其中合法的 JavaScript 文件
      </li>
      <li>
        工具会自动分析 JavaScript 文件使用的第三方库，并进行污点分析
      </li>
      <li>
        执行污点分析
        <ul>
          <li>文字结果：污点分析会给出所有被“污染”的变量、行号和污点传递关系</li>
          <li>可视化结果：污点分析会生成一个 graphviz dot 文件以描述污点传递图</li>
        </ul>
      </li>
    </ul>
    <h3>工具配置</h3>
    <ol>
      <li>
        在项目的 ./backend/settings/js-ignore 设定您希望不要检查的 js 文件名规则
      </li>
      <li>
        在项目的 ./backend/settings/taint-source-modules 设定属于污点的第三方模块名规则
      </li>
    </ol>
    <el-divider />
    <h2>工具使用</h2>
    <h3>第一步：选择待分析项目文件夹</h3>
    工具会自动找出其中所有的合法 JavaScript 文件，将它们复制到选择的项目目录下的 output 文件夹中
    <div style="margin: 6px auto; padding: 12px;">
      <el-form>
        <el-input v-model="projectDirectory" placeholder="请输入项目文件夹的绝对路径"></el-input>
      </el-form>
    </div>
    
    <h3>第二步：进行分析</h3>
    <div>
      <el-button type="primary" size="large" style="font-size: 16px;" @click="analyze">执行分析</el-button>
    </div>

    <h3>第三步：查看分析结果</h3>
    分析成功后，在选择的项目目录下的 output 文件夹中查看输出结果

  </div>
</template>

<script lang="ts" setup>
  import axios from "axios";
  import { ElMessageBox } from 'element-plus';
</script>

<script lang="ts">
  export default {
    data() {
      return {
        projectDirectory: '',
        baseUrl: 'http://localhost:3000',
      }
    },

    mounted() {
      
    },

    methods: {
      analyze() {
        if (this.projectDirectory && this.projectDirectory.length > 0) {
          axios.get(`${this.baseUrl}/analyze`, {params: {
              dir: this.projectDirectory
            }})
            .then(response => {
              ElMessageBox.alert('分析成功！', '提示', {
                confirmButtonText: 'OK'
              });
            })
            .catch(error => {
              ElMessageBox.alert('分析失败！', '提示', {
                confirmButtonText: 'OK'
              });
            });
        } else {
          ElMessageBox.alert('请输入项目文件夹', '提示', {
            confirmButtonText: 'OK'
          });
        }
      },
    },

    watch: {
    }
  }
</script>

<style scoped>

li {
  line-height: 30px;
  margin: 8px auto;
}

.container {
  margin: 0 10px;
  font-size: 16px;
  line-height: 32px;
}

</style>
