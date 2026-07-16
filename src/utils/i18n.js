import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'

const messages = {
  vi: {
    // Nav
    'nav.students': 'Học viên',
    'nav.courses': 'Khóa học',
    'nav.enrollments': 'Đăng ký',
    'nav.home': 'Trang chủ',

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

    // Lessons
    'lessons.add': 'Thêm bài học',
    'lessons.edit': 'Cập nhật bài học',
    'lessons.detail': 'Chi tiết bài học',
    'lessons.noLessons': 'Chưa có bài học nào',

    // Enrollments
    'enrollments.enrolled': 'Đã đăng ký',
    'enrollments.registerNew': 'Đăng ký mới',
    'enrollments.cancelEnroll': 'Hủy đăng ký',
    'enrollments.transfer': 'Chuyển khóa học',
    'enrollments.selectStudent': 'Chọn học viên',
    'enrollments.selectStudentFirst': 'Vui lòng chọn học viên trước',
    'enrollments.noEnrolled': 'Chưa đăng ký khóa học nào',

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

    // Validation
    'validate.required': 'Trường này là bắt buộc',
    'validate.email': 'Email không hợp lệ',
    'validate.identity': 'CCCD phải là 12 chữ số',
    'validate.phone': 'SĐT phải là 10-11 chữ số',
    'validate.durationRequired': 'Thời lượng phải lớn hơn 0',

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
    'msg.exported': 'Đã tải xuống file Excel',
    'msg.uploadImage': 'Tải ảnh lên',
    'msg.removeImage': 'Xóa',
    'msg.fullscreen': 'Toàn màn hình',
    'msg.theme': 'Giao diện',
    'msg.language': 'Ngôn ngữ',

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
  },
  en: {
    // Nav
    'nav.students': 'Students',
    'nav.courses': 'Courses',
    'nav.enrollments': 'Enrollments',
    'nav.home': 'Home',

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

    // Lessons
    'lessons.add': 'Add Lesson',
    'lessons.edit': 'Update Lesson',
    'lessons.detail': 'Lesson Details',
    'lessons.noLessons': 'No lessons yet',

    // Enrollments
    'enrollments.enrolled': 'Enrolled',
    'enrollments.registerNew': 'New Enrollment',
    'enrollments.cancelEnroll': 'Cancel Enrollment',
    'enrollments.transfer': 'Transfer Course',
    'enrollments.selectStudent': 'Select Student',
    'enrollments.selectStudentFirst': 'Please select a student first',
    'enrollments.noEnrolled': 'No courses enrolled yet',

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

    // Validation
    'validate.required': 'This field is required',
    'validate.email': 'Invalid email',
    'validate.identity': 'ID number must be 12 digits',
    'validate.phone': 'Phone must be 10-11 digits',
    'validate.durationRequired': 'Duration must be greater than 0',

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
    'msg.exported': 'Excel file downloaded',
    'msg.uploadImage': 'Upload Image',
    'msg.removeImage': 'Remove',
    'msg.fullscreen': 'Fullscreen',
    'msg.theme': 'Theme',
    'msg.language': 'Language',

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
  }
}

/**
 * Composable for i18n translations
 */
export function useI18n() {
  const store = useAppStore()

  function t(key) {
    return messages[store.locale]?.[key] || messages['vi'][key] || key
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
  app.config.globalProperties.$t = (key) => {
    return messages[store.locale]?.[key] || messages['vi'][key] || key
  }
}
