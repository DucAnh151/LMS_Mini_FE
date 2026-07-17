<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Fold,
  Expand,
  User,
  Reading,
  Notebook,
  Collection,
  FullScreen,
  Sunny,
  Moon
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/utils/i18n'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()
const isCollapsed = ref(false)

const menuItems = computed(() => [
  { index: '/students', title: t('nav.students'), icon: User },
  { index: '/courses', title: t('nav.courses'), icon: Reading },
  { index: '/enrollments', title: t('nav.enrollments'), icon: Collection }
])

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/courses') && path.includes('/lessons')) return '/courses'
  if (path.startsWith('/students')) return '/students'
  if (path.startsWith('/courses')) return '/courses'
  if (path.startsWith('/enrollments')) return '/enrollments'
  return path
})

const breadcrumbs = computed(() => {
  const crumbs = [{ title: t('nav.home'), path: '/' }]
  const matched = route.matched
  matched.forEach((record) => {
    if (record.meta?.titleKey) {
      crumbs.push({
        title: t(record.meta.titleKey),
        path: record.path
      })
    }
  })
  // Handle lesson sub-route
  if (route.params.courseId && route.meta?.titleKey === 'nav.lessons') {
    crumbs.splice(1, 0, { title: t('nav.courses'), path: '/courses' })
  }
  return crumbs
})

function handleMenuSelect(index) {
  router.push(index)
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo" @click="router.push('/')">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" width="32" height="32">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea" />
                <stop offset="100%" style="stop-color:#764ba2" />
              </linearGradient>
            </defs>
            <rect rx="10" ry="10" width="40" height="40" fill="url(#logoGrad)" />
            <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
              fill="white" font-size="18" font-weight="700" font-family="Inter">L</text>
          </svg>
        </div>
        <transition name="fade">
          <span v-if="!isCollapsed" class="logo-text">LMS Mini</span>
        </transition>
      </div>

      <!-- Menu -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="true"
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#667eea"
        @select="handleMenuSelect"
        class="sidebar-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>

      <!-- Collapse Toggle -->
      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="18">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-wrapper" :class="{ expanded: isCollapsed }">
      <!-- Header -->
      <header class="header glass">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(crumb, idx) in breadcrumbs" :key="idx">
              <router-link v-if="idx < breadcrumbs.length - 1" :to="crumb.path">
                {{ crumb.title }}
              </router-link>
              <span v-else>{{ crumb.title }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- Language Toggle -->
          <el-tooltip :content="$t('msg.language')" placement="bottom">
            <button class="header-btn lang-btn" @click="appStore.toggleLocale()" id="btn-toggle-locale">
              <span class="lang-label">{{ appStore.locale === 'vi' ? '🇻🇳' : '🇬🇧' }}</span>
            </button>
          </el-tooltip>

          <!-- Theme Toggle -->
          <el-tooltip :content="$t('msg.theme')" placement="bottom">
            <button class="header-btn" @click="appStore.toggleTheme()" id="btn-toggle-theme">
              <el-icon :size="18">
                <Moon v-if="appStore.theme === 'dark'" />
                <Sunny v-else />
              </el-icon>
            </button>
          </el-tooltip>

          <!-- Fullscreen -->
          <el-tooltip :content="$t('msg.fullscreen')" placement="bottom">
            <button class="header-btn" @click="toggleFullscreen" id="btn-fullscreen">
              <el-icon :size="18"><FullScreen /></el-icon>
            </button>
          </el-tooltip>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ---- Sidebar ---- */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-sidebar);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  background-image: var(--gradient-sidebar);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.logo-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding: 12px 8px;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  border-radius: var(--border-radius-sm);
  margin-bottom: 4px;
  height: 44px;
  line-height: 44px;
  transition: all var(--transition-fast);
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(102, 126, 234, 0.08) !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: rgba(102, 126, 234, 0.12) !important;
  color: #667eea !important;
  font-weight: 600;
}

.sidebar-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--gradient-primary);
  border-radius: 0 3px 3px 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.collapse-btn {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.06);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.collapse-btn:hover {
  background: rgba(102, 126, 234, 0.12);
  color: var(--text-accent);
  border-color: var(--text-accent);
}

/* ---- Main ---- */
.main-wrapper {
  margin-left: var(--sidebar-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: margin-left var(--transition-normal);
  min-width: 0;
}

.main-wrapper.expanded {
  margin-left: var(--sidebar-collapsed-width);
}

.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  width: 36px;
  height: 36px;
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

.header-btn:hover {
  background: rgba(102, 126, 234, 0.08);
  color: var(--text-accent);
  border-color: var(--text-accent);
}

.lang-btn {
  font-size: 16px;
  line-height: 1;
}

.lang-label {
  font-size: 18px;
  line-height: 1;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* ---- Transitions ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
