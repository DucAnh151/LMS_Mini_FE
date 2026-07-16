import request from '@/utils/request'

export function getLessons(courseId) {
  return request.get(`/courses/${courseId}/lessons`)
}

export function getLesson(id) {
  return request.get(`/lessons/${id}`)
}

export function createLesson(courseId, formData) {
  return request.post(`/courses/${courseId}/lessons`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateLesson(id, formData) {
  return request.put(`/lessons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function deleteLesson(id) {
  return request.delete(`/lessons/${id}`)
}

export function restoreLesson(id) {
  return request.patch(`/lessons/${id}/restore`)
}
