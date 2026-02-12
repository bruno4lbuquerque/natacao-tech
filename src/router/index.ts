import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth' // <--- Importamos a Store
import AppLayout from '@/layouts/AppLayout.vue'

// Lazy Loading das Views
const LoginView = () => import('@/modules/auth/views/LoginView.vue')
const AssessmentsView = () =>
  import('@/modules/assessments/views/AssessmentsView.vue')
const AttendanceView = () =>
  import('@/modules/attendance/views/AttendanceView.vue')
const DashboardView = () =>
  import('@/modules/dashboard/views/DashboardView.vue')
const StudentsView = () => import('@/modules/students/views/StudentsView.vue')
const ReportsView = () => import('@/modules/reports/views/ReportsView.vue')
const ClassesView = () => import('@/modules/classes/views/ClassesView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        {
          path: 'assessments',
          name: 'assessments',
          component: AssessmentsView,
        },
        { path: 'attendance', name: 'attendance', component: AttendanceView },
        { path: 'students', name: 'students', component: StudentsView },
        { path: 'reports', name: 'reports', component: ReportsView },
        { path: 'classes', name: 'classes', component: ClassesView },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (!authStore.token) {
    authStore.checkAuth()
  }

  const isAuthenticated = !!authStore.token

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
