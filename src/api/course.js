import request from '@/utils/request'

export function getCourses(params) {
  return request.get('/courses', { params })
}

export function getCourse(id) {
  return request.get(`/courses/${id}`)
}

export function createCourse(formData) {
  return request.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateCourse(id, formData) {
  return request.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteCourse(id) {
  return request.delete(`/courses/${id}`)
}

export function restoreCourse(id) {
  return request.patch(`/courses/${id}/restore`)
}

export function getCourseStudents(courseId, params) {
  return request.get(`/courses/${courseId}/students`, { params })
}

export function exportCourses(params) {
  return request.get('/courses/export', {
    params,
    responseType: 'blob'
  })
}
