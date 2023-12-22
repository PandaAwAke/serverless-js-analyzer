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
        由用户选择一个项目文件夹或单个文件，工具将自动化收集合法的 JavaScript 文件
      </li>
      <li>
        工具会自动分析那些使用指定第三方库的 JavaScript 文件，并为该文件进行污点分析
      </li>
      <li>
        污点分析会给出所有被“污染”的变量、行号，同时会为该 JavaScript 文件生成一个 graphviz dot 文件，描述了污点传递图，以提供可视化功能
      </li>
    </ul>
    <br>
    工具配置：
    <ol>
      <li>
        在项目的 ./backend/settings/js-ignore 设定您希望不要检查的 js 文件名规则
      </li>
      <li>
        在项目的 ./backend/settings/taint-source-modules 设定属于污点的第三方模块名规则
      </li>
    </ol>
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
  font-size: 20px;
  line-height: 36px;
}

</style>
