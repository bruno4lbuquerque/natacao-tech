import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { DashboardDTO } from '@/core/types/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardDTO>({
    totalTurmas: 0,
    totalAlunos: 0,
    turmasDeHoje: [],
    todasMinhasTurmas: [],
  })

  const loading = ref(false)

  async function fetchDashboard() {
    loading.value = true
    try {
      const response = await api.get('/api/dashboard')
      stats.value = response.data
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchEstatisticas() {
    try {
      const response = await api.get('/api/dashboard/estatisticas')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error)
      throw error
    }
  }

  return { stats, loading, fetchDashboard, fetchEstatisticas }
})
