import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { TurmaDTO, CadastroTurmaDTO } from '@/core/types/api'

export const useClassesStore = defineStore('classes', () => {
  const classes = ref<TurmaDTO[]>([])
  const loading = ref(false)

  async function fetchClasses() {
    loading.value = true
    try {
      const response = await api.get('/api/turmas')
      classes.value = response.data
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    } finally {
      loading.value = false
    }
  }

  async function createClass(payload: CadastroTurmaDTO) {
    loading.value = true
    try {
      await api.post('/api/turmas', payload)
      await fetchClasses()
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao criar turma:', error)

      const data = error.response?.data
      let msg = 'Erro ao processar a requisição'

      if (data) {
        if (data.message) {
          msg = data.message
        } else if (data.erros && Array.isArray(data.erros)) {
          msg = data.erros.map((e: any) => `${e.campo}: ${e.erro}`).join(', ')
        } else if (typeof data === 'string') {
          msg = data
        }
      }

      return {
        success: false,
        error: msg,
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchAlunosTurma(uuid: string) {
    try {
      const response = await api.get(`/api/turmas/${uuid}/alunos`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error)
      return []
    }
  }

  async function fetchAlunosSemTurma() {
    try {
      const response = await api.get('/api/turmas/alunos/sem-turma')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar alunos sem turma:', error)
      return []
    }
  }

  async function updateProfessorTurma(uuid: string, professorId: string) {
    try {
      await api.patch(`/api/turmas/${uuid}/professor`, { professorId })
      await fetchClasses()
    } catch (error) {
      console.error('Erro ao atualizar professor da turma:', error)
      throw error
    }
  }

  async function addAlunoTurma(turmaUuid: string, alunoUuid: string) {
    try {
      await api.post(`/api/turmas/${turmaUuid}/alunos/${alunoUuid}`)
    } catch (error) {
      console.error('Erro ao adicionar aluno à turma:', error)
      throw error
    }
  }

  async function transferAlunoTurma(
    turmaAtualUuid: string,
    alunoUuid: string,
    novaTurmaUuid: string
  ) {
    try {
      await api.patch(
        `/api/turmas/${turmaAtualUuid}/alunos/${alunoUuid}/transferir`,
        { novaTurmaId: novaTurmaUuid }
      )
    } catch (error) {
      console.error('Erro ao transferir aluno:', error)
      throw error
    }
  }

  async function deleteClass(uuid: string) {
    loading.value = true
    try {
      await api.delete(`/api/turmas/${uuid}`)
      classes.value = classes.value.filter((t) => t.uuid !== uuid)
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir',
      }
    } finally {
      loading.value = false
    }
  }

  async function removeStudentFromClass(turmaUuid: string, alunoUuid: string) {
    loading.value = true
    try {
      await api.delete(`/api/turmas/${turmaUuid}/alunos/${alunoUuid}`)
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao remover aluno da turma:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao remover aluno',
      }
    } finally {
      loading.value = false
    }
  }

  return {
    classes,
    loading,
    fetchClasses,
    createClass,
    deleteClass,
    removeStudentFromClass,
    fetchAlunosTurma,
    fetchAlunosSemTurma,
    updateProfessorTurma,
    addAlunoTurma,
    transferAlunoTurma,
  }
})
