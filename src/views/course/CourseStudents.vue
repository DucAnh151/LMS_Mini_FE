<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Switch } from '@element-plus/icons-vue'
import { getCourseStudents } from '@/api/course'
import { deleteEnrollment, updateEnrollment } from '@/api/enrollment'
import { getUnregisteredCourses } from '@/api/student'
import { getCourses } from '@/api/course'
import { formatDate, statusTagType, getGenderLabel } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  courseId: { type: Number, default: null },
  courseName: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'change'])

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  keyword: '',
  status: null,
  page: 0,
  size: 10
})

watch(() => props.visible, (val) => {
  if (val && props.courseId) {
    queryParams.page = 0
    queryParams.keyword = ''
    queryParams.status = null
    fetchData()
  }
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getCourseStudents(props.courseId, queryParams)
    const page = res.data
    tableData.value = page.data || []
    total.value = page.totalElements || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  queryParams.page = page - 1
  fetchData()
}

function handleSearch() {
  queryParams.page = 0
  fetchData()
}

function handleClose() {
  emit('update:visible', false)
}

// ─── Delete Enrollment ───
async function handleDeleteEnrollment(row) {
  try {
    await ElMessageBox.confirm(
      t('enrollments.cancelConfirm', { name: row.studentName, course: props.courseName }),
      t('enrollments.cancelTitle'),
      { type: 'warning', confirmButtonText: t('enrollments.cancelBtn'), cancelButtonText: t('btn.close') }
    )
    await deleteEnrollment(row.enrollmentId)
    ElMessage.success(t('enrollments.cancelSuccess'))
    fetchData()
    emit('change')
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// ─── Transfer Enrollment ───
const transferDialogVisible = ref(false)
const transferRow = ref(null)
const transferNewCourseId = ref(null)
const transferCourses = ref([])
const transferLoading = ref(false)

async function openTransferDialog(row) {
  transferRow.value = row
  transferNewCourseId.value = null
  transferDialogVisible.value = true
  // Load available courses the student can transfer to
  try {
    const res = await getUnregisteredCourses(row.studentId, { page: 0, size: 100 })
    transferCourses.value = res.data?.data || []
  } catch (e) {
    console.error(e)
    // Fallback: load all courses
    try {
      const fallbackRes = await getCourses({ page: 0, size: 100 })
      const allCourses = fallbackRes.data?.data || []
      transferCourses.value = allCourses.filter(c => c.id !== props.courseId)
    } catch (e2) {
      console.error(e2)
    }
  }
}

async function handleTransfer() {
  if (!transferNewCourseId.value) {
    ElMessage.warning(t('enrollments.selectCourseWarning'))
    return
  }
  transferLoading.value = true
  try {
    await updateEnrollment(transferRow.value.enrollmentId, transferNewCourseId.value)
    ElMessage.success(t('enrollments.transferSuccess'))
    transferDialogVisible.value = false
    fetchData()
    emit('change')
  } catch (e) {
    console.error(e)
  } finally {
    transferLoading.value = false
  }
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="$t('courseStudents.title', { name: courseName })"
    direction="rtl"
    size="750px"
    @close="handleClose"
    id="drawer-course-students"
  >
    <!-- Search -->
    <div style="margin-bottom: 16px; display: flex; gap: 12px;">
      <el-input
        v-model="queryParams.keyword"
        :placeholder="$t('courseStudents.searchPlaceholder')"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
        style="flex: 1"
        id="input-search-course-student"
      />
      <el-button type="primary" @click="handleSearch">{{ $t('btn.find') }}</el-button>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" stripe style="width: 100%" id="table-course-students">
      <el-table-column prop="studentName" :label="$t('col.studentName')" min-width="150">
        <template #default="{ row }">
          <span class="text-highlight">{{ row.studentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="studentEmail" :label="$t('col.email')" min-width="170" />
      <el-table-column prop="studentPhone" :label="$t('col.phone')" width="120" />
      <el-table-column prop="gender" :label="$t('col.gender')" width="85">
        <template #default="{ row }">
          {{ getGenderLabel(row.gender) }}
        </template>
      </el-table-column>
      <el-table-column prop="enrollmentDate" :label="$t('col.enrollDate')" width="100">
        <template #default="{ row }">
          {{ formatDate(row.enrollmentDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('col.statusShort')" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType[row.status]" size="small" round>
            {{ row.status === 'ACTIVE' ? $t('status.activeShort') : $t('status.deletedShort') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('col.actions')" width="120" align="center" >
        <template #default="{ row }">
          <div class="action-buttons" v-if="row.status === 'ACTIVE'">
            <el-tooltip :content="$t('enrollments.transferCourse')" placement="top">
              <el-button
                type="warning"
                :icon="Switch"
                size="small"
                circle
                @click="openTransferDialog(row)"
              />
            </el-tooltip>
            <el-tooltip :content="$t('enrollments.cancelEnroll')" placement="top">
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

    <!-- Pagination -->
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <el-pagination
        :current-page="queryParams.page + 1"
        :page-size="queryParams.size"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
        small
      />
    </div>

    <!-- Transfer Dialog (nested in drawer) -->
    <el-dialog
      v-model="transferDialogVisible"
      :title="$t('enrollments.transferTitle')"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
      id="dialog-transfer-from-drawer"
    >
      <div class="transfer-info" v-if="transferRow">
        <div class="transfer-detail">
          <span class="transfer-label">{{ $t('enrollments.student') }}</span>
          <span class="transfer-value">{{ transferRow.studentName }}</span>
        </div>
        <div class="transfer-detail">
          <span class="transfer-label">{{ $t('enrollments.transferFrom') }}</span>
          <span class="transfer-value">{{ courseName }}</span>
        </div>
      </div>
      <el-form label-position="top" style="margin-top: 16px;">
        <el-form-item :label="$t('enrollments.transferTo')">
          <el-select
            v-model="transferNewCourseId"
            :placeholder="$t('enrollments.selectNewCourse')"
            style="width: 100%"
            filterable
            id="select-transfer-course-drawer"
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
        <el-button @click="transferDialogVisible = false">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleTransfer" :loading="transferLoading">
          {{ $t('btn.transfer') }}
        </el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<style scoped>
.text-highlight {
  font-weight: 600;
  color: var(--text-white);
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

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
