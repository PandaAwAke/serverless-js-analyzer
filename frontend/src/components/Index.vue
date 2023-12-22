<template>
  <div class="container">
    <h1>JavaScript 污点分析工具</h1>
    本系统可为 JavaScript 项目进行污点分析。
    <ol>
      <li>
        指标监控体系：为<b>节点层</b>、<b>服务层</b>、<b>任务层</b>进行基于 Prometheus 的监控，
        收集各层级指标，进行汇总和处理，为集群用户提供方便的多维度指标监测功能。
      </li>
      <li>
        流处理图建模：为用户提供一套用 yaml 配置文件描述流处理场景模型的方法，并以图形化方式展示
        流处理场景模型。同时支持对集群中流处理应用的部署情况进行调整。
      </li>
      <li>
        综合风险监测：基于流处理场景模型和指标监控体系，采用<b>贝叶斯网络推理</b>、<b>区间化响应时间压缩</b>
        等方法对<b>节点层</b>、<b>服务层</b>、<b>任务层</b>进行综合风险监测，为用户提供风险参考。
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
