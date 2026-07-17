import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('dinamiza-aula:locale') || 'es',
  fallbackLocale: 'es',
  messages: { es, en },
})
