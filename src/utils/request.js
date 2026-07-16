import axios from 'axios'
import { ElMessage } from 'element-plus'

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
      ElMessage.error('Lỗi kết nối đến server')
    }
    return Promise.reject(error)
  }
)

function getErrorMessage(status) {
  const messages = {
    400: 'Dữ liệu không hợp lệ',
    404: 'Không tìm thấy dữ liệu',
    409: 'Dữ liệu bị trùng lặp',
    500: 'Lỗi hệ thống'
  }
  return messages[status] || `Lỗi: ${status}`
}

export default request
