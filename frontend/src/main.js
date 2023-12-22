import App from './App.vue'

import * as Vue from 'vue';
import * as VueRouter from 'vue-router';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import Index from './components/Index.vue';

const routes = [
  { path: '/', component: Index, meta: { title: 'JavaScript 第三方模块污点分析工具' } },
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes,
});

router.beforeEach(async (to) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
});

const app = Vue.createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router);
app.use(ElementPlus);

app.mount('#app');
