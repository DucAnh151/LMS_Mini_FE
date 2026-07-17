<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, User } from '@element-plus/icons-vue'
import { getStudent } from '@/api/student'
import { formatDate, statusTagType, getGenderLabel } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'
import StudentForm from './StudentForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const studentId = computed(() => Number(route.params.studentId))

const loading = ref(false)
const student = ref(null)
const formVisible = ref(false)

async function fetchStudent() {
  loading.value = true
  try {
    const res = await getStudent(studentId.value)
    student.value = res.data
  } catch (e) {
    console.error(e)
    ElMessage.error(t('error.404'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchStudent)

function goBack() {
  router.push('/students')
}

function handleEdit() {
  formVisible.value = true
}

function handleFormSuccess() {
  formVisible.value = false
  fetchStudent()
}
</script>

<template>
  <div class="page-container fade-in" v-loading="loading">
    <!-- Header -->
    <div class="detail-page-header">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn" id="btn-back-students">
        {{ $t('btn.back') }}
      </el-button>
      <div class="header-info">
        <h1 class="page-title">
          <span class="gradient-text">{{ $t('students.detail') }}</span>
        </h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="handleEdit" id="btn-edit-student-detail">
          {{ $t('btn.edit') }}
        </el-button>
      </div>
    </div>

    <template v-if="student">
      <div class="detail-layout">
        <!-- Left: Profile Card -->
        <div class="card-container profile-card">
          <!-- Avatar -->
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar">
              <img v-if="student.avatarUrl" :src="student.avatarUrl" alt="Avatar" />
              <div v-else class="profile-avatar-empty">
                <el-icon :size="56"><User /></el-icon>
              </div>
            </div>
          </div>

          <!-- Name & Status -->
          <h2 class="profile-name">{{ student.fullName }}</h2>
          <div class="profile-id">ID: {{ student.id }}</div>
          <el-tag :type="statusTagType[student.status]" round class="profile-status-tag">
            {{ student.status === 'ACTIVE' ? $t('status.active') : $t('status.deleted') }}
          </el-tag>

          <!-- Quick Info -->
          <div class="profile-quick-info">
            <div class="quick-info-item">
              <span class="quick-label">{{ $t('form.phone') }}</span>
              <span class="quick-value">{{ student.phoneNumber || '—' }}</span>
            </div>
            <div class="quick-info-item">
              <span class="quick-label">{{ $t('form.email') }}</span>
              <span class="quick-value">{{ student.email || '—' }}</span>
            </div>
            <div class="quick-info-item">
              <span class="quick-label">{{ $t('form.gender') }}</span>
              <span class="quick-value">{{ getGenderLabel(student.gender) }}</span>
            </div>
            <div class="quick-info-item">
              <span class="quick-label">{{ $t('form.birthDate') }}</span>
              <span class="quick-value">{{ formatDate(student.birthDate) }}</span>
            </div>
            <div class="quick-info-item">
              <span class="quick-label">{{ $t('form.address') }}</span>
              <span class="quick-value">{{ student.address || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Detailed Info -->
        <div class="card-container info-card">
          <h3 class="info-card-title">{{ $t('detail.personalInfo') }}</h3>

          <div class="info-grid">
            <div class="info-field">
              <label class="field-label">{{ $t('form.fullName') }}</label>
              <div class="field-value">{{ student.fullName }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">ID</label>
              <div class="field-value">{{ student.id }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.identity') }}</label>
              <div class="field-value">{{ student.identityNumber || '—' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.phone') }}</label>
              <div class="field-value">{{ student.phoneNumber || '—' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.email') }}</label>
              <div class="field-value field-value-email">{{ student.email || '—' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.gender') }}</label>
              <div class="field-value">
                <el-tag size="small" round :type="student.gender === 'MALE' ? 'primary' : student.gender === 'FEMALE' ? 'danger' : 'info'">
                  {{ getGenderLabel(student.gender) }}
                </el-tag>
              </div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.birthDate') }}</label>
              <div class="field-value">{{ formatDate(student.birthDate) }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('form.address') }}</label>
              <div class="field-value">{{ student.address || '—' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('col.status') }}</label>
              <div class="field-value">
                <el-tag :type="statusTagType[student.status]" size="small" round>
                  {{ student.status === 'ACTIVE' ? $t('status.active') : $t('status.deleted') }}
                </el-tag>
              </div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('detail.createdDate') }}</label>
              <div class="field-value">{{ formatDate(student.createdDate) }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">{{ $t('detail.updatedDate') }}</label>
              <div class="field-value">{{ formatDate(student.updatedDate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Form Dialog -->
    <StudentForm
      v-model:visible="formVisible"
      :student-id="studentId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  min-height: 400px;
}

.detail-page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.back-btn {
  flex-shrink: 0;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  flex-shrink: 0;
}

/* Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

/* Profile Card (Left) */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px !important;
  text-align: center;
}

.profile-avatar-wrapper {
  margin-bottom: 20px;
}

.profile-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
  transition: border-color var(--transition-normal);
}

.profile-avatar:hover {
  border-color: rgba(102, 126, 234, 0.6);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-empty {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-input) 0%, var(--bg-card) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 4px;
}

.profile-id {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
  font-weight: 500;
}

.profile-status-tag {
  margin-bottom: 24px;
}

.profile-quick-info {
  width: 100%;
  border-top: 1px solid var(--border-color-light);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quick-info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.quick-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 80px;
}

.quick-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

/* Info Card (Right) */
.info-card {
  padding: 28px 32px !important;
}

.info-card-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 32px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 14px;
  color: var(--text-white);
  font-weight: 500;
  padding: 10px 14px;
  background: var(--bg-input);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color-light);
  min-height: 40px;
  display: flex;
  align-items: center;
}

.field-value-email {
  word-break: break-all;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
