<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, Refresh, Delete, Edit, View, User } from '@element-plus/icons-vue'
import { getStudents, deleteStudent, restoreStudent, exportStudents } from '@/api/student'
import { formatDate, statusTagType, downloadExcel, getGenderLabel } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'
import StudentForm from './StudentForm.vue'

const { t } = useI18n()
const router = useRouter()

// State
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const formVisible = ref(false)
const editingId = ref(null)

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

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận xóa học viên "${row.fullName}"?`,
      t('students.confirmDelete'),
      { type: 'warning', confirmButtonText: t('btn.delete'), cancelButtonText: t('btn.cancel') }
    )
    await deleteStudent(row.id)
    ElMessage.success(t('students.deleted'))
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function handleRestore(row) {
  try {
    await ElMessageBox.confirm(
      `Khôi phục học viên "${row.fullName}"?`,
      t('students.confirmRestore'),
      { type: 'info', confirmButtonText: t('btn.restore'), cancelButtonText: t('btn.cancel') }
    )
    await restoreStudent(row.id)
    ElMessage.success(t('students.restored'))
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// View detail — navigate to detail page
function handleViewDetail(row) {
  router.push(`/students/${row.id}`)
}

// Export
async function handleExport() {
  try {
    const res = await exportStudents({
      keyword: queryParams.keyword || undefined,
      status: queryParams.status || undefined
    })
    downloadExcel(res, 'students_export.xlsx')
    ElMessage.success(t('msg.exported'))
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
          <span class="gradient-text">{{ $t('students.title') }}</span>
        </h1>
        <p class="page-subtitle">{{ $t('students.subtitle') }}</p>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate" id="btn-create-student">
          {{ $t('students.add') }}
        </el-button>
        <el-button :icon="Download" @click="handleExport" id="btn-export-students">
          {{ $t('btn.export') }}
        </el-button>
      </div>
    </div>

    <!-- Search / Filter Bar -->
    <div class="card-container filter-bar">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            :placeholder="$t('msg.searchPlaceholder')"
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
            :placeholder="$t('col.status')"
            clearable
            @change="handleSearch"
            style="width: 160px"
            id="select-status-student"
          >
            <el-option :label="$t('status.active')" value="ACTIVE" />
            <el-option :label="$t('status.deleted')" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch" id="btn-search-student">
            {{ $t('btn.search') }}
          </el-button>
          <el-button :icon="Refresh" @click="handleReset" id="btn-reset-student">
            {{ $t('btn.reset') }}
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
        border
        table-layout="fixed"
        @sort-change="handleSortChange"
        style="width: 100%"
        id="table-students"
      >
        <el-table-column prop="id" label="ID" width="70" sortable="custom" />
        <el-table-column :label="$t('col.avatar')" width="80" align="center">
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
        <el-table-column prop="fullName" :label="$t('col.fullName')" width="180" sortable="custom">
          <template #default="{ row }">
            <span class="text-highlight">{{ row.fullName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" :label="$t('col.email')" width="220" />
        <el-table-column prop="phoneNumber" :label="$t('col.phone')" width="130" />
        <el-table-column prop="birthDate" :label="$t('col.birthDate')" width="120">
          <template #default="{ row }">
            {{ formatDate(row.birthDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" :label="$t('col.gender')" width="100">
          <template #default="{ row }">
            {{ getGenderLabel(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" :label="$t('col.address')" width="150" show-overflow-tooltip />
        <el-table-column prop="status" :label="$t('col.status')" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small" round>
              {{ row.status === 'ACTIVE' ? $t('status.active') : $t('status.deleted') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('col.actions')" width="180" align="center" class-name="action-col">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip :content="$t('btn.view')" placement="top">
                <el-button
                  type="info"
                  :icon="View"
                  size="small"
                  circle
                  @click="handleViewDetail(row)"
                />
              </el-tooltip>
              <el-tooltip :content="$t('btn.edit')" placement="top">
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="small"
                  circle
                  @click="handleEdit(row)"
                />
              </el-tooltip>
              <el-tooltip v-if="row.status === 'ACTIVE'" :content="$t('btn.delete')" placement="top">
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  circle
                  @click="handleDelete(row)"
                />
              </el-tooltip>
              <el-tooltip v-else :content="$t('btn.restore')" placement="top">
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
  overflow-x: auto;
  overflow-y: visible;
}

.text-highlight {
  font-weight: 600;
  color: var(--text-white);
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
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


</style>
