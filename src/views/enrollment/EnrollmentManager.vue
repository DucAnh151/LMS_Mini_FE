<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Switch, User } from '@element-plus/icons-vue'
import { getStudents, getUnregisteredCourses } from '@/api/student'
import { createEnrollment, deleteEnrollment, updateEnrollment } from '@/api/enrollment'
import { getCourseStudents, getCourses } from '@/api/course'
import { formatPrice, levelLabels, levelTagType } from '@/utils/helpers'

// ─── Step 1: Select Student ───
const students = ref([])
const studentLoading = ref(false)
const selectedStudent = ref(null)
const studentSearchKeyword = ref('')

const studentQuery = reactive({
  keyword: '',
  status: 'ACTIVE',
  page: 0,
  size: 10
})
const studentTotal = ref(0)

async function fetchStudents() {
  studentLoading.value = true
  try {
    const res = await getStudents(studentQuery)
    const page = res.data
    students.value = page.data || []
    studentTotal.value = page.totalElements || 0
  } catch (e) {
    console.error(e)
  } finally {
    studentLoading.value = false
  }
}

function searchStudents() {
  studentQuery.keyword = studentSearchKeyword.value
  studentQuery.page = 0
  fetchStudents()
}

function handleStudentPageChange(page) {
  studentQuery.page = page - 1
  fetchStudents()
}

function selectStudent(student) {
  selectedStudent.value = student
  activeTab.value = 'enrolled'
  fetchEnrolledCourses()
  fetchUnregisteredCourses()
}

function clearStudent() {
  selectedStudent.value = null
  enrolledCourses.value = []
  unregisteredCourses.value = []
  selectedCourseIds.value = []
}

// ─── Active Tab ───
const activeTab = ref('enrolled')

// ─── Step 2: Enrolled Courses (all courses − unregistered = enrolled) ───
const enrolledCourses = ref([])
const enrolledLoading = ref(false)

async function fetchEnrolledCourses() {
  if (!selectedStudent.value) return
  enrolledLoading.value = true
  try {
    const [allRes, unregRes] = await Promise.all([
      getCourses({ page: 0, size: 100 }),
      getUnregisteredCourses(selectedStudent.value.id, { page: 0, size: 100 })
    ])
    const allList = allRes.data?.data || []
    const unregList = unregRes.data?.data || []
    const unregIds = new Set(unregList.map(c => c.id))
    enrolledCourses.value = allList.filter(c => !unregIds.has(c.id))
  } catch (e) {
    console.error(e)
  } finally {
    enrolledLoading.value = false
  }
}

// Lazily find enrollmentId by querying the course's student list
async function findEnrollmentId(courseId) {
  try {
    const res = await getCourseStudents(courseId, { page: 0, size: 100 })
    const list = res.data?.data || []
    const found = list.find(s => s.studentId === selectedStudent.value.id)
    return found?.enrollmentId
  } catch (e) {
    console.error(e)
    return null
  }
}

// Delete enrollment
async function handleDeleteEnrollment(course) {
  try {
    await ElMessageBox.confirm(
      `Hủy đăng ký khóa học "${course.name}" cho ${selectedStudent.value.fullName}?`,
      'Hủy đăng ký',
      { type: 'warning', confirmButtonText: 'Hủy đăng ký', cancelButtonText: 'Đóng' }
    )
    const enrollmentId = await findEnrollmentId(course.id)
    if (!enrollmentId) {
      ElMessage.error('Không tìm thấy thông tin đăng ký')
      return
    }
    await deleteEnrollment(enrollmentId)
    ElMessage.success('Đã hủy đăng ký thành công')
    refreshAll()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// ─── Step 3: Unregistered Courses (for new enrollment) ───
const unregisteredCourses = ref([])
const unregLoading = ref(false)
const unregTotal = ref(0)
const selectedCourseIds = ref([])
const enrolling = ref(false)

const unregQuery = reactive({
  keyword: '',
  level: null,
  page: 0,
  size: 10
})

async function fetchUnregisteredCourses() {
  if (!selectedStudent.value) return
  unregLoading.value = true
  try {
    const res = await getUnregisteredCourses(selectedStudent.value.id, unregQuery)
    const page = res.data
    unregisteredCourses.value = page.data || []
    unregTotal.value = page.totalElements || 0
  } catch (e) {
    console.error(e)
  } finally {
    unregLoading.value = false
  }
}

function handleUnregPageChange(page) {
  unregQuery.page = page - 1
  fetchUnregisteredCourses()
}

function searchUnreg() {
  unregQuery.page = 0
  fetchUnregisteredCourses()
}

async function handleEnroll() {
  if (selectedCourseIds.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất 1 khóa học')
    return
  }
  enrolling.value = true
  try {
    const fd = new FormData()
    fd.append('studentId', selectedStudent.value.id)
    selectedCourseIds.value.forEach(id => fd.append('courseIds', id))
    await createEnrollment(fd)
    ElMessage.success('Đăng ký thành công')
    selectedCourseIds.value = []
    refreshAll()
  } catch (e) {
    console.error(e)
  } finally {
    enrolling.value = false
  }
}

// ─── Transfer Dialog ───
const transferDialogVisible = ref(false)
const transferCourseFrom = ref(null)
const transferNewCourseId = ref(null)
const transferCourses = ref([])
const transferLoading = ref(false)

async function openTransferDialog(course) {
  transferCourseFrom.value = course
  transferNewCourseId.value = null
  transferDialogVisible.value = true
  try {
    const res = await getUnregisteredCourses(selectedStudent.value.id, { page: 0, size: 100 })
    transferCourses.value = res.data?.data || []
  } catch (e) {
    console.error(e)
  }
}

async function handleTransfer() {
  if (!transferNewCourseId.value) {
    ElMessage.warning('Vui lòng chọn khóa học mới')
    return
  }
  transferLoading.value = true
  try {
    const enrollmentId = await findEnrollmentId(transferCourseFrom.value.id)
    if (!enrollmentId) {
      ElMessage.error('Không tìm thấy thông tin đăng ký')
      return
    }
    await updateEnrollment(enrollmentId, transferNewCourseId.value)
    ElMessage.success('Chuyển khóa học thành công')
    transferDialogVisible.value = false
    refreshAll()
  } catch (e) {
    console.error(e)
  } finally {
    transferLoading.value = false
  }
}

// ─── Refresh Helper ───
function refreshAll() {
  fetchEnrolledCourses()
  fetchUnregisteredCourses()
}

onMounted(fetchStudents)
</script>

<template>
  <div class="page-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">
          <span class="gradient-text">Đăng ký Khóa học</span>
        </h1>
        <p class="page-subtitle">Quản lý đăng ký khóa học cho học viên</p>
      </div>
    </div>

    <div class="enrollment-layout">
      <!-- Left: Student Selection -->
      <div class="card-container student-panel">
        <h3 class="panel-title">
          <el-icon><User /></el-icon> Chọn học viên
        </h3>

        <!-- Selected student card -->
        <div v-if="selectedStudent" class="selected-student-card">
          <div class="student-info">
            <span class="student-name">{{ selectedStudent.fullName }}</span>
            <span class="student-email">{{ selectedStudent.email }}</span>
          </div>
          <el-button text type="danger" size="small" @click="clearStudent">Bỏ chọn</el-button>
        </div>

        <!-- Student search & list -->
        <div v-else>
          <div class="search-row">
            <el-input
              v-model="studentSearchKeyword"
              placeholder="Tìm học viên..."
              :prefix-icon="Search"
              clearable
              @keyup.enter="searchStudents"
              @clear="searchStudents"
              id="input-search-enrollment-student"
            />
          </div>

          <div class="student-list" v-loading="studentLoading">
            <div
              v-for="s in students"
              :key="s.id"
              class="student-item"
              @click="selectStudent(s)"
            >
              <div class="student-item-info">
                <span class="student-item-name">{{ s.fullName }}</span>
                <span class="student-item-email">{{ s.email }}</span>
              </div>
              <el-icon class="select-icon"><Plus /></el-icon>
            </div>

            <div v-if="students.length === 0 && !studentLoading" class="empty-text">
              Không tìm thấy học viên
            </div>
          </div>

          <div class="mini-pagination">
            <el-pagination
              :current-page="studentQuery.page + 1"
              :page-size="studentQuery.size"
              :total="studentTotal"
              layout="prev, pager, next"
              @current-change="handleStudentPageChange"
              background
              small
            />
          </div>
        </div>
      </div>

      <!-- Right: Course Management with Tabs -->
      <div class="card-container course-panel">
        <div v-if="!selectedStudent" class="empty-prompt">
          <el-empty description="Vui lòng chọn học viên trước" />
        </div>

        <div v-else>
          <el-tabs v-model="activeTab" class="enrollment-tabs">
            <!-- Tab 1: Enrolled Courses -->
            <el-tab-pane name="enrolled">
              <template #label>
                <span class="tab-label">
                  📚 Đã đăng ký
                  <el-badge
                    v-if="enrolledCourses.length > 0"
                    :value="enrolledCourses.length"
                    type="primary"
                    class="tab-badge"
                  />
                </span>
              </template>

              <el-table
                :data="enrolledCourses"
                v-loading="enrolledLoading"
                stripe
                style="width: 100%"
                id="table-enrolled-courses"
              >
                <el-table-column label="Ảnh" width="70" align="center">
                  <template #default="{ row }">
                    <div class="mini-thumb">
                      <img v-if="row.thumbnailUrl" :src="row.thumbnailUrl" alt="" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="Tên khóa học" min-width="180">
                  <template #default="{ row }">
                    <span class="text-highlight">{{ row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="Mã" width="100" />
                <el-table-column prop="price" label="Giá" width="130">
                  <template #default="{ row }">
                    <span class="price-text">{{ formatPrice(row.price) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="Cấp độ" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag :type="levelTagType[row.level]" size="small" round>
                      {{ levelLabels[row.level] || row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Hành động" width="140" align="center" fixed="right">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-tooltip content="Chuyển khóa" placement="top">
                        <el-button
                          type="warning"
                          :icon="Switch"
                          size="small"
                          circle
                          @click="openTransferDialog(row)"
                        />
                      </el-tooltip>
                      <el-tooltip content="Hủy đăng ký" placement="top">
                        <el-button
                          type="danger"
                          :icon="Delete"
                          size="small"
                          circle
                          @click="handleDeleteEnrollment(row)"
                        />
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div v-if="enrolledCourses.length === 0 && !enrolledLoading" class="empty-enrolled">
                <el-empty description="Chưa đăng ký khóa học nào" :image-size="80">
                  <el-button type="primary" size="small" @click="activeTab = 'register'">
                    Đăng ký ngay
                  </el-button>
                </el-empty>
              </div>
            </el-tab-pane>

            <!-- Tab 2: Register New -->
            <el-tab-pane name="register">
              <template #label>
                <span class="tab-label">➕ Đăng ký mới</span>
              </template>

              <div class="panel-header">
                <div></div>
                <el-button
                  type="primary"
                  :icon="Plus"
                  :loading="enrolling"
                  :disabled="selectedCourseIds.length === 0"
                  @click="handleEnroll"
                  id="btn-enroll"
                >
                  Đăng ký ({{ selectedCourseIds.length }})
                </el-button>
              </div>

              <!-- Search -->
              <div class="search-row" style="margin-bottom: 16px;">
                <el-input
                  v-model="unregQuery.keyword"
                  placeholder="Tìm khóa học..."
                  :prefix-icon="Search"
                  clearable
                  @keyup.enter="searchUnreg"
                  @clear="searchUnreg"
                  style="flex: 1"
                  id="input-search-unreg-course"
                />
                <el-select
                  v-model="unregQuery.level"
                  placeholder="Cấp độ"
                  clearable
                  @change="searchUnreg"
                  style="width: 140px"
                  id="select-level-unreg"
                >
                  <el-option label="Cơ bản" value="BEGINNER" />
                  <el-option label="Trung cấp" value="INTERMEDIATE" />
                  <el-option label="Nâng cao" value="ADVANCED" />
                </el-select>
              </div>

              <!-- Course table -->
              <el-table
                :data="unregisteredCourses"
                v-loading="unregLoading"
                @selection-change="(rows) => selectedCourseIds = rows.map(r => r.id)"
                stripe
                style="width: 100%"
                id="table-unreg-courses"
              >
                <el-table-column type="selection" width="45" />
                <el-table-column label="Ảnh" width="70" align="center">
                  <template #default="{ row }">
                    <div class="mini-thumb">
                      <img v-if="row.thumbnailUrl" :src="row.thumbnailUrl" alt="" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="Tên khóa học" min-width="180">
                  <template #default="{ row }">
                    <span class="text-highlight">{{ row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="Mã" width="100" />
                <el-table-column prop="price" label="Giá" width="130">
                  <template #default="{ row }">
                    <span class="price-text">{{ formatPrice(row.price) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="Cấp độ" width="110" align="center">
                  <template #default="{ row }">
                    <el-tag :type="levelTagType[row.level]" size="small" round>
                      {{ levelLabels[row.level] || row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="mini-pagination">
                <el-pagination
                  :current-page="unregQuery.page + 1"
                  :page-size="unregQuery.size"
                  :total="unregTotal"
                  layout="prev, pager, next"
                  @current-change="handleUnregPageChange"
                  background
                  small
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- Transfer Dialog -->
    <el-dialog
      v-model="transferDialogVisible"
      title="Chuyển khóa học"
      width="500px"
      :close-on-click-modal="false"
      id="dialog-transfer-enrollment"
    >
      <div class="transfer-info" v-if="transferCourseFrom">
        <div class="transfer-detail">
          <span class="transfer-label">Học viên:</span>
          <span class="transfer-value">{{ selectedStudent?.fullName }}</span>
        </div>
        <div class="transfer-detail">
          <span class="transfer-label">Từ khóa học:</span>
          <span class="transfer-value">{{ transferCourseFrom.name }} ({{ transferCourseFrom.code }})</span>
        </div>
      </div>
      <el-form label-position="top" style="margin-top: 16px;">
        <el-form-item label="Chuyển sang khóa học">
          <el-select
            v-model="transferNewCourseId"
            placeholder="Chọn khóa học mới"
            style="width: 100%"
            filterable
            id="select-transfer-course"
          >
            <el-option
              v-for="c in transferCourses"
              :key="c.id"
              :label="`${c.name} (${c.code})`"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleTransfer" :loading="transferLoading">
          Chuyển khóa học
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container { max-width: 1400px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header-left { flex: 1; }

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.enrollment-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-white);
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selected-student-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-name {
  font-weight: 600;
  color: var(--text-white);
  font-size: 14px;
}

.student-email {
  font-size: 12px;
  color: var(--text-secondary);
}

.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.student-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.student-item:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: var(--border-color);
}

.student-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-item-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 13px;
}

.student-item-email {
  font-size: 11px;
  color: var(--text-muted);
}

.select-icon {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.student-item:hover .select-icon {
  color: var(--text-accent);
}

.empty-text {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-enrolled {
  padding: 32px 0;
}

/* Tabs */
.enrollment-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-badge {
  margin-left: 4px;
}

/* Table styles */
.mini-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-input);
  margin: 0 auto;
}

.mini-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-highlight {
  font-weight: 600;
  color: var(--text-white);
}

.price-text {
  color: #2dce89;
  font-weight: 600;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.mini-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* Transfer dialog */
.transfer-info {
  background: var(--bg-input);
  border-radius: var(--border-radius-sm);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transfer-detail {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.transfer-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.transfer-value {
  color: var(--text-white);
  font-weight: 600;
}
</style>
