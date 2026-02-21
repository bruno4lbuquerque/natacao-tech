import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/core/services/api'

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<string | null>(localStorage.getItem('user'))
  const role = ref<string | null>(localStorage.getItem('role'))
  const loading = ref(false)
  const router = useRouter()

  const userRole = computed(() => role.value)
  const isAdmin = computed(() => role.value === 'ADMIN')

  function checkAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      role.value = localStorage.getItem('role')
    } else {
      token.value = null
      role.value = null
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
      const jwtPayload = decodeJwtPayload(tokenRecebido)
      const userRoleFromToken = jwtPayload?.role ?? null

      localStorage.setItem('token', tokenRecebido)
      localStorage.setItem('user', email)
      if (userRoleFromToken) {
        localStorage.setItem('role', userRoleFromToken)
      }

      token.value = tokenRecebido
      user.value = email
      role.value = userRoleFromToken

      return { success: true }
    } catch (error: any) {
      const status = error.response?.status
      let msg = 'Não foi possível conectar ao servidor. Tente novamente.'
      if (status === 401 || status === 403) {
        msg =
          'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
      } else if (status === 429) {
        msg = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
      }
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  function signOut() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    token.value = null
    user.value = null
    role.value = null
    router.push('/login')
  }

  return {
    user,
    token,
    role,
    loading,
    userRole,
    isAdmin,
    checkAuth,
    signIn,
    signOut,
  }
})
