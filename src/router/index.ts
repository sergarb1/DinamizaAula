import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const LEGACY_MECHANICS = ['dice', 'tombola', 'chest', 'gacha', 'infinite-queue', 'captain', 'timer', 'survival', 'chain', 'fullscreen', 'class-mode']

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/Students.vue'),
    },
    {
      path: '/mechanics',
      name: 'mechanics',
      component: () => import('../views/Mechanics.vue'),
    },
    {
      path: '/mechanics/:id',
      beforeEnter: (to) => {
        if (LEGACY_MECHANICS.includes(to.params.id as string)) {
          return '/mechanics'
        }
      },
      name: 'mechanic-detail',
      component: () => import('../views/MechanicDetail.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/Statistics.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
    },
  ],
})

export default router
