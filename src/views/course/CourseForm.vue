<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Delete, Star, StarFilled } from '@element-plus/icons-vue'
import { getCourse, createCourse, updateCourse } from '@/api/course'
import { buildFormData } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  courseId: { type: Number, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')

// Thumbnails
const newThumbnails = ref([])
const existingThumbnails = ref([])
const deletedThumbnailIds = ref([])
const chosenPrimaryThumbnailId = ref(null)

// Duration split
const durationHours = ref(0)
const durationMinutes = ref(0)

const formData = reactive({
  name: '',
  code: '',
  description: '',
  price: null,
  level: '',
  duration: '',
  language: '',
  instructorName: ''
})

// Duration validation
const durationValidator = (rule, value, callback) => {
  if (durationHours.value <= 0 && durationMinutes.value <= 0) {
    callback(new Error(t('validate.durationRequired')))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: () => t('validate.required'), trigger: ['blur', 'change'] }],
  code: [{ required: true, message: () => t('validate.required'), trigger: ['blur', 'change'] }],
  price: [{ required: true, message: () => t('validate.required'), trigger: ['blur', 'change'] }],
  level: [{ required: true, message: () => t('validate.required'), trigger: 'change' }],
  duration: [{ validator: durationValidator, trigger: ['blur', 'change'] }],
  language: [{ required: true, message: () => t('validate.required'), trigger: 'change' }],
  instructorName: [{ required: true, message: () => t('validate.required'), trigger: ['blur', 'change'] }]
}

// Sync duration hours/minutes → formData.duration string
function syncDuration() {
  const parts = []
  if (durationHours.value > 0) parts.push(`${durationHours.value} hours`)
  if (durationMinutes.value > 0) parts.push(`${durationMinutes.value} minutes`)
  formData.duration = parts.join(' ') || ''
  // Trigger re-validation
  formRef.value?.validateField('duration').catch(() => {})
}

// Parse "30 hours" or "1 hours 30 minutes" → split
function parseDuration(str) {
  durationHours.value = 0
  durationMinutes.value = 0
  if (!str) return
  const hoursMatch = str.match(/(\d+)\s*hours?/i)
  const minutesMatch = str.match(/(\d+)\s*minutes?/i)
  if (hoursMatch) durationHours.value = parseInt(hoursMatch[1])
  if (minutesMatch) durationMinutes.value = parseInt(minutesMatch[1])
}

watch(() => props.visible, async (val) => {
  if (val) {
    resetForm()
    if (props.courseId) {
      isEdit.value = true
      dialogTitle.value = t('courses.edit')
      await loadCourse(props.courseId)
    } else {
      isEdit.value = false
      dialogTitle.value = t('courses.add')
    }
  }
})

async function loadCourse(id) {
  loading.value = true
  try {
    const res = await getCourse(id)
    const data = res.data
    Object.keys(formData).forEach((key) => {
      if (data[key] != null) formData[key] = data[key]
    })
    // Parse duration
    parseDuration(data.duration)
    // Load existing thumbnails
    if (data.resources) {
      existingThumbnails.value = data.resources
        .filter(r => r.status === 'ACTIVE' && r.resourceType === 'THUMBNAIL')
        .map(r => ({ ...r }))
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.keys(formData).forEach((key) => { formData[key] = '' })
  formData.price = null
  durationHours.value = 0
  durationMinutes.value = 0
  newThumbnails.value = []
  existingThumbnails.value = []
  deletedThumbnailIds.value = []
  chosenPrimaryThumbnailId.value = null
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function handleThumbnailChange(file) {
  const raw = file.raw || file
  newThumbnails.value.push({
    file: raw,
    preview: URL.createObjectURL(raw),
    name: raw.name
  })
}

function removeNewThumbnail(index) {
  URL.revokeObjectURL(newThumbnails.value[index].preview)
  newThumbnails.value.splice(index, 1)
}

function removeExistingThumbnail(thumb) {
  deletedThumbnailIds.value.push(thumb.id)
  existingThumbnails.value = existingThumbnails.value.filter(t => t.id !== thumb.id)
  if (chosenPrimaryThumbnailId.value === thumb.id) {
    chosenPrimaryThumbnailId.value = null
  }
}

function setPrimaryThumbnail(thumbId) {
  chosenPrimaryThumbnailId.value = thumbId
}

async function handleSubmit() {
  // Sync duration before validate
  syncDuration()

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // Validate thumbnails for create
  if (!isEdit.value && newThumbnails.value.length === 0) {
    ElMessage.warning('Vui lòng tải lên ít nhất 1 thumbnail')
    return
  }

  loading.value = true
  try {
    const fd = new FormData()

    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value != null && value !== '') {
        fd.append(key, value)
      }
    })

    // Append new thumbnails
    newThumbnails.value.forEach((t) => {
      fd.append('thumbnails', t.file)
    })

    if (isEdit.value) {
      // Append deleted IDs
      deletedThumbnailIds.value.forEach((id) => {
        fd.append('deletedThumbnailIds', id)
      })
      // Append chosen primary
      if (chosenPrimaryThumbnailId.value) {
        fd.append('chosenPrimaryThumbnailId', chosenPrimaryThumbnailId.value)
      }
      await updateCourse(props.courseId, fd)
      ElMessage.success(t('courses.edit') + ' ' + t('msg.success').toLowerCase())
    } else {
      await createCourse(fd)
      ElMessage.success(t('courses.add') + ' ' + t('msg.success').toLowerCase())
    }
    emit('success')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    id="dialog-course-form"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      v-loading="loading"
    >
      <div class="form-row">
        <el-form-item :label="$t('form.courseName')" prop="name" class="form-col">
          <el-input v-model="formData.name" placeholder="Spring Boot cơ bản" id="input-course-name" />
        </el-form-item>
        <el-form-item :label="$t('form.courseCode')" prop="code" class="form-col-sm">
          <el-input v-model="formData.code" placeholder="SB101" id="input-course-code" />
        </el-form-item>
      </div>

      <el-form-item :label="$t('form.description')">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="Mô tả khóa học..."
          id="input-course-desc"
        />
      </el-form-item>

      <div class="form-row">
        <el-form-item :label="$t('form.price')" prop="price" class="form-col">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :step="50000"
            style="width: 100%"
            id="input-course-price"
          />
        </el-form-item>
        <el-form-item :label="$t('form.level')" prop="level" class="form-col">
          <el-select v-model="formData.level" :placeholder="$t('form.level')" style="width: 100%" id="select-course-level">
            <el-option :label="$t('level.beginner')" value="BEGINNER" />
            <el-option :label="$t('level.intermediate')" value="INTERMEDIATE" />
            <el-option :label="$t('level.advanced')" value="ADVANCED" />
          </el-select>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item :label="$t('form.duration')" prop="duration" class="form-col">
          <div class="duration-input">
            <el-input-number
              v-model="durationHours"
              :min="0"
              :max="999"
              controls-position="right"
              @change="syncDuration"
              style="flex: 1"
              id="input-course-duration-hours"
            />
            <span class="duration-label">{{ $t('form.hours') }}</span>
            <el-input-number
              v-model="durationMinutes"
              :min="0"
              :max="59"
              controls-position="right"
              @change="syncDuration"
              style="flex: 1"
              id="input-course-duration-minutes"
            />
            <span class="duration-label">{{ $t('form.minutes') }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('form.language')" prop="language" class="form-col">
          <el-select v-model="formData.language" :placeholder="$t('form.language')" style="width: 100%" id="select-course-lang">
            <el-option :label="$t('lang.vietnamese')" value="VIETNAMESE" />
            <el-option :label="$t('lang.english')" value="ENGLISH" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item :label="$t('form.instructor')" prop="instructorName">
        <el-input v-model="formData.instructorName" placeholder="Nguyễn Văn B" id="input-course-instructor" />
      </el-form-item>

      <!-- Thumbnails -->
      <el-form-item :label="$t('form.thumbnails')">
        <!-- Existing thumbnails (edit mode) -->
        <div v-if="existingThumbnails.length > 0" class="thumb-grid">
          <div
            v-for="thumb in existingThumbnails"
            :key="thumb.id"
            class="thumb-item"
            :class="{ 'is-primary': thumb.isPrimary || chosenPrimaryThumbnailId === thumb.id }"
          >
            <img :src="thumb.url" alt="Thumbnail" />
            <div class="thumb-actions">
              <el-tooltip content="Đặt làm chính" placement="top">
                <button type="button" class="thumb-action-btn" @click="setPrimaryThumbnail(thumb.id)">
                  <el-icon><StarFilled /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="Xóa" placement="top">
                <button type="button" class="thumb-action-btn danger" @click="removeExistingThumbnail(thumb)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div v-if="thumb.isPrimary || chosenPrimaryThumbnailId === thumb.id" class="primary-badge">
              Chính
            </div>
          </div>
        </div>

        <!-- New thumbnails -->
        <div v-if="newThumbnails.length > 0" class="thumb-grid" style="margin-top: 12px">
          <div v-for="(thumb, index) in newThumbnails" :key="index" class="thumb-item new-thumb">
            <img :src="thumb.preview" alt="New" />
            <div class="thumb-actions">
              <button type="button" class="thumb-action-btn danger" @click="removeNewThumbnail(index)">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
            <div class="new-badge">Mới</div>
          </div>
        </div>

        <!-- Upload button -->
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          multiple
          @change="handleThumbnailChange"
          class="thumb-upload"
        >
          <div class="upload-trigger">
            <el-icon :size="24"><UploadFilled /></el-icon>
            <span>Thêm ảnh thumbnail</span>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose" id="btn-cancel-course">{{ $t('btn.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" id="btn-submit-course">
        {{ isEdit ? $t('btn.update') : $t('btn.add') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-row {
  display: flex;
  gap: 16px;
}

.form-col { flex: 1; }
.form-col-sm { flex: 0 0 180px; }

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.duration-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 30px;
}

.thumb-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.thumb-item {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  position: relative;
  border: 2px solid var(--border-color);
  transition: border-color var(--transition-fast);
}

.thumb-item.is-primary {
  border-color: #667eea;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.thumb-item:hover .thumb-actions {
  opacity: 1;
}

.thumb-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transition: background var(--transition-fast);
}

.thumb-action-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.thumb-action-btn.danger:hover {
  background: rgba(245, 54, 92, 0.8);
}

.primary-badge,
.new-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.primary-badge {
  background: rgba(102, 126, 234, 0.9);
}

.new-badge {
  background: rgba(45, 206, 137, 0.9);
}

.thumb-upload {
  margin-top: 12px;
}

.upload-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
}

.upload-trigger:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
}
</style>
