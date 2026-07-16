import request from '@/utils/request'

export function getStudents(params) {
  return request.get('/students/all', { params })
}

export function getStudent(id) {
  return request.get(`/students/${id}`)
}

export function createStudent(formData) {
  return request.post('/students', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateStudent(id, formData) {
  return request.put(`/students/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteStudent(id) {
  return request.delete(`/students/${id}`)
}

export function restoreStudent(id) {
  return request.patch(`/students/${id}/restore`)
}

export function getUnregisteredCourses(studentId, params) {
  return request.get(`/students/${studentId}/unregistered-courses`, { params })
}

export function exportStudents(params) {
  return request.get('/students/export', {
    params,
    responseType: 'blob'
  })
}
