import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getTranslation } from '@/utils/i18n'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // If response is a blob (file download), return directly
    if (response.config.responseType === 'blob') {
      return response
    }
    return res
  },
  (error) => {
    const { response } = error
    if (response) {
      const { data } = response
      const message = data?.message || getErrorMessage(response.status)
      ElMessage.error(message)
    } else {
      ElMessage.error(getTranslation('error.network'))
    }
    return Promise.reject(error)
  }
)

function getErrorMessage(status) {
  const key = `error.${status}`
  const translated = getTranslation(key)
  // If translation returns the key itself, provide a generic fallback
  if (translated === key) {
    return `${getTranslation('msg.error')}: ${status}`
  }
  return translated
}

export default request
