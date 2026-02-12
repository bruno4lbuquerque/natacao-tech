import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/core/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<string | null>(localStorage.getItem('user'))
  const loading = ref(false)
  const router = useRouter()

  function checkAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
    } else {
      token.value = null
    }
  }

  async function signIn(email: string, pass: string) {
    loading.value = true

    try {
      const response = await api.post('/auth/login', {
        login: email,
        password: pass,
      })

      const tokenRecebido = response.data.token

      localStorage.setItem('token', tokenRecebido)
      localStorage.setItem('user', email)
      token.value = tokenRecebido
      user.value = email

      return { success: true }
    } catch (error: any) {
      console.error('Erro no login:', error)
      const msg =
        error.response?.status === 403
          ? 'Usuário ou senha inválidos'
          : 'Erro ao conectar com o servidor'

      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  function signOut() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token.value = null
    user.value = null
    router.push('/login')
  }

  return {
    user,
    token,
    loading,
    checkAuth,
    signIn,
    signOut,
  }
})
