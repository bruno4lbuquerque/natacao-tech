import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'

export interface Student {
  id: string
  name: string
  age: number
  level: string
  classIds: string[]
  turmaId?: string | null
  nomeTurma?: string
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

      students.value = data.map((a: any) => ({
        id: a.uuid,
        name: a.nome,
        age: a.idade ?? 0,
        level: a.nivelAtual || 'Sem nível',
        turmaId: a.turmaId || null,
        nomeTurma: a.nomeTurma,
        classIds: [],
        status: a.ativo !== false ? 'active' : 'inactive',
        contact: a.telefone || '',
      }))
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      students.value = []
    } finally {
      loading.value = false
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

      if (payload.novaTurmaId) {
        await api.patch(`/api/alunos/${id}/transferencia`, {
          novaTurmaId: payload.novaTurmaId,
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
  }
})
