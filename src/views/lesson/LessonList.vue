<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete, Edit, VideoPlay, Picture, Document, View, Refresh } from '@element-plus/icons-vue'
import { getLessons, getLesson, deleteLesson, restoreLesson } from '@/api/lesson'
import { getCourse } from '@/api/course'
import { formatDuration, statusTagType, getLessonTypeLabel, getLevelLabel } from '@/utils/helpers'
import { useI18n } from '@/utils/i18n'
import LessonForm from './LessonForm.vue'

const { t } = useI18n()
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

// Lesson detail dialog
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

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

// Soft delete lesson
async function handleDelete(lesson) {
  try {
    await ElMessageBox.confirm(
      t('lessons.confirmDelete', { title: lesson.title }),
      t('msg.confirmDelete'),
      { type: 'warning', confirmButtonText: t('btn.delete'), cancelButtonText: t('btn.cancel') }
    )
    await deleteLesson(lesson.id)
    ElMessage.success(t('lessons.deleted'))
    fetchLessons()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// Restore lesson
async function handleRestore(lesson) {
  try {
    await ElMessageBox.confirm(
      t('lessons.confirmRestore', { title: lesson.title }),
      t('btn.restore'),
      { type: 'info', confirmButtonText: t('btn.restore'), cancelButtonText: t('btn.cancel') }
    )
    await restoreLesson(lesson.id)
    ElMessage.success(t('lessons.restored'))
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

// View lesson detail (videos + documents)
async function handleViewDetail(lesson) {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await getLesson(lesson.id)
    detailData.value = res.data
  } catch (e) {
    console.error(e)
    ElMessage.error(t('lessons.loadError'))
  } finally {
    detailLoading.value = false
  }
}

function playDetailVideo(video) {
  videoPreviewUrl.value = video.url
  videoPreviewTitle.value = video.fileName || 'Video'
  videoPreviewVisible.value = true
}

function openDocument(doc) {
  window.open(doc.url, '_blank')
}
</script>

<template>
  <div class="page-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <el-button :icon="ArrowLeft" @click="goBack" class="back-btn" id="btn-back-courses">
          {{ $t('btn.back') }}
        </el-button>
        <div>
          <h1 class="page-title">
            <span class="gradient-text">{{ $t('lessons.title') }}</span>
          </h1>
          <p class="page-subtitle" v-if="courseInfo">
            {{ $t('nav.courses') }}: <strong>{{ courseInfo.name }}</strong>
            <el-tag :type="courseInfo.level ? (courseInfo.level === 'BEGINNER' ? 'success' : courseInfo.level === 'INTERMEDIATE' ? 'warning' : 'danger') : 'info'" size="small" round style="margin-left: 8px">
              {{ getLevelLabel(courseInfo.level) }}
            </el-tag>
          </p>
        </div>
      </div>
      <div class="page-header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate" id="btn-create-lesson">
          {{ $t('lessons.add') }}
        </el-button>
      </div>
    </div>

    <!-- Lessons List -->
    <div v-loading="loading" class="lessons-grid">
      <div v-if="lessons.length === 0 && !loading" class="empty-state card-container">
        <el-empty :description="$t('lessons.noLessons')">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            {{ $t('btn.addFirstLesson') }}
          </el-button>
        </el-empty>
      </div>

      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-card card-container"
        :class="{ 'is-deleted': lesson.status !== 'ACTIVE' }"
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
              {{ getLessonTypeLabel(lesson.lessonType) }}
            </div>
          </div>

          <!-- Info -->
          <div class="lesson-info">
            <div class="lesson-header-row">
              <h3 class="lesson-title">{{ lesson.title }}</h3>
              <el-tag :type="statusTagType[lesson.status]" size="small" round>
                {{ lesson.status === 'ACTIVE' ? $t('status.activeShort') : $t('status.deletedShort') }}
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
            <el-tooltip :content="$t('btn.view')" placement="top">
              <el-button type="info" :icon="View" size="small" circle @click="handleViewDetail(lesson)" />
            </el-tooltip>
            <el-tooltip :content="$t('btn.edit')" placement="top">
              <el-button type="primary" :icon="Edit" size="small" circle @click="handleEdit(lesson)" />
            </el-tooltip>
            <template v-if="lesson.status === 'ACTIVE'">
              <el-tooltip :content="$t('btn.delete')" placement="top">
                <el-button type="danger" :icon="Delete" size="small" circle @click="handleDelete(lesson)" />
              </el-tooltip>
            </template>
            <template v-else>
              <el-tooltip :content="$t('btn.restore')" placement="top">
                <el-button type="success" :icon="Refresh" size="small" circle @click="handleRestore(lesson)" />
              </el-tooltip>
            </template>
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
          {{ $t('lessons.videoUnsupported') }}
        </video>
      </div>
    </el-dialog>

    <!-- Lesson Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      :title="$t('lessons.detail')"
      width="700px"
      :close-on-click-modal="true"
      id="dialog-lesson-detail"
    >
      <div v-loading="detailLoading" class="lesson-detail-content">
        <template v-if="detailData">
          <!-- Basic info -->
          <div class="detail-section">
            <div class="detail-header-row">
              <h3>{{ detailData.title }}</h3>
              <el-tag :type="statusTagType[detailData.status]" size="small" round>
                {{ detailData.status === 'ACTIVE' ? $t('status.active') : $t('status.deleted') }}
              </el-tag>
            </div>
            <p class="detail-code">{{ detailData.lessonCode }}</p>
            <p class="detail-summary" v-if="detailData.summary">{{ detailData.summary }}</p>
            <p class="detail-body" v-if="detailData.content">{{ detailData.content }}</p>
          </div>

          <!-- Videos -->
          <div class="detail-section" v-if="detailData.videos && detailData.videos.length > 0">
            <h4 class="section-title">🎬 {{ $t('detail.videos') }}</h4>
            <div class="resource-list">
              <div
                v-for="video in detailData.videos"
                :key="video.id"
                class="resource-item clickable"
                @click="playDetailVideo(video)"
              >
                <el-icon :size="18" color="#667eea"><VideoPlay /></el-icon>
                <span class="resource-name">{{ video.fileName }}</span>
                <el-tag v-if="video.isPrimary" type="info" size="small">{{ $t('badge.primary') }}</el-tag>
                <el-button type="primary" size="small" text>{{ $t('btn.play') }}</el-button>
              </div>
            </div>
          </div>

          <!-- Documents -->
          <div class="detail-section" v-if="detailData.documents && detailData.documents.length > 0">
            <h4 class="section-title">📄 {{ $t('detail.documents') }}</h4>
            <div class="resource-list">
              <div
                v-for="doc in detailData.documents"
                :key="doc.id"
                class="resource-item clickable"
                @click="openDocument(doc)"
              >
                <el-icon :size="18" color="#2dce89"><Document /></el-icon>
                <span class="resource-name">{{ doc.fileName }}</span>
                <el-button type="success" size="small" text>↗ {{ $t('detail.downloadDoc') }}</el-button>
              </div>
            </div>
          </div>

          <!-- Thumbnails -->
          <div class="detail-section" v-if="detailData.thumbnails && detailData.thumbnails.length > 0">
            <h4 class="section-title">🖼️ Thumbnails</h4>
            <div class="thumb-preview-grid">
              <div v-for="thumb in detailData.thumbnails" :key="thumb.id" class="thumb-preview-item">
                <img :src="thumb.url" alt="Thumbnail" />
                <div v-if="thumb.isPrimary" class="thumb-primary-badge">{{ $t('badge.primary') }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">{{ $t('btn.close') }}</el-button>
      </template>
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

.lesson-card.is-deleted {
  opacity: 0.6;
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
  flex-direction: row;
  gap: 8px;
  padding: 0 20px 16px 0;
  justify-content: flex-end;
  align-items: flex-end;
  align-self: flex-end;
  margin-left: auto;
  flex-shrink: 0;
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

/* Lesson Detail Dialog */
.lesson-detail-content {
  min-height: 200px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color-light);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.detail-header-row h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-white);
}

.detail-code {
  font-size: 12px;
  color: var(--text-accent);
  font-weight: 500;
  margin-bottom: 8px;
}

.detail-summary {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.detail-body {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  white-space: pre-line;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-white);
  margin-bottom: 10px;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.resource-item.clickable {
  cursor: pointer;
}

.resource-item.clickable:hover {
  border-color: var(--text-accent);
  background: var(--bg-card-hover);
}

.resource-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumb-preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumb-preview-item {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  position: relative;
  border: 2px solid var(--border-color);
}

.thumb-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-primary-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  background: rgba(102, 126, 234, 0.9);
}
</style>
