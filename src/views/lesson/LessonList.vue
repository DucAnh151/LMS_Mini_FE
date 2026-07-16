<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete, Edit, View, VideoPlay, Picture, Document, Refresh } from '@element-plus/icons-vue'
import { getLessons, getLesson, deleteLesson, restoreLesson } from '@/api/lesson'
import { getCourse } from '@/api/course'
import { formatDuration, lessonTypeLabels, statusTagType, levelLabels } from '@/utils/helpers'
import LessonForm from './LessonForm.vue'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => Number(route.params.courseId))

const loading = ref(false)
const lessons = ref([])
const courseInfo = ref(null)
const formVisible = ref(false)
const editingId = ref(null)

// Video preview
const videoPreviewVisible = ref(false)
const videoPreviewUrl = ref('')
const videoPreviewTitle = ref('')


const detailVisible = ref(false)
const detailData = ref(null)
const detailLoading = ref(false)

async function handleViewDetail(lesson) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getLesson(lesson.id)
    detailData.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailVisible.value = false
  detailData.value = null
}

async function fetchLessons() {
  loading.value = true
  try {
    const res = await getLessons(courseId.value)
    lessons.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchCourse() {
  try {
    const res = await getCourse(courseId.value)
    courseInfo.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchCourse()
  fetchLessons()
})

function handleCreate() {
  editingId.value = null
  formVisible.value = true
}

function handleEdit(lesson) {
  editingId.value = lesson.id
  formVisible.value = true
}

function handleFormSuccess() {
  formVisible.value = false
  fetchLessons()
}

async function handleDelete(lesson) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận xóa bài học "${lesson.title}"?`,
      'Xóa bài học',
      { type: 'warning', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' }
    )
    await deleteLesson(lesson.id)
    ElMessage.success('Đã xóa bài học')
    fetchLessons()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

function goBack() {
  router.push('/courses')
}

function getLessonTypeIcon(type) {
  switch (type) {
    case 'VIDEO': return VideoPlay
    case 'DOCUMENT': return Document
    default: return Document
  }
}

function handlePreviewVideo(lesson) {
  if (lesson.primaryVideoUrl) {
    videoPreviewUrl.value = lesson.primaryVideoUrl
    videoPreviewTitle.value = lesson.title
    videoPreviewVisible.value = true
  }
}

function closeVideoPreview() {
  videoPreviewVisible.value = false
  videoPreviewUrl.value = ''
  videoPreviewTitle.value = ''
}
</script>

<template>
  <div class="page-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <el-button :icon="ArrowLeft" @click="goBack" class="back-btn" id="btn-back-courses">
          Quay lại
        </el-button>
        <div>
          <h1 class="page-title">
            <span class="gradient-text">Bài học</span>
          </h1>
          <p class="page-subtitle" v-if="courseInfo">
            Khóa học: <strong>{{ courseInfo.name }}</strong>
            <el-tag :type="courseInfo.level ? (courseInfo.level === 'BEGINNER' ? 'success' : courseInfo.level === 'INTERMEDIATE' ? 'warning' : 'danger') : 'info'" size="small" round style="margin-left: 8px">
              {{ levelLabels[courseInfo.level] || courseInfo.level }}
            </el-tag>
          </p>
        </div>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate" id="btn-create-lesson">
          Thêm bài học
        </el-button>
      </div>
    </div>

    <!-- Lessons List -->
    <div v-loading="loading" class="lessons-grid">
      <div v-if="lessons.length === 0 && !loading" class="empty-state card-container">
        <el-empty description="Chưa có bài học nào">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            Thêm bài học đầu tiên
          </el-button>
        </el-empty>
      </div>

      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-card card-container"
      >
        <div class="lesson-card-inner">
          <!-- Thumbnail -->
          <div class="lesson-thumb" @click="handlePreviewVideo(lesson)" :class="{ 'has-video': !!lesson.primaryVideoUrl }">
            <img
              v-if="lesson.primaryThumbnailUrl"
              :src="lesson.primaryThumbnailUrl"
              alt="Thumbnail"
            />
            <div v-else class="lesson-thumb-placeholder">
              <el-icon :size="32"><component :is="getLessonTypeIcon(lesson.lessonType)" /></el-icon>
            </div>
            <!-- Play overlay -->
            <div v-if="lesson.primaryVideoUrl" class="play-overlay">
              <el-icon :size="36"><VideoPlay /></el-icon>
            </div>
            <!-- Order badge -->
            <div class="order-badge">{{ lesson.orderIndex }}</div>
            <!-- Type badge -->
            <div class="type-badge">
              {{ lessonTypeLabels[lesson.lessonType] || lesson.lessonType }}
            </div>
          </div>

          <!-- Info -->
          <div class="lesson-info">
            <div class="lesson-header-row">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <el-tag :type="statusTagType[lesson.status]" size="small" round>
                {{ lesson.status === 'ACTIVE' ? 'HĐ' : 'Xóa' }}
              </el-tag>
            </div>
            <p class="lesson-code">{{ lesson.lessonCode }}</p>
            <p class="lesson-summary" v-if="lesson.summary">{{ lesson.summary }}</p>
            <div class="lesson-meta">
              <span class="meta-item">
                <el-icon><VideoPlay /></el-icon>
                {{ formatDuration(lesson.durationInSeconds) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="lesson-actions">
            <el-tooltip content="Xem chi tiết" placement="top">
              <el-button type="info" :icon="View" size="small" circle @click="handleViewDetail(lesson)" />
            </el-tooltip>
            <el-tooltip content="Sửa" placement="top">
              <el-button type="primary" :icon="Edit" size="small" circle @click="handleEdit(lesson)" />
            </el-tooltip>
            <el-tooltip v-if="lesson.status === 'ACTIVE'" content="Xóa" placement="top">
              <el-button type="danger" :icon="Delete" size="small" circle @click="handleDelete(lesson)" />
            </el-tooltip>
            <el-tooltip v-else content="Khôi phục" placement="top">
              <el-button type="success" :icon="Refresh" size="small" circle @click="handleRestore(lesson)" />
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Dialog -->
    <LessonForm
      v-model:visible="formVisible"
      :course-id="courseId"
      :lesson-id="editingId"
      @success="handleFormSuccess"
    />

    <!-- Video Preview Dialog -->
    <el-dialog
      v-model="videoPreviewVisible"
      :title="videoPreviewTitle"
      width="800px"
      :close-on-click-modal="true"
      @close="closeVideoPreview"
      id="dialog-video-preview"
      class="video-preview-dialog"
    >
      <div class="video-container">
        <video
          v-if="videoPreviewUrl"
          :src="videoPreviewUrl"
          controls
          autoplay
          class="preview-video"
        >
          Trình duyệt không hỗ trợ phát video.
        </video>
      </div>
    </el-dialog>
    <el-dialog
      v-model="detailVisible"
      :title="detailData?.title || 'Chi tiết bài học'"
      width="700px"
      @close="closeDetail"
      id="dialog-lesson-detail"
      v-loading="detailLoading"
    >
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.back-btn {
  margin-top: 4px;
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
  flex-shrink: 0;
}

.lessons-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-card {
  padding: 0 !important;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.lesson-card-inner {
  display: flex;
  align-items: stretch;
}

.lesson-thumb {
  width: 180px;
  min-height: 120px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--bg-input);
}

.lesson-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lesson-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.order-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.type-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  backdrop-filter: blur(4px);
}

.lesson-info {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.lesson-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lesson-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-white);
}

.lesson-code {
  font-size: 12px;
  color: var(--text-accent);
  font-weight: 500;
}

.lesson-summary {
  font-size: 13px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lesson-meta {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.lesson-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  justify-content: center;
  border-left: 1px solid var(--border-color-light);
}

.empty-state {
  padding: 60px 20px !important;
  text-align: center;
}

/* Video preview */
.lesson-thumb.has-video {
  cursor: pointer;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.lesson-thumb.has-video:hover .play-overlay {
  opacity: 1;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.lesson-detail { display: flex; flex-direction: column; gap: 8px; }
.detail-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.detail-content-text { color: var(--text-secondary); white-space: pre-line; }
.detail-video { width: 100%; max-height: 300px; border-radius: var(--border-radius-sm); margin-bottom: 8px; }
.detail-thumb-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.detail-thumb-img { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; }
.detail-doc-list { display: flex; flex-direction: column; gap: 6px; }
.detail-doc-link { display: flex; align-items: center; gap: 8px; color: var(--text-accent); }
</style>
