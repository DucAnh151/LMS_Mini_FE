<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, Reading, Collection, Download, Notebook,
  Sunny, Moon, ArrowRight, Message, Location, Phone
} from '@element-plus/icons-vue'
import { getCourses } from '@/api/course'
import { getStudents } from '@/api/student'
import { formatPrice, getLevelLabel, levelTagType } from '@/utils/helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/utils/i18n'

const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(false)
const courses = ref([])
const courseTotal = ref(0)
const studentTotal = ref(0)
const brokenImages = ref(new Set())

const instructorCount = computed(() => {
  const set = new Set(courses.value.map((c) => c.instructorName).filter(Boolean))
  return set.size
})

// 6 khóa học đang hoạt động để hiển thị nổi bật
const featuredCourses = computed(() => courses.value.slice(0, 6))

const features = computed(() => [
  { icon: User, title: t('home.feature.1.title'), desc: t('home.feature.1.desc') },
  { icon: Reading, title: t('home.feature.2.title'), desc: t('home.feature.2.desc') },
  { icon: Collection, title: t('home.feature.3.title'), desc: t('home.feature.3.desc') },
  { icon: Download, title: t('home.feature.4.title'), desc: t('home.feature.4.desc') }
])

async function loadData() {
  loading.value = true
  try {
    const [courseRes, studentRes] = await Promise.allSettled([
      getCourses({ page: 0, size: 100 }),
      getStudents({ page: 0, size: 1 })
    ])

    if (courseRes.status === 'fulfilled') {
      const page = courseRes.value.data
      const list = page.data || []
      courses.value = list.filter((c) => c.status === 'ACTIVE')
      courseTotal.value = courses.value.length
    }
    if (studentRes.status === 'fulfilled') {
      studentTotal.value = studentRes.value.data.totalElements || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function handleImageError(url) {
  const next = new Set(brokenImages.value)
  next.add(url)
  brokenImages.value = next
}

function goAdmin() {
  router.push('/students')
}

function goCourses() {
  router.push('/courses')
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="landing">
    <!-- ============ HEADER ============ -->
    <header class="lp-header glass">
      <div class="lp-container lp-header-inner">
        <div class="lp-brand" @click="scrollTo('top')">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
            <defs>
              <linearGradient id="lpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#667eea" />
                <stop offset="100%" stop-color="#764ba2" />
              </linearGradient>
            </defs>
            <rect rx="10" ry="10" width="40" height="40" fill="url(#lpLogoGrad)" />
            <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
              fill="white" font-size="18" font-weight="700" font-family="Inter">L</text>
          </svg>
          <span class="lp-brand-text">LMS Mini</span>
        </div>

        <nav class="lp-nav">
          <a class="lp-nav-link" @click="scrollTo('top')">{{ $t('home.nav.home') }}</a>
          <a class="lp-nav-link" @click="scrollTo('about')">{{ $t('home.nav.about') }}</a>
          <a class="lp-nav-link" @click="scrollTo('courses')">{{ $t('home.nav.courses') }}</a>
        </nav>

        <div class="lp-header-actions">
          <button class="lp-icon-btn" @click="appStore.toggleLocale()" :title="$t('msg.language')">
            <span class="lp-flag">{{ appStore.locale === 'vi' ? '🇻🇳' : '🇬🇧' }}</span>
          </button>
          <button class="lp-icon-btn" @click="appStore.toggleTheme()" :title="$t('msg.theme')">
            <el-icon :size="18">
              <Moon v-if="appStore.theme === 'dark'" />
              <Sunny v-else />
            </el-icon>
          </button>
          <el-button type="primary" round @click="goAdmin">
            {{ $t('home.nav.admin') }}
          </el-button>
        </div>
      </div>
    </header>

    <!-- ============ HERO ============ -->
    <section id="top" class="lp-hero">
      <div class="lp-orbs" aria-hidden="true">
        <span class="lp-orb lp-orb-1"></span>
        <span class="lp-orb lp-orb-2"></span>
        <span class="lp-orb lp-orb-3"></span>
        <span class="lp-grid-overlay"></span>
      </div>
      <div class="lp-container lp-hero-inner">
        <span class="lp-badge">{{ $t('home.hero.badge') }}</span>
        <h1 class="lp-hero-title">
          <span class="gradient-text">{{ $t('home.hero.title') }}</span>
        </h1>
        <p class="lp-hero-desc">{{ $t('home.hero.desc') }}</p>
        <div class="lp-hero-cta">
          <el-button type="primary" size="large" round @click="goCourses">
            {{ $t('home.hero.ctaCourses') }}
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
          <el-button size="large" round @click="goAdmin">
            {{ $t('home.hero.ctaAdmin') }}
          </el-button>
        </div>

        <div class="lp-stats">
          <div class="lp-stat">
            <div class="lp-stat-num">{{ courseTotal }}</div>
            <div class="lp-stat-label">{{ $t('home.stat.courses') }}</div>
          </div>
          <div class="lp-stat-divider"></div>
          <div class="lp-stat">
            <div class="lp-stat-num">{{ studentTotal }}</div>
            <div class="lp-stat-label">{{ $t('home.stat.students') }}</div>
          </div>
          <div class="lp-stat-divider"></div>
          <div class="lp-stat">
            <div class="lp-stat-num">{{ instructorCount }}</div>
            <div class="lp-stat-label">{{ $t('home.stat.instructors') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ ABOUT / FEATURES ============ -->
    <section id="about" class="lp-section">
      <div class="lp-container">
        <div class="lp-section-head">
          <span class="lp-section-label">{{ $t('home.about.label') }}</span>
          <h2 class="lp-section-title">{{ $t('home.about.title') }}</h2>
          <p class="lp-section-desc">{{ $t('home.about.desc') }}</p>
        </div>

        <div class="lp-features">
          <div v-for="(f, i) in features" :key="i" class="lp-feature-card">
            <div class="lp-feature-icon">
              <el-icon :size="24"><component :is="f.icon" /></el-icon>
            </div>
            <h3 class="lp-feature-title">{{ f.title }}</h3>
            <p class="lp-feature-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ COURSES ============ -->
    <section id="courses" class="lp-section lp-section-alt">
      <div class="lp-container">
        <div class="lp-section-head">
          <span class="lp-section-label">{{ $t('home.courses.label') }}</span>
          <h2 class="lp-section-title">{{ $t('home.courses.title') }}</h2>
          <p class="lp-section-desc">{{ $t('home.courses.desc') }}</p>
        </div>

        <div v-loading="loading" class="lp-courses">
          <div
            v-for="course in featuredCourses"
            :key="course.id"
            class="lp-course-card"
            @click="goCourses"
          >
            <div class="lp-course-thumb">
              <img
                v-if="course.thumbnailUrl && !brokenImages.has(course.thumbnailUrl)"
                :src="course.thumbnailUrl"
                alt="Thumbnail"
                @error="handleImageError(course.thumbnailUrl)"
              />
              <div v-else class="lp-course-thumb-ph">
                <el-icon :size="30"><Notebook /></el-icon>
              </div>
              <el-tag :type="levelTagType[course.level]" size="small" round class="lp-course-level">
                {{ getLevelLabel(course.level) }}
              </el-tag>
            </div>
            <div class="lp-course-body">
              <h3 class="lp-course-name">{{ course.name }}</h3>
              <p class="lp-course-instructor">
                <el-icon><User /></el-icon>
                {{ $t('home.courses.by') }}: {{ course.instructorName || '—' }}
              </p>
              <div class="lp-course-footer">
                <span class="lp-course-price" :class="{ free: !course.price }">
                  {{ course.price ? formatPrice(course.price) : $t('home.courses.free') }}
                </span>
                <el-icon class="lp-course-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && featuredCourses.length === 0" class="lp-empty">
          {{ $t('home.courses.empty') }}
        </div>

        <div v-if="featuredCourses.length" class="lp-courses-more">
          <el-button type="primary" plain round size="large" @click="goCourses">
            {{ $t('home.courses.viewAll') }}
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- ============ FOOTER ============ -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer-grid">
        <div class="lp-footer-brand">
          <div class="lp-brand">
            <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
              <rect rx="10" ry="10" width="40" height="40" fill="url(#lpLogoGrad)" />
              <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
                fill="white" font-size="18" font-weight="700">L</text>
            </svg>
            <span class="lp-brand-text">LMS Mini</span>
          </div>
          <p class="lp-footer-desc">{{ $t('home.footer.desc') }}</p>
        </div>

        <div class="lp-footer-col">
          <h4>{{ $t('home.footer.links') }}</h4>
          <a @click="scrollTo('about')">{{ $t('home.nav.about') }}</a>
          <a @click="scrollTo('courses')">{{ $t('home.nav.courses') }}</a>
          <a @click="goAdmin">{{ $t('home.nav.admin') }}</a>
        </div>

        <div class="lp-footer-col">
          <h4>{{ $t('home.footer.contact') }}</h4>
          <span class="lp-footer-contact"><el-icon><Message /></el-icon> support@lmsmini.dev</span>
          <span class="lp-footer-contact"><el-icon><Phone /></el-icon> +84 000 000 000</span>
          <span class="lp-footer-contact"><el-icon><Location /></el-icon> Hà Nội, Việt Nam</span>
        </div>
      </div>
      <div class="lp-footer-bottom">
        <div class="lp-container">{{ $t('home.footer.rights') }}</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: transparent;
  color: var(--text-primary);
}

.lp-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ---------- Header ---------- */
.lp-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 68px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.lp-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.lp-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.lp-brand-text {
  font-size: 20px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.lp-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lp-nav-link {
  padding: 8px 14px;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lp-nav-link:hover {
  color: var(--text-accent);
  background: rgba(102, 126, 234, 0.08);
}

.lp-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lp-icon-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lp-icon-btn:hover {
  background: rgba(102, 126, 234, 0.08);
  color: var(--text-accent);
  border-color: var(--text-accent);
}

.lp-flag { font-size: 18px; line-height: 1; }

/* ---------- Hero ---------- */
.lp-hero {
  position: relative;
  padding: 110px 0 90px;
  overflow: hidden;
}

/* Animated gradient orbs + grid overlay */
.lp-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.lp-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  animation: lp-float 14s ease-in-out infinite;
}

.lp-orb-1 {
  width: 420px; height: 420px;
  top: -120px; left: 8%;
  background: radial-gradient(circle, #6d5cf5 0%, transparent 70%);
}

.lp-orb-2 {
  width: 360px; height: 360px;
  top: 40px; right: 6%;
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
  animation-delay: -4s;
}

.lp-orb-3 {
  width: 300px; height: 300px;
  bottom: -80px; left: 42%;
  background: radial-gradient(circle, #22d3ee 0%, transparent 70%);
  animation-delay: -8s;
}

.lp-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--border-color-light) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border-color-light) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 75%);
  opacity: 0.6;
}

@keyframes lp-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(24px, -28px) scale(1.06); }
  66% { transform: translate(-20px, 18px) scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  .lp-orb { animation: none; }
}

.lp-hero-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lp-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--bg-card-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  color: var(--text-accent);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 26px;
  box-shadow: var(--shadow-sm);
}

.lp-hero-title {
  font-size: clamp(36px, 6.5vw, 64px);
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: -0.02em;
  max-width: 860px;
  margin-bottom: 22px;
}

.lp-hero-title .gradient-text {
  background: linear-gradient(110deg, #6d5cf5 0%, #a855f7 35%, #ec4899 65%, #6d5cf5 100%);
  background-size: 250% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: lp-shine 6s linear infinite;
}

@keyframes lp-shine {
  to { background-position: 250% center; }
}

.lp-hero-desc {
  font-size: clamp(16px, 2.2vw, 19px);
  color: var(--text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.lp-hero-cta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 56px;
}

.lp-stats {
  display: flex;
  align-items: center;
  gap: 36px;
  padding: 26px 48px;
  background: var(--bg-card-glass);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
}

.lp-stat { text-align: center; min-width: 90px; }

.lp-stat-num {
  font-size: 34px;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
}

.lp-stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.lp-stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* ---------- Sections ---------- */
.lp-section { padding: 90px 0; }
.lp-section-alt {
  background:
    radial-gradient(60rem 30rem at 100% 0%, rgba(236, 72, 153, 0.06), transparent 60%),
    radial-gradient(60rem 30rem at 0% 100%, rgba(34, 211, 238, 0.06), transparent 60%),
    var(--bg-secondary);
  border-top: 1px solid var(--border-color-light);
  border-bottom: 1px solid var(--border-color-light);
}

.lp-section-head {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 48px;
}

.lp-section-label {
  display: inline-block;
  color: var(--text-accent);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.lp-section-title {
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--text-white);
}

.lp-section-desc {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ---------- Features ---------- */
.lp-features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.lp-feature-card {
  position: relative;
  background: var(--bg-card-glass);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 30px 26px;
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
}

.lp-feature-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.lp-feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.lp-feature-card:hover::before {
  transform: scaleX(1);
}

.lp-feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: #fff;
  margin-bottom: 20px;
  box-shadow: var(--shadow-colored);
  transition: transform var(--transition-normal);
}

.lp-feature-card:hover .lp-feature-icon {
  transform: translateY(-2px) rotate(-6deg) scale(1.05);
}

.lp-feature-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-white);
}

.lp-feature-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ---------- Courses ---------- */
.lp-courses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  min-height: 120px;
}

.lp-course-card {
  background: var(--bg-card-glass);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.lp-course-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--text-accent);
}

.lp-course-thumb {
  position: relative;
  height: 160px;
  background: var(--bg-input);
  overflow: hidden;
}

.lp-course-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lp-course-thumb-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--gradient-sidebar);
}

.lp-course-level {
  position: absolute;
  top: 12px;
  left: 12px;
}

.lp-course-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.lp-course-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-white);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lp-course-instructor {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.lp-course-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lp-course-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-accent);
}

.lp-course-price.free { color: #2dce89; }

.lp-course-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.lp-course-card:hover .lp-course-arrow {
  transform: translateX(4px);
  color: var(--text-accent);
}

.lp-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 16px;
}

.lp-courses-more {
  text-align: center;
  margin-top: 40px;
}

/* ---------- Footer ---------- */
.lp-footer {
  position: relative;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

.lp-footer::before {
  content: '';
  position: absolute;
  top: -1px; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6d5cf5, #a855f7, #ec4899, #22d3ee);
  opacity: 0.8;
}

.lp-footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  padding-top: 56px;
  padding-bottom: 40px;
}

.lp-footer-desc {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  max-width: 340px;
}

.lp-footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lp-footer-col h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 4px;
}

.lp-footer-col a {
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: color var(--transition-fast);
  width: fit-content;
}

.lp-footer-col a:hover { color: var(--text-accent); }

.lp-footer-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 15px;
}

.lp-footer-bottom {
  border-top: 1px solid var(--border-color-light);
  padding: 20px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .lp-features { grid-template-columns: repeat(2, 1fr); }
  .lp-courses { grid-template-columns: repeat(2, 1fr); }
  .lp-footer-grid { grid-template-columns: 1fr 1fr; }
  .lp-footer-brand { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .lp-nav { display: none; }
  .lp-features,
  .lp-courses { grid-template-columns: 1fr; }
  .lp-footer-grid { grid-template-columns: 1fr; }
  .lp-stats { gap: 18px; padding: 20px; flex-wrap: wrap; justify-content: center; }
  .lp-stat-divider { display: none; }
  .lp-hero { padding: 60px 0 50px; }
}
</style>
