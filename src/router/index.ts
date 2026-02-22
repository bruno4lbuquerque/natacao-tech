import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'

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

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    allowedRoles?: Array<'ADMIN' | 'DIRETOR' | 'COORDENADOR' | 'PROFESSOR'>
  }
}

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
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('@/modules/profile/views/ProfileView.vue'),
        },

        {
          path: 'admin/usuarios',
          name: 'admin-usuarios',
          component: () =>
            import('@/modules/admin/views/AdminUsuariosView.vue'),
          meta: {
            requiresAuth: true,
            allowedRoles: ['ADMIN', 'DIRETOR', 'COORDENADOR'],
          },
        },

        {
          path: 'admin/habilidades',
          name: 'admin-habilidades',
          component: () => import('@/modules/admin/views/HabilidadesView.vue'),
          meta: {
            requiresAuth: true,
            allowedRoles: ['ADMIN', 'DIRETOR'],
          },
        },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (!auth.token) {
    auth.checkAuth()
  }

  const isAuthenticated = !!auth.token
  const isPublic = to.meta.public === true
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const allowedRoles = to.meta.allowedRoles

  if (requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.path === '/login' && isAuthenticated) {
    return next('/')
  }

  if (allowedRoles && auth.role && !allowedRoles.includes(auth.role as any)) {
    return next('/')
  }

  next()
})

export default router
