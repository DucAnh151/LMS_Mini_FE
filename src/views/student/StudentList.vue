<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, Refresh, Delete, Edit, View, User } from '@element-plus/icons-vue'
import { getStudents, getStudent , deleteStudent, restoreStudent, exportStudents } from '@/api/student'
import { formatDate, genderLabels, statusTagType, downloadExcel } from '@/utils/helpers'
import StudentForm from './StudentForm.vue'

// State
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const formVisible = ref(false)
const editingId = ref(null)
const detailVisible = ref(false)
const detailData = ref(null)

const queryParams = reactive({
  keyword: '',
  status: null,
  page: 0,
  size: 10,
  sort: 'fullName,desc'
})

// Fetch data
async function fetchData() {
  loading.value = true
  try {
    const res = await getStudents(queryParams)
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

// Pagination
function handlePageChange(page) {
  queryParams.page = page - 1
  fetchData()
}

function handleSizeChange(size) {
  queryParams.size = size
  queryParams.page = 0
  fetchData()
}

// Search
function handleSearch() {
  queryParams.page = 0
  fetchData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = null
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

async function handleView(row) {
  try {
    const res = await getStudent(row.id)
    detailData.value = res.data
    detailVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận xóa học viên "${row.fullName}"?`,
      'Xóa học viên',
      { type: 'warning', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' }
    )
    await deleteStudent(row.id)
    ElMessage.success('Đã xóa học viên')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function handleRestore(row) {
  try {
    await ElMessageBox.confirm(
      `Khôi phục học viên "${row.fullName}"?`,
      'Khôi phục',
      { type: 'info', confirmButtonText: 'Khôi phục', cancelButtonText: 'Hủy' }
    )
    await restoreStudent(row.id)
    ElMessage.success('Đã khôi phục học viên')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// Export
async function handleExport() {
  try {
    const res = await exportStudents({
      keyword: queryParams.keyword || undefined,
      status: queryParams.status || undefined
    })
    downloadExcel(res, 'students_export.xlsx')
    ElMessage.success('Đã tải xuống file Excel')
  } catch (e) {
    console.error(e)
  }
}

// Sort
function handleSortChange({ prop, order }) {
  if (prop && order) {
    queryParams.sort = `${prop},${order === 'ascending' ? 'asc' : 'desc'}`
  } else {
    queryParams.sort = 'fullName,desc'
  }
  fetchData()
}
</script>

<template>
  <div class="page-container fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">
          <span class="gradient-text">Quản lý Học viên</span>
        </h1>
        <p class="page-subtitle">Danh sách tất cả học viên trong hệ thống</p>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate" id="btn-create-student">
          Thêm học viên
        </el-button>
        <el-button :icon="Download" @click="handleExport" id="btn-export-students">
          Xuất Excel
        </el-button>
      </div>
    </div>

    <!-- Search / Filter Bar -->
    <div class="card-container filter-bar">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="Tìm theo tên, email..."
            :prefix-icon="Search"
            clearable
            @clear="handleSearch"
            style="width: 280px"
            id="input-search-student"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="queryParams.status"
            placeholder="Trạng thái"
            clearable
            @change="handleSearch"
            style="width: 160px"
            id="select-status-student"
          >
            <el-option label="Hoạt động" value="ACTIVE" />
            <el-option label="Đã xóa" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch" id="btn-search-student">
            Tìm kiếm
          </el-button>
          <el-button :icon="Refresh" @click="handleReset" id="btn-reset-student">
            Đặt lại
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table -->
    <div class="card-container table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @sort-change="handleSortChange"
        style="width: 100%"
        id="table-students"
      >
        <el-table-column prop="id" label="ID" width="70" sortable="custom" />
        <el-table-column label="Avatar" width="80" align="center">
          <template #default="{ row }">
            <div class="avatar-cell">
              <img
                v-if="row.avatarUrl"
                :src="row.avatarUrl"
                alt="Avatar"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                <el-icon><User /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="fullName" label="Họ và tên" min-width="180" sortable="custom">
          <template #default="{ row }">
            <span class="text-highlight">{{ row.fullName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="Email" min-width="200" />
        <el-table-column prop="phoneNumber" label="SĐT" width="130" />
        <el-table-column prop="birthDate" label="Ngày sinh" width="120">
          <template #default="{ row }">
            {{ formatDate(row.birthDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="Giới tính" width="100">
          <template #default="{ row }">
            {{ genderLabels[row.gender] || row.gender }}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="Địa chỉ" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small" round>
              {{ row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã xóa' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Hành động" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="Xem" placement="top">
                <el-button type="info" :icon="View" size="small" circle @click="handleView(row)" />
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

      <!-- Pagination -->
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
          id="pagination-students"
        />
      </div>
    </div>

    <!-- Form Dialog -->
    <StudentForm
      v-model:visible="formVisible"
      :student-id="editingId"
      @success="handleFormSuccess"
    />
    <el-dialog
      v-model="detailVisible"
      title="Chi tiết học viên"
      width="480px"
      id="dialog-student-detail"
    >
      <div v-if="detailData" class="detail-container">
        <div class="detail-avatar-wrap">
          <img v-if="detailData.avatarUrl" :src="detailData.avatarUrl" class="detail-avatar" alt="Avatar" />
          <div v-else class="detail-avatar-placeholder">
            <el-icon :size="40"><User /></el-icon>
          </div>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Họ và tên">{{ detailData.fullName }}</el-descriptions-item>
          <el-descriptions-item label="CCCD/CMND">{{ detailData.identityNumber }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ detailData.email }}</el-descriptions-item>
          <el-descriptions-item label="Số điện thoại">{{ detailData.phoneNumber }}</el-descriptions-item>
          <el-descriptions-item label="Ngày sinh">{{ formatDate(detailData.birthDate) }}</el-descriptions-item>
          <el-descriptions-item label="Giới tính">
            {{ genderLabels[detailData.gender] || detailData.gender || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="Địa chỉ">{{ detailData.address }}</el-descriptions-item>
          <el-descriptions-item label="Trạng thái">
            <el-tag :type="statusTagType[detailData.status]" size="small" round>
              {{ detailData.status === 'ACTIVE' ? 'Hoạt động' : 'Đã xóa' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Ngày tạo">{{ formatDate(detailData.createdDate) }}</el-descriptions-item>
          <el-descriptions-item label="Ngày cập nhật">{{ formatDate(detailData.updatedDate) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">Đóng</el-button>
        <el-button type="primary" @click="detailVisible = false; handleEdit(detailData)">Sửa</el-button>
      </template>
    </el-dialog>
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

.page-header-left {
  flex: 1;
}

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

.table-card {
  overflow: hidden;
}

.text-highlight {
  font-weight: 600;
  color: var(--text-white);
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

.avatar-cell {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 18px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-avatar-wrap {
  display: flex;
  justify-content: center;
}

.detail-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.detail-avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
</style>
