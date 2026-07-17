import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      redirect: '/students',
      children: [
        {
          path: 'students',
          name: 'Students',
          component: () => import('@/views/student/StudentList.vue'),
          meta: { titleKey: 'nav.students' }
        },
        {
          path: 'students/:studentId',
          name: 'StudentDetail',
          component: () => import('@/views/student/StudentDetail.vue'),
          meta: { titleKey: 'students.detail' }
        },
        {
          path: 'courses',
          name: 'Courses',
          component: () => import('@/views/course/CourseList.vue'),
          meta: { titleKey: 'nav.courses' }
        },
        {
          path: 'courses/:courseId/lessons',
          name: 'Lessons',
          component: () => import('@/views/lesson/LessonList.vue'),
          meta: { titleKey: 'nav.lessons' }
        },
        {
          path: 'enrollments',
          name: 'Enrollments',
          component: () => import('@/views/enrollment/EnrollmentManager.vue'),
          meta: { titleKey: 'nav.enrollments' }
        }
      ]
    }
  ]
})

export default router
