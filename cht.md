<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const catalog = ref({})

onMounted(async () => {
  const res = await fetch(withBase('/json/catalog.json'))
  const data = await res.json()
  const raw = data['cht'] || {}
  const sorted = {}
  Object.keys(raw).sort((a, b) => b - a).forEach(year => {
    sorted[year] = raw[year]
  })
  catalog.value = sorted
})
</script>

# 中華電信歷年考古題

<div v-for="(subjects, year) in catalog" :key="year" class="year-row">
  <h3>{{ year }} 年</h3>
  <div class="subject-list">
    <a v-for="sub in subjects" :key="sub" 
       :href="withBase('/exams/cht-' + year + '-' + sub.replace(/\//g, '-').replace(/ /g, '-'))"
       class="exam-link">
      {{ sub }}
    </a>
  </div>
</div>

<style scoped>
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
