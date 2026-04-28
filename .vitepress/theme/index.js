import DefaultTheme from 'vitepress/theme'
import Paper from './components/Paper.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Paper', Paper)
  }
}
