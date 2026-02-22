<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
  { label: 'Turmas', icon: 'pi pi-calendar', route: '/classes' },
  { label: 'Alunos', icon: 'pi pi-users', route: '/students' },
  { label: 'Avaliações', icon: 'pi pi-check-square', route: '/assessments' },
  { label: 'Relatórios', icon: 'pi pi-chart-bar', route: '/reports' },
]

const adminItems = computed(() => {
  const items = []
  if (authStore.isCoordenador) {
    items.push({
      label: 'Usuários',
      icon: 'pi pi-user-edit',
      route: '/admin/usuarios',
    })
  }
  if (authStore.isDiretor) {
    items.push({
      label: 'Habilidades',
      icon: 'pi pi-list-check',
      route: '/admin/habilidades',
    })
  }
  return items
})

const mostrarAdmin = computed(() => adminItems.value.length > 0)

const iniciais = computed(() => {
  const [prefix] = (authStore.user || '').split('@')
  return (prefix ?? '').slice(0, 2).toUpperCase()
})

const nomeExibicao = computed(() => {
  const [prefix] = (authStore.user || '').split('@')
  return prefix ?? authStore.user ?? ''
})

function navigate(path: string) {
  router.push(path)
}
function logout() {
  authStore.signOut()
}
</script>

<template>
  <nav
    class="h-full w-full bg-white flex flex-col transition-all duration-300 border-r border-slate-100"
  >
    <div
      class="h-24 flex items-center gap-3 px-6 shrink-0 border-b border-slate-50"
    >
      <img
        src="/images/acquOnwhite.jpeg"
        alt="AcquOn Logo"
        class="w-12 h-12 rounded-xl shadow-sm object-cover"
      />
      <div class="flex flex-col justify-center">
        <span
          class="font-bold text-xl tracking-tight text-slate-800 leading-tight"
          >AcquOn</span
        >
        <span
          class="text-[10px] uppercase font-bold text-sky-500 tracking-widest"
          >Gestão Inteligente</span
        >
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      <p
        class="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2"
      >
        Menu Principal
      </p>

      <a
        v-for="item in menuItems"
        :key="item.route"
        @click="navigate(item.route)"
        class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium group relative overflow-hidden"
        :class="{
          'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100':
            route.path === item.route,
          'text-slate-500 hover:bg-slate-50 hover:text-slate-900':
            route.path !== item.route,
        }"
      >
        <div
          v-if="route.path === item.route"
          class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500 rounded-r-full"
        ></div>
        <i
          :class="[
            item.icon,
            'text-lg transition-transform group-hover:scale-110 duration-200',
            route.path === item.route
              ? 'text-sky-600'
              : 'text-slate-400 group-hover:text-slate-600',
          ]"
        ></i>
        <span>{{ item.label }}</span>
      </a>

      <template v-if="mostrarAdmin">
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mt-6 mb-2"
        >
          Administração
        </p>
        <a
          v-for="item in adminItems"
          :key="item.route"
          @click="navigate(item.route)"
          class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium group relative overflow-hidden"
          :class="{
            'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100':
              route.path === item.route,
            'text-slate-500 hover:bg-slate-50 hover:text-slate-900':
              route.path !== item.route,
          }"
        >
          <div
            v-if="route.path === item.route"
            class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-red-500 rounded-r-full"
          ></div>
          <i
            :class="[
              item.icon,
              'text-lg transition-transform group-hover:scale-110 duration-200',
              route.path === item.route
                ? 'text-red-600'
                : 'text-slate-400 group-hover:text-slate-600',
            ]"
          ></i>
          <span>{{ item.label }}</span>
        </a>
      </template>
    </div>

    <div class="p-4 border-t border-slate-50 shrink-0 space-y-1">
      <a
        @click="navigate('/perfil')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group"
        :class="{
          'bg-slate-100 text-slate-800': route.path === '/perfil',
          'text-slate-500 hover:bg-slate-50 hover:text-slate-800':
            route.path !== '/perfil',
        }"
      >
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0"
        >
          {{ iniciais }}
        </div>
        <div class="flex flex-col items-start overflow-hidden">
          <span class="font-bold text-sm truncate w-full">{{
            nomeExibicao
          }}</span>
          <span class="text-xs opacity-60 truncate w-full">Meu Perfil</span>
        </div>
        <i class="pi pi-angle-right text-xs ml-auto opacity-40"></i>
      </a>

      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
      >
        <div
          class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-red-100 transition-colors"
        >
          <i class="pi pi-sign-out text-sm"></i>
        </div>
        <div class="flex flex-col items-start">
          <span class="font-bold text-sm">Sair</span>
          <span class="text-xs opacity-70">Encerrar sessão</span>
        </div>
      </button>
    </div>
  </nav>
</template>
