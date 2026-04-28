<script setup>
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  agency: String,
  year: String,
  subject: String
})

const questions = ref([])
const userAnswers = ref({})
const isSubmitted = ref(false)
const examineeName = ref('')
const ticketNumber = ref('')

const fetchQuestions = async () => {
  try {
    const res = await fetch(withBase(`/json/${props.agency}/${props.year}/${props.subject}.json`))
    questions.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch questions:', err)
  }
}

const score = computed(() => {
  if (!isSubmitted.value) return 0
  let correct = 0
  questions.value.forEach((q, idx) => {
    if (userAnswers.value[idx] === q.answer) {
      correct++
    }
  })
  return Math.round((correct / questions.value.length) * 100)
})

const generateTicket = () => {
  ticketNumber.value = 'EXAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

onMounted(() => {
  fetchQuestions()
  generateTicket()
})

const submitExam = () => {
  isSubmitted.value = true
}
</script>

<template>
  <div class="exam-paper">
    <!-- Header Section -->
    <div class="exam-header">
      <div class="header-left">
        <div class="header-item">
          <span class="label">科目：</span>
          <span class="value">{{ subject }}（{{ year }} 年）</span>
        </div>
        <div class="header-item">
          <span class="label">應試人：</span>
          <input v-model="examineeName" type="text" placeholder="請輸入姓名" class="input-field" :disabled="isSubmitted">
        </div>
        <div class="header-item">
          <span class="label">准考證號：</span>
          <span class="value mono">{{ ticketNumber }}</span>
        </div>
      </div>
      
      <div class="score-box" :class="{ 'visible': isSubmitted }">
        <div class="score-label">得分</div>
        <div class="score-value">{{ score }}</div>
      </div>
    </div>

    <div class="instruction">
        注意：請就各題選項中選出最適當者為答案。各題答對得該題所配分數，答錯不倒扣。
    </div>

    <!-- Four Column Content -->
    <div class="exam-body four-columns">
      <div v-for="colIdx in 4" :key="colIdx" class="column">
        <div v-for="(q, index) in questions.slice(Math.ceil((questions.length / 4) * (colIdx - 1)), Math.ceil((questions.length / 4) * colIdx))" :key="q.number" class="question-item">
          <div class="question-text">
            <span class="q-num">{{ q.number }}.</span>
            {{ q.text }}
          </div>
          <div class="options" v-if="q.options && q.options.length">
            <label v-for="(optText, i) in q.options" :key="i" class="option-label" :class="{ 
              'correct': isSubmitted && q.answer == (i + 1),
              'wrong': isSubmitted && userAnswers[questions.indexOf(q)] == (i + 1) && q.answer != (i + 1),
              'selected': userAnswers[questions.indexOf(q)] == (i + 1)
            }">
              <input type="radio" :name="'q' + questions.indexOf(q)" :value="i + 1" v-model="userAnswers[questions.indexOf(q)]" :disabled="isSubmitted">
              <span class="bubble"></span>
              <span class="option-marker">({{ i + 1 }})</span>
              <span class="option-text">{{ optText }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="exam-footer">
      <button v-if="!isSubmitted" @click="submitExam" class="submit-btn">繳卷對答案</button>
      <div v-else class="finish-msg">測驗結束，請檢閱解析。</div>
    </div>
  </div>
</template>

<style scoped>
.exam-paper {
  background: #fff;
  max-width: 1400px; /* Widened for 4 columns */
  margin: 1rem auto;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  min-height: 297mm; /* A4 Ratio */
  position: relative;
  color: #333;
  font-family: 'BiauKai', 'Noto Sans TC', serif;
}

.exam-header {
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-left {
  flex: 1;
}

.header-item {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.label { font-weight: bold; }
.mono { font-family: monospace; }

.input-field {
  border: none;
  border-bottom: 1px solid #666;
  padding: 2px 5px;
  outline: none;
  background: transparent;
  width: 150px;
}

.score-box {
  width: 80px;
  height: 80px;
  border: 3px solid #d32f2f;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #d32f2f;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.score-box.visible { opacity: 1; }

.score-label { font-size: 0.8rem; font-weight: bold; }
.score-value { font-size: 2rem; font-weight: bold; }

.instruction {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    border: 1px solid #ccc;
    padding: 10px;
    background: #f9f9f9;
}

.exam-body.four-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  position: relative;
}

.column {
  min-width: 0; /* Prevents overflow in grid */
  border-right: 1px dashed #ddd;
  padding-right: 1rem;
}

.column:last-child {
  border-right: none;
}

.question-item {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}

.q-num {
  font-weight: bold;
  margin-right: 0.5rem;
}

.options {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.2rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.85rem; /* Smaller font for 4 columns */
}

input[type="radio"] {
  display: none; /* Hide real radio */
}

.bubble {
  width: 14px;
  height: 14px;
  border: 1.5px solid #333;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  background: #fff;
  transition: all 0.2s;
}

.selected .bubble {
  background: #000;
  border-color: #000;
}

.correct .bubble {
  border-color: #2e7d32;
  background: #2e7d32 !important;
}

.wrong .bubble {
  border-color: #d32f2f;
  background: #d32f2f !important;
}

.option-marker {
  font-weight: bold;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-label:hover { background: #f0f0f0; }

.option-label.selected { background: #e3f2fd; }

.option-label.correct {
  background: #e8f5e9 !important;
  color: #2e7d32;
  font-weight: bold;
}

.option-label.wrong {
  background: #ffeeb3 !important;
  color: #c62828;
  text-decoration: line-through;
}

input[type="radio"] {
  margin-top: 5px;
}

.exam-footer {
  margin-top: 3rem;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.submit-btn {
  background: #1a73e8;
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover {
  transform: scale(1.05);
  background: #1557b0;
}

.finish-msg {
  color: #1a73e8;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
