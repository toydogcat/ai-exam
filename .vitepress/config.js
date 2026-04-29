import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/ai-exam/',
  title: "國營事業考古題測驗系統",
  description: "郵局 / 台電 / 中華電信 線上測驗系統",
  head: [
    ['script', { async: true, src: 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js' }]
  ],
  themeConfig: {
    nav: [
      { text: '首頁', link: '/' },
      { text: '開始測驗', link: '/exams' },
      { text: '心得與解析', link: 'https://toydogcat.github.io/ai-exp-exam/' }
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
    ],
    footer: {
      message: '總訪問量 <span id="busuanzi_value_site_pv"></span> 次 | 訪客數 <span id="busuanzi_value_site_uv"></span> 人',
      copyright: 'Copyright © 2026-present AI Exam Team'
    }
  }
})
