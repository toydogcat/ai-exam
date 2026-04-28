<script setup>
import { ref, onMounted } from 'vue'

const catalog = ref({})

onMounted(async () => {
  const res = await fetch('/json/catalog.json')
  catalog.value = await res.json()
})
</script>

# 歷年考古題列表

請選擇考科開始模擬測驗：

<div v-for="(years, agency) in catalog" :key="agency" class="agency-section">
  <h2>{{ agency === 'post-office' ? '郵局' : agency === 'taipower' ? '台電' : '中華電信' }}</h2>
  
  <div v-for="(subjects, year) in years" :key="year" class="year-row">
    <h3>{{ year }} 年</h3>
    <div class="subject-list">
      <a v-for="sub in subjects" :key="sub" 
         :href="agency + '-' + year + '-' + sub.replace(/\//g, '-').replace(/ /g, '-')"
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
