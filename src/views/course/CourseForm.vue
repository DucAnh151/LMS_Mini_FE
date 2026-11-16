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
const thumbnailError = ref('')
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

// Co chan validate khi form dang duoc reset / nap du lieu
// (Element Plus tu goi validate('change') moi khi model thay doi,
//  nen neu khong chan thi vua mo dialog da bao "Truong nay la bat buoc")
const suppressValidate = ref(true)

// ----- Validators -----
const durationValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  if (durationHours.value <= 0 && durationMinutes.value <= 0) {
    callback(new Error(t('validate.durationRequired')))
  } else {
    callback()
  }
}

// Validator dung chung: bo qua khi dang reset, bat buoc nhap, gioi han do dai
function requiredValidator({ max = 255, trim = true } = {}) {
  return (rule, value, callback) => {
    if (suppressValidate.value) return callback()
    const val = typeof value === 'string' && trim ? value.trim() : value
    if (val === '' || val === null || val === undefined) {
      callback(new Error(t('validate.required')))
    } else if (typeof val === 'string' && val.length > max) {
      callback(new Error(t('validate.maxLength', { max })))
    } else {
      callback()
    }
  }
}

const priceValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  if (value === '' || value === null || value === undefined) {
    callback(new Error(t('validate.required')))
  } else if (Number.isNaN(Number(value)) || Number(value) < 0) {
    callback(new Error(t('validate.priceMin')))
  } else {
    callback()
  }
}

const selectValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  if (!value) callback(new Error(t('validate.required')))
  else callback()
}

const rules = {
  name: [{ required: true, validator: requiredValidator({ max: 255 }), trigger: ['blur', 'change'] }],
  code: [{ required: true, validator: requiredValidator({ max: 50 }), trigger: ['blur', 'change'] }],
  price: [{ required: true, validator: priceValidator, trigger: ['blur', 'change'] }],
  level: [{ required: true, validator: selectValidator, trigger: 'change' }],
  duration: [{ required: true, validator: durationValidator, trigger: ['blur', 'change'] }],
  language: [{ required: true, validator: selectValidator, trigger: 'change' }],
  instructorName: [{ required: true, validator: requiredValidator({ max: 255 }), trigger: ['blur', 'change'] }]
}

// Sync duration hours/minutes → formData.duration string
function syncDuration() {
  const parts = []
  if (durationHours.value > 0) parts.push(`${durationHours.value} hours`)
  if (durationMinutes.value > 0) parts.push(`${durationMinutes.value} minutes`)
  formData.duration = parts.join(' ') || ''
  // Trigger re-validation (bo qua khi dang reset/nap du lieu)
  if (!suppressValidate.value) {
    formRef.value?.validateField('duration').catch(() => {})
  }
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
  if (!val) {
    suppressValidate.value = true
    return
  }
  suppressValidate.value = true
  resetForm()
  if (props.courseId) {
    isEdit.value = true
    dialogTitle.value = t('courses.edit')
    await loadCourse(props.courseId)
  } else {
    isEdit.value = false
    dialogTitle.value = t('courses.add')
  }
  // Cho Element Plus chay xong cac validate tu sinh do gan du lieu,
  // xoa sach trang thai loi roi moi mo lai validate cho thao tac cua nguoi dung
  await nextTick()
  await nextTick()
  formRef.value?.clearValidate()
  suppressValidate.value = false
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
      // Khởi tạo primary hiện tại làm lựa chọn ban đầu (một nguồn sự thật duy nhất)
      const primary = existingThumbnails.value.find(r => r.isPrimary)
      chosenPrimaryThumbnailId.value = primary ? primary.id : null
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
  newThumbnails.value.forEach((item) => URL.revokeObjectURL(item.preview))
  newThumbnails.value = []
  existingThumbnails.value = []
  deletedThumbnailIds.value = []
  chosenPrimaryThumbnailId.value = null
  thumbnailError.value = ''
  formRef.value?.clearValidate()
}

// Loi hien thi ngay duoi o upload thumbnail
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
const MAX_IMAGE_MB = 5

function handleThumbnailChange(file) {
  const raw = file.raw || file
  const ext = (raw.name.split('.').pop() || '').toLowerCase()
  // Chan file khong phai anh (accept="image/*" chi la goi y, nguoi dung van chon duoc file khac)
  const type = raw.type || ''
  if (!IMAGE_EXT.includes(ext) || (type && !type.startsWith('image/'))) {
    ElMessage.error(t('lessonForm.invalidImage', { name: raw.name }))
    return
  }
  if (raw.size > MAX_IMAGE_MB * 1024 * 1024) {
    ElMessage.error(t('lessonForm.fileTooLarge', { name: raw.name, max: MAX_IMAGE_MB }))
    return
  }
  newThumbnails.value.push({
    file: raw,
    preview: URL.createObjectURL(raw),
    name: raw.name
  })
  thumbnailError.value = ''
}

function removeNewThumbnail(index) {
  URL.revokeObjectURL(newThumbnails.value[index].preview)
  newThumbnails.value.splice(index, 1)
}

function removeExistingThumbnail(thumb) {
  deletedThumbnailIds.value.push(thumb.id)
  existingThumbnails.value = existingThumbnails.value.filter(t => t.id !== thumb.id)
  // Nếu xóa đúng ảnh đang là primary -> chuyển sang ảnh còn lại (nếu có)
  if (chosenPrimaryThumbnailId.value === thumb.id) {
    const next = existingThumbnails.value[0]
    chosenPrimaryThumbnailId.value = next ? next.id : null
  }
}

function setPrimaryThumbnail(thumbId) {
  chosenPrimaryThumbnailId.value = thumbId
}

async function handleSubmit() {
  // Mo validate (nguoi dung da chu dong bam Luu) va dong bo thoi luong truoc khi kiem tra
  suppressValidate.value = false
  syncDuration()

  let valid = true
  try {
    await formRef.value.validate()
  } catch {
    valid = false
  }

  // Validate thumbnails khi tao moi (BE bat buoc phai co it nhat 1 anh)
  if (!isEdit.value && newThumbnails.value.length === 0) {
    thumbnailError.value = t('validate.thumbnailRequired')
    valid = false
  } else {
    thumbnailError.value = ''
  }

  if (!valid) {
    ElMessage.warning(t('validate.checkForm'))
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
    destroy-on-close
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
      <el-form-item :label="$t('form.thumbnails')" :required="!isEdit" :error="thumbnailError">
        <!-- Existing thumbnails (edit mode) -->
        <div v-if="existingThumbnails.length > 0" class="thumb-grid">
          <div
            v-for="thumb in existingThumbnails"
            :key="thumb.id"
            class="thumb-item"
            :class="{ 'is-primary': chosenPrimaryThumbnailId === thumb.id }"
          >
            <img :src="thumb.url" alt="Thumbnail" />
            <div class="thumb-actions">
              <el-tooltip :content="$t('btn.setPrimary')" placement="top">
                <button type="button" class="thumb-action-btn" :class="{ active: chosenPrimaryThumbnailId === thumb.id }" @click="setPrimaryThumbnail(thumb.id)">
                  <el-icon><StarFilled /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip :content="$t('btn.delete')" placement="top">
                <button type="button" class="thumb-action-btn danger" @click="removeExistingThumbnail(thumb)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div v-if="chosenPrimaryThumbnailId === thumb.id" class="primary-badge">
              {{ $t('badge.primary') }}
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
            <div class="new-badge">{{ $t('badge.new') }}</div>
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
            <span>{{ $t('form.addThumbnail') }}</span>
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

.thumb-action-btn.active {
  background: #f5a623;
  color: #fff;
}
.thumb-action-btn.active:hover {
  background: #f5a623;
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
