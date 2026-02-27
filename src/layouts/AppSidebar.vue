<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isDiretorOuAcima = computed(() =>
  ['ADMIN', 'DIRETOR', 'COORDENADOR'].includes(auth.role ?? '')
)

const menuItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
    { label: 'Turmas', icon: 'pi pi-calendar', route: '/classes' },
    { label: 'Avaliações', icon: 'pi pi-check-square', route: '/assessments' },
  ]

  if (['DIRETOR', 'COORDENADOR', 'PROFESSOR'].includes(auth.role ?? '')) {
    items.push({
      label: 'Relatórios',
      icon: 'pi pi-chart-bar',
      route: '/reports',
    })
  }

  return items
})

const iniciais = computed((): string => {
  const raw: string = auth.user ?? ''
  const atIndex: number = raw.indexOf('@')
  const local: string = atIndex >= 0 ? raw.substring(0, atIndex) : raw
  const partes: string[] = local
    .split(/[.\-_]/)
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
  return (
    partes
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || '?'
  )
})

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    ADMIN: 'Administrador',
    DIRETOR: 'Diretor',
    COORDENADOR: 'Coordenador',
    PROFESSOR: 'Professor',
  }
  return map[auth.role ?? ''] ?? auth.role ?? ''
})

const roleBadgeCls = computed(() => {
  const map: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DIRETOR: 'bg-blue-100 text-blue-700',
    COORDENADOR: 'bg-amber-100 text-amber-700',
    PROFESSOR: 'bg-sky-100 text-sky-700',
  }
  return map[auth.role ?? ''] ?? 'bg-slate-100 text-slate-600'
})

function navigate(path: string) {
  router.push(path)
}

function logout() {
  auth.signOut()
  router.push('/login')
}

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="h-full w-full bg-white flex flex-col border-r border-slate-100">
    <div
      class="h-20 flex items-center gap-3 px-5 shrink-0 border-b border-slate-50"
    >
      <img
        src="/images/acquOnwhite.jpeg"
        alt="AcquOn Logo"
        class="w-10 h-10 rounded-xl shadow-sm object-cover"
      />
      <div class="flex flex-col justify-center leading-tight">
        <span class="font-bold text-xl tracking-tight text-slate-800"
          >AcquOn</span
        >
        <span
          class="text-[10px] uppercase font-bold text-sky-500 tracking-widest"
          >Gestão Inteligente</span
        >
      </div>
    </div>

    <button
      @click="navigate('/perfil')"
      class="mx-3 mt-4 mb-1 flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left group shrink-0 cursor-pointer"
      :class="
        isActive('/perfil')
          ? 'bg-sky-50 border-sky-200 ring-1 ring-sky-100'
          : 'bg-slate-50 border-slate-100 hover:bg-sky-50 hover:border-sky-200'
      "
    >
      <div
        class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
      >
        {{ iniciais }}
      </div>
      <div class="min-w-0 flex-1 overflow-hidden">
        <p class="text-xs text-slate-600 truncate font-medium">
          {{ auth.user }}
        </p>
        <span
          class="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
          :class="roleBadgeCls"
        >
          {{ roleLabel }}
        </span>
      </div>
      <i
        class="pi pi-chevron-right text-[11px] shrink-0 transition-colors"
        :class="
          isActive('/perfil')
            ? 'text-sky-400'
            : 'text-slate-300 group-hover:text-sky-400'
        "
      />
    </button>

    <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <p
        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2"
      >
        Menu Principal
      </p>

      <a
        v-for="item in menuItems"
        :key="item.route"
        @click="navigate(item.route)"
        class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium group relative overflow-hidden"
        :class="
          isActive(item.route)
            ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        "
      >
        <div
          v-if="isActive(item.route)"
          class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500 rounded-r-full"
        />
        <i
          :class="[
            item.icon,
            'text-lg transition-transform group-hover:scale-110 duration-200',
            isActive(item.route)
              ? 'text-sky-600'
              : 'text-slate-400 group-hover:text-slate-600',
          ]"
        />
        <span>{{ item.label }}</span>
      </a>

      <template v-if="isDiretorOuAcima">
        <p
          class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mt-5 mb-2"
        >
          Administração
        </p>
        <a
          @click="navigate('/admin/usuarios')"
          class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium group relative overflow-hidden"
          :class="
            isActive('/admin')
              ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          "
        >
          <div
            v-if="isActive('/admin')"
            class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500 rounded-r-full"
          />
          <i
            :class="[
              'pi pi-users text-lg transition-transform group-hover:scale-110 duration-200',
              isActive('/admin')
                ? 'text-sky-600'
                : 'text-slate-400 group-hover:text-slate-600',
            ]"
          />
          <span>Usuários</span>
        </a>
        <a
          @click="navigate('/students')"
          class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-medium group relative overflow-hidden"
          :class="
            isActive('/students')
              ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          "
        >
          <div
            v-if="isActive('/students')"
            class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-sky-500 rounded-r-full"
          />
          <i
            :class="[
              'pi pi-user-plus text-lg transition-transform group-hover:scale-110 duration-200',
              isActive('/students')
                ? 'text-sky-600'
                : 'text-slate-400 group-hover:text-slate-600',
            ]"
          />
          <span>Alunos</span>
        </a>
      </template>
    </div>

    <div class="px-3 pb-4 pt-2 border-t border-slate-50 shrink-0 space-y-0.5">
      <a
        @click="navigate('/guia')"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 font-medium group"
        :class="
          isActive('/guia')
            ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
        "
      >
        <i
          :class="[
            'pi pi-book text-base transition-transform group-hover:scale-110 duration-200',
            isActive('/guia')
              ? 'text-sky-600'
              : 'text-slate-400 group-hover:text-slate-600',
          ]"
        />
        <span class="text-sm">Guia de Uso</span>
      </a>

      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group cursor-pointer"
      >
        <i
          class="pi pi-sign-out text-base group-hover:scale-110 transition-transform duration-200"
        />
        <div class="flex flex-col items-start">
          <span class="font-bold text-sm">Sair</span>
          <span class="text-[10px] opacity-70">Encerrar sessão</span>
        </div>
      </button>
    </div>
  </nav>
</template>
