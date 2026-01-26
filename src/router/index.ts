import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/core/services/supabase";
import AppLayout from "@/layouts/AppLayout.vue";

const LoginView = () => import("@/modules/auth/views/LoginView.vue");
const AssessmentsView = () =>
  import("@/modules/assessments/views/AssessmentsView.vue");
const AttendanceView = () =>
  import("@/modules/attendance/views/AttendanceView.vue");

const DashboardView = () =>
  import("@/modules/dashboard/views/DashboardView.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          component: DashboardView,
        },
        {
          path: "assessments",
          name: "assessments",
          component: AssessmentsView,
        },
        {
          path: "attendance",
          name: "attendance",
          component: AttendanceView,
        },
      ],
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (requiresAuth && !session) {
    next();
  } else if (to.path === "/login" && session) {
    next("/");
  } else {
    next();
  }
});

export default router;
