import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/ai-exam/',
  title: "國營事業考古題測驗系統",
  description: "郵局 / 台電 / 中華電信 線上測驗系統",
  themeConfig: {
    nav: [
      { text: '首頁', link: '/' },
      { text: '開始測驗', link: '/exams' }
    ],
    sidebar: [
      {
        text: '考試類別',
        items: [
          { text: '郵局', link: '/post-office' },
          { text: '台電', link: '/taipower' },
          { text: '中華電信', link: '/cht' }
        ]
      }
    ]
  }
})
