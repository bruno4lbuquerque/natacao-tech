import api from '@/core/services/api'

async function createHabilidade(payload: any) {
  try {
    await api.post('/api/habilidades', payload)
  } catch (error) {
    console.error('Erro ao criar habilidade:', error)
    throw error
  }
}

async function updateHabilidade(uuid: string, payload: any) {
  try {
    await api.put(`/api/habilidades/${uuid}`, payload)
  } catch (error) {
    console.error('Erro ao atualizar habilidade:', error)
    throw error
  }
}

async function deleteHabilidade(uuid: string) {
  try {
    await api.delete(`/api/habilidades/${uuid}`)
  } catch (error) {
    console.error('Erro ao excluir habilidade:', error)
    throw error
  }
}

export { createHabilidade, updateHabilidade, deleteHabilidade }
