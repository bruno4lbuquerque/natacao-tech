import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { NivelDTO } from '@/core/types/api'

export const useLevelsStore = defineStore('levels', () => {
  const levels = ref<NivelDTO[]>([])
  const loading = ref(false)
  const fetchError = ref<string | null>(null)

  async function fetchLevels() {
    if (levels.value.length > 0 && !fetchError.value) return

    loading.value = true
    fetchError.value = null
    try {
      const response = await api.get<NivelDTO[]>('/api/niveis')
      levels.value = Array.isArray(response.data) ? response.data : []
    } catch (error: any) {
      const status = error?.response?.status
      const msg =
        status === 403
          ? 'Sem permissão para carregar níveis.'
          : 'Falha ao carregar níveis.'
      fetchError.value = msg
      console.error('fetchLevels:', msg, error)
      window.dispatchEvent(new CustomEvent('levels-error', { detail: msg }))
    } finally {
      loading.value = false
    }
  }

  async function refetchLevels() {
    levels.value = []
    fetchError.value = null
    await fetchLevels()
  }

  async function createNivel(payload: any) {
    await api.post('/api/niveis', payload)
    await refetchLevels()
  }

  async function updateNivel(uuid: string, payload: any) {
    await api.put(`/api/niveis/${uuid}`, payload)
    await refetchLevels()
  }

  return {
    levels,
    loading,
    fetchError,
    fetchLevels,
    refetchLevels,
    updateNivel,
    createNivel,
  }
})
