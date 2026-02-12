import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'

export const useAssessmentsStore = defineStore('assessments', () => {
  const loading = ref(false)
  const skills = ref<any[]>([])

  async function fetchSkills(nivelId: string) {
    loading.value = true
    try {
      const res = await api.get(`/api/niveis/${nivelId}/habilidades`)
      skills.value = res.data
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function submitEvaluation(turmaId: string, evaluations: any[]) {
    loading.value = true
    try {
      const payload = {
        turmaId: turmaId,
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
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return { loading, skills, fetchSkills, submitEvaluation }
})
