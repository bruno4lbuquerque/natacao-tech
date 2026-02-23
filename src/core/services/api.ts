import axios, { type InternalAxiosRequestConfig } from 'axios'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1500

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 40_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryConfig

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isNetworkError = !error.response && error.code !== 'ERR_CANCELED'

    if ((isTimeout || isNetworkError) && config) {
      config._retryCount = (config._retryCount ?? 0) + 1
      if (config._retryCount <= MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        return api(config)
      }
    }

    return Promise.reject(error)
  }
)

export default api
