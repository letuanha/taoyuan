<template>
  <div>
    <!-- 标题 -->
    <div class="flex items-center space-x-1.5 text-sm text-accent mb-3">
      <ClipboardList :size="14" />
      <span>Nhiệm vụ</span>
    </div>

    <!-- 主线任务 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-3">
      <p class="text-xs text-muted mb-2">
        <BookOpen :size="12" class="inline" />
        chínhdâybất kỳvụ
      </p>
      <div
        v-if="mainQuestDef"
        class="flex items-center justify-between border rounded-xs px-3 py-1.5 cursor-pointer"
        :class="
          questStore.mainQuest?.accepted && questStore.canSubmitMainQuest()
            ? 'border-success/50 bg-success/5 hover:bg-success/10'
            : 'border-accent/20 hover:bg-accent/5'
        "
        @click="questModal = { type: 'main' }"
      >
        <div class="min-w-0">
          <p class="text-xs text-accent truncate">lượt{{ mainQuestDef.chapter }}chương · {{ mainQuestDef.title }}</p>
          <p class="text-xs text-muted truncate">
            {{ mainQuestDef.description }}
          </p>
        </div>
        <span
          class="text-xs whitespace-nowrap ml-2"
          :class="questStore.canSubmitMainQuest() ? 'text-success' : questStore.mainQuest?.accepted ? 'text-accent' : 'text-muted'"
        >
          {{ questStore.canSubmitMainQuest() ? 'Có thể nộp' : questStore.mainQuest?.accepted ? 'Đang thực hiện' : 'Chưa nhận' }}
        </span>
      </div>
      <div v-else-if="questStore.completedMainQuests.length >= 50" class="flex flex-col items-center justify-center py-4 text-muted">
        <CheckCircle :size="24" />
        <p class="text-xs mt-1">Đã hoàn thành toàn bộ nhiệm vụ chính tuyến</p>
      </div>
    </div>

    <!-- 今日委托 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-3">
      <p class="text-xs text-muted mb-2">
        <Calendar :size="12" class="inline" />
        hôm nayngàyủynhờ
      </p>
      <div v-if="questStore.boardQuests.length === 0" class="flex flex-col items-center justify-center py-4 text-muted">
        <Calendar :size="24" />
        <p class="text-xs mt-1">hôm nayngàytạmkhông Ủy thác</p>
      </div>
      <div v-else class="flex flex-col space-y-1.5">
        <div
          v-for="quest in questStore.boardQuests"
          :key="quest.id"
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
          @click="questModal = { type: 'board', questId: quest.id }"
        >
          <p class="text-xs truncate min-w-0">{{ quest.description }}</p>
          <span class="text-xs text-accent whitespace-nowrap ml-2">{{ quest.moneyReward }}văn</span>
        </div>
      </div>
    </div>

    <!-- 特殊订单 -->
    <div v-if="questStore.specialOrder" class="border border-accent/20 rounded-xs p-3 mb-3">
      <p class="text-xs text-muted mb-2">
        <Star :size="12" class="inline" />
        đặcđặc biệtđặtđơn
      </p>
      <div
        class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
        @click="questModal = { type: 'special' }"
      >
        <div class="min-w-0">
          <p class="text-xs truncate">
            {{ questStore.specialOrder.description }}
          </p>
        </div>
        <span class="text-xs text-accent whitespace-nowrap ml-2">{{ questStore.specialOrder.moneyReward }}văn</span>
      </div>
    </div>

    <!-- 进行中 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-3">
      <p class="text-xs text-muted mb-2">
        <Clock :size="12" class="inline" />
        tiếnhànhtrong ({{ questStore.activeQuests.length }}/{{ questStore.MAX_ACTIVE_QUESTS }})
      </p>
      <div v-if="questStore.activeQuests.length === 0" class="flex flex-col items-center justify-center py-4 text-muted">
        <Clock :size="24" />
        <p class="text-xs mt-1">tạmkhông Đang thực hiện của Nhiệm vụ</p>
      </div>
      <div v-else class="flex flex-col space-y-1.5">
        <div
          v-for="quest in questStore.activeQuests"
          :key="quest.id"
          class="border rounded-xs px-3 py-1.5 cursor-pointer"
          :class="
            canSubmit(quest)
              ? 'border-success/50 bg-success/5 hover:bg-success/10'
              : quest.type === 'special_order'
                ? 'border-accent/30 hover:bg-accent/5'
                : 'border-accent/20 hover:bg-accent/5'
          "
          @click="questModal = { type: 'active', questId: quest.id }"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs truncate min-w-0">{{ quest.description }}</p>
            <span class="text-xs whitespace-nowrap ml-2" :class="canSubmit(quest) ? 'text-success' : 'text-muted'">
              {{ canSubmit(quest) ? 'Có thể nộp' : `Còn ${quest.daysRemaining} ngày` }}
            </span>
          </div>
          <div v-if="quest.type !== 'delivery'" class="mt-1 flex items-center space-x-2">
            <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
              <div
                class="h-full rounded-xs bg-accent transition-all"
                :style="{
                  width: Math.floor((getEffectiveProgress(quest) / quest.targetQuantity) * 100) + '%'
                }"
              />
            </div>
            <span class="text-xs text-muted">{{ getEffectiveProgress(quest) }}/{{ quest.targetQuantity }}</span>
          </div>
          <div v-else class="mt-0.5">
            <span class="text-xs text-muted">Túi đồ {{ inventoryStore.getItemCount(quest.targetItemId) }}/{{ quest.targetQuantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计 -->
    <div class="border border-accent/10 rounded-xs p-2 text-center">
      <p class="text-xs text-muted">
        Đã hoàn thành {{ questStore.completedQuestCount }} ủy thác · tiến độ chính tuyến {{ questStore.completedMainQuests.length }}/50
      </p>
    </div>

    <!-- 任务详情弹窗 -->
    <Transition name="panel-fade">
      <div v-if="questModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="questModal = null">
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="questModal = null">
            <X :size="14" />
          </button>

          <!-- 主线任务详情 -->
          <template v-if="questModal.type === 'main' && mainQuestDef">
            <p class="text-accent text-sm mb-1">lượt{{ mainQuestDef.chapter }}chương「{{ chapterTitle }}」</p>
            <p class="text-xs font-bold text-accent mb-1">
              {{ mainQuestDef.title }}
            </p>
            <p class="text-xs text-muted leading-relaxed mb-2">
              {{ mainQuestDef.description }}
            </p>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">Mục tiêu</p>
              <div v-for="(obj, i) in mainQuestDef.objectives" :key="i" class="flex items-center space-x-1">
                <CircleCheck v-if="mainQuestProgress[i]" :size="12" class="text-success shrink-0" />
                <Circle v-else :size="12" class="text-danger shrink-0" />
                <span class="text-xs" :class="mainQuestProgress[i] ? 'text-success' : ''">{{ obj.label }}</span>
              </div>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-3">
              <p class="text-xs text-muted mb-1">Phần thưởng</p>
              <p class="text-xs">
                {{ mainQuestDef.moneyReward }}văn
                <template v-if="mainQuestDef.friendshipReward?.length">+ hảo cảm</template>
                <template v-if="mainQuestDef.itemReward?.length">
                  +
                  {{ mainQuestDef.itemReward.map(i => `${getItemName(i.itemId)}×${i.quantity}`).join(', ') }}
                </template>
              </p>
            </div>
            <Button
              v-if="!questStore.mainQuest?.accepted"
              class="w-full justify-center"
              :icon="Plus"
              :icon-size="12"
              @click="handleAcceptMain"
            >
              tiếplấybất kỳvụ
            </Button>
            <Button
              v-else
              class="w-full justify-center"
              :class="{
                '!bg-accent !text-bg': questStore.canSubmitMainQuest()
              }"
              :icon="CheckCircle"
              :icon-size="12"
              :disabled="!questStore.canSubmitMainQuest()"
              @click="handleSubmitMain"
            >
              nânggiaobất kỳvụ
            </Button>
          </template>

          <!-- 委托详情 -->
          <template v-if="questModal.type === 'board' && selectedBoardQuest">
            <p class="text-accent text-sm mb-2">Ủy thácchi tiếthình</p>
            <p class="text-xs leading-relaxed mb-2">
              {{ selectedBoardQuest.description }}
            </p>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">Mục tiêu</p>
              <p class="text-xs">
                {{ selectedBoardQuest.targetItemName }} ×
                {{ selectedBoardQuest.targetQuantity }}
              </p>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-3">
              <p class="text-xs text-muted mb-1">Phần thưởng</p>
              <p class="text-xs">{{ selectedBoardQuest.moneyReward }}văn + hảo cảm{{ selectedBoardQuest.friendshipReward }}</p>
            </div>
            <Button
              class="w-full justify-center"
              :icon="Plus"
              :icon-size="12"
              :disabled="questStore.activeQuests.length >= questStore.MAX_ACTIVE_QUESTS"
              @click="handleAccept(selectedBoardQuest.id)"
            >
              tiếplấyủynhờ
            </Button>
          </template>

          <!-- 特殊订单详情 -->
          <template v-if="questModal.type === 'special' && questStore.specialOrder">
            <p class="text-accent text-sm mb-2">
              đặcđặc biệtđặtđơn
              <span v-if="questStore.specialOrder.tierLabel" class="text-[10px] text-muted border border-accent/20 rounded-xs px-1 ml-1">
                {{ questStore.specialOrder.tierLabel }}
              </span>
            </p>
            <p class="text-xs leading-relaxed mb-2">
              {{ questStore.specialOrder.description }}
            </p>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">Mục tiêu</p>
              <p class="text-xs">
                {{ questStore.specialOrder.targetItemName }} ×
                {{ questStore.specialOrder.targetQuantity }}
              </p>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">Có thời hạn</p>
              <p class="text-xs">{{ questStore.specialOrder.daysRemaining }} ngày</p>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-3">
              <p class="text-xs text-muted mb-1">Phần thưởng</p>
              <p class="text-xs">
                {{ questStore.specialOrder.moneyReward }}văn + tốtnhiễm{{ questStore.specialOrder.friendshipReward }}
                <template v-if="questStore.specialOrder.itemReward?.length">
                  +
                  {{ questStore.specialOrder.itemReward.map(i => `${getItemName(i.itemId)}×${i.quantity}`).join(', ') }}
                </template>
              </p>
            </div>
            <Button
              class="w-full justify-center"
              :icon="Plus"
              :icon-size="12"
              :disabled="questStore.activeQuests.length >= questStore.MAX_ACTIVE_QUESTS"
              @click="handleAcceptSpecialOrder"
            >
              tiếplấyđặtđơn
            </Button>
          </template>

          <!-- 进行中任务详情 -->
          <template v-if="questModal.type === 'active' && selectedActiveQuest">
            <p class="text-accent text-sm mb-2">
              {{ selectedActiveQuest.type === 'special_order' ? 'Đơn đặc biệt' : 'Ủy thác' }}
            </p>
            <p class="text-xs leading-relaxed mb-2">
              {{ selectedActiveQuest.description }}
            </p>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">Tiến độ</p>
              <div v-if="selectedActiveQuest.type !== 'delivery'" class="flex items-center space-x-2">
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs bg-accent transition-all"
                    :style="{
                      width: Math.floor((getEffectiveProgress(selectedActiveQuest) / selectedActiveQuest.targetQuantity) * 100) + '%'
                    }"
                  />
                </div>
                <span class="text-xs text-muted">
                  {{ getEffectiveProgress(selectedActiveQuest) }}/{{ selectedActiveQuest.targetQuantity }}
                </span>
              </div>
              <p v-else class="text-xs">
                lưnggóitrong
                {{ inventoryStore.getItemCount(selectedActiveQuest.targetItemId) }}/{{ selectedActiveQuest.targetQuantity }}
              </p>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">còn cònThời gian</p>
              <p class="text-xs">{{ selectedActiveQuest.daysRemaining }} ngày</p>
            </div>
            <div class="border border-accent/10 rounded-xs p-2 mb-3">
              <p class="text-xs text-muted mb-1">Phần thưởng</p>
              <p class="text-xs">
                {{ selectedActiveQuest.moneyReward }}văn
                <template v-if="selectedActiveQuest.itemReward?.length">
                  +
                  {{ selectedActiveQuest.itemReward.map(i => `${getItemName(i.itemId)}×${i.quantity}`).join(', ') }}
                </template>
              </p>
            </div>
            <Button
              class="w-full justify-center"
              :class="{ '!bg-accent !text-bg': canSubmit(selectedActiveQuest) }"
              :icon="CheckCircle"
              :icon-size="12"
              :disabled="!canSubmit(selectedActiveQuest)"
              @click="handleSubmit(selectedActiveQuest.id)"
            >
              nânggiaobất kỳvụ
            </Button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ClipboardList, Calendar, Clock, Plus, CheckCircle, CircleCheck, Circle, Star, BookOpen, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { QuestInstance } from '@/types'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useQuestStore } from '@/stores/useQuestStore'
  import { getItemById, getStoryQuestById, CHAPTER_TITLES } from '@/data'
  import { addLog } from '@/composables/useGameLog'

  const questStore = useQuestStore()
  const inventoryStore = useInventoryStore()

  const getItemName = (id: string): string => {
    return getItemById(id)?.name ?? id
  }

  // === đạncửa sổtrạng tháitrạng thái ===

  type QuestModalState = { type: 'main' } | { type: 'board'; questId: string } | { type: 'special' } | { type: 'active'; questId: string }

  const questModal = ref<QuestModalState | null>(null)

  const selectedBoardQuest = computed(() => {
    const m = questModal.value
    if (!m || m.type !== 'board') return null
    return questStore.boardQuests.find(q => q.id === m.questId) ?? null
  })

  const selectedActiveQuest = computed(() => {
    const m = questModal.value
    if (!m || m.type !== 'active') return null
    return questStore.activeQuests.find(q => q.id === m.questId) ?? null
  })

  // === chínhdâybất kỳvụ ===

  const mainQuestDef = computed(() => {
    if (!questStore.mainQuest) return null
    return getStoryQuestById(questStore.mainQuest.questId) ?? null
  })

  const chapterTitle = computed(() => {
    if (!mainQuestDef.value) return ''
    return CHAPTER_TITLES[mainQuestDef.value.chapter] ?? ''
  })

  const mainQuestProgress = computed(() => {
    return questStore.mainQuest?.objectiveProgress ?? []
  })

  const handleAcceptMain = () => {
    const result = questStore.acceptMainQuest()
    addLog(result.message)
    questModal.value = null
  }

  const handleSubmitMain = () => {
    const result = questStore.submitMainQuest()
    addLog(result.message)
    questModal.value = null
  }

  // === ngàythườngủynhờ ===

  /** không phảitặnghàngloàibất kỳvụ的cóhiệutiếnđộ（lấytheodấusốlượngvàlưnggóisốlượng的so sánhlớngiá trị） */
  const getEffectiveProgress = (quest: QuestInstance): number => {
    return Math.min(Math.max(quest.collectedQuantity, inventoryStore.getItemCount(quest.targetItemId)), quest.targetQuantity)
  }

  const canSubmit = (quest: QuestInstance): boolean => {
    if (quest.type === 'delivery') {
      return inventoryStore.getItemCount(quest.targetItemId) >= quest.targetQuantity
    }
    return getEffectiveProgress(quest) >= quest.targetQuantity
  }

  const handleAccept = (questId: string) => {
    const result = questStore.acceptQuest(questId)
    addLog(result.message)
    questModal.value = null
  }

  const handleAcceptSpecialOrder = () => {
    const result = questStore.acceptSpecialOrder()
    addLog(result.message)
    questModal.value = null
  }

  const handleSubmit = (questId: string) => {
    const result = questStore.submitQuest(questId)
    addLog(result.message)
    questModal.value = null
  }
</script>
