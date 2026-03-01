import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'

export interface Student {
  id: string
  name: string
  age: number
  nivelId: string
  level: string
  turmas: string[]
  status: 'active' | 'inactive'
  contact: string
}

export const useStudentsStore = defineStore('students', () => {
  const students = ref<Student[]>([])
  const loading = ref(false)

  async function fetchStudents() {
    loading.value = true
    try {
      const response = await api.get('/api/alunos')
      const data = response.data?.content || response.data || []
      if (!Array.isArray(data)) {
        students.value = []
        return
      }

      students.value = data.map((a: any) => {
        let listaTurmas: string[] = []
        if (Array.isArray(a.turmas)) {
          listaTurmas = a.turmas
        } else if (Array.isArray(a.nomesTurmas)) {
          listaTurmas = a.nomesTurmas
        } else if (typeof a.turmas === 'string' && a.turmas.trim() !== '') {
          listaTurmas = a.turmas.split(',').map((t: string) => t.trim())
        }

        return {
          id: a.uuid,
          name: a.nome,
          age: a.idade || 0,
          nivelId: a.nivelUuid || '',
          level: a.nivelNome || a.nivelAtual || 'Sem nível',
          turmas: listaTurmas,
          status: a.ativo !== false ? 'active' : 'inactive',
          contact: a.telefone || '',
        }
      })
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      students.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMeusAlunos() {
    loading.value = true
    try {
      const response = await api.get('/api/alunos/meus-alunos')
      const data = response.data?.content || response.data || []

      students.value = data.map((a: any) => {
        let listaTurmas: string[] = []
        if (Array.isArray(a.turmas)) listaTurmas = a.turmas
        else if (Array.isArray(a.nomesTurmas)) listaTurmas = a.nomesTurmas
        else if (typeof a.turmas === 'string' && a.turmas.trim() !== '') {
          listaTurmas = a.turmas.split(',').map((t: string) => t.trim())
        }

        return {
          id: a.uuid,
          name: a.nome,
          age: a.idade || 0,
          nivelId: a.nivelUuid || '',
          level: a.nivelNome || a.nivelAtual || 'Sem nível',
          turmas: listaTurmas,
          status: a.ativo !== false ? 'active' : 'inactive',
          contact: a.telefone || '',
        }
      })
    } catch (error) {
      console.error('Erro ao buscar meus alunos:', error)
      students.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchHistoricoAluno(uuid: string) {
    try {
      const response = await api.get(`/api/alunos/${uuid}/historico`)
      return response.data?.content || response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico do aluno:', error)
      return []
    }
  }

  async function addStudent(payload: any) {
    try {
      await api.post('/api/alunos', payload)
      await fetchStudents()
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
      throw error
    }
  }

  async function updateStudent(id: string, payload: any) {
    try {
      await api.put(`/api/alunos/${id}`, payload)

      if (payload.novasTurmasIds !== undefined) {
        await api.patch(`/api/alunos/${id}/transferencia`, {
          novasTurmasIds: payload.novasTurmasIds,
        })
      }
      await fetchStudents()
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error)
      throw error
    }
  }

  async function deleteStudent(id: string) {
    try {
      await api.delete(`/api/alunos/${id}`)
      students.value = students.value.filter((s) => s.id !== id)
    } catch (error) {
      console.error('Erro ao excluir aluno:', error)
    }
  }

  return {
    students,
    loading,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    fetchMeusAlunos,
    fetchHistoricoAluno,
  }
})
