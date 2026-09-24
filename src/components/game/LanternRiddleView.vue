<template>
  <div class="game-panel max-w-sm w-full">
    <h3 class="text-accent text-sm mb-3 flex items-center space-x-1">
      <Lightbulb :size="14" />
      <span>Đoán đố đèn Thất Tịch</span>
    </h3>

    <!-- 准备 -->
    <div v-if="phase === 'ready'">
      <p class="text-xs text-muted mb-3">Quảng trường treo đầy đèn lồng, dưới mỗi đèn có một câu đố. Có 5 câu, mỗi câu có thời gian giới hạn, trả lời đúng có thưởng!</p>
      <Button class="w-full" @click="startGame">Bắt đầu giải đố!</Button>
    </div>

    <!-- 展示灯笼 -->
    <div v-else-if="phase === 'showing'" class="text-center py-4">
      <div class="lantern-drop mb-3">
        <div class="inline-block border-2 border-accent/50 px-6 py-3">
          <Lamp :size="20" class="text-accent mx-auto mb-1" />
          <p class="text-accent text-xs">lượt {{ currentIndex + 1 }} câu</p>
        </div>
      </div>
      <!-- 进度点 -->
      <div class="flex justify-center space-x-2 mt-2">
        <div v-for="i in 5" :key="i" class="w-2 h-2" :class="dotClass(i - 1)" />
      </div>
    </div>

    <!-- 答题中 -->
    <div v-else-if="phase === 'answering'">
      <!-- 进度点 + 倒计时 -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-1.5">
          <div v-for="i in 5" :key="i" class="w-2 h-2" :class="dotClass(i - 1)" />
        </div>
        <p class="text-xs" :class="countdown <= 3 ? 'text-danger time-pulse' : 'text-accent'">
          <Timer :size="12" class="inline -mt-0.5" />
          {{ countdown }}s
        </p>
      </div>

      <!-- 倒计时条 -->
      <div class="h-1 bg-bg border border-accent/20 mb-3">
        <div
          class="h-full transition-all duration-1000 ease-linear"
          :class="countdown <= 3 ? 'bg-danger/60' : 'bg-accent/60'"
          :style="{ width: `${(countdown / currentTimeLimit) * 100}%` }"
        />
      </div>

      <!-- 谜面 -->
      <div class="border border-accent/30 p-3 mb-3 text-center">
        <p class="text-xs text-muted mb-1">Câu đố</p>
        <p class="text-xs text-text leading-relaxed">
          {{ currentRiddle.question }}
        </p>
      </div>

      <!-- 选项 -->
      <div class="flex flex-col space-y-2">
        <Button
          v-for="(opt, i) in currentRiddle.options"
          :key="i"
          class="text-left w-full"
          :disabled="answered"
          :class="{ 'opacity-50': answered }"
          @click="answer(i)"
        >
          <span class="text-accent mr-1">{{ ['A', 'B', 'C', 'D'][i] }}.</span>
          {{ opt }}
        </Button>
      </div>
    </div>

    <!-- 单题结果 -->
    <div v-else-if="phase === 'result'" class="text-center">
      <!-- 进度点 -->
      <div class="flex justify-center space-x-1.5 mb-3">
        <div v-for="i in 5" :key="i" class="w-2 h-2" :class="dotClass(i - 1)" />
      </div>

      <div :class="lastCorrect ? 'correct-flash' : 'wrong-shake'" class="mb-3 py-3 border border-accent/20">
        <p class="text-sm mb-1" :class="lastCorrect ? 'text-success' : 'text-danger'">
          {{ lastCorrect ? 'Đúng rồi! +100 văn' : 'Sai rồi…' }}
        </p>
        <p class="text-xs text-muted mt-1">
          đúngxáctrả lờián：
          <span class="text-accent">{{ currentRiddle.options[currentRiddle.answer] }}</span>
        </p>
      </div>
      <p class="text-xs text-muted">
        khitrướcđượcđiểm：
        <span class="text-accent">{{ score }}</span>
        xu
      </p>
    </div>

    <!-- 最终结果 -->
    <div v-else>
      <p class="text-xs text-muted mb-2">Hội đố đèn kết thúc!</p>

      <!-- 进度点（最终状态） -->
      <div class="flex justify-center space-x-1.5 mb-3">
        <div v-for="i in 5" :key="i" class="w-2 h-2" :class="dotClass(i - 1)" />
      </div>

      <div class="border border-accent/20 p-3 mb-3 text-center">
        <p class="text-xs mb-1">
          trả lờiđúng：
          <span class="text-success">{{ correctCount }}</span>
          / 5 câu
        </p>
        <p class="text-xs">
          tổngthưởngvàng：
          <span class="text-accent">{{ score }}</span>
          xu
          <span v-if="correctCount === 5" class="text-accent finish-flash">(Đúng hết +300 văn!)</span>
        </p>
      </div>
      <Button class="w-full" @click="handleClaim">Nhận phần thưởng</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from 'vue'
  import { Lightbulb, Lamp, Timer } from 'lucide-vue-next'
  import {
    sfxGameStart,
    sfxRewardClaim,
    sfxCountdownTick,
    sfxCountdownFinal,
    sfxRiddleReveal,
    sfxRiddleWrong,
    sfxMiniGood,
    sfxMiniPerfect
  } from '@/composables/useAudio'
  import Button from '@/components/game/Button.vue'

  const emit = defineEmits<{ complete: [prize: number] }>()

  type Phase = 'ready' | 'showing' | 'answering' | 'result' | 'finished'
  const phase = ref<Phase>('ready')

  interface Riddle {
    question: string
    options: string[]
    answer: number
  }

  const RIDDLE_POOL: Riddle[] = [
    // === truyềnhệ thốngđènđố ===
    {
      question: 'Có mặt không miệng, có chân không tay, nghe người nói chuyện, cùng người uống rượu. (Đố đồ dùng)',
      options: ['Bàn', 'Ghế', 'Ấm trà', 'Đèn lồng'],
      answer: 0
    },
    {
      question: 'Ngàn sợi, vạn sợi, rơi xuống nước thì không thấy. (Đố hiện tượng tự nhiên)',
      options: ['Gió', 'Mưa', 'Tuyết', 'Sương mù'],
      answer: 1
    },
    {
      question: 'Mặc áo xanh, bụng đầy nước, nhiều hạt, hạt nào cũng đen. (Đố trái cây)',
      options: ['Nho', 'Dưa hấu', 'Lựu', 'Vải'],
      answer: 1
    },
    {
      question: 'Gà trống đỏ, đuôi xanh, thân chui xuống đất. (Đố rau củ)',
      options: ['Cà rốt', 'Củ cải trắng', 'Khoai lang', 'Đậu Phộng'],
      answer: 0
    },
    {
      question: 'Bảy tám anh em ngồi quanh một cột, vừa tách nhau ra thì áo quần đều rách. (Đố món ăn)',
      options: ['Há cảo', 'Bánh bao', 'Tỏi', 'Cam'],
      answer: 2
    },
    {
      question: 'Đội mũ đỏ, mặc áo trắng, đi đứng oai vệ, nói chuyện thì vươn cổ. (Đố con vật)',
      options: ['Gà', 'Ngỗng', 'Hạc', 'Vẹt'],
      answer: 1
    },
    {
      question: 'Một vật ba miệng, có chân không tay; ai không có nó thì khó gặp người thân. (Đố trang phục)',
      options: ['Mũ', 'Quần', 'Giày', 'Găng tay'],
      answer: 1
    },
    {
      question: 'Một cô gái nhỏ ngồi giữa nước, mặc áo hồng, tỏa hương thơm. (Đố thực vật)',
      options: ['Hoa súng', 'Hoa sen', 'Hoa Cúc', 'Hoa lan'],
      answer: 1
    },
    {
      question: 'Một ông già không chạy không đi, bảo ông ngủ thì ông lắc đầu. (Đố đồ vật)',
      options: ['Quả lắc đồng hồ', 'Con lật đật', 'Xích đu', 'Cối xay gió'],
      answer: 1
    },
    {
      question: 'Có đầu không cổ, có mắt không mày, không chân vẫn đi, có cánh khó bay. (Đố con vật)',
      options: ['Rắn', 'Cá', 'Tằm', 'Ốc Sên'],
      answer: 1
    },
    {
      question: 'Ông già lưng gù, sức mạnh vô cùng, thích cõng gì? Xe cộ ngựa xe. (Đố đồ vật)',
      options: ['Cầu', 'Đường', 'Thuyền', 'Xe'],
      answer: 0
    },
    {
      question: 'Trên không sợ nước, dưới không sợ lửa, nhà bếp nào cũng có một cái. (Đố dụng cụ bếp)',
      options: ['Dao bếp', 'Nồi', 'Bát', 'Thớt'],
      answer: 1
    },
    // === trongquốcvănhóa/lễngày/thơtừ ===
    {
      question: 'Trong câu “Chỉ mong người lâu dài, ngàn dặm cùng thiền quyên”, “thiền quyên” chỉ gì?',
      options: ['Mỹ nhân', 'Mặt trăng', 'Mặt trời', 'Tinh tú'],
      answer: 1
    },
    {
      question: 'Lễ Thất Tịch còn gọi là lễ gì?',
      options: ['Tết Nguyên Tiêu', 'Lễ Hội Trăm Hoa', 'Lễ Khất Xảo', 'Tết Thượng Tỵ'],
      answer: 2
    },
    {
      question: 'Câu “Trong tiếng pháo, một năm qua đi” của nhà thơ nào?',
      options: ['Lý Bạch', 'Đỗ Phủ', 'Tô Thức', 'Vương An Thạch'],
      answer: 3
    },
    {
      question: 'Trong “ngũ cốc” cổ đại, loại nào không bao gồm?',
      options: ['Lúa', 'Lúa mì', 'Bông', 'Kê'],
      answer: 2
    },
    {
      question: 'Câu tiếp theo của “Thanh Minh tiết trời mưa rả rích” là?',
      options: ['Người đi đường muốn đứt hồn', 'Mục đồng từ xa chỉ làng hoa hạnh', 'Xin hỏi quán rượu ở đâu', 'Một mình nơi đất khách làm khách lạ'],
      answer: 0
    },
    {
      question: 'Mùng năm tháng năm âm lịch là lễ gì?',
      options: ['Tết Trung Thu', 'Tết Trùng Dương', 'Tết Đoan Ngọ', 'Lễ Thất Tịch'],
      answer: 2
    },
    {
      question: 'Câu tiếp theo của “Ngẩng đầu ngắm trăng sáng” là?',
      options: ['Ngỡ là sương trên mặt đất', 'Cúi đầu nhớ quê hương', 'Trăng quê hương sáng hơn', 'Đối bóng thành ba người'],
      answer: 1
    },
    {
      question: '“Bốn báu vật văn phòng” cổ đại không gồm món nào?',
      options: ['Bút', 'Mực', 'Giấy', 'Thước'],
      answer: 3
    },
    {
      question: 'Câu tiếp theo của “Xuân miên bất giác hiểu” là?',
      options: ['Nơi nơi nghe chim hót', 'Hoa rơi biết bao nhiêu', 'Đêm qua tiếng gió mưa', 'Gió xuân hương hoa cỏ'],
      answer: 0
    },
    {
      question: 'Trong 24 tiết khí, sau Lập Xuân là tiết khí nào?',
      options: ['Kinh Trập', 'Vũ Thủy', 'Xuân Phân', 'Thanh Minh'],
      answer: 1
    },
    {
      question: '“Ba người bạn mùa lạnh” chỉ ba loài cây nào?',
      options: ['Mai Lan Trúc', 'Tùng Trúc Mai', 'Lan Cúc Mai', 'Tùng Lan Trúc'],
      answer: 1
    },
    {
      question: '“Giường trước ánh trăng sáng” — “giường” có khả năng chỉ gì?',
      options: ['Giường ngủ', 'Thành giếng', 'Ghế Hồ', 'Bệ cửa sổ'],
      answer: 1
    },
    {
      question: 'Tết Trùng Dương có phong tục gì?',
      options: ['Ăn bánh trôi', 'Lên cao ngắm cảnh', 'Thả đèn hoa đăng', 'Du xuân'],
      answer: 1
    },
    {
      question: 'Câu tiếp theo của “Mặt người không biết đi đâu” là?',
      options: ['Hoa đào vẫn cười trong gió xuân', 'Gió xuân không qua ải Ngọc Môn', 'Hoa nở hoa tàn mặc cho tự nhiên', 'Mùa hoa rụng lại gặp người'],
      answer: 0
    },
    {
      question: 'Tết Đoan Ngọ ăn bánh ú để tưởng niệm ai?',
      options: ['Khổng Tử', 'Khuất Nguyên', 'Lý Bạch', 'Gia Cát Lượng'],
      answer: 1
    },
    {
      question: 'Câu tiếp theo của “Hái cúc dưới hàng rào phía đông” là?',
      options: ['Thảnh thơi ngắm Nam Sơn', 'Nâng chén hỏi trời xanh', 'Một mình câu cá giữa tuyết sông lạnh', 'Xuân về nước sông xanh như lam'],
      answer: 0
    },
    // === tựnhiên/nôngcanh tác/tácvật ===
    {
      question: 'Mặt tròn như táo, chua ngọt và giàu dinh dưỡng, vừa làm rau vừa làm trái. (Đố rau quả)',
      options: ['Cà chua', 'Táo', 'Đào', 'Mơ'],
      answer: 0
    },
    {
      question: 'Nhìn tròn, sờ sần, bên trong đầy những “mặt trăng nhỏ”. (Đố món ăn)',
      options: ['Quả óc chó', 'Đậu Phộng', 'Cam', 'Lựu'],
      answer: 2
    },
    {
      question: 'Em bé trắng nõn, tắm rửa tạo bọt, càng rửa càng nhỏ rồi biến mất. (Đố đồ dùng)',
      options: ['Khăn mặt', 'Xà phòng', 'Kem đánh răng', 'Túi thơm'],
      answer: 1
    },
    {
      question: 'Ống tre dài hai thước, có bảy lỗ tròn, thổi vào một lỗ thì tiếng nhạc vang xa. (Đố nhạc cụ)',
      options: ['Tiêu', 'Sáo', 'Huân', 'Tỳ bà'],
      answer: 1
    },
    {
      question: 'Nói là con bò nhưng không kéo cày, sức nhỏ mà có thể “cõng cả ngôi nhà”. (Đố con vật)',
      options: ['Ốc Sên', 'Tê giác', 'Trâu nước', 'Kiến'],
      answer: 0
    },
    {
      question: 'Có cánh không phải chim, có chân không biết chạy, không làm tổ mà sống trên cây, tiếng kêu hơn trăm loài chim. (Đố côn trùng)',
      options: ['Ong', 'Bướm', 'Ve sầu', 'Dế'],
      answer: 2
    },
    {
      question: 'Hai lá bốn hoa, màu trắng pha vàng, mỗi năm nở một lần, tháng tám tỏa hương. (Đố thực vật)',
      options: ['Hoa lan', 'Hoa Cúc', 'Hoa Quế', 'Hoa sen'],
      answer: 2
    },
    {
      question: 'Một tòa thành vuông vức, bên trong có trăm nghìn binh lính, phái tướng quân đi đánh trận. (Đố đồ vật)',
      options: ['Bàn cờ', 'Bàn tính', 'Con dấu', 'Nghiên mực'],
      answer: 0
    }
  ]

  /** trước2câu7giây，sau3câu6giây */
  const currentTimeLimit = ref(7)

  const gameRiddles = ref<Riddle[]>([])
  const currentIndex = ref(0)
  const countdown = ref(7)
  const score = ref(0)
  const correctCount = ref(0)
  const lastCorrect = ref(false)
  const answered = ref(false)
  const results = ref<(boolean | null)[]>([null, null, null, null, null])

  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let phaseTimeout: ReturnType<typeof setTimeout> | null = null

  const currentRiddle = ref<Riddle>(RIDDLE_POOL[0]!)

  const dotClass = (idx: number) => {
    const r = results.value[idx]
    if (r === true) return 'bg-success'
    if (r === false) return 'bg-danger'
    if (idx === currentIndex.value && phase.value !== 'finished') return 'bg-accent dot-pulse'
    return 'bg-accent/20'
  }

  const pickRiddles = (): Riddle[] => {
    const pool = [...RIDDLE_POOL]
    const picked: Riddle[] = []
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      picked.push(pool.splice(idx, 1)[0]!)
    }
    return picked
  }

  const startGame = () => {
    sfxGameStart()
    gameRiddles.value = pickRiddles()
    currentIndex.value = 0
    score.value = 0
    correctCount.value = 0
    results.value = [null, null, null, null, null]
    showNextRiddle()
  }

  const showNextRiddle = () => {
    currentRiddle.value = gameRiddles.value[currentIndex.value]!
    answered.value = false
    currentTimeLimit.value = currentIndex.value < 2 ? 7 : 6
    sfxRiddleReveal()
    phase.value = 'showing'
    phaseTimeout = setTimeout(() => {
      phase.value = 'answering'
      countdown.value = currentTimeLimit.value
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 3 && countdown.value > 0) sfxCountdownFinal()
        else if (countdown.value > 3) sfxCountdownTick()
        if (countdown.value <= 0) {
          answer(-1)
        }
      }, 1000)
    }, 800)
  }

  const answer = (choice: number) => {
    if (answered.value) return
    answered.value = true

    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = null

    const correct = choice === currentRiddle.value.answer
    lastCorrect.value = correct
    results.value[currentIndex.value] = correct
    if (correct) {
      sfxMiniGood()
      correctCount.value++
      score.value += 100
    } else {
      sfxRiddleWrong()
    }
    phase.value = 'result'

    phaseTimeout = setTimeout(() => {
      currentIndex.value++
      if (currentIndex.value >= 5) {
        if (correctCount.value === 5) {
          score.value += 300
          sfxMiniPerfect()
        }
        phase.value = 'finished'
      } else {
        showNextRiddle()
      }
    }, 1500)
  }

  const handleClaim = () => {
    sfxRewardClaim()
    emit('complete', score.value)
  }

  onUnmounted(() => {
    if (countdownTimer) clearInterval(countdownTimer)
    if (phaseTimeout) clearTimeout(phaseTimeout)
  })
</script>

<style scoped>
  .lantern-drop {
    animation: lantern-drop 0.6s ease-out;
  }

  @keyframes lantern-drop {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    60% {
      transform: translateY(3px);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .dot-pulse {
    animation: dot-pulse 1s ease-in-out infinite;
  }

  @keyframes dot-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  .time-pulse {
    animation: time-pulse 0.5s ease-in-out infinite;
  }

  @keyframes time-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .correct-flash {
    animation: correct-flash 0.4s ease-in-out;
  }

  @keyframes correct-flash {
    0% {
      background-color: transparent;
    }
    30% {
      background-color: rgba(90, 158, 111, 0.2);
    }
    100% {
      background-color: transparent;
    }
  }

  .wrong-shake {
    animation: wrong-shake 0.4s ease-in-out;
  }

  @keyframes wrong-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-4px);
    }
    40% {
      transform: translateX(4px);
    }
    60% {
      transform: translateX(-3px);
    }
    80% {
      transform: translateX(3px);
    }
  }

  .finish-flash {
    animation: finish-flash 0.6s ease-in-out 3;
  }

  @keyframes finish-flash {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
