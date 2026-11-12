<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Delete, StarFilled, VideoPlay, Picture, Document } from '@element-plus/icons-vue'
import { getLesson, createLesson, updateLesson } from '@/api/lesson'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  courseId: { type: Number, required: true },
  lessonId: { type: Number, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')

// Files
const resourceError = ref('')
const newVideos = ref([])
const newThumbnails = ref([])
const newDocuments = ref([])
const existingResources = ref({ videos: [], thumbnails: [], documents: [] })
const deletedResourceIds = ref([])
const chosenPrimaryVideoId = ref(null)
const chosenPrimaryThumbnailId = ref(null)

const formData = reactive({
  title: '',
  lessonCode: '',
  summary: '',
  content: '',
  orderIndex: 1,
  durationInSeconds: 60,
  lessonType: 'VIDEO'
})

// Chan validate tu dong khi form dang reset / nap du lieu
const suppressValidate = ref(true)

function requiredValidator(msgKey, max) {
  return (rule, value, callback) => {
    if (suppressValidate.value) return callback()
    const val = typeof value === 'string' ? value.trim() : value
    if (val === '' || val === null || val === undefined) {
      callback(new Error(t(msgKey)))
    } else if (max && typeof val === 'string' && val.length > max) {
      callback(new Error(t('validate.maxLength', { max })))
    } else {
      callback()
    }
  }
}

const rules = {
  title: [{ required: true, validator: requiredValidator('lessonValidate.title', 255), trigger: ['blur', 'change'] }],
  lessonCode: [{ required: true, validator: requiredValidator('lessonValidate.code', 50), trigger: ['blur', 'change'] }],
  summary: [{ required: true, validator: requiredValidator('lessonValidate.summary', 500), trigger: ['blur', 'change'] }],
  content: [{ required: true, validator: requiredValidator('lessonValidate.content'), trigger: ['blur', 'change'] }],
  orderIndex: [{ required: true, validator: requiredValidator('lessonValidate.order'), trigger: ['blur', 'change'] }],
  durationInSeconds: [{ required: true, validator: requiredValidator('lessonValidate.duration'), trigger: ['blur', 'change'] }],
  lessonType: [{ required: true, validator: requiredValidator('lessonValidate.type'), trigger: 'change' }]
}

watch(() => props.visible, async (val) => {
  if (!val) {
    suppressValidate.value = true
    return
  }
  suppressValidate.value = true
  resetForm()
  if (props.lessonId) {
    isEdit.value = true
    dialogTitle.value = t('lessons.edit')
    await loadLesson(props.lessonId)
  } else {
    isEdit.value = false
    dialogTitle.value = t('lessons.addNew')
  }
  await nextTick()
  await nextTick()
  formRef.value?.clearValidate()
  suppressValidate.value = false
})

async function loadLesson(id) {
  loading.value = true
  try {
    const res = await getLesson(id)
    const data = res.data
    Object.keys(formData).forEach((key) => {
      if (data[key] != null) formData[key] = data[key]
    })
    existingResources.value = {
      videos: (data.videos || []).filter(r => r.status === 'ACTIVE'),
      thumbnails: (data.thumbnails || []).filter(r => r.status === 'ACTIVE'),
      documents: (data.documents || []).filter(r => r.status === 'ACTIVE')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(formData, {
    title: '', lessonCode: '', summary: '', content: '',
    orderIndex: 1, durationInSeconds: 60, lessonType: 'VIDEO'
  })
  newVideos.value = []
  newThumbnails.value = []
  newDocuments.value = []
  existingResources.value = { videos: [], thumbnails: [], documents: [] }
  deletedResourceIds.value = []
  chosenPrimaryVideoId.value = null
  chosenPrimaryThumbnailId.value = null
  resourceError.value = ''
  formRef.value?.clearValidate()
}

// ----- Kiem tra dinh dang file truoc khi them vao danh sach -----
// Thuoc tinh accept cua <input type="file"> chi loc trong hop thoai chon file,
// nguoi dung van co the chon "All files" va dua vao file sai loai (vd: .xlsx cho video)
// => bat buoc phai kiem tra lai bang JS.
const FILE_RULES = {
  image: {
    ext: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    mime: 'image/',
    maxMB: 5,
    msg: 'lessonForm.invalidImage'
  },
  video: {
    ext: ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'mkv', 'm4v'],
    mime: 'video/',
    maxMB: 500,
    msg: 'lessonForm.invalidVideo'
  },
  document: {
    ext: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
    mime: null,
    maxMB: 50,
    msg: 'lessonForm.invalidDocument'
  }
}

function isValidFile(raw, kind) {
  const rule = FILE_RULES[kind]
  const ext = (raw.name.split('.').pop() || '').toLowerCase()
  const type = raw.type || ''
  // Duoi file phai dung; neu trinh duyet doc duoc MIME thi MIME cung phai dung
  // => file .xlsx (hoac .xlsx doi ten thanh .mp4) deu bi chan
  if (!rule.ext.includes(ext)) return false
  if (rule.mime && type && !type.startsWith(rule.mime)) return false
  return true
}

function addFile(list, file, kind) {
  const raw = file.raw || file
  const rule = FILE_RULES[kind]
  if (!isValidFile(raw, kind)) {
    ElMessage.error(t(rule.msg, { name: raw.name }))
    return
  }
  if (raw.size > rule.maxMB * 1024 * 1024) {
    ElMessage.error(t('lessonForm.fileTooLarge', { name: raw.name, max: rule.maxMB }))
    return
  }
  list.push({ file: raw, name: raw.name, preview: URL.createObjectURL(raw) })
  resourceError.value = ''
}

function removeNewFile(list, index) {
  URL.revokeObjectURL(list[index].preview)
  list.splice(index, 1)
}

function removeExistingResource(category, resource) {
  deletedResourceIds.value.push(resource.id)
  existingResources.value[category] = existingResources.value[category].filter(r => r.id !== resource.id)
}

async function handleSubmit() {
  suppressValidate.value = false

  let valid = true
  try {
    await formRef.value.validate()
  } catch {
    valid = false
  }

  if (!isEdit.value && newThumbnails.value.length === 0) {
    resourceError.value = t('lessonForm.thumbnailRequired')
    valid = false
  } else {
    resourceError.value = ''
  }

  // Bai hoc dang VIDEO phai co video, dang DOCUMENT phai co tai lieu
  const totalVideos = newVideos.value.length + existingResources.value.videos.length
  const totalDocs = newDocuments.value.length + existingResources.value.documents.length
  if (formData.lessonType === 'VIDEO' && totalVideos === 0) {
    ElMessage.warning(t('lessonForm.videoRequired'))
    valid = false
  }
  if (formData.lessonType === 'DOCUMENT' && totalDocs === 0) {
    ElMessage.warning(t('lessonForm.documentRequired'))
    valid = false
  }

  if (!valid) {
    if (!resourceError.value) ElMessage.warning(t('validate.checkForm'))
    return
  }

  loading.value = true
  try {
    const fd = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value != null && value !== '') fd.append(key, value)
    })

    newVideos.value.forEach(v => fd.append('videos', v.file))
    newThumbnails.value.forEach(t => fd.append('thumbnails', t.file))
    newDocuments.value.forEach(d => fd.append('documents', d.file))

    if (isEdit.value) {
      deletedResourceIds.value.forEach(id => fd.append('deletedResourceIds', id))
      if (chosenPrimaryVideoId.value) fd.append('chosenPrimaryVideoId', chosenPrimaryVideoId.value)
      if (chosenPrimaryThumbnailId.value) fd.append('chosenPrimaryThumbnailId', chosenPrimaryThumbnailId.value)
      await updateLesson(props.lessonId, fd)
      ElMessage.success(t('lessons.updateSuccess'))
    } else {
      await createLesson(props.courseId, fd)
      ElMessage.success(t('lessons.addSuccess'))
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
    width="750px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
    id="dialog-lesson-form"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" v-loading="loading">
      <div class="form-row">
        <el-form-item :label="$t('lessonForm.title')" prop="title" class="form-col">
          <el-input v-model="formData.title" :placeholder="$t('lessonForm.titlePlaceholder')" id="input-lesson-title" />
        </el-form-item>
        <el-form-item :label="$t('lessonForm.code')" prop="lessonCode" class="form-col-sm">
          <el-input v-model="formData.lessonCode" :placeholder="$t('lessonForm.codePlaceholder')" id="input-lesson-code" />
        </el-form-item>
      </div>

      <el-form-item :label="$t('lessonForm.summary')" prop="summary">
        <el-input v-model="formData.summary" type="textarea" :rows="2" :placeholder="$t('lessonForm.summaryPlaceholder')" id="input-lesson-summary" />
      </el-form-item>

      <el-form-item :label="$t('lessonForm.content')" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="4" :placeholder="$t('lessonForm.contentPlaceholder')" id="input-lesson-content" />
      </el-form-item>

      <div class="form-row">
        <el-form-item :label="$t('lessonForm.order')" prop="orderIndex" class="form-col">
          <el-input-number v-model="formData.orderIndex" :min="1" style="width: 100%" id="input-lesson-order" />
        </el-form-item>
        <el-form-item :label="$t('lessonForm.duration')" prop="durationInSeconds" class="form-col">
          <el-input-number v-model="formData.durationInSeconds" :min="1" :step="60" style="width: 100%" id="input-lesson-duration" />
        </el-form-item>
        <el-form-item :label="$t('lessonForm.type')" prop="lessonType" class="form-col">
          <el-select v-model="formData.lessonType" style="width: 100%" id="select-lesson-type">
            <el-option :label="$t('lessonForm.typeVideo')" value="VIDEO" />
            <el-option :label="$t('lessonForm.typeDocument')" value="DOCUMENT" />
            <el-option :label="$t('lessonForm.typeQuiz')" value="QUIZ" />
          </el-select>
        </el-form-item>
      </div>

      <!-- File Uploads -->
      <el-divider content-position="left">{{ $t('lessonForm.resources') }}</el-divider>

      <!-- Thumbnails -->
      <el-form-item :label="$t('lessonForm.thumbnails')" :required="!isEdit" :error="resourceError">
        <div class="resource-section">
          <div class="file-grid">
            <div v-for="res in existingResources.thumbnails" :key="res.id"
              class="file-item" :class="{ 'is-primary': res.isPrimary || chosenPrimaryThumbnailId === res.id }">
              <img :src="res.url" alt="Thumbnail" />
              <div class="file-overlay">
                <button type="button" @click="chosenPrimaryThumbnailId = res.id" class="file-btn"><el-icon><StarFilled /></el-icon></button>
                <button type="button" @click="removeExistingResource('thumbnails', res)" class="file-btn danger"><el-icon><Delete /></el-icon></button>
              </div>
              <div v-if="res.isPrimary || chosenPrimaryThumbnailId === res.id" class="badge primary">{{ $t('badge.primary') }}</div>
            </div>
            <div v-for="(f, i) in newThumbnails" :key="'nt'+i" class="file-item new-file">
              <img :src="f.preview" alt="New" />
              <div class="file-overlay">
                <button type="button" @click="removeNewFile(newThumbnails, i)" class="file-btn danger"><el-icon><Delete /></el-icon></button>
              </div>
              <div class="badge new">{{ $t('badge.new') }}</div>
            </div>
          </div>
          <el-upload :auto-upload="false" :show-file-list="false" accept=".jpg,.jpeg,.png,.gif,.webp,.bmp" multiple @change="(f) => addFile(newThumbnails, f, 'image')">
            <el-button size="small"><el-icon><Picture /></el-icon> {{ $t('lessonForm.addImage') }}</el-button>
          </el-upload>
        </div>
      </el-form-item>

      <!-- Videos -->
      <el-form-item label="Videos" :required="formData.lessonType === 'VIDEO'">
        <div class="resource-section">
          <div class="file-list">
            <div v-for="res in existingResources.videos" :key="res.id" class="file-list-item"
              :class="{ 'is-primary': res.isPrimary || chosenPrimaryVideoId === res.id }">
              <el-icon><VideoPlay /></el-icon>
              <span class="file-name">{{ res.fileName }}</span>
              <el-tag v-if="res.isPrimary || chosenPrimaryVideoId === res.id" type="info" size="small">{{ $t('badge.primary') }}</el-tag>
              <div class="file-list-actions">
                <el-button size="small" text @click="chosenPrimaryVideoId = res.id">{{ $t('btn.setPrimary') }}</el-button>
                <el-button size="small" text type="danger" @click="removeExistingResource('videos', res)">{{ $t('btn.delete') }}</el-button>
              </div>
            </div>
            <div v-for="(f, i) in newVideos" :key="'nv'+i" class="file-list-item new-file">
              <el-icon><VideoPlay /></el-icon>
              <span class="file-name">{{ f.name }}</span>
              <el-tag type="success" size="small">{{ $t('badge.new') }}</el-tag>
              <el-button size="small" text type="danger" @click="removeNewFile(newVideos, i)">{{ $t('btn.delete') }}</el-button>
            </div>
          </div>
          <el-upload :auto-upload="false" :show-file-list="false" accept=".mp4,.webm,.ogg,.ogv,.mov,.avi,.mkv,.m4v" multiple @change="(f) => addFile(newVideos, f, 'video')">
            <el-button size="small"><el-icon><VideoPlay /></el-icon> {{ $t('lessonForm.addVideo') }}</el-button>
          </el-upload>
        </div>
      </el-form-item>

      <!-- Documents -->
      <el-form-item :label="$t('detail.documents')" :required="formData.lessonType === 'DOCUMENT'">
        <div class="resource-section">
          <div class="file-list">
            <div v-for="res in existingResources.documents" :key="res.id" class="file-list-item">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ res.fileName }}</span>
              <el-button size="small" text type="danger" @click="removeExistingResource('documents', res)">{{ $t('btn.delete') }}</el-button>
            </div>
            <div v-for="(f, i) in newDocuments" :key="'nd'+i" class="file-list-item new-file">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ f.name }}</span>
              <el-tag type="success" size="small">{{ $t('badge.new') }}</el-tag>
              <el-button size="small" text type="danger" @click="removeNewFile(newDocuments, i)">{{ $t('btn.delete') }}</el-button>
            </div>
          </div>
          <el-upload :auto-upload="false" :show-file-list="false" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple @change="(f) => addFile(newDocuments, f, 'document')">
            <el-button size="small"><el-icon><Document /></el-icon> {{ $t('lessonForm.addDocument') }}</el-button>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose" id="btn-cancel-lesson">{{ $t('btn.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" id="btn-submit-lesson">
        {{ isEdit ? $t('btn.update') : $t('btn.add') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-row { display: flex; gap: 16px; }
.form-col { flex: 1; }
.form-col-sm { flex: 0 0 160px; }

.resource-section {
  width: 100%;
}

.file-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.file-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--border-color);
  transition: border-color var(--transition-fast);
}

.file-item.is-primary { border-color: #667eea; }

.file-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.file-item:hover .file-overlay { opacity: 1; }

.file-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.file-btn.danger:hover { background: rgba(245, 54, 92, 0.8); }

.badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  color: white;
}

.badge.primary { background: rgba(102, 126, 234, 0.9); }
.badge.new { background: rgba(45, 206, 137, 0.9); }

.file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.file-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  font-size: 13px;
}

.file-list-item.is-primary { border-color: #667eea; }
.file-list-item.new-file { border-color: rgba(45, 206, 137, 0.4); }

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.file-list-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.el-divider {
  border-color: var(--border-color) !important;
}

.el-divider__text {
  color: var(--text-secondary) !important;
  background: var(--bg-card) !important;
  font-weight: 600;
  font-size: 13px;
}
</style>
