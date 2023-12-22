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
    工具会自动找出其中所有的合法 JavaScript 文件，将它们复制到被选择文件的父目录下的 output 文件夹中
    <div style="margin: 6px auto; padding: 12px;">
      <el-form>
        <input ref="fileInput" type="file" hidden
          @change="selectProjectDirectory((<HTMLInputElement> $refs.fileInput).files![0])"
          webkitdirectory />
        <el-button type="primary" size="large" style="font-size: 16px;"
          @click="(<HTMLInputElement> $refs.fileInput).click();">选择项目文件夹
        </el-button>
      </el-form>
    </div>
    
    <h3>第二步：进行分析</h3>

    <h3>第三步：查看分析结果</h3>

  </div>
</template>

<script lang="ts" setup>

</script>

<script lang="ts">
  export default {
    data() {
      return {
      }
    },

    mounted() {
      
    },

    methods: {
      selectProjectDirectory(dir: File) {
        console.log(dir)
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
