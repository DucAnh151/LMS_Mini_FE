import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'

const messages = {
  vi: {
    // Nav
    'nav.students': 'Học viên',
    'nav.courses': 'Khóa học',
    'nav.enrollments': 'Đăng ký',
    'nav.home': 'Trang chủ',
    'nav.lessons': 'Bài học',

    // Page titles
    'students.title': 'Quản lý Học viên',
    'students.subtitle': 'Danh sách tất cả học viên trong hệ thống',
    'courses.title': 'Quản lý Khóa học',
    'courses.subtitle': 'Danh sách tất cả khóa học trong hệ thống',
    'lessons.title': 'Bài học',
    'enrollments.title': 'Đăng ký Khóa học',
    'enrollments.subtitle': 'Quản lý đăng ký khóa học cho học viên',

    // Buttons
    'btn.add': 'Thêm mới',
    'btn.edit': 'Sửa',
    'btn.delete': 'Xóa',
    'btn.save': 'Lưu',
    'btn.cancel': 'Hủy',
    'btn.search': 'Tìm kiếm',
    'btn.reset': 'Đặt lại',
    'btn.export': 'Xuất Excel',
    'btn.back': 'Quay lại',
    'btn.view': 'Xem',
    'btn.restore': 'Khôi phục',
    'btn.close': 'Đóng',
    'btn.update': 'Cập nhật',
    'btn.enroll': 'Đăng ký',
    'btn.transfer': 'Chuyển khóa học',
    'btn.deselect': 'Bỏ chọn',
    'btn.registerNow': 'Đăng ký ngay',
    'btn.addFirstLesson': 'Thêm bài học đầu tiên',
    'btn.find': 'Tìm',
    'btn.setPrimary': 'Đặt chính',
    'btn.play': '▶ Phát',

    // Students
    'students.add': 'Thêm học viên',
    'students.edit': 'Cập nhật học viên',
    'students.detail': 'Chi tiết học viên',
    'students.confirmDelete': 'Xác nhận xóa học viên',
    'students.confirmRestore': 'Khôi phục',
    'students.deleted': 'Đã xóa học viên',
    'students.restored': 'Đã khôi phục học viên',

    // Courses
    'courses.add': 'Thêm khóa học',
    'courses.edit': 'Cập nhật khóa học',
    'courses.viewStudents': 'Xem học viên',
    'courses.deleted': 'Đã xóa khóa học',
    'courses.restored': 'Đã khôi phục khóa học',
    'courses.confirmDelete': 'Xác nhận xóa khóa học "{name}"?',
    'courses.confirmRestore': 'Khôi phục khóa học "{name}"?',
    'courses.deleteTitle': 'Xóa khóa học',
    'courses.restoreTitle': 'Khôi phục',
    'courses.exported': 'Đã tải xuống file Excel',

    // Lessons
    'lessons.add': 'Thêm bài học',
    'lessons.addNew': 'Thêm bài học mới',
    'lessons.edit': 'Cập nhật bài học',
    'lessons.detail': 'Chi tiết bài học',
    'lessons.noLessons': 'Chưa có bài học nào',
    'lessons.deleted': 'Đã xóa mềm bài học',
    'lessons.restored': 'Đã khôi phục bài học',
    'lessons.confirmDelete': 'Xác nhận xóa bài học "{title}"?',
    'lessons.confirmRestore': 'Khôi phục bài học "{title}"?',
    'lessons.addSuccess': 'Thêm bài học thành công',
    'lessons.updateSuccess': 'Cập nhật bài học thành công',
    'lessons.loadError': 'Không thể tải chi tiết bài học (có thể đã bị xóa)',
    'lessons.videoUnsupported': 'Trình duyệt không hỗ trợ phát video.',

    // Lesson form
    'lessonForm.title': 'Tiêu đề',
    'lessonForm.titlePlaceholder': 'Bài 1: Giới thiệu',
    'lessonForm.code': 'Mã bài học',
    'lessonForm.codePlaceholder': 'L001',
    'lessonForm.summary': 'Tóm tắt',
    'lessonForm.summaryPlaceholder': 'Tóm tắt ngắn gọn...',
    'lessonForm.content': 'Nội dung',
    'lessonForm.contentPlaceholder': 'Nội dung chi tiết...',
    'lessonForm.order': 'Thứ tự',
    'lessonForm.duration': 'Thời lượng (giây)',
    'lessonForm.type': 'Loại bài học',
    'lessonForm.typeVideo': 'Video',
    'lessonForm.typeDocument': 'Tài liệu',
    'lessonForm.typeQuiz': 'Quiz',
    'lessonForm.resources': 'Tài nguyên',
    'lessonForm.thumbnails': 'Thumbnails',
    'lessonForm.addImage': 'Thêm ảnh',
    'lessonForm.addVideo': 'Thêm video',
    'lessonForm.addDocument': 'Thêm tài liệu',
    'lessonForm.thumbnailRequired': 'Vui lòng tải lên ít nhất 1 thumbnail',

    // Lesson validation
    'lessonValidate.title': 'Vui lòng nhập tiêu đề',
    'lessonValidate.code': 'Vui lòng nhập mã bài học',
    'lessonValidate.summary': 'Vui lòng nhập tóm tắt',
    'lessonValidate.content': 'Vui lòng nhập nội dung',
    'lessonValidate.order': 'Vui lòng nhập thứ tự',
    'lessonValidate.duration': 'Vui lòng nhập thời lượng',
    'lessonValidate.type': 'Vui lòng chọn loại',

    // Enrollments
    'enrollments.enrolled': 'Đã đăng ký',
    'enrollments.registerNew': 'Đăng ký mới',
    'enrollments.cancelEnroll': 'Hủy đăng ký',
    'enrollments.transfer': 'Chuyển khóa học',
    'enrollments.selectStudent': 'Chọn học viên',
    'enrollments.selectStudentFirst': 'Vui lòng chọn học viên trước',
    'enrollments.noEnrolled': 'Chưa đăng ký khóa học nào',
    'enrollments.cancelSuccess': 'Đã hủy đăng ký thành công',
    'enrollments.cancelConfirm': 'Hủy đăng ký học viên "{name}" khỏi khóa học "{course}"?',
    'enrollments.cancelTitle': 'Hủy đăng ký',
    'enrollments.cancelBtn': 'Hủy đăng ký',
    'enrollments.transferSuccess': 'Chuyển khóa học thành công',
    'enrollments.transferTitle': 'Chuyển khóa học',
    'enrollments.transferFrom': 'Từ khóa học:',
    'enrollments.transferTo': 'Chuyển sang khóa học',
    'enrollments.selectNewCourse': 'Chọn khóa học mới',
    'enrollments.selectCourseWarning': 'Vui lòng chọn khóa học mới',
    'enrollments.enrollSuccess': 'Đăng ký thành công',
    'enrollments.selectCourseFirst': 'Vui lòng chọn ít nhất 1 khóa học',
    'enrollments.student': 'Học viên:',
    'enrollments.enrollCount': 'Đăng ký ({count})',
    'enrollments.notFound': 'Không tìm thấy thông tin đăng ký',
    'enrollments.searchStudent': 'Tìm học viên...',
    'enrollments.noStudentFound': 'Không tìm thấy học viên',
    'enrollments.searchCourse': 'Tìm khóa học...',
    'enrollments.transferCourse': 'Chuyển khóa',

    // Course students drawer
    'courseStudents.title': 'Học viên — {name}',
    'courseStudents.searchPlaceholder': 'Tìm theo tên, email...',

    // Table columns
    'col.id': 'ID',
    'col.avatar': 'Avatar',
    'col.fullName': 'Họ và tên',
    'col.email': 'Email',
    'col.phone': 'SĐT',
    'col.birthDate': 'Ngày sinh',
    'col.gender': 'Giới tính',
    'col.address': 'Địa chỉ',
    'col.status': 'Trạng thái',
    'col.actions': 'Hành động',
    'col.thumbnail': 'Ảnh',
    'col.name': 'Tên',
    'col.code': 'Mã',
    'col.price': 'Giá',
    'col.level': 'Cấp độ',
    'col.enrollDate': 'Ngày ĐK',
    'col.courseName': 'Tên khóa học',
    'col.instructor': 'Giảng viên',
    'col.studentName': 'Tên học viên',
    'col.statusShort': 'TT',

    // Form labels
    'form.fullName': 'Họ và tên',
    'form.identity': 'CCCD/CMND',
    'form.email': 'Email',
    'form.phone': 'Số điện thoại',
    'form.birthDate': 'Ngày sinh',
    'form.gender': 'Giới tính',
    'form.address': 'Địa chỉ',
    'form.avatar': 'Ảnh đại diện',
    'form.courseName': 'Tên khóa học',
    'form.courseCode': 'Mã khóa học',
    'form.description': 'Mô tả',
    'form.price': 'Giá (VNĐ)',
    'form.level': 'Cấp độ',
    'form.duration': 'Thời lượng',
    'form.hours': 'Giờ',
    'form.minutes': 'Phút',
    'form.language': 'Ngôn ngữ',
    'form.instructor': 'Giảng viên',
    'form.thumbnails': 'Thumbnails',
    'form.addThumbnail': 'Thêm ảnh thumbnail',

    // Validation
    'validate.required': 'Trường này là bắt buộc',
    'validate.email': 'Email không hợp lệ',
    'validate.identity': 'CCCD phải là 12 chữ số',
    'validate.phone': 'SĐT phải là 10-11 chữ số',
    'validate.durationRequired': 'Thời lượng phải lớn hơn 0',
    'validate.thumbnailRequired': 'Vui lòng tải lên ít nhất 1 thumbnail',

    // Status
    'status.active': 'Hoạt động',
    'status.deleted': 'Đã xóa',
    'status.activeShort': 'HĐ',
    'status.deletedShort': 'Xóa',

    // Gender
    'gender.male': 'Nam',
    'gender.female': 'Nữ',
    'gender.other': 'Khác',

    // Level
    'level.beginner': 'Cơ bản',
    'level.intermediate': 'Trung cấp',
    'level.advanced': 'Nâng cao',

    // Language
    'lang.vietnamese': 'Tiếng Việt',
    'lang.english': 'English',

    // Messages
    'msg.success': 'Thành công',
    'msg.error': 'Lỗi',
    'msg.confirmDelete': 'Xác nhận xóa',
    'msg.noData': 'Không có dữ liệu',
    'msg.searchPlaceholder': 'Tìm theo tên, email...',
    'msg.searchCourse': 'Tìm theo tên, mã...',
    'msg.exported': 'Đã tải xuống file Excel',
    'msg.uploadImage': 'Tải ảnh lên',
    'msg.removeImage': 'Xóa',
    'msg.fullscreen': 'Toàn màn hình',
    'msg.theme': 'Giao diện',
    'msg.language': 'Ngôn ngữ',

    // Badges
    'badge.primary': 'Chính',
    'badge.new': 'Mới',

    // Lesson types
    'lessonType.video': 'Video',
    'lessonType.document': 'Tài liệu',
    'lessonType.quiz': 'Quiz',

    // Detail
    'detail.createdDate': 'Ngày tạo',
    'detail.updatedDate': 'Ngày cập nhật',
    'detail.personalInfo': 'Thông tin cá nhân',
    'detail.content': 'Nội dung',
    'detail.resources': 'Tài nguyên',
    'detail.videos': 'Videos',
    'detail.documents': 'Tài liệu',
    'detail.downloadDoc': 'Tải tài liệu',

    // Request errors
    'error.400': 'Dữ liệu không hợp lệ',
    'error.404': 'Không tìm thấy dữ liệu',
    'error.409': 'Dữ liệu bị trùng lặp',
    'error.500': 'Lỗi hệ thống',
    'error.network': 'Lỗi kết nối đến server',
  },
  en: {
    // Nav
    'nav.students': 'Students',
    'nav.courses': 'Courses',
    'nav.enrollments': 'Enrollments',
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',

    // Page titles
    'students.title': 'Student Management',
    'students.subtitle': 'All students in the system',
    'courses.title': 'Course Management',
    'courses.subtitle': 'All courses in the system',
    'lessons.title': 'Lessons',
    'enrollments.title': 'Course Enrollment',
    'enrollments.subtitle': 'Manage course enrollments for students',

    // Buttons
    'btn.add': 'Add New',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.search': 'Search',
    'btn.reset': 'Reset',
    'btn.export': 'Export Excel',
    'btn.back': 'Go Back',
    'btn.view': 'View',
    'btn.restore': 'Restore',
    'btn.close': 'Close',
    'btn.update': 'Update',
    'btn.enroll': 'Enroll',
    'btn.transfer': 'Transfer Course',
    'btn.deselect': 'Deselect',
    'btn.registerNow': 'Enroll Now',
    'btn.addFirstLesson': 'Add First Lesson',
    'btn.find': 'Find',
    'btn.setPrimary': 'Set Primary',
    'btn.play': '▶ Play',

    // Students
    'students.add': 'Add Student',
    'students.edit': 'Update Student',
    'students.detail': 'Student Details',
    'students.confirmDelete': 'Confirm delete student',
    'students.confirmRestore': 'Restore',
    'students.deleted': 'Student deleted',
    'students.restored': 'Student restored',

    // Courses
    'courses.add': 'Add Course',
    'courses.edit': 'Update Course',
    'courses.viewStudents': 'View Students',
    'courses.deleted': 'Course deleted',
    'courses.restored': 'Course restored',
    'courses.confirmDelete': 'Delete course "{name}"?',
    'courses.confirmRestore': 'Restore course "{name}"?',
    'courses.deleteTitle': 'Delete Course',
    'courses.restoreTitle': 'Restore',
    'courses.exported': 'Excel file downloaded',

    // Lessons
    'lessons.add': 'Add Lesson',
    'lessons.addNew': 'Add New Lesson',
    'lessons.edit': 'Update Lesson',
    'lessons.detail': 'Lesson Details',
    'lessons.noLessons': 'No lessons yet',
    'lessons.deleted': 'Lesson soft-deleted',
    'lessons.restored': 'Lesson restored',
    'lessons.confirmDelete': 'Delete lesson "{title}"?',
    'lessons.confirmRestore': 'Restore lesson "{title}"?',
    'lessons.addSuccess': 'Lesson added successfully',
    'lessons.updateSuccess': 'Lesson updated successfully',
    'lessons.loadError': 'Unable to load lesson details (may have been deleted)',
    'lessons.videoUnsupported': 'Your browser does not support video playback.',

    // Lesson form
    'lessonForm.title': 'Title',
    'lessonForm.titlePlaceholder': 'Lesson 1: Introduction',
    'lessonForm.code': 'Lesson Code',
    'lessonForm.codePlaceholder': 'L001',
    'lessonForm.summary': 'Summary',
    'lessonForm.summaryPlaceholder': 'Brief summary...',
    'lessonForm.content': 'Content',
    'lessonForm.contentPlaceholder': 'Detailed content...',
    'lessonForm.order': 'Order',
    'lessonForm.duration': 'Duration (seconds)',
    'lessonForm.type': 'Lesson Type',
    'lessonForm.typeVideo': 'Video',
    'lessonForm.typeDocument': 'Document',
    'lessonForm.typeQuiz': 'Quiz',
    'lessonForm.resources': 'Resources',
    'lessonForm.thumbnails': 'Thumbnails',
    'lessonForm.addImage': 'Add Image',
    'lessonForm.addVideo': 'Add Video',
    'lessonForm.addDocument': 'Add Document',
    'lessonForm.thumbnailRequired': 'Please upload at least 1 thumbnail',

    // Lesson validation
    'lessonValidate.title': 'Please enter a title',
    'lessonValidate.code': 'Please enter a lesson code',
    'lessonValidate.summary': 'Please enter a summary',
    'lessonValidate.content': 'Please enter content',
    'lessonValidate.order': 'Please enter the order',
    'lessonValidate.duration': 'Please enter the duration',
    'lessonValidate.type': 'Please select a type',

    // Enrollments
    'enrollments.enrolled': 'Enrolled',
    'enrollments.registerNew': 'New Enrollment',
    'enrollments.cancelEnroll': 'Cancel Enrollment',
    'enrollments.transfer': 'Transfer Course',
    'enrollments.selectStudent': 'Select Student',
    'enrollments.selectStudentFirst': 'Please select a student first',
    'enrollments.noEnrolled': 'No courses enrolled yet',
    'enrollments.cancelSuccess': 'Enrollment cancelled successfully',
    'enrollments.cancelConfirm': 'Cancel enrollment of "{name}" from course "{course}"?',
    'enrollments.cancelTitle': 'Cancel Enrollment',
    'enrollments.cancelBtn': 'Cancel Enrollment',
    'enrollments.transferSuccess': 'Course transferred successfully',
    'enrollments.transferTitle': 'Transfer Course',
    'enrollments.transferFrom': 'From course:',
    'enrollments.transferTo': 'Transfer to course',
    'enrollments.selectNewCourse': 'Select new course',
    'enrollments.selectCourseWarning': 'Please select a new course',
    'enrollments.enrollSuccess': 'Enrollment successful',
    'enrollments.selectCourseFirst': 'Please select at least 1 course',
    'enrollments.student': 'Student:',
    'enrollments.enrollCount': 'Enroll ({count})',
    'enrollments.notFound': 'Enrollment information not found',
    'enrollments.searchStudent': 'Search student...',
    'enrollments.noStudentFound': 'No students found',
    'enrollments.searchCourse': 'Search course...',
    'enrollments.transferCourse': 'Transfer',

    // Course students drawer
    'courseStudents.title': 'Students — {name}',
    'courseStudents.searchPlaceholder': 'Search by name, email...',

    // Table columns
    'col.id': 'ID',
    'col.avatar': 'Avatar',
    'col.fullName': 'Full Name',
    'col.email': 'Email',
    'col.phone': 'Phone',
    'col.birthDate': 'Birth Date',
    'col.gender': 'Gender',
    'col.address': 'Address',
    'col.status': 'Status',
    'col.actions': 'Actions',
    'col.thumbnail': 'Image',
    'col.name': 'Name',
    'col.code': 'Code',
    'col.price': 'Price',
    'col.level': 'Level',
    'col.enrollDate': 'Enroll Date',
    'col.courseName': 'Course Name',
    'col.instructor': 'Instructor',
    'col.studentName': 'Student Name',
    'col.statusShort': 'ST',

    // Form labels
    'form.fullName': 'Full Name',
    'form.identity': 'ID Number',
    'form.email': 'Email',
    'form.phone': 'Phone Number',
    'form.birthDate': 'Birth Date',
    'form.gender': 'Gender',
    'form.address': 'Address',
    'form.avatar': 'Avatar',
    'form.courseName': 'Course Name',
    'form.courseCode': 'Course Code',
    'form.description': 'Description',
    'form.price': 'Price (VND)',
    'form.level': 'Level',
    'form.duration': 'Duration',
    'form.hours': 'Hours',
    'form.minutes': 'Minutes',
    'form.language': 'Language',
    'form.instructor': 'Instructor',
    'form.thumbnails': 'Thumbnails',
    'form.addThumbnail': 'Add thumbnail image',

    // Validation
    'validate.required': 'This field is required',
    'validate.email': 'Invalid email',
    'validate.identity': 'ID number must be 12 digits',
    'validate.phone': 'Phone must be 10-11 digits',
    'validate.durationRequired': 'Duration must be greater than 0',
    'validate.thumbnailRequired': 'Please upload at least 1 thumbnail',

    // Status
    'status.active': 'Active',
    'status.deleted': 'Deleted',
    'status.activeShort': 'Active',
    'status.deletedShort': 'Del',

    // Gender
    'gender.male': 'Male',
    'gender.female': 'Female',
    'gender.other': 'Other',

    // Level
    'level.beginner': 'Beginner',
    'level.intermediate': 'Intermediate',
    'level.advanced': 'Advanced',

    // Language
    'lang.vietnamese': 'Vietnamese',
    'lang.english': 'English',

    // Messages
    'msg.success': 'Success',
    'msg.error': 'Error',
    'msg.confirmDelete': 'Confirm Delete',
    'msg.noData': 'No data',
    'msg.searchPlaceholder': 'Search by name, email...',
    'msg.searchCourse': 'Search by name, code...',
    'msg.exported': 'Excel file downloaded',
    'msg.uploadImage': 'Upload Image',
    'msg.removeImage': 'Remove',
    'msg.fullscreen': 'Fullscreen',
    'msg.theme': 'Theme',
    'msg.language': 'Language',

    // Badges
    'badge.primary': 'Primary',
    'badge.new': 'New',

    // Lesson types
    'lessonType.video': 'Video',
    'lessonType.document': 'Document',
    'lessonType.quiz': 'Quiz',

    // Detail
    'detail.createdDate': 'Created Date',
    'detail.updatedDate': 'Updated Date',
    'detail.personalInfo': 'Personal Information',
    'detail.content': 'Content',
    'detail.resources': 'Resources',
    'detail.videos': 'Videos',
    'detail.documents': 'Documents',
    'detail.downloadDoc': 'Download Document',

    // Request errors
    'error.400': 'Invalid data',
    'error.404': 'Data not found',
    'error.409': 'Duplicate data',
    'error.500': 'System error',
    'error.network': 'Cannot connect to server',
  }
}

/**
 * Composable for i18n translations
 */
export function useI18n() {
  const store = useAppStore()

  function t(key, params) {
    let text = messages[store.locale]?.[key] || messages['vi'][key] || key
    // Support simple parameter replacement: {name}, {count}, etc.
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }

  return {
    t,
    locale: computed(() => store.locale)
  }
}

/**
 * Create a global $t function for use in templates without importing
 */
export function createI18nPlugin(app) {
  const store = useAppStore()
  app.config.globalProperties.$t = (key, params) => {
    let text = messages[store.locale]?.[key] || messages['vi'][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }
}

/**
 * Get translation outside of Vue component context (e.g. in axios interceptor)
 */
export function getTranslation(key) {
  const locale = localStorage.getItem('lms-locale') || 'vi'
  return messages[locale]?.[key] || messages['vi'][key] || key
}
