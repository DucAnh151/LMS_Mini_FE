/**
 * Format date string from yyyy-MM-dd to dd/MM/yyyy
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

/**
 * Format price to VND
 */
export function formatPrice(price) {
  if (price == null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Format seconds to readable duration (e.g. "1h 30m")
 */
export function formatDuration(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  let parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 && h === 0) parts.push(`${s}s`)
  return parts.join(' ') || '0s'
}

/**
 * Download a blob response as an Excel file
 */
export function downloadExcel(response, filename) {
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Build FormData from object, handling files and arrays
 */
export function buildFormData(data) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value == null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item)
        } else {
          formData.append(key, item)
        }
      })
    } else if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, value)
    }
  })
  return formData
}

/**
 * Gender label map
 */
export const genderLabels = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác'
}

/**
 * Course level label map
 */
export const levelLabels = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao'
}

/**
 * Level tag type map
 */
export const levelTagType = {
  BEGINNER: 'success',
  INTERMEDIATE: 'warning',
  ADVANCED: 'danger'
}

/**
 * Status tag type map
 */
export const statusTagType = {
  ACTIVE: 'success',
  DELETE: 'danger'
}

/**
 * Lesson type labels
 */
export const lessonTypeLabels = {
  VIDEO: 'Video',
  DOCUMENT: 'Tài liệu',
  QUIZ: 'Quiz'
}
