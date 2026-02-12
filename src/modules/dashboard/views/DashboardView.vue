<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/modules/dashboard/stores/dashboard'
import { formatDays } from '@/core/utils/formatters' // <--- 1. IMPORTANTE: Importar o formatador

const store = useDashboardStore()

onMounted(() => {
  store.fetchDashboard()
})
</script>

<template>
  <div v-if="store.loading" class="flex justify-center p-10">
    <i class="pi pi-spin pi-spinner text-4xl text-brand-500"></i>
  </div>

  <div v-else class="space-y-8">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
          Olá, Professor(a)! 👋
        </h1>
        <p class="text-gray-500">Resumo da sua academia.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 p-4 opacity-10">
          <i class="pi pi-users text-6xl text-brand-600"></i>
        </div>
        <div
          class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4"
        >
          <i class="pi pi-users text-xl"></i>
        </div>
        <span class="block text-gray-500 text-sm font-medium"
          >Total de Alunos</span
        >
        <span class="block text-3xl font-bold text-gray-800 mt-1">{{
          store.stats.totalAlunos
        }}</span>
      </div>

      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 p-4 opacity-10">
          <i class="pi pi-calendar text-6xl text-orange-600"></i>
        </div>
        <div
          class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4"
        >
          <i class="pi pi-calendar text-xl"></i>
        </div>
        <span class="block text-gray-500 text-sm font-medium"
          >Minhas Turmas</span
        >
        <span class="block text-3xl font-bold text-gray-800 mt-1">{{
          store.stats.totalTurmas
        }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div
        class="lg:col-span-2 bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div class="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h2 class="text-3xl font-bold mb-2">Hora da Avaliação?</h2>
            <p class="text-blue-100 mb-6 max-w-md">
              Selecione uma turma para começar a avaliar os alunos.
            </p>
          </div>
          <button
            @click="$router.push('/assessments')"
            class="w-max bg-white text-brand-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg flex items-center gap-2"
          >
            <i class="pi pi-play"></i>
            Iniciar Avaliação
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 text-lg mb-4">Aulas de Hoje</h3>

        <div
          v-if="store.stats.turmasDeHoje.length === 0"
          class="text-gray-400 text-sm text-center py-4"
        >
          Nenhuma aula agendada para hoje.
        </div>

        <div class="space-y-4">
          <div
            v-for="turma in store.stats.turmasDeHoje"
            :key="turma.uuid"
            class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
          >
            <div class="text-center min-w-[3rem]">
              <span class="block text-gray-800 font-bold">{{
                turma.horario
              }}</span>
            </div>

            <div class="w-1 h-10 bg-brand-200 rounded-full"></div>

            <div>
              <h4 class="font-bold text-gray-700 text-sm">{{ turma.nome }}</h4>
              <p class="text-xs text-gray-500">
                {{ turma.nivelAlvo?.nome || 'Multinível' }}
              </p>

              <div class="flex gap-1 mt-1">
                <span
                  v-for="day in formatDays(turma.diasSemana)"
                  :key="day"
                  class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {{ day }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
