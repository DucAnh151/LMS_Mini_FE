import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref(localStorage.getItem('lms-theme') || 'dark')
  const locale = ref(localStorage.getItem('lms-locale') || 'vi')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
  }

  function setTheme(val) {
    theme.value = val
    applyTheme()
  }

  function toggleLocale() {
    locale.value = locale.value === 'vi' ? 'en' : 'vi'
    localStorage.setItem('lms-locale', locale.value)
  }

  function setLocale(val) {
    locale.value = val
    localStorage.setItem('lms-locale', locale.value)
  }

  function applyTheme() {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('lms-theme', theme.value)
  }

  // Apply on init
  applyTheme()

  return { theme, locale, toggleTheme, setTheme, toggleLocale, setLocale, applyTheme }
})
