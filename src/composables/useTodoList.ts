import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useFishPondStore } from '@/stores/useFishPondStore'
import { useBreedingStore } from '@/stores/useBreedingStore'
import { NPCS, getNpcById } from '@/data/npcs'
import { getProcessingRecipeById, PROCESSING_MACHINES } from '@/data/processing'
import { getStoryQuestById } from '@/data/storyQuests'
import type { PanelKey } from './useNavigation'

/** 待办分类 */
export type TodoCategory = 'farm' | 'animal' | 'processing' | 'social' | 'quest' | 'craft'

/** 紧要程度：urgent 会高亮，info 只是提示 */
export type TodoUrgency = 'urgent' | 'normal' | 'info'

export interface TodoItem {
  id: string
  category: TodoCategory
  /** 一句话说明要做什么 */
  text: string
  /** 附加说明（数量、剩余天数等） */
  detail?: string
  urgency: TodoUrgency
  /** 点击后跳转的面板 */
  panel?: PanelKey
}

export const TODO_CATEGORY_NAMES: Record<TodoCategory, string> = {
  farm: 'Nông vụ',
  animal: 'Mục trường',
  processing: 'Chế biến',
  social: 'Nhân tình',
  quest: 'Nhiệm vụ',
  craft: 'Xưởng'
}

/**
 * 待办事项。
 *
 * 桃源乡的日常摊子铺得很开——地要浇、牲口要喂、加工品要收、谁过生日、委托快到期。
 * 这些信息原先散落在七八个面板里，玩家只能靠记。这里把它们汇总成一份「今天该做什么」。
 */
export const useTodoList = () => {
  const gameStore = useGameStore()

  const todos = computed((): TodoItem[] => {
    const list: TodoItem[] = []
    const farmStore = useFarmStore()
    const animalStore = useAnimalStore()
    const processingStore = useProcessingStore()
    const npcStore = useNpcStore()
    const questStore = useQuestStore()
    const inventoryStore = useInventoryStore()
    const fishPondStore = useFishPondStore()
    const breedingStore = useBreedingStore()

    // --- 农事 ---
    const unwatered = farmStore.plots.filter(p => (p.state === 'planted' || p.state === 'growing') && !p.watered).length
    if (unwatered > 0 && !gameStore.isRainy) {
      list.push({
        id: 'farm-water',
        category: 'farm',
        text: 'Có cây chưa được tưới',
        detail: `${unwatered} ô`,
        urgency: 'urgent',
        panel: 'farm'
      })
    }

    const harvestable = farmStore.plots.filter(p => p.state === 'harvestable').length
    if (harvestable > 0) {
      list.push({
        id: 'farm-harvest',
        category: 'farm',
        text: 'Có cây có thể thu hoạch',
        detail: `${harvestable} ô`,
        urgency: 'normal',
        panel: 'farm'
      })
    }

    const troubled = farmStore.plots.filter(p => p.infested || p.weedy).length
    if (troubled > 0) {
      list.push({
        id: 'farm-pest',
        category: 'farm',
        text: 'Ruộng có cỏ dại hoặc sâu bệnh',
        detail: `${troubled} chỗ`,
        urgency: 'normal',
        panel: 'farm'
      })
    }

    // 换季前提醒：第28天睡前会换季，跨季作物会枯死
    if (gameStore.day === 28) {
      const planted = farmStore.plots.filter(p => p.state === 'planted' || p.state === 'growing').length
      if (planted > 0) {
        list.push({
          id: 'farm-season',
          category: 'farm',
          text: 'Ngày mai đổi mùa, cây không hợp mùa sẽ héo',
          detail: `${planted} cây đang sinh trưởng`,
          urgency: 'urgent',
          panel: 'farm'
        })
      }
    }

    // --- 牧场 ---
    const unfed = animalStore.animals.filter(a => !a.wasFed).length
    if (unfed > 0) {
      list.push({
        id: 'animal-feed',
        category: 'animal',
        text: 'Gia súc chưa được cho ăn',
        detail: `${unfed} con`,
        urgency: 'urgent',
        panel: 'animal'
      })
    }

    const unpetted = animalStore.animals.filter(a => !a.wasPetted).length
    if (unpetted > 0) {
      list.push({
        id: 'animal-pet',
        category: 'animal',
        text: 'Còn gia súc chưa được vuốt ve (ảnh hưởng tâm trạng và sản lượng)',
        detail: `${unpetted} con`,
        urgency: 'normal',
        panel: 'animal'
      })
    }

    if (fishPondStore.pond.built && !fishPondStore.pond.fedToday) {
      list.push({
        id: 'pond-feed',
        category: 'animal',
        text: 'Ao cá chưa được cho ăn',
        urgency: 'normal',
        panel: 'fishpond'
      })
    }

    // --- 加工 ---
    const readyCount = processingStore.machines.filter(m => m.ready).length
    if (readyCount > 0) {
      list.push({
        id: 'processing-collect',
        category: 'processing',
        text: 'Xưởng chế biến có thành phẩm để thu',
        detail: `${readyCount} phần`,
        urgency: 'normal',
        panel: 'workshop'
      })
    }

    const idleCount = processingStore.machines.filter(m => !m.recipeId).length
    if (idleCount > 0) {
      list.push({
        id: 'processing-idle',
        category: 'processing',
        text: 'Trạm chế biến có ô trống chưa hoạt động',
        detail: `${idleCount} ô`,
        urgency: 'info',
        panel: 'workshop'
      })
    }

    // 明天就能收的加工品，提前打个招呼
    const tomorrowReady = processingStore.machines.filter(m => m.recipeId && !m.ready && m.totalDays - m.daysProcessed === 1)
    if (tomorrowReady.length > 0) {
      const names = [...new Set(tomorrowReady.map(m => getProcessingRecipeById(m.recipeId!)?.name ?? ''))].filter(Boolean)
      list.push({
        id: 'processing-tomorrow',
        category: 'processing',
        text: 'Ngày mai có thể thu:' + names.slice(0, 3).join('、'),
        detail: `${tomorrowReady.length} phần`,
        urgency: 'info',
        panel: 'workshop'
      })
    }

    // 育种台
    const breedingReady = breedingStore.stations.filter(s => s.ready).length
    if (breedingReady > 0) {
      list.push({
        id: 'breeding-ready',
        category: 'processing',
        text: 'Bàn lai tạo có thành quả để lấy',
        detail: `${breedingReady} cái`,
        urgency: 'normal',
        panel: 'breeding'
      })
    }

    // --- 工坊 ---
    if (inventoryStore.pendingUpgrade) {
      const remain = inventoryStore.pendingUpgrade.daysRemaining
      list.push({
        id: 'craft-tool',
        category: 'craft',
        text: remain <= 0 ? 'Công cụ đã nâng cấp có thể lấy về' : 'Công cụ đang được nâng cấp',
        detail: remain <= 0 ? 'Đã hoàn thành' : `Còn ${remain} ngày`,
        urgency: remain <= 0 ? 'normal' : 'info',
        panel: 'upgrade'
      })
    }

    // --- 人情 ---
    // 今天过生日的村民
    for (const npc of NPCS) {
      if (!npcStore.isBirthday(npc.id)) continue
      const state = npcStore.getNpcState(npc.id)
      list.push({
        id: `birthday-${npc.id}`,
        category: 'social',
        text: `Hôm nay là sinh nhật ${npc.name}`,
        detail: state?.birthdayGiftGiven ? 'Đã tặng quà sinh nhật' : 'Có thể tặng thêm một quà sinh nhật ×4',
        urgency: state?.birthdayGiftGiven ? 'info' : 'urgent',
        panel: 'village'
      })
    }

    // 未来三天内的生日，提前备礼
    const upcoming = getUpcomingBirthdays(gameStore.season, gameStore.day, 3)
    for (const b of upcoming) {
      list.push({
        id: `birthday-soon-${b.npcId}`,
        category: 'social',
        text: `Sinh nhật ${b.name} sắp tới`,
        detail: `Còn ${b.daysLeft} ngày`,
        urgency: 'info',
        panel: 'village'
      })
    }

    // 今天还没说过话的村民（只提示在场的，避免刷屏）
    const notTalked = npcStore.npcStates.filter(s => !s.talkedToday).length
    if (notTalked > 0) {
      list.push({
        id: 'social-talk',
        category: 'social',
        text: 'Còn dân làng hôm nay chưa chào hỏi',
        detail: `${notTalked} người`,
        urgency: 'info',
        panel: 'village'
      })
    }

    // 配偶与子女
    const spouse = npcStore.getSpouse()
    if (spouse && !spouse.talkedToday) {
      const name = getNpcById(spouse.npcId)?.name ?? 'Bạn đời'
      list.push({
        id: 'social-spouse',
        category: 'social',
        text: `Chưa nói chuyện với ${name}`,
        urgency: 'normal',
        panel: 'cottage'
      })
    }
    const childrenToVisit = npcStore.children.filter(c => !c.interactedToday).length
    if (childrenToVisit > 0) {
      list.push({
        id: 'social-child',
        category: 'social',
        text: 'Con vẫn đang chờ bạn chơi cùng một lát',
        detail: `${childrenToVisit} bé`,
        urgency: 'normal',
        panel: 'cottage'
      })
    }

    // --- 任务 ---
    for (const quest of questStore.activeQuests) {
      const done = Math.max(quest.collectedQuantity, inventoryStore.getItemCount(quest.targetItemId)) >= quest.targetQuantity
      list.push({
        id: `quest-${quest.id}`,
        category: 'quest',
        text: done ? `Có thể giao: ủy thác của ${quest.npcName}` : `Ủy thác đang thực hiện: ${quest.targetItemName}`,
        detail: done
          ? `Còn ${quest.daysRemaining} ngày đến hạn`
          : `${quest.collectedQuantity}/${quest.targetQuantity} · còn ${quest.daysRemaining} ngày`,
        urgency: done ? 'normal' : quest.daysRemaining <= 1 ? 'urgent' : 'info',
        panel: 'quest'
      })
    }

    if (questStore.mainQuest?.accepted && questStore.canSubmitMainQuest()) {
      const def = getStoryQuestById(questStore.mainQuest.questId)
      list.push({
        id: 'quest-main',
        category: 'quest',
        text: `Nhiệm vụ chính có thể giao: ${def?.title ?? ''}`,
        urgency: 'normal',
        panel: 'quest'
      })
    } else if (questStore.mainQuest && !questStore.mainQuest.accepted) {
      const def = getStoryQuestById(questStore.mainQuest.questId)
      list.push({
        id: 'quest-main-accept',
        category: 'quest',
        text: `Có nhiệm vụ chính mới có thể nhận: ${def?.title ?? ''}`,
        urgency: 'info',
        panel: 'quest'
      })
    }

    return list
  })

  /** 需要立刻处理的条目数，用于导航角标 */
  const urgentCount = computed(() => todos.value.filter(t => t.urgency === 'urgent').length)

  /** 全部待办条目数（不含纯提示） */
  const actionableCount = computed(() => todos.value.filter(t => t.urgency !== 'info').length)

  /** 按分类分组 */
  const groupedTodos = computed(() => {
    const groups = new Map<TodoCategory, TodoItem[]>()
    for (const todo of todos.value) {
      const list = groups.get(todo.category) ?? []
      list.push(todo)
      groups.set(todo.category, list)
    }
    return [...groups.entries()].map(([category, items]) => ({
      category,
      name: TODO_CATEGORY_NAMES[category],
      items
    }))
  })

  return { todos, groupedTodos, urgentCount, actionableCount }
}

/** 找出未来 N 天内过生日的村民 */
const getUpcomingBirthdays = (season: string, day: number, withinDays: number): { npcId: string; name: string; daysLeft: number }[] => {
  const result: { npcId: string; name: string; daysLeft: number }[] = []
  for (const npc of NPCS) {
    if (!npc.birthday || npc.birthday.season !== season) continue
    const daysLeft = npc.birthday.day - day
    if (daysLeft > 0 && daysLeft <= withinDays) {
      result.push({ npcId: npc.id, name: npc.name, daysLeft })
    }
  }
  return result.sort((a, b) => a.daysLeft - b.daysLeft)
}

/** 机器类型名（供界面展示用） */
export const getMachineName = (type: string): string => {
  return PROCESSING_MACHINES.find(m => m.id === type)?.name ?? type
}
