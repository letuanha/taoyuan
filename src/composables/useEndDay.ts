import { ref } from 'vue'
import { useGameStore, SEASON_NAMES, WEATHER_NAMES } from '@/stores/useGameStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useFarmStore } from '@/stores/useFarmStore'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useSaveStore } from '@/stores/useSaveStore'
import { useSkillStore } from '@/stores/useSkillStore'
import { useNpcStore } from '@/stores/useNpcStore'
import { useCookingStore } from '@/stores/useCookingStore'
import { useProcessingStore } from '@/stores/useProcessingStore'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useHomeStore } from '@/stores/useHomeStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useShopStore } from '@/stores/useShopStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { useFishingStore } from '@/stores/useFishingStore'
import { useBreedingStore } from '@/stores/useBreedingStore'
import { useHanhaiStore } from '@/stores/useHanhaiStore'
import { useFishPondStore } from '@/stores/useFishPondStore'
import { useTutorialStore } from '@/stores/useTutorialStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'
import { useMiningStore } from '@/stores/useMiningStore'
import { getItemById, getTodayEvent, getNpcById, getCropById, getForageItems } from '@/data'
import { getFertilizerById } from '@/data/processing'
import { FISH } from '@/data/fish'
import { RECIPES } from '@/data/recipes'
import { CAVE_UNLOCK_EARNINGS } from '@/data/buildings'
import { TOOL_NAMES, TIER_NAMES } from '@/data/upgrades'
import { addLog, showFloat } from './useGameLog'
import { getDailyMarketInfo, MARKET_CATEGORY_NAMES } from '@/data/market'
import { showEvent, showFestival, triggerWeddingEvent, triggerPetAdoption, showFarmEvent, showDiscoveryScene } from './useDialogs'
import { sfxSleep, useAudio } from './useAudio'
import { MORNING_NARRATIONS, NARRATIONS_NO_LOSS, MORNING_CHOICE_EVENTS, MORNING_EASTER_EGGS } from '@/data/farmEvents'
import { MORNING_TIPS } from '@/data/tutorials'
import type { MorningEffect } from '@/data/farmEvents'
import router from '@/router'

const NPC_NAME_MAP: Record<string, string> = {
  chen_bo: 'Bác Trần',
  liu_niang: 'Liễu Nương',
  a_shi: 'A Thạch',
  qiu_yue: 'Thu Nguyệt',
  lin_lao: 'Lâm Lão',
  xiao_man: 'Tiểu Mãn',
  chun_lan: 'Xuân Lan',
  xue_qin: 'Tuyết Cần',
  su_su: 'Tố Tố',
  hong_dou: 'Hồng Đậu',
  dan_qing: 'Đan Thanh',
  a_tie: 'A Thiết',
  yun_fei: 'Vân Phi',
  da_niu: 'Đại Ngưu',
  mo_bai: 'Mặc Bạch',
  wang_dashen: 'Thím Vương',
  zhao_mujiang: 'Triệu thợ mộc',
  sun_tiejiang: 'Thợ rèn Tôn',
  zhang_popo: 'Bà cụ Trương',
  li_yu: 'Lão ngư họ Lý',
  zhou_xiucai: 'Chu tú tài',
  wu_shen: 'Thím Ngô',
  ma_liu: 'Mã Lục',
  lao_song: 'Lão Tống',
  pang_shen: 'Thím Mập',
  a_hua: 'A Hoa',
  shi_tou: 'Thạch Đầu',
  hui_niang: 'Huệ Nương',
  lao_lu: 'Lão Lục',
  liu_cunzhang: 'Trưởng thôn Liễu',
  qian_niang: 'Tiền Nương',
  he_zhanggui: 'Chưởng quầy Hà',
  qin_dashu: 'Chú Tần',
  a_fu: 'A Phúc'
}

const getNpcName = (npcId: string): string => {
  return NPC_NAME_MAP[npcId] ?? npcId
}

/** NPC 好感度 → 食谱解锁映射（多层级） */
const NPC_RECIPE_MAP: {
  npcId: string
  level: 'acquaintance' | 'friendly' | 'bestFriend'
  recipeId: string
}[] = [
  // 相识
  { npcId: 'chen_bo', level: 'acquaintance', recipeId: 'radish_soup' },
  { npcId: 'qiu_yue', level: 'acquaintance', recipeId: 'braised_carp' },
  { npcId: 'lin_lao', level: 'acquaintance', recipeId: 'herbal_porridge' },
  { npcId: 'liu_niang', level: 'acquaintance', recipeId: 'osmanthus_cake' },
  { npcId: 'a_shi', level: 'acquaintance', recipeId: 'miner_lunch' },
  { npcId: 'xiao_man', level: 'acquaintance', recipeId: 'sweet_osmanthus_tea' },
  // 相知
  { npcId: 'chen_bo', level: 'friendly', recipeId: 'aged_radish_stew' },
  { npcId: 'qiu_yue', level: 'friendly', recipeId: 'maple_grilled_fish' },
  { npcId: 'lin_lao', level: 'friendly', recipeId: 'herbal_pill' },
  { npcId: 'liu_niang', level: 'friendly', recipeId: 'embroidered_cake' },
  { npcId: 'a_shi', level: 'friendly', recipeId: 'deep_mine_stew' },
  { npcId: 'xiao_man', level: 'friendly', recipeId: 'wild_berry_jam' },
  // 挚友
  { npcId: 'chen_bo', level: 'bestFriend', recipeId: 'farmers_feast' },
  { npcId: 'qiu_yue', level: 'bestFriend', recipeId: 'autumn_moon_feast' },
  { npcId: 'lin_lao', level: 'bestFriend', recipeId: 'longevity_soup' },
  { npcId: 'liu_niang', level: 'bestFriend', recipeId: 'lovers_pastry' },
  { npcId: 'a_shi', level: 'bestFriend', recipeId: 'forgemasters_meal' },
  { npcId: 'xiao_man', level: 'bestFriend', recipeId: 'spirit_fruit_wine' },
  // 新增：动物产品相关食谱
  { npcId: 'da_niu', level: 'friendly', recipeId: 'goat_milk_soup' },
  { npcId: 'da_niu', level: 'bestFriend', recipeId: 'truffle_fried_rice' },
  { npcId: 'lin_lao', level: 'bestFriend', recipeId: 'antler_soup' },
  { npcId: 'chen_bo', level: 'bestFriend', recipeId: 'camel_milk_tea' }
]

/** 结婚食谱映射 */
const MARRIAGE_RECIPE_MAP: Record<string, string> = {
  liu_niang: 'phoenix_cake',
  a_shi: 'molten_hotpot',
  qiu_yue: 'moonlight_sashimi',
  chun_lan: 'tea_banquet',
  xue_qin: 'snow_plum_soup',
  su_su: 'silk_dumpling',
  hong_dou: 'drunken_chicken',
  dan_qing: 'scholars_porridge',
  a_tie: 'ironforge_stew',
  yun_fei: 'hunters_roast',
  da_niu: 'ranch_milk_soup',
  mo_bai: 'moonlit_tea_rice'
}

/** 节日食谱映射 */
const FESTIVAL_RECIPE_MAP: Record<string, string> = {
  spring_festival: 'spring_roll',
  summer_lantern: 'lotus_lantern_cake',
  autumn_harvest: 'harvest_feast',
  winter_new_year: 'new_year_dumpling',
  yuan_ri: 'nian_gao',
  hua_chao: 'hua_gao',
  shang_si: 'qing_tuan',
  zhong_qiu: 'yue_bing',
  la_ba: 'la_ba_zhou',
  duan_wu: 'dragon_boat_zongzi',
  qi_xi: 'qiao_guo',
  chong_yang: 'chrysanthemum_wine',
  dong_zhi: 'jiaozi',
  nian_mo: 'tangyuan',
  dou_cha: 'dou_cha_yin',
  qiu_yuan: 'zhi_yuan_gao'
}

/** 好感度等级层级顺序 */
const LEVEL_ORDER = ['stranger', 'acquaintance', 'friendly', 'bestFriend'] as const

/** 检查好感度是否达到指定等级 */
const meetsLevel = (current: string, required: 'acquaintance' | 'friendly' | 'bestFriend'): boolean => {
  return LEVEL_ORDER.indexOf(current as (typeof LEVEL_ORDER)[number]) >= LEVEL_ORDER.indexOf(required)
}

/** 传说鱼ID列表 */
const LEGENDARY_FISH_IDS = ['dragonfish', 'golden_turtle', 'river_dragon', 'abyss_leviathan', 'jade_dragon']

/** 检查 NPC 友好度、技能等级、结婚解锁食谱 */
const checkRecipeUnlocks = () => {
  const npcStore = useNpcStore()
  const cookingStore = useCookingStore()
  const skillStore = useSkillStore()

  // NPC 多层级好感食谱
  for (const entry of NPC_RECIPE_MAP) {
    const level = npcStore.getFriendshipLevel(entry.npcId)
    if (meetsLevel(level, entry.level)) {
      if (cookingStore.unlockRecipe(entry.recipeId)) {
        const levelName = entry.level === 'acquaintance' ? 'Làm quen' : entry.level === 'friendly' ? 'Tri kỷ' : 'Bạn thân'
        addLog(`${getNpcName(entry.npcId)} (${levelName}) gửi đến một công thức mới!`)
      }
    }
  }

  // 结婚食谱
  const spouse = npcStore.getSpouse()
  if (spouse) {
    const marriageRecipe = MARRIAGE_RECIPE_MAP[spouse.npcId]
    if (marriageRecipe) {
      if (cookingStore.unlockRecipe(marriageRecipe)) {
        const spouseName = getNpcName(spouse.npcId)
        addLog(`${spouseName} đã dạy bạn một bí quyết nấu ăn mới!`)
      }
    }
    // 通用结婚食谱：孔雀宴
    if (cookingStore.unlockRecipe('peacock_feast')) {
      addLog(`Cuộc sống sau hôn nhân đã mở khóa công thức mới: Tiệc công!`)
    }
  }

  // 技能食谱
  for (const recipe of RECIPES) {
    if (recipe.requiredSkill) {
      const skill = skillStore.getSkill(recipe.requiredSkill.type)
      if (skill.level >= recipe.requiredSkill.level) {
        if (cookingStore.unlockRecipe(recipe.id)) {
          addLog(`Tăng kỹ năng đã mở khóa công thức mới: ${recipe.name}!`)
        }
      }
    }
  }

  // 物品获取解锁食谱（瀚海）
  const inventoryStore = useInventoryStore()
  const ITEM_RECIPE_MAP: { itemId: string; recipeId: string; name: string }[] = [
    { itemId: 'hanhai_spice', recipeId: 'spiced_lamb', name: 'Thịt cừu nướng hương liệu' },
    {
      itemId: 'hanhai_silk',
      recipeId: 'silk_dumpling_deluxe',
      name: 'Sủi cảo Con Đường Tơ Lụa'
    },
    {
      itemId: 'hanhai_cactus',
      recipeId: 'desert_cactus_soup',
      name: 'Canh xương rồng'
    },
    { itemId: 'hanhai_date', recipeId: 'date_cake', name: 'Bánh chà là' }
  ]
  for (const entry of ITEM_RECIPE_MAP) {
    if (inventoryStore.hasItem(entry.itemId)) {
      if (cookingStore.unlockRecipe(entry.recipeId)) {
        addLog(`Nhận được công thức mới: ${entry.name}!`)
      }
    }
  }
}

/** 检查成就解锁食谱 */
const checkAchievementRecipes = () => {
  const achievementStore = useAchievementStore()
  const cookingStore = useCookingStore()
  const npcStore = useNpcStore()
  const s = achievementStore.stats

  const checks: { condition: boolean; recipeId: string; message: string }[] = [
    {
      condition: s.totalFishCaught >= 1,
      recipeId: 'first_catch_soup',
      message: 'Lần đầu câu cá'
    },
    {
      condition: s.totalCropsHarvested >= 100,
      recipeId: 'bountiful_porridge',
      message: 'Thu hoạch 100 cây trồng'
    },
    {
      condition: s.highestMineFloor >= 30,
      recipeId: 'miners_glory',
      message: 'Thám hiểm hầm mỏ'
    },
    {
      condition: s.totalRecipesCooked >= 20,
      recipeId: 'chef_special',
      message: 'Bậc thầy nấu ăn'
    },
    {
      condition:
        (['chen_bo', 'liu_niang', 'a_shi', 'qiu_yue', 'lin_lao', 'xiao_man'] as const).filter(id =>
          meetsLevel(npcStore.getFriendshipLevel(id), 'friendly')
        ).length >= 3,
      recipeId: 'social_tea',
      message: 'Bậc thầy giao tiếp'
    },
    {
      condition: s.totalFishCaught >= 20,
      recipeId: 'anglers_platter',
      message: 'Tay câu cá giỏi'
    },
    {
      condition: LEGENDARY_FISH_IDS.some(id => achievementStore.isDiscovered(id)),
      recipeId: 'legendary_feast',
      message: 'Thợ săn huyền thoại'
    },
    {
      condition: s.highestMineFloor >= 50,
      recipeId: 'abyss_stew',
      message: 'Thám hiểm vực sâu'
    },
    {
      condition: achievementStore.discoveredCount >= 50,
      recipeId: 'collectors_banquet',
      message: 'Bậc thầy sưu tầm'
    }
  ]

  for (const check of checks) {
    if (check.condition) {
      if (cookingStore.unlockRecipe(check.recipeId)) {
        addLog(`【Công thức thành tựu】${check.message} đã mở khóa công thức mới!`)
      }
    }
  }
}

/** 应用季节事件效果 */
const applyEventEffects = (event: { id: string; name: string; description: string; effects: any }) => {
  const playerStore = usePlayerStore()
  const npcStore = useNpcStore()
  const inventoryStore = useInventoryStore()
  const effects = event.effects

  if (effects.friendshipBonus) {
    for (const state of npcStore.npcStates) {
      state.friendship += effects.friendshipBonus
    }
  }
  if (effects.moneyReward) {
    playerStore.earnMoney(effects.moneyReward)
    showFloat(`+${effects.moneyReward} văn`, 'accent')
  }
  if (effects.staminaBonus) {
    playerStore.restoreStamina(effects.staminaBonus)
    showFloat(`+${effects.staminaBonus} thể lực`, 'success')
  }
  if (effects.itemReward) {
    for (const item of effects.itemReward) {
      inventoryStore.addItem(item.itemId, item.quantity)
    }
  }
  addLog(`【${event.name}】${event.description}`)

  // 节日食谱解锁
  const cookingStore = useCookingStore()
  const festivalRecipe = FESTIVAL_RECIPE_MAP[event.id]
  if (festivalRecipe) {
    if (cookingStore.unlockRecipe(festivalRecipe)) {
      addLog(`Sự kiện lễ hội đã mở khóa công thức mới!`)
    }
  }
}

// ==================== 晨间随机事件 ====================

/** 应用晨间效果 */
const applyMorningEffect = (effect?: MorningEffect) => {
  if (!effect) return
  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const npcStore = useNpcStore()
  const farmStore = useFarmStore()

  switch (effect.type) {
    case 'loseCrop': {
      const growing = farmStore.plots.filter(p => p.state === 'growing' || p.state === 'harvestable')
      if (growing.length > 0) {
        const target = growing[Math.floor(Math.random() * growing.length)]!
        const cropName = getCropById(target.cropId ?? '')?.name ?? 'Nông sản'
        target.state = 'tilled'
        target.cropId = null
        target.growthDays = 0
        target.watered = false
        target.harvestCount = 0
        target.seedGenetics = null
        addLog(`Một cây ${cropName} đã bị phá hoại.`)
      }
      break
    }
    case 'gainItem':
      inventoryStore.addItem(effect.itemId, effect.qty)
      break
    case 'gainMoney':
      playerStore.earnMoney(effect.amount)
      break
    case 'gainFriendship':
      for (const s of npcStore.npcStates) {
        s.friendship += effect.amount
      }
      break
  }
}

/** 掷骰：晨间随机事件 */
const rollMorningEvent = ():
  | { type: 'narration'; message: string; effect?: MorningEffect }
  | { type: 'choice'; event: (typeof MORNING_CHOICE_EVENTS)[number] }
  | { type: 'easter'; message: string; effect?: MorningEffect }
  | null => {
  const roll = Math.random()

  // 95% 什么都没发生
  if (roll >= 0.05) return null

  // 0.2% 彩蛋 (roll < 0.002)
  if (roll < 0.002) {
    const egg = MORNING_EASTER_EGGS[Math.floor(Math.random() * MORNING_EASTER_EGGS.length)]!
    return { type: 'easter', message: egg.message, effect: egg.effect }
  }

  // 0.8% 选项事件 (roll < 0.01)
  if (roll < 0.01) {
    const event = MORNING_CHOICE_EVENTS[Math.floor(Math.random() * MORNING_CHOICE_EVENTS.length)]!
    return { type: 'choice', event }
  }

  // 4% 小偷/动物旁白
  const farmStore = useFarmStore()
  const hasCrops = farmStore.plots.some(p => p.state === 'growing' || p.state === 'harvestable')
  const pool = hasCrops ? MORNING_NARRATIONS : NARRATIONS_NO_LOSS
  const narration = pool[Math.floor(Math.random() * pool.length)]!
  return {
    type: 'narration',
    message: narration.message,
    effect: narration.effect
  }
}

/** 日结算处理 */
/** 最近一次昏倒的结算说明；GameLayout 读取后弹窗告知玩家，并负责清空 */
export const lastPassOutNotice = ref<string | null>(null)

export const handleEndDay = () => {
  sfxSleep()

  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const saveStore = useSaveStore()
  const npcStore = useNpcStore()
  const cookingStore = useCookingStore()
  const processingStore = useProcessingStore()
  const achievementStore = useAchievementStore()
  const animalStore = useAnimalStore()
  const homeStore = useHomeStore()
  const questStore = useQuestStore()
  const skillStore = useSkillStore()
  const tutorialStore = useTutorialStore()

  // 新手引导：记录体力低标记（在 dailyReset 之前）
  if (playerStore.stamina < 20) tutorialStore.setFlag('staminaWasLow')

  // 恢复模式
  // 昏倒只看是否撑到了凌晨 2 点。体力归零不算——那是玩家自己花完的，
  // 只要还能走回家睡觉就不该被扣钱；否则「体力用光 → 回家 → 醒来少了 10% 铜钱」毫无道理。
  let recoveryMode: 'normal' | 'late' | 'passout'
  if (gameStore.hour >= 26) {
    recoveryMode = 'passout'
  } else if (gameStore.hour >= 24) {
    recoveryMode = 'late'
  } else {
    recoveryMode = 'normal'
  }

  // 矿洞强制退出：无论玩家是否在探索中，睡觉/晕厥后都重置矿洞状态
  const miningStore = useMiningStore()
  if (miningStore.isExploring) {
    miningStore.leaveMine()
  }

  const pestResult = farmStore.dailyUpdate(gameStore.isRainy)
  processingStore.dailyUpdate()

  // 育种台进度更新
  const breedingStore = useBreedingStore()
  breedingStore.dailyUpdate()

  // 戒指效果：作物生长加速
  const ringGrowthBonus = inventoryStore.getRingEffectValue('crop_growth_bonus')
  const walletGrowthBonus = useWalletStore().getCropGrowthBonus()
  if (ringGrowthBonus > 0) {
    for (const plot of farmStore.plots) {
      if ((plot.state === 'growing' || plot.state === 'planted') && plot.watered) {
        plot.growthDays += ringGrowthBonus
        const crop = getCropById(plot.cropId!)
        if (crop) {
          const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
          const speedup = (fertDef?.growthSpeedup ?? 0) + walletGrowthBonus
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (plot.growthDays >= effectiveDays) {
            plot.state = 'harvestable'
          }
        }
      }
    }
  }

  // 绿雨额外效果：作物加速生长 + 野树加速
  if (gameStore.weather === 'green_rain') {
    for (const plot of farmStore.plots) {
      if ((plot.state === 'growing' || plot.state === 'planted') && plot.watered) {
        plot.growthDays += 0.5
        const crop = getCropById(plot.cropId!)
        if (crop) {
          const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
          const speedup = (fertDef?.growthSpeedup ?? 0) + walletGrowthBonus
          const effectiveDays = Math.max(1, Math.floor(crop.growthDays * (1 - speedup)))
          if (plot.growthDays >= effectiveDays) {
            plot.state = 'harvestable'
          }
        }
      }
    }
    for (const tree of farmStore.wildTrees) {
      if (!tree.mature) {
        tree.growthDays += 1
      }
    }
    addLog('Mưa xanh tưới mát đất đai, cây trồng và cây cối sinh trưởng nhanh hơn!')
  }

  // 工具升级进度
  const upgradeResult = inventoryStore.dailyUpgradeUpdate()
  if (upgradeResult?.completed) {
    addLog(`Tiểu Mãn đã hoàn tất nâng cấp ${TOOL_NAMES[upgradeResult.toolType]}! Hiện tại là cấp ${TIER_NAMES[upgradeResult.targetTier]}.`)
  }

  // 乌鸦袭击（在其他日常处理前）
  const crowResult = farmStore.crowAttack()
  if (crowResult.attacked) {
    addLog(`Quạ đã tấn công nông trại, một cây ${crowResult.cropName} đã bị ăn mất! Hãy đặt bù nhìn để bảo vệ cây trồng.`)
  }

  // 虫害日志
  if (pestResult.newInfestations > 0) {
    addLog(
      `Sâu bệnh tấn công! ${pestResult.newInfestations} ô đất bị nhiễm. ${farmStore.scarecrows > 0 ? 'Bù nhìn đã giảm nguy cơ sâu bệnh.' : 'Đặt bù nhìn để giảm nguy cơ sâu bệnh.'}`
    )
  }
  if (pestResult.pestDeaths > 0) {
    addLog(`${pestResult.pestDeaths} cây trồng đã héo chết vì sâu bệnh kéo dài! Bắt sâu kịp thời có thể cứu cây.`)
  }

  // 杂草日志
  if (pestResult.newWeeds > 0) {
    addLog(
      `Cỏ dại lan rộng! ${pestResult.newWeeds} ô đất mọc cỏ. ${farmStore.scarecrows > 0 ? 'Bù nhìn đã hạn chế cỏ dại.' : 'Đặt bù nhìn để giảm cỏ dại.'}`
    )
  }
  if (pestResult.weedDeaths > 0) {
    addLog(`${pestResult.weedDeaths} cây trồng đã chết ngạt vì cỏ dại! Nhổ cỏ kịp thời có thể cứu cây.`)
  }

  // 晨间随机事件（偷菜旁白）
  const morningEvent = rollMorningEvent()
  if (morningEvent) {
    if (morningEvent.type === 'choice') {
      showFarmEvent(morningEvent.event)
    } else {
      addLog(morningEvent.message)
      applyMorningEffect(morningEvent.effect)
    }
  }

  // 巨型作物检查
  const giantCrops = farmStore.checkGiantCrops()
  for (const gc of giantCrops) {
    addLog(`Cây khổng lồ ${gc.cropName} xuất hiện! Cây trồng 3×3 đã hợp thành một cây khổng lồ!`)
  }

  // 雇工喂食结算（必须在 animalStore.dailyUpdate 之前，确保喂食状态生效）
  // 每天仅消耗一次草料：此处喂食用于过夜检查，dailyUpdate 后用 markAllFed 标记新一天
  const helperFeedResult = npcStore.processDailyHelpers(['feed'])
  for (const msg of helperFeedResult.messages) addLog(msg)
  const helperFeedSuccess = helperFeedResult.allFed

  const spouse = npcStore.getSpouse()
  let spouseFedSuccess = false
  if (spouse && !helperFeedSuccess) {
    const bonusChanceEve = spouse.friendship >= 2500 ? 0.1 : 0
    if (Math.random() < 0.4 + bonusChanceEve) {
      const result = animalStore.feedAll()
      if (result.fedCount > 0) {
        const spouseDefEve = getNpcById(spouse.npcId)
        addLog(`${spouseDefEve?.name ?? 'Bạn đời'} đã giúp bạn cho toàn bộ gia súc ăn.`)
        spouseFedSuccess = result.noFeedCount === 0
      } else if (result.noFeedCount > 0) {
        const spouseDefEve = getNpcById(spouse.npcId)
        addLog(`${spouseDefEve?.name ?? 'Bạn đời'} muốn giúp bạn cho gia súc ăn nhưng không đủ thức ăn.`)
      }
    }
  }

  // 知己每日加成（在 dailyReset 之前）
  const zhiji = npcStore.getZhiji()
  if (zhiji) {
    const zhijiDef = getNpcById(zhiji.npcId)
    const zhijiName = zhijiDef?.name ?? 'Tri Kỷ'
    const bonusChance2 = zhiji.friendship >= 2500 ? 0.15 : 0

    switch (zhiji.npcId) {
      case 'a_shi':
        if (Math.random() < 0.3 + bonusChance2) {
          const ores = ['copper_ore', 'iron_ore', 'gold_ore']
          const ore = ores[Math.floor(Math.random() * ores.length)]!
          const qty = 1 + Math.floor(Math.random() * 3)
          inventoryStore.addItem(ore, qty)
          addLog(`${zhijiName} mang đến ${qty} ${getItemById(ore)?.name ?? 'quặng'}.`)
        }
        break
      case 'dan_qing':
        if (Math.random() < 0.2 + bonusChance2) {
          for (const s of npcStore.npcStates) {
            if (s.npcId !== zhiji.npcId) s.friendship += 5
          }
          addLog(`${zhijiName} đã nói vài lời tốt đẹp về bạn trong làng. (Toàn làng +5 hảo cảm)`)
        }
        break
      case 'a_tie':
        if (Math.random() < 0.3 + bonusChance2) {
          const mats = ['iron_ore', 'copper_ore', 'charcoal']
          const mat = mats[Math.floor(Math.random() * mats.length)]!
          inventoryStore.addItem(mat, 2)
          addLog(`${zhijiName} mang đến một số nguyên liệu rèn.`)
        }
        break
      case 'yun_fei':
        if (Math.random() < 0.3 + bonusChance2) {
          const items2 = ['wild_mushroom', 'herb', 'pine_cone']
          const item2 = items2[Math.floor(Math.random() * items2.length)]!
          inventoryStore.addItem(item2)
          addLog(`${zhijiName} mang từ núi về ${getItemById(item2)?.name ?? 'một món đồ'}.`)
        }
        break
      case 'da_niu':
        if (Math.random() < 0.3 + bonusChance2) {
          const result2 = animalStore.feedAll()
          if (result2.fedCount > 0) addLog(`${zhijiName} đã giúp bạn cho toàn bộ gia súc ăn.`)
        }
        break
      case 'mo_bai':
        if (Math.random() < 0.25 + bonusChance2) {
          playerStore.restoreStamina(15)
          addLog(`${zhijiName} đàn một khúc nhạc êm dịu, bạn cảm thấy tinh thần khá hơn. (+15 thể lực)`)
        }
        break
      case 'liu_niang':
        if (Math.random() < 0.2 + bonusChance2) {
          for (const s of npcStore.npcStates) {
            if (s.npcId !== zhiji.npcId) s.friendship += 5
          }
          addLog(`${zhijiName} nói tốt về bạn trong làng. (Toàn làng +5 hảo cảm)`)
        }
        break
      case 'qiu_yue':
        if (Math.random() < 0.3 + bonusChance2) {
          const fish = ['crucian', 'carp', 'grass_carp', 'bass']
          const f = fish[Math.floor(Math.random() * fish.length)]!
          inventoryStore.addItem(f)
          addLog(`${zhijiName} mang đến một ${getItemById(f)?.name ?? 'con cá'}.`)
        }
        break
      case 'chun_lan':
        if (Math.random() < 0.25 + bonusChance2) {
          inventoryStore.addItem('green_tea_drink')
          addLog(`${zhijiName} mang đến một ấm trà ngon.`)
        }
        break
      case 'xue_qin':
        if (Math.random() < 0.15 + bonusChance2) {
          inventoryStore.addItem('bamboo')
          addLog(`${zhijiName} mang đến một bó tre.`)
        }
        break
      case 'su_su':
        if (Math.random() < 0.25 + bonusChance2) {
          const cloths = ['cloth', 'silk_cloth', 'felt']
          const c = cloths[Math.floor(Math.random() * cloths.length)]!
          inventoryStore.addItem(c)
          addLog(`${zhijiName} mang đến ${getItemById(c)?.name ?? 'một tấm vải'}.`)
        }
        break
      case 'hong_dou':
        if (Math.random() < 0.3 + bonusChance2) {
          const wines = ['peach_wine', 'jujube_wine', 'corn_wine']
          const w = wines[Math.floor(Math.random() * wines.length)]!
          inventoryStore.addItem(w)
          addLog(`${zhijiName} mang đến một vò ${getItemById(w)?.name ?? 'rượu'}.`)
        }
        break
    }
  }

  npcStore.dailyReset()
  cookingStore.dailyReset()
  const hanhaiStore = useHanhaiStore()
  hanhaiStore.resetDailyBets()
  // 通商售货结算
  if (hanhaiStore.unlocked) {
    hanhaiStore.dailyTradeUpdate()
  }

  // 仙灵每日处理
  const hiddenNpcStore = useHiddenNpcStore()
  const discoveryTriggered = hiddenNpcStore.checkDiscoveryConditions()
  for (const { npcId, step } of discoveryTriggered) {
    if (step.logMessage) addLog(step.logMessage)
    if (step.scenes.length > 0) showDiscoveryScene(npcId, step)
  }
  hiddenNpcStore.dailyReset()
  const newAbilities = hiddenNpcStore.checkAbilityUnlocks()
  for (const a of newAbilities) {
    addLog(`【Tiên duyên】${a.name}: ${a.description}`)
    // 永久效果：最大体力+20
    if (a.id === 'shan_weng_3') {
      playerStore.addBonusMaxStamina(20)
    }
  }
  // 修复旧存档：确保已激活的 shan_weng_3 体力加成正确应用
  if (hiddenNpcStore.isAbilityActive('shan_weng_3')) {
    const expected = 20
    if (playerStore.bonusMaxStamina < expected) {
      playerStore.addBonusMaxStamina(expected - playerStore.bonusMaxStamina)
    }
  }

  // === 晚间结算（旧日期） ===

  // 出货箱结算
  const shopStore = useShopStore()
  const shippingIncome = shopStore.processShippingBox()
  if (shippingIncome > 0) {
    playerStore.earnMoney(shippingIncome)
    addLog(`Quyết toán thùng hàng: thu nhập ${shippingIncome} văn.`)
  }

  // 委托每日更新（当天结算：倒计时递减、过期处理）
  const expiredQuests = questStore.dailyUpdate()
  for (const eq of expiredQuests) {
    addLog(`Ủy thác 「${eq.description}」 đã hết hạn.`)
  }

  // 主线任务进度检查
  questStore.updateMainQuestProgress()

  // === 日期推进 ===
  const { seasonChanged, oldSeason } = gameStore.nextDay()

  // === 晨间结算（新日期） ===

  // 瀚海轮换商品刷新（使用新日期，每周首日或首次加载时刷新）
  if (hanhaiStore.unlocked && (gameStore.day % 7 === 1 || hanhaiStore.weeklyRotatingStock.length === 0)) {
    hanhaiStore.refreshRotatingStock()
  }

  // 动物产出
  const animalResult = animalStore.dailyUpdate()
  if (animalResult.products.length > 0) {
    for (const p of animalResult.products) {
      inventoryStore.addItem(p.itemId, 1, p.quality)
    }
    addLog(`Động vật đã tạo ra ${animalResult.products.length} sản phẩm.`)
  }
  if (animalResult.died.length > 0) {
    addLog(`${animalResult.died.join(', ')} đã chết vì đói lâu ngày hoặc bệnh nặng…`)
  }
  if (animalResult.gotSick.length > 0) {
    addLog(`${animalResult.gotSick.join(', ')} bị bệnh vì đói! Hãy cho ăn sớm.`)
  }
  if (animalResult.healed.length > 0) {
    addLog(`${animalResult.healed.join(', ')} đã khỏe lại sau khi được ăn no.`)
  }

  // 晨间标记：dailyUpdate 已重置 wasFed，若有喂食雇工或配偶喂食成功则标记新一天已喂食（不再消耗草料）
  const hasFeedHelper = npcStore.hiredHelpers.some(h => h.task === 'feed')
  if (hasFeedHelper || spouseFedSuccess) {
    animalStore.markAllFed()
  }

  // 晨间工作：雇工浇水/收获/除草/收加工品
  const helperMorningResult = npcStore.processDailyHelpers(['water', 'harvest', 'weed', 'collect'])
  for (const msg of helperMorningResult.messages) addLog(msg)

  // 晨间工作：配偶浇水/做饭/收获
  if (spouse) {
    const spouseDef = getNpcById(spouse.npcId)
    const spouseName = spouseDef?.name ?? 'Bạn đời'
    const bonusChance = spouse.friendship >= 2500 ? 0.1 : 0
    const highBond = spouse.friendship >= 3000 ? 0.15 : 0

    // 浇水：50% + bonus + highBond，3-6块
    if (Math.random() < 0.5 + bonusChance + highBond) {
      const unwatered = farmStore.plots.filter(p => (p.state === 'planted' || p.state === 'growing') && !p.watered)
      const count = Math.min(unwatered.length, 3 + Math.floor(Math.random() * 4))
      for (let i = 0; i < count; i++) farmStore.waterPlot(unwatered[i]!.id)
      if (count > 0) addLog(`${spouseName} sáng sớm đã giúp bạn tưới ${count} ô đất.`)
    }

    // 做饭：30% + bonus（好感>=2000）
    if (spouse.friendship >= 2000 && Math.random() < 0.3 + bonusChance) {
      const foods = ['food_rice_ball', 'food_congee', 'food_steamed_bun', 'food_honey_tea', 'food_stir_fry', 'food_dumpling']
      const food = foods[Math.floor(Math.random() * foods.length)]!
      inventoryStore.addItem(food)
      addLog(`${spouseName} sáng sớm đã làm ${getItemById(food)?.name ?? 'một món ăn'}.`)
    }

    // 收获：30%（好感>=3000），最多3块，背包满时不收
    if (spouse.friendship >= 3000 && !inventoryStore.isFull && Math.random() < 0.3 + bonusChance) {
      const harvestable = farmStore.plots.filter(p => p.state === 'harvestable')
      const harvestCount = Math.min(harvestable.length, 3)
      let harvested = 0
      for (let i = 0; i < harvestCount; i++) {
        if (inventoryStore.isFull) break
        const hResult = farmStore.harvestPlot(harvestable[i]!.id)
        if (hResult.cropId) {
          inventoryStore.addItem(hResult.cropId, 1, 'normal')
          harvested++
        }
      }
      if (harvested > 0) addLog(`${spouseName} sáng sớm đã giúp bạn thu hoạch ${harvested} ô ruộng.`)
    }
  }

  // 孵化器更新
  const incubatorResult = animalStore.dailyIncubatorUpdate()
  if (incubatorResult.hatched) {
    addLog(`Một quả trứng trong máy ấp chuồng gà đã nở thành ${incubatorResult.hatched.name}!`)
  }

  // 牲口棚孵化器更新
  const barnIncubatorResult = animalStore.dailyBarnIncubatorUpdate()
  if (barnIncubatorResult.hatched) {
    addLog(`Một quả trứng trong máy ấp chuồng gia súc đã nở thành ${barnIncubatorResult.hatched.name}!`)
  }

  // 宠物每日更新
  const petResult = animalStore.dailyPetUpdate()
  if (petResult.item) {
    const petName = animalStore.pet?.name ?? 'Thú nuôi'
    const itemDef2 = getItemById(petResult.item)
    addLog(`${petName} tha về ${itemDef2?.name ?? petResult.item}.`)
  }

  // 鱼塘每日更新
  const fishPondStore = useFishPondStore()
  if (fishPondStore.pond.built) {
    const pondResult = fishPondStore.dailyUpdate()
    for (const p of pondResult.products) {
      inventoryStore.addItem(p.itemId, 1, p.quality)
    }
    if (pondResult.products.length > 0) {
      addLog(`Ao cá tạo ra ${pondResult.products.length} sản phẩm thủy sản.`)
    }
    if (pondResult.died.length > 0) {
      addLog(`${pondResult.died.join(', ')} đã chết vì bệnh nặng…`)
    }
    if (pondResult.gotSick.length > 0) {
      addLog(`${pondResult.gotSick.join(', ')} bị bệnh! Hãy điều trị kịp thời.`)
    }
    if (pondResult.bred) {
      addLog(`Ao cá sinh sản thành công, ${pondResult.bred} mới đã ra đời!`)
    }
    if (pondResult.breedingFailed) {
      addLog(`${pondResult.breedingFailed}。`)
    }
  }

  // 蟹笼装饵雇工结算（在收获之前）
  const helperBaitResult = npcStore.processDailyHelpers(['bait'])
  for (const msg of helperBaitResult.messages) addLog(msg)

  // 蟹笼收获
  const fishingStore = useFishingStore()
  const crabPotHarvest = fishingStore.collectCrabPots()
  if (crabPotHarvest.length > 0) {
    const names = crabPotHarvest.map(c => c.name).join('、')
    addLog(`Bẫy cua bắt được ${names}.`)
  }

  // 洞穴产出
  if (homeStore.caveChoice !== 'none') {
    homeStore.caveDaysActive++
  }
  const caveProducts = homeStore.dailyCaveUpdate()
  for (const p of caveProducts) {
    inventoryStore.addItem(p.itemId, p.quantity, p.quality)
    const itemDef = getItemById(p.itemId)
    const qualityLabel =
      p.quality === 'normal' ? '' : p.quality === 'fine' ? '(Chất lượng tốt)' : p.quality === 'excellent' ? '(Tinh phẩm)' : '(Cực phẩm)'
    const qtyText = p.quantity > 1 ? `${p.quantity} cái` : ''
    addLog(`Trong hang phát hiện ${qtyText}${itemDef?.name ?? p.itemId}${qualityLabel}.`)
  }

  // 果树更新
  const fruitResult = farmStore.dailyFruitTreeUpdate(gameStore.season)
  for (const f of fruitResult.fruits) {
    inventoryStore.addItem(f.fruitId, 1, f.quality)
  }
  if (fruitResult.fruits.length > 0) {
    addLog(`Cây ăn quả cho ${fruitResult.fruits.length} trái.`)
  }

  // 野生树木更新
  const wildTreeResult = farmStore.dailyWildTreeUpdate()
  for (const p of wildTreeResult.products) {
    inventoryStore.addItem(p.productId)
  }
  if (wildTreeResult.products.length > 0) {
    addLog(`Dụng cụ lấy nhựa thu được ${wildTreeResult.products.map(p => p.productName).join(', ')}.`)
  }

  // 温室更新
  if (homeStore.greenhouseUnlocked) {
    farmStore.greenhouseDailyUpdate()
  }

  // 酒窖更新
  if (homeStore.farmhouseLevel >= 3) {
    const cellarResult = homeStore.dailyCellarUpdate()
    for (const r of cellarResult.upgraded) {
      const name = getItemById(r.itemId)?.name ?? r.itemId
      addLog(`${name} trong hầm rượu tăng giá +${homeStore.cellarValuePerCycle} văn (tổng +${r.addedValue} văn)`)
      if (r.upgradeCount >= 16 && r.upgradeCount % 16 === 0) {
        addLog(`${name} đã trở thành rượu ủ ${r.upgradeCount / 16} năm!`)
      }
    }
  }

  // 钱包解锁检查
  const walletStore = useWalletStore()
  const newWalletItems = walletStore.checkAndUnlock()
  for (const name of newWalletItems) {
    addLog(`Đã mở khóa vật phẩm túi tiền: ${name}!`)
  }

  // 婚礼倒计时
  const weddingResult = npcStore.dailyWeddingUpdate()
  if (weddingResult.weddingToday && weddingResult.npcId) {
    const weddingNpcDef = getNpcById(weddingResult.npcId)
    addLog(`Hôm nay là ngày đại hỷ của bạn và ${weddingNpcDef?.name ?? 'người thương'}!`)
    triggerWeddingEvent(weddingResult.npcId)
  }

  // 孕期每日更新
  const pregResult = npcStore.dailyPregnancyUpdate()
  if (pregResult.born) {
    const qMsg =
      pregResult.born.quality === 'healthy' ? 'Khỏe mạnh!' : pregResult.born.quality === 'premature' ? 'Dù sinh non một chút nhưng vẫn bình an.' : ''
    addLog(`${pregResult.born.name} đã chào đời! Chúc mừng! ${qMsg}`)
  }
  if (pregResult.stageChanged) {
    const stageLabels: Record<string, string> = {
      early: 'Giai đoạn đầu',
      mid: 'Giai đoạn giữa',
      late: 'Giai đoạn cuối',
      ready: 'Thời kỳ chờ sinh'
    }
    addLog(`Thai kỳ bước vào ${stageLabels[pregResult.stageChanged.to]}. Nhớ chăm sóc bạn đời nhiều hơn.`)
  }
  if (pregResult.miscarriage) {
    addLog('Thật đáng tiếc… lần này chưa thể đón thêm thành viên mới. Cả hai cần thời gian để hồi phục.')
  }

  // 子女成长（已出生的子女）
  for (const milestone of npcStore.dailyChildUpdate()) addLog(milestone)

  // NPC 提议要孩子（不自动确认，玩家回家后回应）
  if (npcStore.checkChildProposal()) {
    npcStore.triggerChildProposal()
    const spouseDef2 = getNpcById(npcStore.getSpouse()?.npcId ?? '')
    addLog(`${spouseDef2?.name ?? 'Bạn đời'} dường như có điều muốn nói với bạn…`)
  }

  // 为新的一天生成委托（在 nextDay 之后，使用新季节和新日期）
  questStore.generateDailyQuests(gameStore.season, gameStore.day)

  // 每7天生成一个特殊订单 (第7/14/21/28天, 梯度递增)
  const specialOrderDays: Record<number, number> = {
    7: 1,
    14: 2,
    21: 3,
    28: 4
  }
  const tier = specialOrderDays[gameStore.day]
  if (tier && !questStore.specialOrder) {
    questStore.generateSpecialOrder(gameStore.season, tier)
  }

  // 新一天如果下雨，立即浇水所有作物（让玩家看到已浇水状态）
  if (gameStore.isRainy) {
    for (const plot of farmStore.plots) {
      if (plot.state === 'planted' || plot.state === 'growing') {
        plot.watered = true
        plot.unwateredDays = 0
      }
    }
  }

  const bedHour = gameStore.hour
  const { moneyLost, recoveryPct } = playerStore.dailyReset(recoveryMode, bedHour)

  // 仙灵结缘每日奖励（必须在 dailyReset 之后，否则 stamina_restore 会被覆盖）
  const bondMessages = hiddenNpcStore.dailyBondBonus()
  for (const msg of bondMessages.messages) addLog(msg)

  let summary: string
  if (recoveryMode === 'passout') {
    summary =
      moneyLost > 0
        ? `Bạn kiệt sức và ngã xuống… Có người đưa bạn về nhà. Mất ${moneyLost} văn. Ngày hôm sau chỉ hồi 50% thể lực.`
        : `Bạn kiệt sức và ngã xuống… Ngày hôm sau chỉ hồi 50% thể lực.`
    // 记录昏倒说明，由 GameLayout 弹窗告知玩家，避免"一觉醒来莫名其妙少了钱"
    lastPassOutNotice.value = summary
  } else if (recoveryMode === 'late') {
    const pct = Math.round(recoveryPct * 100)
    summary = `Bạn thức rất khuya mới ngủ… Ngày hôm sau chỉ hồi ${pct}% thể lực.`
  } else {
    summary = 'Một ngày tuyệt vời đã kết thúc.'
  }

  addLog(summary)

  // 换季处理
  if (seasonChanged) {
    const { witheredCount, reclaimedCount } = farmStore.onSeasonChange(gameStore.season)
    addLog(`—— Đổi mùa: ${SEASON_NAMES[oldSeason]}→${SEASON_NAMES[gameStore.season]} ——`)
    if (witheredCount > 0) {
      addLog(`${witheredCount} cây không hợp mùa mới đã héo…`)
    }
    if (reclaimedCount > 0) {
      addLog(`${reclaimedCount} ô đất bỏ hoang đã bị cỏ dại phủ kín.`)
    }
    if (oldSeason === 'winter' && gameStore.season === 'spring') {
      addLog('Năm mới bắt đầu! Nông trại sau mùa đông đã hoang hóa phần nào, cần khai hoang lại.')
    }
    farmStore.fruitTreeSeasonUpdate(oldSeason === 'winter')

    // 桃源田庄：换季自动施肥（默认关闭，可在设置中开启）
    if (gameStore.farmMapType === 'standard' && useSettingsStore().autoFertilizeOnSeasonChange) {
      const { count: fertCount, fertilizerName } = farmStore.applyFertileSoil(skillStore.getSkill('farming').level)
      if (fertCount > 0) {
        addLog(`Đất màu mỡ Đào Nguyên nuôi dưỡng ruộng đất, ${fertCount} ô ruộng nhận ${fertilizerName}.`)
      }
    }

    // 新手引导：记录换季标记
    tutorialStore.setFlag('justChangedSeason')
  }

  // 闪电
  if (gameStore.weather === 'stormy') {
    const strike = farmStore.lightningStrike()
    if (strike.absorbed) {
      inventoryStore.addItem('battery')
      addLog('Cột thu lôi hấp thụ một tia sét! Nhận được bộ pin.')
    } else if (strike.hit) {
      addLog(`Một tia sét trong cơn giông đánh trúng nông trại, một cây ${strike.cropName} bị phá hủy! Xây cột thu lôi để phòng vệ.`)
    }
  }

  if (gameStore.isRainy) {
    addLog('Hôm nay mưa, cây trồng được tự động tưới.')
  }

  // 天气预报
  addLog(`Dự báo thời tiết ngày mai: ${WEATHER_NAMES[gameStore.tomorrowWeather]}`)

  // 换季倒计时提醒（第25-27天早晨）
  if (!seasonChanged && gameStore.day >= 25 && gameStore.day <= 27) {
    const daysLeft = 28 - gameStore.day
    const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'] as const
    const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(gameStore.season) + 1) % 4]!
    let cropAtRisk = 0
    for (const plot of farmStore.plots) {
      if ((plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable') && plot.cropId) {
        const crop = getCropById(plot.cropId)
        if (crop && !crop.season.includes(nextSeason)) cropAtRisk++
      }
    }
    if (cropAtRisk > 0) {
      addLog(`Còn ${daysLeft} ngày nữa đổi mùa, ${cropAtRisk} cây không hợp ${SEASON_NAMES[nextSeason]} sẽ héo.`)
      showFloat(`Còn ${daysLeft} ngày đổi mùa! ${cropAtRisk} cây sẽ héo`, 'danger')
    } else {
      addLog(`Còn ${daysLeft} ngày nữa đổi mùa.`)
    }
  }

  // 今日行情
  const marketInfo = getDailyMarketInfo(gameStore.year, gameStore.seasonIndex, gameStore.day, shopStore.getRecentShipping())
  const booms = marketInfo.filter(m => m.trend === 'boom')
  const crashes = marketInfo.filter(m => m.trend === 'crash')
  if (booms.length > 0) {
    addLog(`Thị trường hôm nay: giá ${booms.map(b => MARKET_CATEGORY_NAMES[b.category]).join(', ')} tăng mạnh!`)
  }
  if (crashes.length > 0) {
    addLog(`Thị trường hôm nay: giá ${crashes.map(c => MARKET_CATEGORY_NAMES[c.category]).join(', ')} giảm mạnh.`)
  }

  // 新手引导：晨间提示（仅第1年）
  // 注意：此时 nextDay() 已执行，gameStore.day 是新一天的日期
  // 例如玩家结束第1天后，gameStore.day === 2（第2天早晨）
  if (tutorialStore.enabled && gameStore.year === 1) {
    const conditions: Record<string, () => boolean> = {
      earlyFirstDay: () => gameStore.day === 2 && gameStore.season === 'spring',
      allWasteland: () => farmStore.plots.every(p => p.state === 'wasteland') && gameStore.day > 2,
      tilledNoPlanted: () =>
        farmStore.plots.some(p => p.state === 'tilled') &&
        !farmStore.plots.some(p => p.state === 'planted' || p.state === 'growing' || p.state === 'harvestable'),
      plantedUnwatered: () =>
        farmStore.plots.some(p => (p.state === 'planted' || p.state === 'growing') && !p.watered) && !gameStore.isRainy,
      hasHarvestable: () => farmStore.plots.some(p => p.state === 'harvestable'),
      harvestedNeverSold: () => achievementStore.stats.totalCropsHarvested > 0 && achievementStore.stats.totalMoneyEarned === 0,
      earlyGame: () => gameStore.day <= 4 && gameStore.season === 'spring',
      staminaWasLow: () => tutorialStore.getFlag('staminaWasLow'),
      neverVisitedShop: () => !tutorialStore.hasPanelVisited('shop'),
      neverFished: () => achievementStore.stats.totalFishCaught === 0 && gameStore.day >= 4,
      neverMined: () => achievementStore.stats.highestMineFloor === 0 && gameStore.day >= 6,
      neverTalkedNpc: () => npcStore.npcStates.every(n => n.friendship === 0) && gameStore.day >= 3,
      neverCheckedQuests: () => !tutorialStore.hasPanelVisited('quest') && gameStore.day >= 5,
      neverCooked: () => achievementStore.stats.totalRecipesCooked === 0 && gameStore.day >= 8,
      firstRainyDay: () => gameStore.isRainy && !tutorialStore.getFlag('seenRain'),
      justChangedSeason: () => tutorialStore.getFlag('justChangedSeason'),
      hasCropNoSprinkler: () =>
        farmStore.plots.some(p => p.state === 'growing') && farmStore.sprinklers.length === 0 && gameStore.day >= 11,
      neverHadAnimal: () => animalStore.animals.length === 0 && gameStore.day >= 15
    }
    for (const tip of MORNING_TIPS) {
      if (tutorialStore.isTipShown(tip.id)) continue
      const check = conditions[tip.conditionKey]
      if (check && check()) {
        addLog(tip.message)
        tutorialStore.markTipShown(tip.id)
        if (tip.conditionKey === 'firstRainyDay') tutorialStore.setFlag('seenRain')
        if (tip.conditionKey === 'justChangedSeason') tutorialStore.setFlag('seenSeasonChange')
        break // 每天只显示一条
      }
    }
    // 清除临时标记
    tutorialStore.setFlag('justChangedSeason', false)
    tutorialStore.setFlag('staminaWasLow', false)
  }

  // 食谱解锁
  checkRecipeUnlocks()

  // 季节事件
  const event = getTodayEvent(gameStore.season, gameStore.day)
  if (event) {
    applyEventEffects(event)
    if (event.interactive && event.festivalType) {
      showFestival(event.festivalType)
    } else {
      const { startFestivalBgm } = useAudio()
      startFestivalBgm(gameStore.season)
    }
    // 替换 narrative 中的动态占位符
    const ORDINALS = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười']
    const yearStr = gameStore.year <= 10 ? ORDINALS[gameStore.year - 1]! : String(gameStore.year)
    const resolved = {
      ...event,
      narrative: event.narrative.map(line => line.replace('{year}', yearStr))
    }
    showEvent(resolved)
  }

  // 成就检查
  const newAchievements = achievementStore.checkAchievements()
  for (const a of newAchievements) {
    addLog(`【成就达成】${a.name}！${a.reward.money ? `获得${a.reward.money}文` : ''}`)
    showFloat(`Thành tựu: ${a.name}`, 'accent')
  }

  // 成就食谱解锁
  checkAchievementRecipes()

  // 洞穴解锁检查
  if (!homeStore.caveUnlocked && achievementStore.stats.totalMoneyEarned >= CAVE_UNLOCK_EARNINGS) {
    homeStore.unlockCave()
    addLog('Tổng thu nhập của bạn đã gây chú ý… Hang động phía sau làng đã mở! Hãy vào bảng công trình để chọn công dụng.')
  }

  // ===== 田庄特殊效果 =====

  // 荒野田庄：被动矿石（增强）+ 夜间野兽遭遇
  if (gameStore.farmMapType === 'wilderness') {
    const orePool = ['copper_ore', 'iron_ore', 'gold_ore']
    const randomOre = orePool[Math.floor(Math.random() * orePool.length)]!
    const qty = 2 + Math.floor(Math.random() * 2) // 2-3
    inventoryStore.addItem(randomOre, qty)
    const oreDef = getItemById(randomOre)
    addLog(`Ngoài hoang dã phát hiện ${qty} ${oreDef?.name ?? randomOre}.`)

    // 夜间野兽遭遇（25%概率）
    if (Math.random() < 0.25) {
      const combatLevel = skillStore.getSkill('combat').level
      const winRate = Math.min(0.95, 0.5 + combatLevel * 0.05)
      if (Math.random() < winRate) {
        const lootPool = ['copper_ore', 'iron_ore', 'quartz', 'jade', 'gold_ore']
        const loot = lootPool[Math.floor(Math.random() * lootPool.length)]!
        const lootQty = 1 + Math.floor(Math.random() * 2)
        inventoryStore.addItem(loot, lootQty)
        skillStore.addExp('combat', 15)
        const lootName = getItemById(loot)?.name ?? loot
        addLog(`Ban đêm thú dữ xâm nhập! Bạn chiến đấu đẩy lùi chúng và thu được ${lootQty} ${lootName}.`)
      } else {
        const damage = 5 + Math.floor(Math.random() * 11) // 5-15
        playerStore.takeDamage(damage)
        const crops = farmStore.plots.filter(p => p.state === 'growing' || p.state === 'harvestable')
        if (crops.length > 0) {
          const target = crops[Math.floor(Math.random() * crops.length)]!
          const cropName = getCropById(target.cropId ?? '')?.name ?? 'Nông sản'
          farmStore.removeCrop(target.id)
          addLog(`Ban đêm thú dữ xâm nhập! Bạn không chặn được, chịu ${damage} sát thương và một cây ${cropName} bị phá hủy.`)
        } else {
          addLog(`Ban đêm thú dữ xâm nhập! Bạn không chặn được và chịu ${damage} sát thương.`)
        }
      }
    }
  }

  // 竹林田庄：每日林中拾遗
  if (gameStore.farmMapType === 'forest') {
    const foragePool = getForageItems(gameStore.season)
    const commonForage = foragePool.filter(f => f.chance >= 0.1)
    if (commonForage.length > 0) {
      const count = 1 + (Math.random() < 0.4 ? 1 : 0) // 1-2个
      const gathered: string[] = []
      for (let i = 0; i < count; i++) {
        const item = commonForage[Math.floor(Math.random() * commonForage.length)]!
        const quality = skillStore.rollForageQuality()
        inventoryStore.addItem(item.itemId, 1, quality)
        skillStore.addExp('foraging', item.expReward)
        gathered.push(getItemById(item.itemId)?.name ?? item.itemId)
      }
      addLog(`Trong rừng trúc phát hiện ${gathered.join(' và ')}.`)
    }
  }

  // 山丘田庄：地表矿脉生成
  if (gameStore.farmMapType === 'hilltop') {
    if (!gameStore.surfaceOrePatch && Math.random() < 0.35) {
      const year = gameStore.year
      const orePool = year >= 2 ? ['copper_ore', 'iron_ore', 'gold_ore'] : ['copper_ore', 'iron_ore']
      const oreId = orePool[Math.floor(Math.random() * orePool.length)]!
      const qty = 3 + Math.floor(Math.random() * 3) // 3-5
      gameStore.surfaceOrePatch = { oreId, quantity: qty }
      const oreName = getItemById(oreId)?.name ?? 'Quặng'
      addLog(`Phát hiện một mạch ${oreName} trên đồi!`)
    }
  }

  // 溪流田庄：溪流鱼获生成
  if (gameStore.farmMapType === 'riverland') {
    const seasonFish = FISH.filter(f => (f.location ?? 'creek') === 'creek' && f.season.includes(gameStore.season as any))
    if (seasonFish.length > 0) {
      const isRainy = gameStore.isRainy
      const catchCount = isRainy ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2)
      const catches: {
        fishId: string
        quality: 'normal' | 'fine' | 'excellent' | 'supreme'
      }[] = []
      for (let i = 0; i < catchCount; i++) {
        const fish = seasonFish[Math.floor(Math.random() * seasonFish.length)]!
        const quality: 'normal' | 'fine' = Math.random() < 0.15 ? 'fine' : 'normal'
        catches.push({ fishId: fish.id, quality })
      }
      const MAX_CREEK_CATCH = 10
      const merged = [...gameStore.creekCatch, ...catches].slice(0, MAX_CREEK_CATCH)
      gameStore.creekCatch = merged
      addLog(`Cá đang nhảy trong suối, hãy vào bảng nông trại để thu cá.`)
    }
  }

  // 宠物领养触发（春季第一年第7天起，每天检查直到领养）
  if (gameStore.day >= 7 && gameStore.year === 1 && gameStore.season === 'spring' && !animalStore.pet) {
    triggerPetAdoption()
  }

  // 回到农场页面（防止留在商铺等页面继续操作）
  void router.push({ name: 'farm' })

  // 自动存档
  saveStore.autoSave()
}

export const useEndDay = () => {
  return { handleEndDay }
}
