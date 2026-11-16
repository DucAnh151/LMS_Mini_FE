import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Trang chủ công khai (có header + footer riêng, không dùng sidebar admin)
      path: '/',
      name: 'Home',
      component: () => import('@/views/home/HomeView.vue')
    },
    {
      // Khu vực quản lý — dùng AdminLayout (sidebar). Các đường dẫn module
      // giữ nguyên bằng cách khai báo tuyệt đối nên không cần sửa link cũ.
      path: '/app',
      component: AdminLayout,
      children: [
        {
          path: '/students',
          name: 'Students',
          component: () => import('@/views/student/StudentList.vue'),
          meta: { titleKey: 'nav.students' }
        },
        {
          path: '/students/:studentId',
          name: 'StudentDetail',
          component: () => import('@/views/student/StudentDetail.vue'),
          meta: { titleKey: 'students.detail' }
        },
        {
          path: '/courses',
          name: 'Courses',
          component: () => import('@/views/course/CourseList.vue'),
          meta: { titleKey: 'nav.courses' }
        },
        {
          path: '/courses/:courseId/lessons',
          name: 'Lessons',
          component: () => import('@/views/lesson/LessonList.vue'),
          meta: { titleKey: 'nav.lessons' }
        },
        {
          path: '/enrollments',
          name: 'Enrollments',
          component: () => import('@/views/enrollment/EnrollmentManager.vue'),
          meta: { titleKey: 'nav.enrollments' }
        }
      ]
    }
  ]
})

export default router
