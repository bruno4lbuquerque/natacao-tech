import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/core/services/api'

interface JwtPayload {
  sub?: string
  role?: string
  exp?: number
  iat?: number
}

const ROLES_VALIDAS = ['ADMIN', 'DIRETOR', 'COORDENADOR', 'PROFESSOR'] as const
type RoleValida = (typeof ROLES_VALIDAS)[number]

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  const CLOCK_SKEW_SECONDS = 60
  return payload.exp < nowSeconds - CLOCK_SKEW_SECONDS
}

function sanitizarRole(role: string | null): RoleValida | null {
  if (!role) return null
  return (ROLES_VALIDAS as readonly string[]).includes(role)
    ? (role as RoleValida)
    : null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<string | null>(null)
  const role = ref<RoleValida | null>(null)
  const loading = ref(false)
  const router = useRouter()

  const userRole = computed(() => role.value)
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isDiretor = computed(
    () => role.value === 'ADMIN' || role.value === 'DIRETOR'
  )
  const isCoordenador = computed(
    () =>
      role.value === 'ADMIN' ||
      role.value === 'DIRETOR' ||
      role.value === 'COORDENADOR'
  )

  function checkAuth() {
    const storedToken = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    const storedUser = localStorage.getItem('user')

    if (!storedToken || isTokenExpired(storedToken)) {
      _limparSessao()
      return
    }

    token.value = storedToken
    user.value = storedUser
    role.value = sanitizarRole(storedRole)
  }

  async function signIn(email: string, pass: string) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', {
        login: email,
        password: pass,
      })

      const tokenRecebido: string = response.data.token
      if (!tokenRecebido) {
        return { success: false, error: 'Resposta inválida do servidor.' }
      }

      const payload = decodeJwtPayload(tokenRecebido)
      const roleDoToken = sanitizarRole(payload?.role ?? null)

      localStorage.setItem('token', tokenRecebido)
      localStorage.setItem('user', email)
      if (roleDoToken) localStorage.setItem('role', roleDoToken)

      token.value = tokenRecebido
      user.value = email
      role.value = roleDoToken

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
    _limparSessao()
    router.push('/login')
  }

  function _limparSessao() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    token.value = null
    user.value = null
    role.value = null
  }

  async function alterarSenha(payload: any) {
    try {
      await api.put('/api/usuarios/alterar-senha', payload)
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }

  async function promoverDiretor(uuid: string) {
    try {
      await api.patch(`/api/usuarios/${uuid}/promover-diretor`)
    } catch (error) {
      console.error('Erro ao promover diretor:', error)
      throw error
    }
  }

  async function rebaixarUsuario(uuid: string) {
    try {
      await api.patch(`/api/usuarios/${uuid}/rebaixar-usuario`)
    } catch (error) {
      console.error('Erro ao rebaixar usuário:', error)
      throw error
    }
  }

  return {
    user,
    token,
    role,
    loading,
    userRole,
    isAdmin,
    isDiretor,
    isCoordenador,
    checkAuth,
    signIn,
    signOut,
    alterarSenha,
    promoverDiretor,
    rebaixarUsuario,
  }
})
