import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/services/api'
import type { AlunoDTO } from '@/core/types/api'

export const useStudentsStore = defineStore('students', () => {
  const students = ref<AlunoDTO[]>([])
  const loading = ref(false)

  async function fetchStudents() {
    loading.value = true
    try {
      const response = await api.get('/api/alunos')
      students.value = mapJavaAlunosToFront(response.data)
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchStudentsByClass(turmaUuid: string) {
    loading.value = true
    try {
      const response = await api.get(`/api/turmas/${turmaUuid}/alunos`)
      students.value = mapJavaAlunosToFront(response.data)
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error)
      students.value = []
    } finally {
      loading.value = false
    }
  }

  async function transferStudent(studentId: string, newClassId: string) {
    try {
      await api.patch(`/api/alunos/${studentId}`, {
        turmaId: newClassId,
      })
      await fetchStudents()
      return { success: true }
    } catch (error) {
      console.error('Erro ao transferir aluno:', error)
      return { success: false, error }
    }
  }

  function mapJavaAlunosToFront(data: any[]): AlunoDTO[] {
    return data.map((aluno: any) => ({
      id: aluno.uuid,
      name: aluno.nome,
      class_code: aluno.nomeTurma || 'Sem Turma',
      level: aluno.corTouca || 'N/A',
      active: true,
    }))
  }

  return {
    students,
    loading,
    fetchStudents,
    fetchStudentsByClass,
    transferStudent,
  }
})
