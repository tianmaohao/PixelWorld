import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Hash 模式兼容 GitHub Pages，刷新不会 404
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/convert',
      name: 'convert',
      component: () => import('@/views/ConverterView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('@/views/CommunityView.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/UserCenterView.vue'),
    },
  ],
})

export default router
