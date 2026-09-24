<template>
  <div class="game-panel max-w-sm w-full">
    <h3 class="text-accent text-sm mb-3 flex items-center space-x-1">
      <Wind :size="14" />
      <span>Hội thả diều mùa thu</span>
    </h3>

    <!-- 准备 -->
    <div v-if="phase === 'ready'">
      <p class="text-xs text-muted mb-3">
        Thả diều trong gió thu! Gió liên tục thổi diều sang hai bên, nhấn 「Kéo trái」 hoặc 「Kéo phải」 để đưa diều về giữa. Giữ diều trong vùng xanh để liên tục ghi điểm, cố gắng trong 25 giây!
      </p>
      <Button class="w-full" @click="startGame">Thả diều!</Button>
    </div>

    <!-- 游戏中 -->
    <div v-else-if="phase === 'playing'">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-muted">
          còncòn：
          <span class="text-accent">{{ timeLeft }}</span>
          giây
        </p>
        <p class="text-xs text-muted">
          đượcđiểm：
          <span class="text-accent">{{ score }}</span>
        </p>
      </div>

      <!-- 风向提示 -->
      <div class="text-center mb-2">
        <p class="text-xs" :class="windDirection > 0 ? 'text-success' : 'text-danger'">
          {{ windDirection > 0 ? '→ Gió Đông →' : '← Gió Tây ←' }}
          {{ windLabel }}
        </p>
      </div>

      <!-- 风筝位置条 -->
      <div class="relative h-10 bg-bg border border-accent/20 mb-3">
        <!-- 安全区域 (中间36%) -->
        <div class="absolute top-0 bottom-0 left-[32%] w-[36%] bg-success/10 border-x border-success/30" />
        <!-- 中心线 -->
        <div class="absolute top-0 bottom-0 left-1/2 w-px bg-accent/20" />
        <!-- 风筝 -->
        <div
          class="absolute top-1 bottom-1 flex items-center justify-center"
          :style="{ left: `calc(${kitePosition}% - 10px)`, transition: 'none' }"
        >
          <span class="text-lg" :class="inSafeZone ? 'kite-float' : 'kite-shake'">🪁</span>
        </div>
        <!-- 区域标签 -->
        <div class="absolute bottom-0 w-full flex text-center" style="font-size: 9px">
          <span class="flex-32 text-danger/40">Nguy hiểm</span>
          <span class="flex-36 text-success/40">An toàn</span>
          <span class="flex-32 text-danger/40">Nguy hiểm</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex space-x-2">
        <Button class="flex-1 py-2" :icon="ArrowLeft" @click="pullLeft">Kéo trái</Button>
        <Button class="flex-1 py-2" @click="pullRight">
          kéophải
          <ArrowRight :size="14" />
        </Button>
      </div>

      <!-- 连续稳定加分提示 -->
      <div v-if="combo >= 3" class="text-center mt-2">
        <p class="text-xs text-accent combo-pulse">Bay ổn định ×{{ combo }}</p>
      </div>
    </div>

    <!-- 结果 -->
    <div v-else>
      <p class="text-xs text-muted mb-2">Hội thả diều kết thúc!</p>

      <div class="border border-accent/20 p-2 mb-3 text-center">
        <p
          class="text-sm mb-2"
          :class="{
            'text-accent': score >= 200,
            'text-success': score >= 120 && score < 200,
            'text-muted': score < 120
          }"
        >
          {{ score >= 200 ? 'Bậc thầy điều khiển gió! Diều vững như bàn thạch!' : score >= 120 ? 'Kỹ thuật khá tốt, diều bay rất cao.' : 'Gió mạnh quá, lần sau cố gắng tiếp nhé.' }}
        </p>
        <p class="text-xs text-muted mb-1">Chuỗi bay ổn định dài nhất: {{ maxCombo }} lần</p>
        <p class="text-xs mb-1">
          tổngđiểm：
          <span class="text-accent">{{ score }}</span>
        </p>
        <p class="text-xs">
          thưởngvàng：
          <span class="text-accent">{{ prize }}</span>
          xu
        </p>
      </div>
      <Button class="w-full" @click="handleClaim">Nhận phần thưởng</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted } from 'vue'
  import { Wind, ArrowLeft, ArrowRight } from 'lucide-vue-next'
  import {
    sfxGameStart,
    sfxRewardClaim,
    sfxCountdownTick,
    sfxCountdownFinal,
    sfxKitePull,
    sfxWindGust,
    sfxRankFirst,
    sfxRankSecond,
    sfxRankThird
  } from '@/composables/useAudio'
  import Button from '@/components/game/Button.vue'

  const emit = defineEmits<{ complete: [prize: number] }>()

  type Phase = 'ready' | 'playing' | 'finished'

  const phase = ref<Phase>('ready')
  const score = ref(0)
  const kitePosition = ref(50) // 0-100, 50=trongtâm
  const timeLeft = ref(25)
  const windDirection = ref(1) // 1=phải, -1=trái
  const windStrength = ref(1)
  const combo = ref(0)
  const maxCombo = ref(0)
  const windLabel = ref('Gió nhẹ')

  /** giódiềutốcđộ（đơnvị trí：%/giây），đúng=hướngphải，mang=hướngtrái */
  let kiteVelocity = 0
  let rafId: number | null = null
  let lastFrameTime = 0
  let scoreTick = 0 // tích lũytínhan toàntoàn bộkhuthờigian（giây），mỗi0.5giâyđượcđiểm
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let windChangeTimer: ReturnType<typeof setTimeout> | null = null

  const inSafeZone = computed(() => kitePosition.value >= 32 && kitePosition.value <= 68)

  const prize = computed(() => {
    if (score.value >= 200) return 800
    if (score.value >= 120) return 500
    if (score.value >= 60) return 200
    return 50
  })

  /** requestAnimationFrame chínhtheovòng */
  const gameLoop = (timestamp: number) => {
    if (phase.value !== 'playing') return

    const dt = lastFrameTime === 0 ? 0.016 : Math.min((timestamp - lastFrameTime) / 1000, 0.05)
    lastFrameTime = timestamp

    // giólựclàmlàgiữtiếp tụcthêmtốcđộ（đơnvị trí：%/giây²）
    const windAccel = windDirection.value * windStrength.value * 22
    kiteVelocity += windAccel * dt

    // theomáytrậngió：đột ngộtnhiên的số tiềnngoàixunglượng，đểgiódiềukhódùngdự kiếnkiểm tra
    if (Math.random() < dt * 1.5) {
      const gustForce = (Math.random() - 0.4) * windStrength.value * 18
      kiteVelocity += gustForce
    }

    // 阻尼：速度自然衰减，使风筝不会无限加速
    kiteVelocity *= Math.pow(0.95, dt * 60)

    // 更新位置
    kitePosition.value += kiteVelocity * dt
    // 边界弹回
    if (kitePosition.value <= 0) {
      kitePosition.value = 0
      kiteVelocity = Math.abs(kiteVelocity) * 0.3
    } else if (kitePosition.value >= 100) {
      kitePosition.value = 100
      kiteVelocity = -Math.abs(kiteVelocity) * 0.3
    }

    // đangan toàntoàn bộkhutrongđượcđiểm
    if (inSafeZone.value) {
      combo.value++
      if (combo.value > maxCombo.value) maxCombo.value = combo.value
      scoreTick += dt
      if (scoreTick >= 0.5) {
        scoreTick -= 0.5
        const comboBonus = Math.min(Math.floor(combo.value / 60), 2)
        score.value += 1 + comboBonus
      }
    } else {
      combo.value = 0
      scoreTick = 0
    }

    rafId = requestAnimationFrame(gameLoop)
  }

  const startGame = () => {
    sfxGameStart()
    score.value = 0
    kitePosition.value = 50
    kiteVelocity = 0
    timeLeft.value = 25
    windDirection.value = Math.random() > 0.5 ? 1 : -1
    windStrength.value = 1.0
    windLabel.value = 'Gió nhẹ'
    combo.value = 0
    maxCombo.value = 0
    scoreTick = 0
    lastFrameTime = 0
    phase.value = 'playing'

    // mởtác RAF chínhtheovòng
    rafId = requestAnimationFrame(gameLoop)

    // gụctínhthời
    countdownTimer = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 3 && timeLeft.value > 0) sfxCountdownFinal()
      else if (timeLeft.value > 3) sfxCountdownTick()
      if (timeLeft.value <= 0) {
        endGame()
      }
    }, 1000)

    // 风向/风力变化
    scheduleWindChange()
  }

  const scheduleWindChange = () => {
    const delay = 2000 + Math.random() * 1500
    windChangeTimer = setTimeout(() => {
      if (phase.value !== 'playing') return

      // 可năngđổiphươnghướng（saukỳhơntần suấtphồnđổihướng）
      const elapsed = 25 - timeLeft.value
      const flipChance = 0.35 + elapsed * 0.01
      if (Math.random() < flipChance) {
        windDirection.value *= -1
        sfxWindGust()
      }

      // 风力变化，随时间增强
      const minStrength = 1.0 + elapsed * 0.1
      const maxStrength = 2.0 + elapsed * 0.15
      windStrength.value = minStrength + Math.random() * (maxStrength - minStrength)

      if (windStrength.value < 2) windLabel.value = 'Gió nhẹ'
      else if (windStrength.value < 3.5) windLabel.value = 'Gió nhẹ'
      else windLabel.value = 'Gió mạnh'

      scheduleWindChange()
    }, delay) as unknown as ReturnType<typeof setTimeout>
  }

  /** kéotrái：bónthêmmộtcáihướngtrái的xunglượng */
  const pullLeft = () => {
    if (phase.value !== 'playing') return
    sfxKitePull()
    kiteVelocity -= 42
  }

  /** kéophải：bónthêmmộtcáihướngphải的xunglượng */
  const pullRight = () => {
    if (phase.value !== 'playing') return
    sfxKitePull()
    kiteVelocity += 42
  }

  const endGame = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (countdownTimer) clearInterval(countdownTimer)
    if (windChangeTimer) clearTimeout(windChangeTimer)
    rafId = null
    countdownTimer = null
    windChangeTimer = null
    phase.value = 'finished'

    // kếttínhâm thanhhiệu
    if (score.value >= 200) sfxRankFirst()
    else if (score.value >= 120) sfxRankSecond()
    else sfxRankThird()
  }

  const handleClaim = () => {
    sfxRewardClaim()
    emit('complete', prize.value)
  }

  onUnmounted(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (countdownTimer) clearInterval(countdownTimer)
    if (windChangeTimer) clearTimeout(windChangeTimer)
  })
</script>

<style scoped>
  .kite-float {
    animation: kite-float 2s ease-in-out infinite;
  }

  @keyframes kite-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  .kite-shake {
    animation: kite-shake 0.3s ease-in-out infinite;
  }

  @keyframes kite-shake {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-8deg);
    }
    75% {
      transform: rotate(8deg);
    }
  }

  .combo-pulse {
    animation: combo-pulse 0.8s ease-in-out infinite;
  }

  @keyframes combo-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
