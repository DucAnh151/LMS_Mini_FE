import request from '@/utils/request'

export function createEnrollment(formData) {
  return request.post('/enrollments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateEnrollment(id, newCourseId) {
  return request.put(`/enrollments/${id}`, null, {
    params: { newCourseId }
  })
}

export function deleteEnrollment(id) {
  return request.delete(`/enrollments/${id}`)
}

export function bulkDeleteEnrollments(ids) {
  return request.delete('/enrollments/bulk-delete', {
    params: { ids }
  })
}
