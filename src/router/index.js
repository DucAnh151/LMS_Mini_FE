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
          meta: { title: 'Học viên' }
        },
        {
          path: 'courses',
          name: 'Courses',
          component: () => import('@/views/course/CourseList.vue'),
          meta: { title: 'Khóa học' }
        },
        {
          path: 'courses/:courseId/lessons',
          name: 'Lessons',
          component: () => import('@/views/lesson/LessonList.vue'),
          meta: { title: 'Bài học' }
        },
        {
          path: 'enrollments',
          name: 'Enrollments',
          component: () => import('@/views/enrollment/EnrollmentManager.vue'),
          meta: { title: 'Đăng ký' }
        }
      ]
    }
  ]
})

export default router
