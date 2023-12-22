<template>
  <div class="container">
    <h1>JavaScript 第三方模块污点分析工具</h1>
    本系统可为 JavaScript 项目进行第三方模块污点分析。
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
}

</style>
