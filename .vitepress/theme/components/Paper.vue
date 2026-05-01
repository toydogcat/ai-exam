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
const timeLeft = ref(90 * 60) // Default 90 minutes in seconds
const totalDuration = ref(90 * 60)
let timer = null

const formatTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const fetchQuestions = async () => {
  try {
    const res = await fetch(withBase(`/json/${props.agency}/${props.year}/${props.subject}.json`))
    const data = await res.json()
    
    // Handle both array and object formats
    if (Array.isArray(data)) {
      questions.value = data
    } else {
      questions.value = data.questions || []
      if (data.duration) {
        totalDuration.value = data.duration * 60
        timeLeft.value = totalDuration.value
      }
    }
    startTimer()
  } catch (err) {
    console.error('Failed to fetch questions:', err)
  }
}

const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (timeLeft.value > 0 && !isSubmitted.value) {
      timeLeft.value--
    } else if (timeLeft.value === 0 && !isSubmitted.value) {
      submitExam()
      clearInterval(timer)
    }
  }, 1000)
}

const getAnswerValue = (ans) => {
  if (typeof ans === 'number') return ans
  if (typeof ans === 'string') {
    const map = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 }
    return map[ans.toUpperCase()] || ans
  }
  return ans
}

const score = computed(() => {
  if (!isSubmitted.value) return 0
  let totalScore = 0
  let earnedScore = 0
  
  questions.value.forEach((q, idx) => {
    const questionScore = q.score || 2
    totalScore += questionScore
    
    const correctAns = getAnswerValue(q.answer)
    const userAns = userAnswers.value[idx]

    if (q.options && q.options.length) {
      // Multiple Choice
      if (userAns == correctAns) {
        earnedScore += questionScore
      }
    } else if (q.type === 'fill_in') {
      // Fill in the blank (exact match)
      const u = (userAns || '').toString().trim()
      const c = (q.answer || '').toString().trim()
      if (u === c) {
        earnedScore += questionScore
      }
    }
  })
  
  return Math.round((earnedScore / totalScore) * 100)
} )

const generateTicket = () => {
  ticketNumber.value = 'EXAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const columnCount = computed(() => {
  if (!questions.value.length) return 1
  const hasEssay = questions.value.some(q => q.type === 'essay' || q.type === 'calc')
  if (hasEssay || questions.value.length <= 4) {
    return 1
  }
  return 4
})

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
      
      <div class="header-right">
        <div class="timer-box" :class="{ 'warning': timeLeft < 300, 'expired': timeLeft === 0 }">
          <div class="timer-label">剩餘時間</div>
          <div class="timer-value">{{ formatTime }}</div>
        </div>

        <div class="score-box" :class="{ 'visible': isSubmitted }">
          <div class="score-label">得分</div>
          <div class="score-value">{{ score }}</div>
        </div>
      </div>
    </div>

    <div class="instruction">
        注意：請就各題選項中選出最適當者為答案。各題答對得該題所配分數，答錯不倒扣。
    </div>

    <!-- Column Content -->
    <div class="exam-body" :class="{ 'four-columns': columnCount === 4, 'single-column': columnCount === 1 }">
      <div v-for="colIdx in columnCount" :key="colIdx" class="column">
        <div v-for="(q, index) in questions.slice(Math.ceil((questions.length / columnCount) * (colIdx - 1)), Math.ceil((questions.length / columnCount) * colIdx))" :key="q.number" class="question-item">
          <div class="question-text">
            <span class="q-num">{{ q.number }}.</span>
            {{ q.text }}
          </div>
          <div class="options" v-if="q.options && q.options.length">
            <label v-for="(optText, i) in q.options" :key="i" class="option-label" :class="{ 
              'correct': isSubmitted && getAnswerValue(q.answer) == (i + 1),
              'wrong': isSubmitted && userAnswers[questions.indexOf(q)] == (i + 1) && getAnswerValue(q.answer) != (i + 1),
              'selected': userAnswers[questions.indexOf(q)] == (i + 1)
            }">
              <input type="radio" :name="'q' + questions.indexOf(q)" :value="i + 1" v-model="userAnswers[questions.indexOf(q)]" :disabled="isSubmitted">
              <span class="bubble"></span>
              <span class="option-marker">({{ i + 1 }})</span>
              <span class="option-text">{{ optText }}</span>
            </label>
          </div>

          <!-- Fill-in-the-blank / Essay Input -->
          <div class="short-answer-box" v-else :class="{ 'essay-box': q.type === 'essay' || q.type === 'calc' }">
            <div class="input-wrapper" :class="{
              'correct': isSubmitted && q.type === 'fill_in' && (userAnswers[questions.indexOf(q)] || '').toString().trim() === (q.answer || '').toString().trim(),
              'wrong': isSubmitted && q.type === 'fill_in' && (userAnswers[questions.indexOf(q)] || '').toString().trim() !== (q.answer || '').toString().trim(),
              'essay-input': q.type === 'essay' || q.type === 'calc'
            }">
              <textarea 
                v-if="q.type === 'essay' || q.type === 'calc'"
                v-model="userAnswers[questions.indexOf(q)]" 
                :placeholder="q.type === 'essay' ? '在此輸入作答內容...' : '在此輸入計算與答案內容...'" 
                class="short-input essay-textarea" 
                :disabled="isSubmitted"
                rows="4"
              ></textarea>
              <input 
                v-else
                type="text" 
                v-model="userAnswers[questions.indexOf(q)]" 
                placeholder="在此輸入答案..." 
                class="short-input" 
                :disabled="isSubmitted"
              >
            </div>
            <div class="answer-reveal" v-if="isSubmitted && q.answer">
              <span class="reveal-label">{{ q.type === 'essay' || q.type === 'calc' ? '參考答案/解析：' : '正確答案：' }}</span>
              <span class="reveal-text">{{ q.answer }}</span>
            </div>
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

.header-right {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.timer-box {
  width: 100px;
  height: 80px;
  border: 3px solid #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  transition: all 0.3s;
}

.timer-box.warning {
  border-color: #f57c00;
  color: #ef6c00;
  animation: pulse 1s infinite;
}

.timer-box.expired {
  border-color: #d32f2f;
  background: #ffebee;
  color: #c62828;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.timer-label { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
.timer-value { font-size: 1.5rem; font-weight: bold; font-family: monospace; }

.score-box {
  width: 80px;
  height: 80px;
  border: 3px solid #d32f2f;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #d32f2f;
  background: #fff;
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

.exam-body.single-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.single-column .column {
  border-right: none;
  padding-right: 0;
}

.essay-textarea {
  resize: vertical;
  min-height: 100px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  padding: 8px;
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

.short-answer-box {
  margin-top: 0.8rem;
  width: 100%;
}

.input-wrapper {
  border-bottom: 2px solid #ccc;
  transition: all 0.3s;
  margin-bottom: 0.5rem;
}

.input-wrapper.correct {
  border-bottom-color: #2e7d32;
  background-color: #e8f5e9;
}

.input-wrapper.wrong {
  border-bottom-color: #d32f2f;
  background-color: #ffebee;
}

.short-input {
  width: 100%;
  border: none;
  padding: 8px 5px;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  font-family: inherit;
}

.answer-reveal {
  font-size: 0.85rem;
  margin-top: 0.4rem;
  padding: 5px;
  background: #f1f3f4;
  border-radius: 4px;
  border-left: 3px solid #1a73e8;
}

.reveal-label {
  font-weight: bold;
  color: #1a73e8;
}

.reveal-text {
  color: #333;
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
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(26,115,232,0.2);
}

.submit-btn:hover {
  transform: translateY(-2px);
  background: #1557b0;
  box-shadow: 0 6px 12px rgba(26,115,232,0.3);
}

.finish-msg {
  color: #1a73e8;
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
