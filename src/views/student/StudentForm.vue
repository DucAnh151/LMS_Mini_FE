<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { getStudent, createStudent, updateStudent } from '@/api/student'
import { buildFormData } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  studentId: { type: Number, default: null }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref('')

const isEdit = ref(false)
const dialogTitle = ref('')

const formData = reactive({
  fullName: '',
  identityNumber: '',
  birthDate: '',
  gender: '',
  email: '',
  phoneNumber: '',
  address: ''
})

// Chan validate tu dong khi form dang reset / nap du lieu,
// neu khong Element Plus se bao loi ngay khi vua mo dialog
const suppressValidate = ref(true)

// ----- Validators -----
const identityValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  const val = (value || '').trim()
  if (!val) {
    callback(new Error(t('validate.identityRequired')))
  } else if (!/^\d{12}$/.test(val)) {
    callback(new Error(t('validate.identity')))
  } else {
    callback()
  }
}

const phoneValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  const val = (value || '').trim()
  if (!val) {
    callback(new Error(t('validate.phoneRequired')))
  } else if (!/^0\d{9,10}$/.test(val)) {
    callback(new Error(t('validate.phone')))
  } else {
    callback()
  }
}

const emailValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  const val = (value || '').trim()
  if (!val) {
    callback(new Error(t('validate.required')))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
    callback(new Error(t('validate.email')))
  } else {
    callback()
  }
}

// BE yeu cau @Past cho ngay sinh
const birthDateValidator = (rule, value, callback) => {
  if (suppressValidate.value) return callback()
  if (!value) {
    callback(new Error(t('validate.required')))
    return
  }
  const picked = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Number.isNaN(picked.getTime()) || picked >= today) {
    callback(new Error(t('validate.birthDateFuture')))
  } else {
    callback()
  }
}

function requiredValidator({ max = 255 } = {}) {
  return (rule, value, callback) => {
    if (suppressValidate.value) return callback()
    const val = typeof value === 'string' ? value.trim() : value
    if (val === '' || val === null || val === undefined) {
      callback(new Error(t('validate.required')))
    } else if (typeof val === 'string' && val.length > max) {
      callback(new Error(t('validate.maxLength', { max })))
    } else {
      callback()
    }
  }
}

const rules = {
  fullName: [{ required: true, validator: requiredValidator({ max: 255 }), trigger: ['blur', 'change'] }],
  // required: true de hien dau * (BE cung @NotBlank truong nay)
  identityNumber: [{ required: true, validator: identityValidator, trigger: ['blur', 'change'] }],
  birthDate: [{ required: true, validator: birthDateValidator, trigger: 'change' }],
  email: [{ required: true, validator: emailValidator, trigger: ['blur', 'change'] }],
  phoneNumber: [{ required: true, validator: phoneValidator, trigger: ['blur', 'change'] }],
  address: [{ required: true, validator: requiredValidator({ max: 255 }), trigger: ['blur', 'change'] }]
}

// Watch dialog open
watch(() => props.visible, async (val) => {
  if (!val) {
    suppressValidate.value = true
    return
  }
  suppressValidate.value = true
  resetForm()
  if (props.studentId) {
    isEdit.value = true
    dialogTitle.value = t('students.edit')
    await loadStudent(props.studentId)
  } else {
    isEdit.value = false
    dialogTitle.value = t('students.add')
  }
  await nextTick()
  await nextTick()
  formRef.value?.clearValidate()
  suppressValidate.value = false
})

async function loadStudent(id) {
  loading.value = true
  try {
    const res = await getStudent(id)
    const data = res.data
    Object.keys(formData).forEach((key) => {
      if (data[key] != null) formData[key] = data[key]
    })
    if (data.avatarUrl) {
      avatarPreview.value = data.avatarUrl
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.keys(formData).forEach((key) => { formData[key] = '' })
  formData.gender = ''
  avatarFile.value = null
  avatarPreview.value = ''
  formRef.value?.clearValidate()
}

// Khong cho chon ngay sinh tu hom nay tro di (BE: @Past)
function disabledFutureDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() >= today.getTime()
}

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
const MAX_IMAGE_MB = 5

function handleAvatarChange(file) {
  const raw = file.raw || file
  const ext = (raw.name.split('.').pop() || '').toLowerCase()
  // accept="image/*" chi la goi y cua trinh duyet, van phai kiem tra lai
  const type = raw.type || ''
  if (!IMAGE_EXT.includes(ext) || (type && !type.startsWith('image/'))) {
    ElMessage.error(t('lessonForm.invalidImage', { name: raw.name }))
    return
  }
  if (raw.size > MAX_IMAGE_MB * 1024 * 1024) {
    ElMessage.error(t('lessonForm.fileTooLarge', { name: raw.name, max: MAX_IMAGE_MB }))
    return
  }
  if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
  avatarFile.value = raw
  avatarPreview.value = URL.createObjectURL(raw)
}

function handleAvatarRemove() {
  avatarFile.value = null
  avatarPreview.value = ''
}

async function handleSubmit() {
  suppressValidate.value = false
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning(t('validate.checkForm'))
    return
  }

  loading.value = true
  try {
    const payload = { ...formData }
    if (avatarFile.value) {
      payload.avatarImage = avatarFile.value
    }
    const fd = buildFormData(payload)

    if (isEdit.value) {
      await updateStudent(props.studentId, fd)
      ElMessage.success(t('students.edit') + ' ' + t('msg.success').toLowerCase())
    } else {
      await createStudent(fd)
      ElMessage.success(t('students.add') + ' ' + t('msg.success').toLowerCase())
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
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
    id="dialog-student-form"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      v-loading="loading"
    >
      <!-- Avatar Upload -->
      <el-form-item :label="$t('form.avatar')">
        <div class="avatar-upload-area">
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="Avatar" />
            <div class="avatar-overlay" @click="handleAvatarRemove">
              <span>{{ $t('msg.removeImage') }}</span>
            </div>
          </div>
          <el-upload
            v-else
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleAvatarChange"
            class="avatar-uploader"
          >
            <div class="upload-placeholder">
              <el-icon :size="28"><UploadFilled /></el-icon>
              <span>{{ $t('msg.uploadImage') }}</span>
            </div>
          </el-upload>
        </div>
      </el-form-item>

      <div class="form-row">
        <el-form-item :label="$t('form.fullName')" prop="fullName" class="form-col">
          <el-input v-model="formData.fullName" placeholder="Nguyễn Văn A" id="input-fullname" />
        </el-form-item>
        <el-form-item :label="$t('form.identity')" prop="identityNumber" class="form-col">
          <el-input v-model="formData.identityNumber" placeholder="012345678901" maxlength="12" id="input-identity" />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item :label="$t('form.email')" prop="email" class="form-col">
          <el-input v-model="formData.email" placeholder="email@example.com" id="input-email" />
        </el-form-item>
        <el-form-item :label="$t('form.phone')" prop="phoneNumber" class="form-col">
          <el-input v-model="formData.phoneNumber" placeholder="0912345678" maxlength="11" id="input-phone" />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item :label="$t('form.birthDate')" prop="birthDate" class="form-col">
          <el-date-picker
            v-model="formData.birthDate"
            type="date"
            :placeholder="$t('form.birthDate')"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledFutureDate"
            style="width: 100%"
            id="input-birthdate"
          />
        </el-form-item>
        <el-form-item :label="$t('form.gender')" class="form-col">
          <el-select v-model="formData.gender" :placeholder="$t('form.gender')" style="width: 100%" id="select-gender">
            <el-option :label="$t('gender.male')" value="MALE" />
            <el-option :label="$t('gender.female')" value="FEMALE" />
            <el-option :label="$t('gender.other')" value="OTHER" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item :label="$t('form.address')" prop="address">
        <el-input v-model="formData.address" placeholder="Hà Nội" id="input-address" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose" id="btn-cancel-student">{{ $t('btn.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" id="btn-submit-student">
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

.form-col {
  flex: 1;
}

.avatar-upload-area {
  display: flex;
  align-items: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
  border: 2px solid var(--border-color);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
  cursor: pointer;
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-uploader {
  width: 100px;
  height: 100px;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 12px;
}

.upload-placeholder:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
}
</style>
