<template>
  <div id="app">
    <div class="width: 100%;">
      <el-container>
        <el-header height="55px" class="header">
          <!-- 标题栏左半边 -->
          <div>
            <span>
              <a href="/" style="line-height: 30px; vertical-align: middle;">
                <el-icon size="30px" color="white"><HomeFilled /></el-icon>
              </a>
            </span>
            <span class="header-text">
              JavaScript 第三方模块污点分析工具
            </span>
          </div>

          <!-- 标题栏右半边 -->
          <div class="header-right">
            
          </div>
        </el-header>
        
        <!-- Container -->
        <el-container>

          <el-main style="padding: 12px;">
            
              <!-- 路由出口 -->
              <!-- 路由匹配到的组件将渲染在这里 -->
              <router-view></router-view>
            
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>


<script lang="ts" setup>
  import { ref } from 'vue';

</script>


<script lang="ts">

  export default {
    data() {
      return {
      }
    }
  }

</script>


<style scoped>

.router-link-active {
  text-decoration: none;
}

a {
  text-decoration: none;
  color: black;
}

.header {
  display: flex;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
  background-color: #324057;
}

.header-text {
  margin-left: 16px;
  letter-spacing: 2px;
  font-size: 24px;
  color: white;
  line-height: 55px;
}

.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;
}

</style>
