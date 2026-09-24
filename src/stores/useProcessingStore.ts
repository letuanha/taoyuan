import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MachineType, ProcessingSlot, Quality } from '@/types'
import {
  PROCESSING_MACHINES,
  SPRINKLERS,
  FERTILIZERS,
  BAITS,
  TACKLES,
  TAPPER,
  CRAB_POT_CRAFT,
  BOMBS,
  getRecipesForMachine,
  getProcessingRecipeById
} from '@/data/processing'
import { useInventoryStore } from './useInventoryStore'
import { usePlayerStore } from './usePlayerStore'
import { useSkillStore } from './useSkillStore'
import { useBreedingStore } from './useBreedingStore'
import { useWarehouseStore } from './useWarehouseStore'
import { useHiddenNpcStore } from './useHiddenNpcStore'
import { addLog } from '@/composables/useGameLog'
import { hasCombinedItem, removeCombinedItem, getLowestCombinedQuality } from '@/composables/useCombinedInventory'

/** 工坊升级定义 */
const WORKSHOP_UPGRADES = [
  {
    level: 1,
    cost: 10000,
    materials: [
      { itemId: 'iron_bar', quantity: 15 },
      { itemId: 'wood', quantity: 50 }
    ]
  },
  {
    level: 2,
    cost: 25000,
    materials: [
      { itemId: 'gold_bar', quantity: 10 },
      { itemId: 'wood', quantity: 80 }
    ]
  }
]

export const useProcessingStore = defineStore('processing', () => {
  const inventoryStore = useInventoryStore()
  const playerStore = usePlayerStore()
  const skillStore = useSkillStore()

  /** 已放置的加工机器（运行中的槽位） */
  const machines = ref<ProcessingSlot[]>([])

  /** 工坊等级：0/1/2，对应 15/20/25 */
  const workshopLevel = ref(0)

  /** 最大放置机器数 */
  const maxMachines = computed(() => 15 + workshopLevel.value * 5)

  /** 当前放置数量 */
  const machineCount = computed(() => machines.value.length)

  // === 制造(Craft) ===

  /** 检查是否有足够材料制造某样东西 */
  const canCraft = (craftCost: { itemId: string; quantity: number }[], craftMoney: number): boolean => {
    if (playerStore.money < craftMoney) return false
    return craftCost.every(c => hasCombinedItem(c.itemId, c.quantity))
  }

  /** 消耗材料 */
  const consumeCraftMaterials = (craftCost: { itemId: string; quantity: number }[], craftMoney: number): boolean => {
    if (!canCraft(craftCost, craftMoney)) return false
    if (!playerStore.spendMoney(craftMoney)) return false
    for (const c of craftCost) {
      if (!removeCombinedItem(c.itemId, c.quantity)) {
        // 回退（简化处理：理论上不会到这里因为canCraft已检查）
        playerStore.earnMoney(craftMoney)
        return false
      }
    }
    return true
  }

  /** 制造并放置一台加工机器 */
  const craftMachine = (machineType: MachineType): boolean => {
    if (machines.value.length >= maxMachines.value) return false
    const def = PROCESSING_MACHINES.find(m => m.id === machineType)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    machines.value.push({
      machineType,
      recipeId: null,
      inputItemId: null,
      daysProcessed: 0,
      totalDays: 0,
      ready: false
    })
    return true
  }

  /** 制造洒水器（返回物品ID放入背包） */
  const craftSprinkler = (sprinklerId: string): boolean => {
    const def = SPRINKLERS.find(s => s.id === sprinklerId)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    inventoryStore.addItem(def.id)
    return true
  }

  /** 制造肥料 */
  const craftFertilizer = (fertilizerId: string): boolean => {
    const def = FERTILIZERS.find(f => f.id === fertilizerId)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    inventoryStore.addItem(def.id)
    return true
  }

  /** 制造鱼饵 */
  const craftBait = (baitId: string): boolean => {
    const def = BAITS.find(b => b.id === baitId)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    inventoryStore.addItem(def.id)
    return true
  }

  /** 制造浮漂 */
  const craftTackle = (tackleId: string): boolean => {
    const def = TACKLES.find(t => t.id === tackleId)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    inventoryStore.addItem(def.id)
    return true
  }

  /** 制造采脂器 */
  const craftTapper = (): boolean => {
    if (!consumeCraftMaterials(TAPPER.craftCost, TAPPER.craftMoney)) return false
    inventoryStore.addItem(TAPPER.id)
    return true
  }

  /** 制造蟹笼 */
  const craftCrabPot = (): boolean => {
    if (!consumeCraftMaterials(CRAB_POT_CRAFT.craftCost, CRAB_POT_CRAFT.craftMoney)) return false
    inventoryStore.addItem(CRAB_POT_CRAFT.id)
    return true
  }

  /** 制造炸弹 */
  const craftBomb = (bombId: string): boolean => {
    const def = BOMBS.find(b => b.id === bombId)
    if (!def) return false
    if (!consumeCraftMaterials(def.craftCost, def.craftMoney)) return false
    inventoryStore.addItem(def.id)
    return true
  }

  // === 加工操作 ===

  /** 检测背包+仓库中某物品的最低品质（removeItem 默认消耗顺序） */
  const getLowestQuality = (itemId: string): Quality => {
    return getLowestCombinedQuality(itemId)
  }

  /** 向已放置的机器投入原料开始加工。specifiedQuality 可指定消耗的品质 */
  const startProcessing = (slotIndex: number, recipeId: string, specifiedQuality?: Quality): boolean => {
    const slot = machines.value[slotIndex]
    if (!slot || slot.recipeId !== null) return false // 正在加工中
    const recipe = getProcessingRecipeById(recipeId)
    if (!recipe || recipe.machineType !== slot.machineType) return false

    // 消耗输入材料（蜂箱无需输入），记录投入品质
    let quality: Quality = 'normal'
    if (recipe.inputItemId !== null) {
      if (specifiedQuality !== undefined) {
        quality = specifiedQuality
        if (!removeCombinedItem(recipe.inputItemId, recipe.inputQuantity, specifiedQuality)) return false
      } else {
        quality = getLowestQuality(recipe.inputItemId)
        if (!removeCombinedItem(recipe.inputItemId, recipe.inputQuantity)) return false
      }
    }

    slot.recipeId = recipeId
    slot.inputItemId = recipe.inputItemId
    slot.inputQuality = quality
    slot.daysProcessed = 0
    slot.totalDays = recipe.processingDays
    // 仙缘能力：织速（gui_nv_1）织布机加工时间-30%
    if (slot.machineType === 'loom' && useHiddenNpcStore().isAbilityActive('gui_nv_1')) {
      slot.totalDays = Math.max(1, Math.ceil(slot.totalDays * 0.7))
    }
    slot.ready = false
    return true
  }

  /** 收取加工产物 */
  const collectProduct = (slotIndex: number): string | null => {
    const slot = machines.value[slotIndex]
    if (!slot || !slot.ready || !slot.recipeId) return null

    const recipe = getProcessingRecipeById(slot.recipeId)
    if (!recipe) return null

    // 优先放入虚空成品箱，箱子满则回退到背包
    const warehouseStore = useWarehouseStore()
    const voidOutput = warehouseStore.getVoidOutputChest()
    const outputQuality = slot.inputQuality ?? 'normal'
    if (!voidOutput || !warehouseStore.addItemToChest(voidOutput.id, recipe.outputItemId, recipe.outputQuantity, outputQuality)) {
      inventoryStore.addItem(recipe.outputItemId, recipe.outputQuantity, outputQuality)
    }

    // 种子制造机额外触发育种种子生成
    if (slot.machineType === 'seed_maker' && slot.inputItemId) {
      const breedingStore = useBreedingStore()
      const farmingLevel = skillStore.farmingLevel
      if (breedingStore.trySeedMakerGeneticSeed(slot.inputItemId, farmingLevel)) {
        addLog('Máy chế tạo hạt giống tạo thêm một hạt giống lai tạo!')
      }
    }

    // 重置槽位
    slot.recipeId = null
    slot.inputItemId = null
    slot.inputQuality = undefined
    slot.daysProcessed = 0
    slot.totalDays = 0
    slot.ready = false

    return recipe.outputItemId
  }

  /** 拆除机器（退回加工原料 + 已完成产物 + 机器制作材料） */
  const removeMachine = (slotIndex: number): boolean => {
    const slot = machines.value[slotIndex]
    if (!slot) return false

    // 如果已完成：先收取产物
    if (slot.recipeId && slot.ready) {
      const recipe = getProcessingRecipeById(slot.recipeId)
      if (recipe) {
        const warehouseStore = useWarehouseStore()
        const voidOutput = warehouseStore.getVoidOutputChest()
        const outputQuality = slot.inputQuality ?? 'normal'
        if (!voidOutput || !warehouseStore.addItemToChest(voidOutput.id, recipe.outputItemId, recipe.outputQuantity, outputQuality)) {
          inventoryStore.addItem(recipe.outputItemId, recipe.outputQuantity, outputQuality)
        }
      }
    }
    // 如果正在加工：退回原料
    else if (slot.recipeId && !slot.ready && slot.inputItemId) {
      const recipe = getProcessingRecipeById(slot.recipeId)
      if (recipe && recipe.inputItemId) {
        inventoryStore.addItem(recipe.inputItemId, recipe.inputQuantity, slot.inputQuality ?? 'normal')
      }
    }

    // 退还机器制作材料
    const machineDef = PROCESSING_MACHINES.find(m => m.id === slot.machineType)
    if (machineDef) {
      for (const mat of machineDef.craftCost) {
        inventoryStore.addItem(mat.itemId, mat.quantity)
      }
      playerStore.earnMoney(machineDef.craftMoney)
    }

    machines.value.splice(slotIndex, 1)
    return true
  }

  /** 取消加工（退回原料，机器回到空闲状态） */
  const cancelProcessing = (slotIndex: number): boolean => {
    const slot = machines.value[slotIndex]
    if (!slot || !slot.recipeId) return false
    // 如果正在加工且有原料投入，退回原料
    if (!slot.ready && slot.inputItemId) {
      const recipe = getProcessingRecipeById(slot.recipeId)
      if (recipe && recipe.inputItemId) {
        inventoryStore.addItem(recipe.inputItemId, recipe.inputQuantity, slot.inputQuality ?? 'normal')
      }
    }
    // 重置为空闲
    slot.recipeId = null
    slot.inputItemId = null
    slot.inputQuality = undefined
    slot.daysProcessed = 0
    slot.totalDays = 0
    slot.ready = false
    return true
  }

  /** 获取某台机器可用的加工配方列表 */
  const getAvailableRecipes = (machineType: MachineType) => {
    return getRecipesForMachine(machineType)
  }

  // === 加工站（同类设备并行槽位）===

  /** 加工站统计：把同类设备视作一个拥有 N 个并行槽位的工站 */
  interface StationStats {
    /** 槽位总数 */
    total: number
    /** 空闲槽位数 */
    idle: number
    /** 运行中槽位数 */
    running: number
    /** 可收取槽位数 */
    ready: number
  }

  /** 统计某类设备的槽位占用情况 */
  const getStationStats = (machineType: MachineType): StationStats => {
    let total = 0
    let idle = 0
    let running = 0
    let ready = 0
    for (const slot of machines.value) {
      if (slot.machineType !== machineType) continue
      total++
      if (!slot.recipeId) idle++
      else if (slot.ready) ready++
      else running++
    }
    return { total, idle, running, ready }
  }

  /** 取得某类设备的槽位在 machines 中的下标（按原始顺序） */
  const getStationSlotIndexes = (machineType: MachineType): number[] => {
    const result: number[] = []
    for (let i = 0; i < machines.value.length; i++) {
      if (machines.value[i]!.machineType === machineType) result.push(i)
    }
    return result
  }

  /**
   * 批量投料：把同一配方分配到该加工站的空闲槽位上。
   * 逐个尝试，材料不足时自动停止，返回实际开工的槽位数。
   */
  const startProcessingBatch = (machineType: MachineType, recipeId: string, count: number, specifiedQuality?: Quality): number => {
    if (count <= 0) return 0
    let started = 0
    for (const index of getStationSlotIndexes(machineType)) {
      if (started >= count) break
      if (machines.value[index]!.recipeId !== null) continue
      if (!startProcessing(index, recipeId, specifiedQuality)) break
      started++
    }
    return started
  }

  /** 收取某加工站（省略则全部工站）已完成的产物，返回收取数量 */
  const collectAllReady = (machineType?: MachineType): number => {
    let collected = 0
    for (let i = 0; i < machines.value.length; i++) {
      const slot = machines.value[i]!
      if (machineType && slot.machineType !== machineType) continue
      if (!slot.ready) continue
      if (collectProduct(i)) collected++
    }
    return collected
  }

  /** 取消某加工站全部进行中的加工，返回取消数量 */
  const cancelAllProcessing = (machineType: MachineType): number => {
    let cancelled = 0
    for (const index of getStationSlotIndexes(machineType)) {
      const slot = machines.value[index]!
      if (!slot.recipeId || slot.ready) continue
      if (cancelProcessing(index)) cancelled++
    }
    return cancelled
  }

  /** 拆除该加工站的一个槽位：优先拆空闲槽位，避免误毁进行中的加工 */
  const removeOneFromStation = (machineType: MachineType): boolean => {
    const indexes = getStationSlotIndexes(machineType)
    if (indexes.length === 0) return false
    const idleIndex = indexes.find(i => machines.value[i]!.recipeId === null)
    return removeMachine(idleIndex ?? indexes[indexes.length - 1]!)
  }

  // === 排序与命名 ===

  /**
   * 加工站自定义名称。
   * 设备多了以后「酒坊」「酒坊」「酒坊」很难区分各自在干什么，允许起个诸如「果酒专用」的名字。
   */
  const stationNames = ref<Record<string, string>>({})

  /** 加工站显示顺序（存放 machineType，未列出的按默认顺序排在后面） */
  const stationOrder = ref<MachineType[]>([])

  /** 取加工站显示名（未命名则用设备原名） */
  const getStationName = (machineType: MachineType, defaultName: string): string => {
    return stationNames.value[machineType] || defaultName
  }

  /** 重命名加工站；传空字符串恢复默认名 */
  const renameStation = (machineType: MachineType, name: string) => {
    const trimmed = name.trim()
    if (trimmed) stationNames.value[machineType] = trimmed
    else delete stationNames.value[machineType]
  }

  /** 在显示顺序中把某个加工站上移/下移 */
  const moveStation = (machineType: MachineType, direction: -1 | 1, allTypes: MachineType[]) => {
    // 以当前完整列表为基准补全顺序表，避免新造的设备无法参与排序
    const order = allTypes.slice()
    const from = order.indexOf(machineType)
    const to = from + direction
    if (from < 0 || to < 0 || to >= order.length) return
    ;[order[from], order[to]] = [order[to]!, order[from]!]
    stationOrder.value = order
  }

  /** 按自定义顺序排序加工站类型 */
  const sortStationTypes = (types: MachineType[]): MachineType[] => {
    if (stationOrder.value.length === 0) return types
    const rank = new Map(stationOrder.value.map((t, i) => [t, i]))
    return types.slice().sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999))
  }

  // === 每日更新 ===

  const dailyUpdate = () => {
    const collected: string[] = []
    const readyNames: string[] = []
    const warehouseStore = useWarehouseStore()
    const voidOutput = warehouseStore.getVoidOutputChest()
    for (const slot of machines.value) {
      if (!slot.recipeId || slot.ready) continue
      slot.daysProcessed++
      if (slot.daysProcessed >= slot.totalDays) {
        const recipe = getProcessingRecipeById(slot.recipeId)
        if (recipe) {
          // 仙缘能力：梦织（gui_nv_2）织布机8%概率额外产出梦丝
          if (slot.machineType === 'loom' && useHiddenNpcStore().isAbilityActive('gui_nv_2') && Math.random() < 0.08) {
            inventoryStore.addItem('dream_silk', 1)
            collected.push('Mộng ty')
          }
          const machineDef = PROCESSING_MACHINES.find(m => m.id === slot.machineType)
          if (recipe.inputItemId === null || machineDef?.autoCollect) {
            // 自动收取：无需原料的机器（蜂箱/蚯蚓箱）或标记了 autoCollect 的机器（熔炉）
            const outputQuality = slot.inputQuality ?? 'normal'
            if (!voidOutput || !warehouseStore.addItemToChest(voidOutput.id, recipe.outputItemId, recipe.outputQuantity, outputQuality)) {
              inventoryStore.addItem(recipe.outputItemId, recipe.outputQuantity, outputQuality)
            }
            collected.push(recipe.name)
            // 无需原料的机器自动重启，有原料的机器回到空闲
            if (recipe.inputItemId === null) {
              slot.daysProcessed = 0
              slot.inputQuality = undefined
              slot.ready = false
            } else {
              slot.recipeId = null
              slot.inputItemId = null
              slot.inputQuality = undefined
              slot.daysProcessed = 0
              slot.totalDays = 0
              slot.ready = false
            }
          } else {
            // 需要原料的机器：检查虚空原料箱是否可自动续产
            const voidInput = warehouseStore.getVoidInputChest()
            if (voidInput && recipe.inputItemId) {
              // 自动收取当前产物
              const outputQuality = slot.inputQuality ?? 'normal'
              if (!voidOutput || !warehouseStore.addItemToChest(voidOutput.id, recipe.outputItemId, recipe.outputQuantity, outputQuality)) {
                inventoryStore.addItem(recipe.outputItemId, recipe.outputQuantity, outputQuality)
              }
              collected.push(recipe.name)

              // 种子制造机额外触发育种种子生成
              if (slot.machineType === 'seed_maker' && slot.inputItemId) {
                const breedingStore = useBreedingStore()
                const farmingLevel = skillStore.farmingLevel
                if (breedingStore.trySeedMakerGeneticSeed(slot.inputItemId, farmingLevel)) {
                  addLog('Máy chế tạo hạt giống tạo thêm một hạt giống lai tạo!')
                }
              }

              // 尝试从虚空原料箱取材料开始下一轮
              const available = warehouseStore.getChestItemCount(voidInput.id, recipe.inputItemId)
              if (available >= recipe.inputQuantity) {
                // 查找最低品质
                const qOrder: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
                const newQuality = qOrder.find(q => warehouseStore.getChestItemCount(voidInput.id, recipe.inputItemId!, q) > 0) ?? 'normal'
                warehouseStore.removeItemFromChest(voidInput.id, recipe.inputItemId, recipe.inputQuantity, newQuality)
                slot.daysProcessed = 0
                slot.inputQuality = newQuality
                slot.ready = false
              } else {
                // 虚空箱无足够原料，回到空闲
                slot.recipeId = null
                slot.inputItemId = null
                slot.inputQuality = undefined
                slot.daysProcessed = 0
                slot.totalDays = 0
                slot.ready = false
              }
            } else {
              // 无虚空原料箱，保持原行为：标记为完成等待手动收取
              slot.ready = true
              readyNames.push(recipe.name)
            }
          }
        } else {
          slot.ready = true
        }
      }
    }
    if (collected.length > 0) {
      const counts = new Map<string, number>()
      for (const name of collected) {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      }
      const summary = Array.from(counts.entries())
        .map(([name, count]) => (count > 1 ? `${name}x${count}` : name))
        .join('、')
      addLog(`工坊自动收取了：${summary}。`)
    }
    if (readyNames.length > 0) {
      const counts = new Map<string, number>()
      for (const name of readyNames) {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      }
      const summary = Array.from(counts.entries())
        .map(([name, count]) => (count > 1 ? `${name}x${count}` : name))
        .join('、')
      addLog(`加工完成：${summary}，去工坊收取吧。`)
    }
  }

  // === 工坊升级 ===

  /** 升级工坊（扩展机器上限） */
  const upgradeWorkshop = (): { success: boolean; message: string } => {
    const next = workshopLevel.value + 1
    const upgrade = WORKSHOP_UPGRADES.find(u => u.level === next)
    if (!upgrade) return { success: false, message: '工坊已达到最高等级。' }
    if (!consumeCraftMaterials(upgrade.materials, upgrade.cost)) return { success: false, message: 'Không đủ nguyên liệu hoặc tiền.' }
    workshopLevel.value = next
    return {
      success: true,
      message: `工坊扩建完成！机器上限提升至${maxMachines.value}台。`
    }
  }

  /** 获取下一级升级信息 */
  const getNextUpgrade = () => {
    const next = workshopLevel.value + 1
    return WORKSHOP_UPGRADES.find(u => u.level === next) ?? null
  }

  /** 工坊分组折叠状态（参与存档） */
  const collapsedGroups = ref(new Set<MachineType>())

  /**
   * 加工区视图模式（参与存档）。
   * station：同类设备合并成一座加工站，统一投料；
   * individual：每台设备各自一块面板，逐台操作。
   */
  const viewMode = ref<'station' | 'individual'>('station')

  const toggleGroup = (type: MachineType) => {
    if (collapsedGroups.value.has(type)) {
      collapsedGroups.value.delete(type)
    } else {
      collapsedGroups.value.add(type)
    }
  }

  // === 序列化 ===

  const serialize = () => {
    return {
      machines: machines.value,
      workshopLevel: workshopLevel.value,
      collapsedGroups: [...collapsedGroups.value],
      viewMode: viewMode.value,
      stationNames: stationNames.value,
      stationOrder: stationOrder.value
    }
  }

  const deserialize = (data: ReturnType<typeof serialize>) => {
    machines.value = data.machines ?? []
    workshopLevel.value = (data as any).workshopLevel ?? 0
    collapsedGroups.value = new Set((data as any).collapsedGroups ?? [])
    viewMode.value = (data as any).viewMode ?? 'station'
    stationNames.value = (data as any).stationNames ?? {}
    stationOrder.value = (data as any).stationOrder ?? []
  }

  return {
    machines,
    machineCount,
    maxMachines,
    workshopLevel,
    canCraft,
    consumeCraftMaterials,
    craftMachine,
    craftSprinkler,
    craftFertilizer,
    craftBait,
    craftTackle,
    craftTapper,
    craftCrabPot,
    craftBomb,
    startProcessing,
    collectProduct,
    cancelProcessing,
    removeMachine,
    getAvailableRecipes,
    getStationStats,
    getStationSlotIndexes,
    startProcessingBatch,
    collectAllReady,
    cancelAllProcessing,
    removeOneFromStation,
    dailyUpdate,
    upgradeWorkshop,
    getNextUpgrade,
    WORKSHOP_UPGRADES,
    collapsedGroups,
    viewMode,
    stationNames,
    stationOrder,
    getStationName,
    renameStation,
    moveStation,
    sortStationTypes,
    toggleGroup,
    serialize,
    deserialize
  }
})
