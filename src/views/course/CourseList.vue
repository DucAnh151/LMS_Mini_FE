<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, Refresh, Delete, Edit, Notebook } from '@element-plus/icons-vue'
import { getCourses, deleteCourse, restoreCourse, exportCourses, getCourseStudents } from '@/api/course'
import { formatPrice, levelLabels, levelTagType, statusTagType, downloadExcel } from '@/utils/helpers'
import CourseForm from './CourseForm.vue'
import CourseStudents from './CourseStudents.vue'

const router = useRouter()

// State
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const formVisible = ref(false)
const editingId = ref(null)
const studentsDrawerVisible = ref(false)
const selectedCourseId = ref(null)
const selectedCourseName = ref('')

const queryParams = reactive({
  keyword: '',
  level: null,
  minPrice: null,
  maxPrice: null,
  page: 0,
  size: 10,
  sort: 'createdDate,desc'
})

// Fetch
async function fetchData() {
  loading.value = true
  try {
    const params = { ...queryParams }
    if (!params.level) delete params.level
    if (!params.minPrice) delete params.minPrice
    if (!params.maxPrice) delete params.maxPrice
    const res = await getCourses(params)
    const page = res.data
    tableData.value = page.data || []
    total.value = page.totalElements || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function handlePageChange(page) {
  queryParams.page = page - 1
  fetchData()
}

function handleSizeChange(size) {
  queryParams.size = size
  queryParams.page = 0
  fetchData()
}

function handleSearch() {
  queryParams.page = 0
  fetchData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.level = null
  queryParams.minPrice = null
  queryParams.maxPrice = null
  queryParams.page = 0
  fetchData()
}

// CRUD
function handleCreate() {
  editingId.value = null
  formVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  formVisible.value = true
}

function handleFormSuccess() {
  formVisible.value = false
  fetchData()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận xóa khóa học "${row.name}"?`,
      'Xóa khóa học',
      { type: 'warning', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' }
    )
    await deleteCourse(row.id)
    ElMessage.success('Đã xóa khóa học')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function handleRestore(row) {
  try {
    await ElMessageBox.confirm(
      `Khôi phục khóa học "${row.name}"?`,
      'Khôi phục',
      { type: 'info', confirmButtonText: 'Khôi phục', cancelButtonText: 'Hủy' }
    )
    await restoreCourse(row.id)
    ElMessage.success('Đã khôi phục khóa học')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// Lessons
function handleViewLessons(row) {
  router.push(`/courses/${row.id}/lessons`)
}

// Students
function handleViewStudents(row) {
  selectedCourseId.value = row.id
  selectedCourseName.value = row.name
  studentsDrawerVisible.value = true
}

// Export
async function handleExport() {
  try {
    const res = await exportCourses({
      keyword: queryParams.keyword || undefined,
      level: queryParams.level || undefined,
      minPrice: queryParams.minPrice || undefined,
      maxPrice: queryParams.maxPrice || undefined
    })
    downloadExcel(res, 'courses_export.xlsx')
    ElMessage.success('Đã tải xuống file Excel')
  } catch (e) {
    console.error(e)
  }
}

function handleSortChange({ prop, order }) {
  if (prop && order) {
    queryParams.sort = `${prop},${order === 'ascending' ? 'asc' : 'desc'}`
  } else {
    queryParams.sort = 'createdDate,desc'
  }
  fetchData()
}
</script>

<template>
  <div class="page-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">
          <span class="gradient-text">Quản lý Khóa học</span>
        </h1>
        <p class="page-subtitle">Danh sách tất cả khóa học trong hệ thống</p>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate" id="btn-create-course">
          Thêm khóa học
        </el-button>
        <el-button :icon="Download" @click="handleExport" id="btn-export-courses">
          Xuất Excel
        </el-button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card-container filter-bar">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="Tìm theo tên, mã..."
            :prefix-icon="Search"
            clearable
            @clear="handleSearch"
            style="width: 240px"
            id="input-search-course"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="queryParams.level"
            placeholder="Cấp độ"
            clearable
            @change="handleSearch"
            style="width: 150px"
            id="select-level-course"
          >
            <el-option label="Cơ bản" value="BEGINNER" />
            <el-option label="Trung cấp" value="INTERMEDIATE" />
            <el-option label="Nâng cao" value="ADVANCED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input-number
            v-model="queryParams.minPrice"
            placeholder="Giá từ"
            :min="0"
            :controls="false"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item>
          <el-input-number
            v-model="queryParams.maxPrice"
            placeholder="Giá đến"
            :min="0"
            :controls="false"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch" id="btn-search-course">
            Tìm kiếm
          </el-button>
          <el-button :icon="Refresh" @click="handleReset" id="btn-reset-course">
            Đặt lại
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <div class="card-container table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @sort-change="handleSortChange"
        style="width: 100%"
        id="table-courses"
      >
        <el-table-column prop="id" label="ID" width="70" sortable="custom" />
        <el-table-column label="Thumbnail" width="90" align="center">
          <template #default="{ row }">
            <div class="thumb-cell">
              <img
                v-if="row.thumbnailUrl"
                :src="row.thumbnailUrl"
                alt="Thumbnail"
                class="thumb-img"
              />
              <div v-else class="thumb-placeholder">
                <el-icon><Notebook /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Tên khóa học" min-width="200" sortable="custom">
          <template #default="{ row }">
            <span class="text-highlight">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Mã" width="110" />
        <el-table-column prop="price" label="Giá" width="140" sortable="custom">
          <template #default="{ row }">
            <span class="price-text">{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="Cấp độ" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="levelTagType[row.level]" size="small" round>
              {{ levelLabels[row.level] || row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="instructorName" label="Giảng viên" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small" round>
              {{ row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã xóa' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Hành động" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="Bài học" placement="top">
                <el-button
                  type="info"
                  :icon="Notebook"
                  size="small"
                  circle
                  @click="handleViewLessons(row)"
                />
              </el-tooltip>
              <el-tooltip content="Học viên" placement="top">
                <el-button
                  size="small"
                  circle
                  @click="handleViewStudents(row)"
                >
                  <el-icon><User /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Sửa" placement="top">
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="small"
                  circle
                  @click="handleEdit(row)"
                />
              </el-tooltip>
              <el-tooltip v-if="row.status === 'ACTIVE'" content="Xóa" placement="top">
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  circle
                  @click="handleDelete(row)"
                />
              </el-tooltip>
              <el-tooltip v-else content="Khôi phục" placement="top">
                <el-button
                  type="success"
                  :icon="Refresh"
                  size="small"
                  circle
                  @click="handleRestore(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          background
          id="pagination-courses"
        />
      </div>
    </div>

    <!-- Form Dialog -->
    <CourseForm
      v-model:visible="formVisible"
      :course-id="editingId"
      @success="handleFormSuccess"
    />

    <!-- Students Drawer -->
    <CourseStudents
      v-model:visible="studentsDrawerVisible"
      :course-id="selectedCourseId"
      :course-name="selectedCourseName"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
}

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

.page-header-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-bar .el-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.table-card { overflow: hidden; }

.thumb-cell {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 20px;
}

.text-highlight {
  font-weight: 600;
  color: var(--text-white);
}

.price-text {
  color: #2dce89;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid var(--border-color-light);
  margin-top: 16px;
}
</style>
