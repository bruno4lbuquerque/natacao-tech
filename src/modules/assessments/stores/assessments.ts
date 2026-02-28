import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { HabilidadeDTO } from '@/core/types/api'

export const useAssessmentsStore = defineStore('assessments', () => {
  const skills = ref<HabilidadeDTO[]>([])
  const loading = ref(false)

  async function fetchSkills(nivelUuid: string) {
    loading.value = true
    try {
      const response = await api.get(`/api/niveis/${nivelUuid}/habilidades`)
      skills.value = response.data
    } catch (error) {
      console.error('Erro ao buscar habilidades:', error)
      skills.value = []
    } finally {
      loading.value = false
    }
  }

  async function downloadAvaliacaoPdf(historicoUuid: string) {
    try {
      const response = await api.get(`/api/avaliacoes/${historicoUuid}/pdf`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `avaliacao-${historicoUuid}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      throw error
    }
  }

  async function submitEvaluation(turmaUuid: string, evaluations: any[]) {
    loading.value = true
    try {
      const payload = {
        turmaId: turmaUuid,
        avaliacoes: evaluations.map((ev) => ({
          alunoId: ev.studentId,
          habilidadesAprovadasIds: ev.approvedSkills,
          observacao: ev.feedback,
          promoverManual: ev.promoted,
        })),
      }

      await api.post('/api/avaliacoes/lote', payload)

      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    skills,
    loading,
    fetchSkills,
    submitEvaluation,
    downloadAvaliacaoPdf,
  }
})
