<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const catalog = ref({})

onMounted(async () => {
  const res = await fetch(withBase('/json/catalog.json'))
  const data = await res.json()
  const sorted = Object.keys(data).map(agency => {
    const years = data[agency]
    const sortedYears = Object.keys(years)
      .map(year => ({ year, subjects: years[year] }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    return { agency, years: sortedYears }
  })
  catalog.value = sorted
})
</script>

# 歷年考古題列表

請選擇考科開始模擬測驗：

<div v-for="agencyItem in catalog" :key="agencyItem.agency" class="agency-section">
  <h2>{{ agencyItem.agency === 'post-office' ? '郵局' : agencyItem.agency === 'taipower' ? '台電' : '中華電信' }}</h2>
  
  <div v-for="yearItem in agencyItem.years" :key="yearItem.year" class="year-row">
    <h3>{{ yearItem.year }} 年</h3>
    <div class="subject-list">
      <a v-for="sub in yearItem.subjects" :key="sub" 
         :href="withBase('/exams/' + agencyItem.agency + '-' + yearItem.year + '-' + sub.replace(/\//g, '-').replace(/ /g, '-'))"
         class="exam-link">
        {{ sub }}
      </a>
    </div>
  </div>
</div>

<style scoped>
.agency-section { margin-bottom: 3rem; }
.year-row { margin-bottom: 1.5rem; }
.subject-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.exam-link {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #f0f2f5;
  border-radius: 4px;
  text-decoration: none;
  color: #1a73e8;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.exam-link:hover { background: #e3f2fd; }
</style>
