<template>
  <div>
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center space-x-1.5 text-sm text-accent">
        <Waves :size="14" />
        <span>Ao cá</span>
      </div>
      <span v-if="!fishPondStore.pond.built" class="text-xs text-muted">{{ fishPondStore.fishCount }}/{{ fishPondStore.capacity }}</span>
    </div>

    <!-- 未建造 -->
    <div v-if="!fishPondStore.pond.built" class="border border-accent/10 rounded-xs py-6 flex flex-col items-center space-y-2">
      <Waves :size="32" class="text-muted/30" />
      <p class="text-xs text-muted">vẫnchưa xâyxâyAo cá</p>
      <p class="text-xs text-muted/60">xâyxâyAo cásaucó thể nuôicáloài、Sinh sảnthu hoạch</p>
      <Button :icon="Hammer" :icon-size="12" @click="pondModal = 'build'">xâyxâyAo cá</Button>
    </div>

    <!-- 已建造 -->
    <template v-else>
      <!-- 两栏切换 -->
      <div class="flex space-x-1 mb-3">
        <Button class="flex-1 justify-center" :class="{ '!bg-accent !text-bg': currentTab === 'pond' }" @click="currentTab = 'pond'">
          cáao
        </Button>
        <Button
          class="flex-1 justify-center"
          :class="{ '!bg-accent !text-bg': currentTab === 'compendium' }"
          @click="currentTab = 'compendium'"
        >
          bộ sưu tậpgiám {{ fishPondStore.discoveredBreeds.size }}/{{ totalBreedCount }}
        </Button>
      </div>

      <!-- ===== 鱼塘 Tab ===== -->
      <template v-if="currentTab === 'pond'">
        <!-- 状态总览 -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1.5">
            <Divider>Ao cá Lv.{{ fishPondStore.pond.level }}</Divider>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-muted">{{ fishPondStore.fishCount }}/{{ fishPondStore.capacity }}</span>
              <Button v-if="fishPondStore.pond.level < 3" :icon="ArrowUp" :icon-size="12" @click="pondModal = 'upgrade'">Nâng cấp</Button>
            </div>
          </div>

          <!-- 水质条 -->
          <div class="border border-accent/20 rounded-xs px-3 py-2">
            <div class="flex items-center space-x-2 mb-1.5">
              <span class="text-xs text-muted shrink-0">nướcchất</span>
              <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs transition-all"
                  :class="waterQualityColor"
                  :style="{ width: fishPondStore.pond.waterQuality + '%' }"
                />
              </div>
              <span class="text-xs whitespace-nowrap" :class="waterQualityTextColor">{{ fishPondStore.pond.waterQuality }}%</span>
            </div>
            <!-- 操作按钮 -->
            <div class="flex flex-wrap space-x-1">
              <Button
                :icon="Droplets"
                :icon-size="12"
                :disabled="fishPondStore.pond.fedToday || fishPondStore.pond.fish.length === 0"
                @click="handleFeed"
              >
                {{ fishPondStore.pond.fedToday ? 'Đã cho ăn' : 'Cho ăn' }}
              </Button>
              <Button :icon="Sparkles" :icon-size="12" @click="handleClean">cảithiệnnướcchất</Button>
              <Button v-if="fishPondStore.sickFish.length > 0" :icon="HeartPulse" :icon-size="12" @click="handleTreat">
                Điều trị ({{ fishPondStore.sickFish.length }})
              </Button>
              <Button
                v-if="fishPondStore.pendingProducts.length > 0"
                :icon="Package"
                :icon-size="12"
                :disabled="fishPondStore.pond.collectedToday"
                @click="handleCollect"
              >
                thunhận ({{ fishPondStore.pendingProducts.length }})
              </Button>
            </div>
          </div>
        </div>

        <!-- 塘中鱼类 -->
        <div class="mb-3">
          <Divider label="Cá trong ao" />

          <!-- 空状态 -->
          <div
            v-if="fishPondStore.pond.fish.length === 0"
            class="border border-accent/10 rounded-xs py-6 flex flex-col items-center space-y-2"
          >
            <Fish :size="32" class="text-muted/30" />
            <p class="text-xs text-muted">Ao cá trống</p>
            <p class="text-xs text-muted/60">từTúi đồtrongđặt vàocácây giốngbắt đầu nuôi</p>
          </div>

          <!-- 鱼列表 -->
          <div v-else class="flex flex-col space-y-1.5 max-h-80 overflow-auto">
            <div
              v-for="fish in fishPondStore.pond.fish"
              :key="fish.id"
              class="border rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5 transition-colors mr-1"
              :class="
                fish.sick ? 'border-danger/30' : selectedBreedingFish?.id === fish.id ? 'border-accent bg-accent/10' : 'border-accent/20'
              "
              @click="openFishDetail(fish)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1.5">
                  <Waves v-if="fish.mature && !fish.sick" :size="12" class="text-success" />
                  <HeartPulse v-else-if="fish.sick" :size="12" class="text-danger" />
                  <Fish v-else :size="12" class="text-muted/40" />
                  <span class="text-xs" :class="fish.sick ? 'text-danger' : fish.mature ? 'text-text' : 'text-muted'">
                    {{ fish.name }}
                  </span>
                  <span v-if="fish.sick" class="text-[10px] text-danger">[Bệnh]</span>
                  <span v-if="!fish.mature" class="text-[10px] text-muted">[Con non]</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] text-accent flex items-center space-x-px">
                    <Star v-for="n in fishPondStore.getGeneticStarRating(fish.genetics)" :key="n" :size="10" />
                  </span>
                  <span class="text-[10px] text-muted">{{ fish.daysInPond }}ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 放入鱼苗 -->
        <div class="mb-3">
          <Divider label="Thả cá giống" />
          <div v-if="pondableFishInBag.length > 0" class="flex flex-col space-y-1.5 max-h-80 overflow-auto">
            <div
              v-for="item in pondableFishInBag"
              :key="item.itemId"
              class="border border-accent/20 rounded-xs px-3 py-2 flex items-center justify-between mr-1"
            >
              <span class="text-xs">
                {{ item.name }}
                <span class="text-muted">&times;{{ item.count }}</span>
              </span>
              <Button :icon-size="12" @click="handleAddFish(item.itemId)">đặt vào</Button>
            </div>
          </div>
          <div v-else class="border border-accent/10 rounded-xs py-6 flex flex-col items-center space-y-2">
            <Package :size="32" class="text-muted/30" />
            <p class="text-xs text-muted">Túi đồtrongkhông cócó thể nuôi của cá</p>
            <p class="text-xs text-muted/60">đangthanhsuốiCâu cásaucó thể đặt vàoAo cánuôi</p>
          </div>
        </div>

        <!-- 繁殖 -->
        <div class="mb-3">
          <Divider label="Sinh sản" />
          <!-- 繁殖中 -->
          <div v-if="fishPondStore.pond.breeding" class="border border-accent/20 rounded-xs px-3 py-2">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <Heart :size="12" class="text-accent" />
                <span class="text-xs text-accent">Sinh sảntrong</span>
              </div>
              <span class="text-xs text-muted">{{ fishPondStore.pond.breeding.daysLeft }}/{{ breedingTotalDays }}ngày</span>
            </div>
            <div class="h-1 bg-bg rounded-xs border border-accent/10">
              <div class="h-full rounded-xs bg-accent transition-all" :style="{ width: breedingProgress + '%' }" />
            </div>
            <p class="text-[10px] text-muted mt-1">phẩmloại：{{ getPondableFishName(fishPondStore.pond.breeding.fishId) }}</p>
          </div>
          <!-- 已选择一条 -->
          <div v-else-if="selectedBreedingFish" class="border border-accent/20 rounded-xs px-3 py-2">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <Heart :size="12" class="text-muted/40" />
                <span class="text-xs">
                  đãchọn：{{ selectedBreedingFish.name }}
                  <span class="text-accent inline-flex items-center space-x-px">
                    <Star v-for="n in fishPondStore.getGeneticStarRating(selectedBreedingFish.genetics)" :key="n" :size="10" />
                  </span>
                </span>
              </div>
              <Button @click="selectedBreedingFish = null">Hủy</Button>
            </div>
            <p class="text-[10px] text-muted">Hãy chọn hai con cá trưởng thành cùng loài trong danh sách để ghép đôi</p>
          </div>
          <!-- 空状态 -->
          <div v-else class="border border-accent/10 rounded-xs py-6 flex flex-col items-center space-y-2">
            <Heart :size="32" class="text-muted/30" />
            <p class="text-xs text-muted">Chọn hai con cá trưởng thành cùng loài để bắt đầu sinh sản</p>
            <p class="text-xs text-muted/60">Ao cá cần còn chỗ trống</p>
          </div>
        </div>
      </template>

      <!-- ===== 图鉴 Tab ===== -->
      <template v-if="currentTab === 'compendium'">
        <!-- 代数筛选 -->
        <div class="grid grid-cols-5 space-x-1 mb-2">
          <Button
            v-for="g in 5"
            :key="g"
            class="grow shrink-0 basis-[calc(20%-3px)] justify-center"
            :class="{ '!bg-accent !text-bg': compendiumGen === g }"
            @click="compendiumGen = g as 1 | 2 | 3 | 4 | 5"
          >
            {{ g }}đời
          </Button>
        </div>

        <!-- 进度 -->
        <p class="text-xs text-muted mb-2">đã Phát hiện {{ discoveredCountByGen(compendiumGen) }}/{{ BREED_COUNTS[compendiumGen] }}</p>

        <!-- 提示 -->
        <div v-if="compendiumGen > 1" class="border border-accent/10 rounded-xs p-2 mb-2">
          <p class="text-xs text-muted leading-relaxed">
            <span class="text-accent">{{ compendiumGen }}đời</span>
            Giống cá cần ghép đúng với
            <span class="text-accent">{{ compendiumGen - 1 }}đời</span>
            phẩmgiốngphồnsinh sảnnhậnđược。
          </p>
        </div>

        <!-- 品种网格 -->
        <div class="grid grid-cols-5 gap-1 p-2 max-h-[50vh] overflow-auto">
          <div
            v-for="breed in currentGenBreeds"
            :key="breed.breedId"
            class="border rounded-xs p-1.5 text-xs text-center transition-colors truncate"
            :class="isDiscovered(breed.breedId) ? 'border-accent/20 ' + genColor(compendiumGen) : 'border-accent/10 text-muted/30'"
          >
            <template v-if="isDiscovered(breed.breedId)">{{ breed.name }}</template>
            <Lock v-else :size="12" class="mx-auto text-muted/30" />
          </div>
        </div>

        <!-- 完成度 -->
        <div class="mt-3 border border-accent/20 rounded-xs p-2">
          <div class="flex items-center space-x-2 text-xs mb-1.5">
            <span class="text-xs text-muted shrink-0">Tiến độ hoàn thành</span>
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div class="h-full bg-accent rounded-xs transition-all" :style="{ width: completionPercent + '%' }" />
            </div>
            <span class="text-xs text-accent whitespace-nowrap">{{ fishPondStore.discoveredBreeds.size }}/{{ totalBreedCount }}</span>
          </div>
          <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <div v-for="g in 5" :key="g" class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ g }}đời</span>
              <span class="text-xs">{{ discoveredCountByGen(g) }}/{{ BREED_COUNTS[g] }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- 鱼详情弹窗 -->
    <Transition name="panel-fade">
      <div v-if="detailFish" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="detailFish = null">
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="detailFish = null">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">{{ detailFish.name }}</p>
          <p class="text-xs mb-2 flex items-center space-x-1">
            <span class="text-accent flex items-center space-x-px">
              <Star v-for="n in fishPondStore.getGeneticStarRating(detailFish.genetics)" :key="n" :size="10" />
            </span>
            <span class="text-muted">·</span>
            <span class="text-muted">lượt{{ detailFish.daysInPond }}ngày</span>
            <span v-if="detailFish.sick" class="text-danger">· sinhBệnhtrong</span>
            <span v-if="!detailFish.mature" class="text-muted">· Chưa trưởng thành</span>
          </p>

          <!-- 基因条 -->
          <div class="flex flex-col space-y-1 mb-3">
            <div v-for="attr in fishAttributes" :key="attr.key" class="flex items-center space-x-2">
              <span class="text-xs text-muted w-10 shrink-0">{{ attr.label }}</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div class="h-full rounded-xs transition-all" :class="attr.barClass" :style="{ width: attr.value + '%' }" />
              </div>
              <span class="text-xs w-6 text-right">{{ attr.value }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-col space-y-1">
            <Button
              v-if="detailFish.mature && !detailFish.sick"
              class="w-full justify-center"
              :class="{ '!bg-accent !text-bg': !fishPondStore.pond.breeding }"
              :icon="Heart"
              :icon-size="12"
              :disabled="!!fishPondStore.pond.breeding"
              @click="handleDetailBreed"
            >
              chọnlàphồnsinh sảnhọ hàngbản
            </Button>
            <Button class="w-full justify-center" :icon="ArrowUp" :icon-size="12" @click="handleDetailRemove">Lấy rađếnTúi đồ</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 建造/升级弹窗 -->
    <Transition name="panel-fade">
      <div v-if="pondModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="pondModal = null">
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="pondModal = null">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">{{ modalTitle }}</p>

          <!-- 等级信息 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ pondModal === 'build' ? 'Cấp' : 'Cấp hiện tại' }}</span>
              <span class="text-xs">Lv.{{ modalCurrentLevel }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">{{ pondModal === 'build' ? 'Sức chứa ban đầu' : 'Sức chứa hiện tại' }}</span>
              <span class="text-xs">{{ modalCurrentCapacity }}</span>
            </div>
          </div>

          <!-- 升级后信息（仅升级时显示） -->
          <div v-if="pondModal === 'upgrade'" class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Nâng cấpđến</span>
              <span class="text-xs text-accent">Lv.{{ modalTargetLevel }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Nâng cấpsauSức chứa</span>
              <span class="text-xs text-accent">{{ modalTargetCapacity }}</span>
            </div>
          </div>

          <!-- 所需材料 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted mb-1">Nguyên liệu cần thiết</p>
            <div v-for="mat in modalMaterials" :key="mat.itemId" class="flex items-center justify-between mt-0.5">
              <span class="text-xs">{{ mat.name }}</span>
              <span class="text-xs" :class="mat.enough ? 'text-success' : 'text-danger'">{{ mat.owned }}/{{ mat.required }}</span>
            </div>
          </div>

          <!-- 费用 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Chi phí</span>
              <span class="text-xs" :class="playerStore.money >= modalMoney ? 'text-accent' : 'text-danger'">{{ modalMoney }}văn</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Đang sở hữu</span>
              <span class="text-xs">{{ playerStore.money }}văn</span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canConfirmModal }"
            :icon="pondModal === 'build' ? Hammer : ArrowUp"
            :icon-size="12"
            :disabled="!canConfirmModal"
            @click="handleModalConfirm"
          >
            {{ pondModal === 'build' ? 'Xác nhận xây' : 'Xác nhận nâng cấp' }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Waves, Droplets, Sparkles, HeartPulse, Package, ArrowUp, Hammer, Lock, Fish, Heart, X, Star } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import { useFishPondStore } from '@/stores/useFishPondStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { addLog, showFloat } from '@/composables/useGameLog'
  import { handleEndDay } from '@/composables/useEndDay'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import { POND_BUILD_COST, POND_UPGRADE_COSTS, POND_CAPACITY, PONDABLE_FISH, getPondableFish, FISH_BREEDING_DAYS } from '@/data/fishPond'
  import { getBreedsByGeneration, BREED_COUNTS } from '@/data/pondBreeds'
  import { getItemById } from '@/data/items'
  import type { PondFish } from '@/types/fishPond'

  const fishPondStore = useFishPondStore()
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  const currentTab = ref<'pond' | 'compendium'>('pond')
  const selectedBreedingFish = ref<PondFish | null>(null)
  const detailFish = ref<PondFish | null>(null)
  const compendiumGen = ref<1 | 2 | 3 | 4 | 5>(1)

  /** xâyxây/tăngcấphệ thốngmộtđạncửa sổ */
  const pondModal = ref<'build' | 'upgrade' | null>(null)

  const getItemName = (itemId: string): string => getItemById(itemId)?.name ?? itemId
  const getPondableFishName = (fishId: string): string => getPondableFish(fishId)?.name ?? fishId

  const totalBreedCount = 400

  const isDiscovered = (breedId: string): boolean => fishPondStore.discoveredBreeds.has(breedId)

  const discoveredCountByGen = (gen: number): number => {
    const breeds = getBreedsByGeneration(gen as 1 | 2 | 3 | 4 | 5)
    return breeds.filter(b => fishPondStore.discoveredBreeds.has(b.breedId)).length
  }

  const currentGenBreeds = computed(() => getBreedsByGeneration(compendiumGen.value))

  /** bộ sưu tậpgiámhoàn成độ */
  const completionPercent = computed(() => {
    return Math.floor((fishPondStore.discoveredBreeds.size / totalBreedCount) * 100)
  })

  /** đờisốmàu sắcmàu */
  const genColor = (gen: number): string => {
    if (gen >= 5) return 'text-quality-supreme'
    if (gen >= 4) return 'text-quality-excellent'
    if (gen >= 3) return 'text-quality-fine'
    return 'text-accent'
  }

  /** nướcchấtmụcmàu sắcmàu */
  const waterQualityColor = computed(() => {
    const wq = fishPondStore.pond.waterQuality
    if (wq >= 70) return 'bg-success'
    if (wq >= 30) return 'bg-accent'
    return 'bg-danger'
  })

  /** nướcchấtvănchữmàu sắcmàu */
  const waterQualityTextColor = computed(() => {
    const wq = fishPondStore.pond.waterQuality
    if (wq >= 70) return 'text-success'
    if (wq >= 30) return 'text-accent'
    return 'text-danger'
  })

  /** phồnsinh sảntiếnđộ */
  const breedingTotalDays = FISH_BREEDING_DAYS
  const breedingProgress = computed(() => {
    if (!fishPondStore.pond.breeding) return 0
    return ((breedingTotalDays - fishPondStore.pond.breeding.daysLeft) / breedingTotalDays) * 100
  })

  // === xâyxây/tăngcấphệ thốngmộtđạncửa sổ ===

  const upgradeNextLevel = computed(() => Math.min(fishPondStore.pond.level + 1, 3) as 2 | 3)

  const modalTitle = computed(() => (pondModal.value === 'build' ? 'Xây ao cá' : 'Nâng cấp ao cá'))

  const modalCurrentLevel = computed(() => (pondModal.value === 'build' ? 1 : fishPondStore.pond.level))

  const modalCurrentCapacity = computed(() => (pondModal.value === 'build' ? POND_CAPACITY[1] : fishPondStore.capacity))

  const modalTargetLevel = computed(() => upgradeNextLevel.value)

  const modalTargetCapacity = computed(() => POND_CAPACITY[upgradeNextLevel.value])

  const modalMoney = computed(() =>
    pondModal.value === 'build' ? POND_BUILD_COST.money : POND_UPGRADE_COSTS[upgradeNextLevel.value].money
  )

  const modalMaterials = computed(() => {
    const mats = pondModal.value === 'build' ? POND_BUILD_COST.materials : POND_UPGRADE_COSTS[upgradeNextLevel.value].materials
    return mats.map(m => ({
      itemId: m.itemId,
      name: getItemName(m.itemId),
      required: m.quantity,
      owned: inventoryStore.getItemCount(m.itemId),
      enough: inventoryStore.getItemCount(m.itemId) >= m.quantity
    }))
  })

  const canConfirmModal = computed(() => {
    if (playerStore.money < modalMoney.value) return false
    return modalMaterials.value.every(m => m.enough)
  })

  const handleModalConfirm = () => {
    if (pondModal.value === 'build') {
      if (fishPondStore.buildPond()) {
        addLog('Đã xây xong ao cá!')
        showFloat('Đã xây xong ao cá!', 'success')
        pondModal.value = null
      } else {
        addLog('Thiếu nguyên liệu hoặc tiền, không thể xây ao cá.')
      }
    } else {
      const nextLevel = (fishPondStore.pond.level + 1) as 2 | 3
      if (fishPondStore.upgradePond()) {
        addLog(`Ao cá nâng lên Lv.${nextLevel}! Sức chứa tăng.`)
        showFloat(`Nâng cấp ao cá Lv.${nextLevel}`, 'success')
        pondModal.value = null
      } else {
        addLog('Thiếu nguyên liệu hoặc tiền, không thể nâng cấp.')
      }
    }
  }

  /** lưnggóitrong可đặtvàocáao的cá */
  const pondableFishInBag = computed(() => {
    const result: { itemId: string; name: string; count: number }[] = []
    for (const def of PONDABLE_FISH) {
      const count = inventoryStore.getItemCount(def.fishId)
      if (count > 0) {
        result.push({ itemId: def.fishId, name: def.name, count })
      }
    }
    return result
  })

  /** cáchi tiếthìnhđạncửa sổthuộc tínhtínhmục */
  const fishAttributes = computed(() => {
    if (!detailFish.value) return []
    const g = detailFish.value.genetics
    return [
      { key: 'weight', label: 'Cân nặng', value: g.weight, barClass: 'bg-accent' },
      {
        key: 'growthRate',
        label: 'Sinh trưởng',
        value: g.growthRate,
        barClass: 'bg-success'
      },
      {
        key: 'diseaseRes',
        label: 'Kháng bệnh',
        value: g.diseaseRes,
        barClass: 'bg-water'
      },
      {
        key: 'qualityGene',
        label: 'Phẩm chất',
        value: g.qualityGene,
        barClass: 'bg-quality-fine'
      },
      {
        key: 'mutationRate',
        label: 'Đột biến',
        value: g.mutationRate,
        barClass: 'bg-danger'
      }
    ]
  })

  /** đánhmởcáchi tiếthình */
  const openFishDetail = (fish: PondFish) => {
    detailFish.value = fish
  }

  /** đạncửa sổtrongchọnlàphồnsinh sảnhọ hàngbản */
  const handleDetailBreed = () => {
    if (!detailFish.value) return
    handleSelectForBreeding(detailFish.value)
    detailFish.value = null
  }

  /** đạncửa sổtronglấyrađếnlưnggói */
  const handleDetailRemove = () => {
    if (!detailFish.value) return
    handleRemoveFish(detailFish.value.id)
    detailFish.value = null
  }

  // === thao táclàm ===

  const handleFeed = () => {
    if (fishPondStore.feedFish()) {
      addLog('Đã cho cá trong ao ăn.')
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.feedFish)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else if (fishPondStore.pond.fedToday) {
      addLog('Hôm nay đã cho ăn rồi.')
    } else {
      addLog('Không có thức ăn cá, không thể cho ăn.')
    }
  }

  const handleClean = () => {
    if (fishPondStore.cleanPond()) {
      addLog('Dùng chất cải tạo nước để làm sạch ao cá.')
      showFloat('+Chất lượng nước', 'success')
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.cleanPond)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Không có chất cải tạo nước.')
    }
  }

  const handleTreat = () => {
    const count = fishPondStore.treatSickFish()
    if (count > 0) {
      addLog(`Đã chữa ${count} con cá bệnh.`)
      showFloat(`Chữa ${count} con cá`, 'success')
    } else {
      addLog('Không có thuốc thú y hoặc không có cá bệnh.')
    }
  }

  const handleCollect = () => {
    const products = fishPondStore.collectProducts()
    if (products.length > 0) {
      for (const p of products) {
        inventoryStore.addItem(p.itemId, 1, p.quality)
      }
      const names = products.map(p => getItemName(p.itemId)).join('、')
      addLog(`Đã thu hoạch ${names}.`)
      showFloat(`+${products.length} sản phẩm thủy sản`, 'success')
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.collectFishProducts)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Không có sản phẩm để thu hoạch.')
    }
  }

  const handleAddFish = (fishId: string) => {
    const added = fishPondStore.addFish(fishId, 1)
    if (added > 0) {
      const name = getPondableFishName(fishId)
      addLog(`Đã thả ${added} con ${name}.`)
    } else if (fishPondStore.isFull) {
      addLog('Ao cá đã đầy, không thể thả thêm cá.')
    } else {
      addLog('Túi không có loài cá này.')
    }
  }

  const handleRemoveFish = (pondFishId: string) => {
    if (fishPondStore.removeFish(pondFishId)) {
      addLog('Đã lấy một con cá ra.')
      selectedBreedingFish.value = null
    } else {
      addLog('Balo đã đầy, không thể lấy ra.')
    }
  }

  const handleSelectForBreeding = (fish: PondFish) => {
    if (!selectedBreedingFish.value) {
      selectedBreedingFish.value = fish
      return
    }

    if (selectedBreedingFish.value.id === fish.id) {
      selectedBreedingFish.value = null
      return
    }

    // thửthửphốiđúng
    if (fishPondStore.startBreeding(selectedBreedingFish.value.id, fish.id)) {
      addLog(`${fish.name} bắt đầu sinh sản, sau ${fishPondStore.pond.breeding!.daysLeft} ngày sẽ có kết quả.`)
      showFloat('Bắt đầu sinh sản', 'success')
      selectedBreedingFish.value = null
    } else {
      if (selectedBreedingFish.value.fishId !== fish.fishId) {
        addLog('Chỉ có thể ghép đôi cùng loài cá.')
      } else if (fishPondStore.isFull) {
        addLog('Ao cá đã đầy, không thể sinh sản.')
      } else {
        addLog('Không thể ghép đôi, hãy đảm bảo cá đã trưởng thành và không bệnh.')
      }
      selectedBreedingFish.value = null
    }
  }
</script>
