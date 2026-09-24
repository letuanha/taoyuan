<template>
  <div>
    <VillagerPresence spot="forage" />
    <h3 class="text-accent text-sm mb-3">
      <TreePine :size="14" class="inline" />
      trerừngthu háithập
    </h3>

    <!-- 采集操作 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">Thu thập</p>
        <span class="text-xs text-muted">tiêuhao {{ forageCost }} thể lực · {{ forageTimeLabel }}</span>
      </div>
      <p class="text-xs text-muted mb-2">Dùng rìu để tìm kiếm nhiều loại tài nguyên trong rừng tre.</p>
      <div
        class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
        @click="handleForage"
      >
        <span class="text-xs">Thu thập một lần</span>
        <span class="text-xs text-muted">{{ playerStore.stamina }}/{{ playerStore.maxStamina }} thể lực</span>
      </div>
      <!-- 天气/加成提示 -->
      <div class="flex flex-wrap space-x-3 mt-2">
        <span v-if="weatherMod !== 1" class="text-[10px]" :class="weatherMod > 1 ? 'text-success' : 'text-danger'">
          {{ weatherModLabel }}
        </span>
        <span v-if="hasHerbalistPerk" class="text-[10px] text-success">thuốcsư：kháisuất+20%</span>
        <span v-if="hasLumberjackPerk" class="text-[10px] text-success">
          {{ foragingSkill.perk10 === 'forester' ? 'Tiều phu: chắc chắn nhận gỗ' : 'Người đốn củi: thêm 25% gỗ' }}
        </span>
        <span v-if="foragingSkill.perk10 === 'tracker'" class="text-[10px] text-success">theodấungười：số tiềnngoài+1Vật phẩm</span>
        <span v-if="cookingLuckBuff > 0" class="text-[10px] text-success">món ănvậnkhí+{{ cookingLuckBuff }}%</span>
        <span v-if="isForestFarm" class="text-[10px] text-success">rừngrừngNông trại：kinh nghiệm×1.25</span>
      </div>
    </div>

    <!-- 采集结果 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <p class="text-sm text-accent mb-2">
        <Search :size="14" class="inline" />
        Kết quả thu thập
      </p>
      <div v-if="lastResults.length > 0" class="flex flex-col space-y-1">
        <div
          v-for="(r, i) in lastResults"
          :key="i"
          class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5"
          :class="r.itemId ? 'cursor-pointer hover:bg-accent/5' : ''"
          @click="r.itemId && (selectedResult = r)"
        >
          <span class="text-xs" :class="r.quality ? QUALITY_COLORS[r.quality] : ''">{{ r.label }}</span>
          <span v-if="r.itemId" class="text-xs text-muted/50">Chi tiết ›</span>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-6 text-muted">
        <Search :size="32" class="mb-2" />
        <p class="text-xs">Chưa thu thập lần nào, hãy thử xem.</p>
      </div>
    </div>

    <!-- 采集物详情弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="selectedResult && selectedResultDef"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="selectedResult = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="selectedResult = null">
            <X :size="14" />
          </button>

          <p class="text-sm mb-2" :class="selectedResult.quality ? QUALITY_COLORS[selectedResult.quality] : 'text-accent'">
            {{ selectedResultDef.name }}
            <span v-if="selectedResult.quantity > 1" class="text-muted">×{{ selectedResult.quantity }}</span>
          </p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">
              {{ selectedResultDef.description }}
            </p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Phân loại</span>
              <span class="text-xs">{{ CATEGORY_NAMES[selectedResultDef.category] ?? selectedResultDef.category }}</span>
            </div>
            <div v-if="selectedResult.quality && selectedResult.quality !== 'normal'" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Chất lượng</span>
              <span class="text-xs" :class="QUALITY_COLORS[selectedResult.quality]">{{ QUALITY_NAMES[selectedResult.quality] }}</span>
            </div>
            <div v-if="selectedResultDef.sellPrice > 0" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Giá bán</span>
              <span class="text-xs text-accent">{{ selectedResultDef.sellPrice }}văn</span>
            </div>
            <div v-if="selectedResultDef.edible" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">ĂnHiệu quả</span>
              <span class="text-xs text-success">
                {{ selectedResultDef.staminaRestore ? `Thể lực +${selectedResultDef.staminaRestore}` : '' }}
                {{ selectedResultDef.healthRestore ? `HP+${selectedResultDef.healthRestore}` : '' }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Nguồn</span>
              <span class="text-xs">{{ getItemSource(selectedResult.itemId!) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 当季采集物 -->
    <div class="border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">Vật phẩm thu thập theo mùa</p>
        <span class="text-xs text-muted">{{ SEASON_NAMES[gameStore.season] }}mùa</span>
      </div>
      <div class="flex flex-col space-y-1">
        <div
          v-for="item in currentForage"
          :key="item.itemId"
          class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5"
        >
          <div>
            <span class="text-xs">{{ item.name }}</span>
            <span class="text-[10px] text-muted ml-2">+{{ item.expReward }}kinh nghiệm</span>
          </div>
          <span class="text-xs text-muted">{{ Math.round(item.chance * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- 温和动物遭遇弹窗 -->
    <Transition name="panel-fade">
      <div v-if="encounter && encounter.type === 'friendly'" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent mb-2">gặpđếnđã{{ encounter.animal.name }}！</p>
          <p class="text-xs text-muted mb-3">mộtcon{{ encounter.animal.name }}rahiệnđangtrerừngtrong，xemlênđếnrấtấmthuận。</p>
          <div class="flex flex-col space-y-1.5">
            <div
              class="flex items-center justify-between border border-success/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-success/5"
              @click="handleFriendlyCollect"
            >
              <span class="text-xs text-success">thuthậpsảnvật</span>
              <span class="text-[10px] text-muted">+{{ encounter.animal.collectExp }}thu háithậpkinh nghiệm</span>
            </div>
            <div
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleFriendlyChase"
            >
              <span class="text-xs">Xua đuổi</span>
              <span class="text-[10px] text-muted">+{{ encounter.animal.chaseExp }}thu háithậpkinh nghiệm</span>
            </div>
            <div
              class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="encounter = null"
            >
              <span class="text-xs text-muted">rời</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 野兽战斗弹窗 -->
    <Transition name="panel-fade">
      <div v-if="inForestCombat && forestCombatMonster" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-danger mb-2">gặpgặp{{ forestCombatMonster.name }}！</p>

          <!-- 玩家 vs 野兽 -->
          <div class="grid grid-cols-[1fr_auto_1fr] mb-3 items-center" style="column-gap: 6px">
            <!-- 玩家 -->
            <div class="border border-accent/10 rounded-xs p-2">
              <p class="text-xs text-center mb-1.5">Bạn</p>
              <div class="bg-bg rounded-xs h-1.5 mb-1">
                <div
                  class="h-1.5 rounded-xs transition-all"
                  :class="playerStore.getIsLowHp() ? 'bg-danger' : 'bg-success'"
                  :style="{ width: `${playerStore.getHpPercent()}%` }"
                />
              </div>
              <p class="text-[10px]" :class="playerStore.getIsLowHp() ? 'text-danger' : 'text-muted'">
                {{ playerStore.hp }}/{{ playerStore.getMaxHp() }}
              </p>
            </div>
            <span class="text-[10px] text-muted/40">VS</span>
            <!-- 野兽 -->
            <div class="border border-danger/20 rounded-xs p-2">
              <p class="text-xs text-center text-danger mb-1.5">
                {{ forestCombatMonster.name }}
              </p>
              <div class="bg-bg rounded-xs h-1.5 mb-1">
                <div
                  class="h-1.5 bg-danger rounded-xs transition-all"
                  :style="{
                    width: `${(forestCombatMonsterHp / forestCombatMonster.hp) * 100}%`
                  }"
                />
              </div>
              <p class="text-[10px] text-muted">{{ forestCombatMonsterHp }}/{{ forestCombatMonster.hp }}</p>
            </div>
          </div>

          <!-- 操作 -->
          <div class="grid grid-cols-3 mb-3" style="column-gap: 4px">
            <div
              class="flex flex-col items-center border border-accent/20 rounded-xs py-1.5"
              :class="forestCombatAnimLock ? 'opacity-50' : 'cursor-pointer hover:bg-accent/5'"
              @click="!forestCombatAnimLock && handleForestCombat('attack')"
            >
              <span class="text-xs">
                <Swords :size="12" class="inline" />
                tấn côngđánh
              </span>
              <span class="text-[10px] text-muted">{{ forestWeaponAttack }}Tấn cônglực</span>
            </div>
            <div
              class="flex flex-col items-center border border-accent/20 rounded-xs py-1.5"
              :class="forestCombatAnimLock ? 'opacity-50' : 'cursor-pointer hover:bg-accent/5'"
              @click="!forestCombatAnimLock && handleForestCombat('defend')"
            >
              <span class="text-xs">
                <Shield :size="12" class="inline" />
                phòngngự
              </span>
              <span class="text-[10px] text-muted">Giảm sát thương</span>
            </div>
            <div
              class="flex flex-col items-center border border-danger/20 rounded-xs py-1.5 cursor-pointer hover:bg-danger/5"
              :class="forestCombatAnimLock ? 'opacity-50' : ''"
              @click="!forestCombatAnimLock && handleForestCombat('flee')"
            >
              <span class="text-xs text-danger">
                <MoveRight :size="12" class="inline" />
                chạy trốnchạy
              </span>
            </div>
          </div>

          <!-- 战斗日志 -->
          <div class="text-xs space-y-0.5 max-h-28 overflow-y-auto">
            <p v-for="(msg, i) in forestCombatLog" :key="i" :class="i < forestCombatLog.length - 1 ? 'text-muted' : 'text-text'">
              {{ msg }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import VillagerPresence from '@/components/game/VillagerPresence.vue'
  import { ref, computed } from 'vue'
  import { TreePine, Search, X, Swords, Shield, MoveRight } from 'lucide-vue-next'
  import { useAchievementStore } from '@/stores/useAchievementStore'
  import { useCookingStore } from '@/stores/useCookingStore'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useQuestStore } from '@/stores/useQuestStore'
  import { useSkillStore } from '@/stores/useSkillStore'
  import { useMiningStore } from '@/stores/useMiningStore'
  import { useWalletStore } from '@/stores/useWalletStore'
  import type { Quality } from '@/types'
  import type { MonsterDef, CombatAction } from '@/types/skill'
  import { getForageItems, getItemById, getItemSource } from '@/data'
  import {
    WEATHER_FORAGE_MODIFIER,
    FOREST_ENCOUNTER_CHANCE,
    FOREST_DEFEAT_MONEY_PENALTY_RATE,
    FOREST_DEFEAT_MONEY_PENALTY_CAP,
    rollForestEncounter
  } from '@/data/forage'
  import type { FriendlyAnimalDef } from '@/data/forage'
  import { getWeaponById, getEnchantmentById } from '@/data/weapons'
  import { ACTION_TIME_COSTS, TOOL_TIME_SAVINGS, SKILL_TIME_REDUCTION_PER_LEVEL, MIN_ACTION_MINUTES } from '@/data/timeConstants'
  import { sfxForage } from '@/composables/useAudio'
  import { addLog } from '@/composables/useGameLog'
  import { handleEndDay } from '@/composables/useEndDay'
  import { useHiddenNpcStore } from '@/stores/useHiddenNpcStore'

  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const gameStore = useGameStore()
  const achievementStore = useAchievementStore()
  const cookingStore = useCookingStore()
  const walletStore = useWalletStore()

  interface ForageResult {
    label: string
    itemId?: string
    quantity: number
    quality?: Quality
  }

  const QUALITY_COLORS: Record<Quality, string> = {
    normal: '',
    fine: 'text-quality-fine',
    excellent: 'text-quality-excellent',
    supreme: 'text-quality-supreme'
  }

  const QUALITY_NAMES: Record<Quality, string> = {
    normal: 'Thường',
    fine: 'Chất lượng tốt',
    excellent: 'Tinh phẩm',
    supreme: 'Cực phẩm'
  }

  const CATEGORY_NAMES: Record<string, string> = {
    seed: 'Hạt giống',
    crop: 'Cây trồng',
    fish: 'Cá',
    ore: 'Quặng',
    gem: 'Đá quý',
    gift: 'Quà tặng',
    food: 'Thức ăn',
    material: 'Nguyên liệu',
    misc: 'Linh tinh',
    processed: 'Đồ chế biến',
    machine: 'Máy móc',
    sprinkler: 'Vòi phun nước',
    fertilizer: 'Phân bón',
    animal_product: 'Sản phẩm chăn nuôi',
    sapling: 'Cây non',
    fruit: 'Trái cây',
    bait: 'Mồi câu',
    tackle: 'Đồ câu',
    bomb: 'Bom',
    fossil: 'Hóa thạch',
    artifact: 'Cổ vật',
    weapon: 'Vũ khí',
    ring: 'Nhẫn',
    hat: 'Mũ',
    shoe: 'Giày'
  }

  const lastResults = ref<ForageResult[]>([])
  const selectedResult = ref<ForageResult | null>(null)

  const selectedResultDef = computed(() => {
    if (!selectedResult.value?.itemId) return null
    return getItemById(selectedResult.value.itemId) ?? null
  })

  const currentForage = computed(() => getForageItems(gameStore.season))
  const foragingSkill = computed(() => skillStore.getSkill('foraging'))

  const forageCost = computed(() =>
    Math.max(1, Math.floor(5 * inventoryStore.getToolStaminaMultiplier('axe') * (1 - skillStore.getStaminaReduction('foraging'))))
  )

  /** thu háithậphaothời（nhỏthời），chịu工công cụvàkỹ thuậtnănggiảmmiễn */
  const forageTime = computed(() => {
    const baseMin = ACTION_TIME_COSTS.forage * 60
    const toolTier = inventoryStore.getTool('axe')?.tier ?? 'basic'
    const saving = TOOL_TIME_SAVINGS[toolTier] ?? 0
    const skillReduction = skillStore.getSkill('foraging').level * SKILL_TIME_REDUCTION_PER_LEVEL
    return Math.max(MIN_ACTION_MINUTES, Math.round((baseMin - saving) * (1 - skillReduction))) / 60
  })

  const forageTimeLabel = computed(() => `${Math.round(forageTime.value * 60)} phút`)

  const weatherMod = computed(() => WEATHER_FORAGE_MODIFIER[gameStore.weather] ?? 1)

  const WEATHER_MOD_LABELS: Record<string, string> = {
    rainy: 'Ngày mưa: tỷ lệ +15%',
    stormy: 'Mưa giông: tỷ lệ -20%',
    snowy: 'Ngày tuyết: tỷ lệ -10%',
    windy: 'Gió lớn: tỷ lệ +10%',
    green_rain: 'Mưa xanh: tỷ lệ +50%'
  }

  const weatherModLabel = computed(() => WEATHER_MOD_LABELS[gameStore.weather] ?? '')

  const hasHerbalistPerk = computed(() => foragingSkill.value.perk5 === 'herbalist')
  const hasLumberjackPerk = computed(() => foragingSkill.value.perk5 === 'lumberjack' || foragingSkill.value.perk10 === 'forester')
  const isForestFarm = computed(() => gameStore.farmMapType === 'forest')
  const cookingLuckBuff = computed(() => (cookingStore.activeBuff?.type === 'luck' ? cookingStore.activeBuff.value : 0))

  const handleForage = () => {
    if (gameStore.isPastBedtime) {
      addLog('Muộn quá, không thể thu thập.')
      handleEndDay()
      return
    }

    if (!inventoryStore.isToolAvailable('axe')) {
      addLog('Rìu đang được nâng cấp, không thể thu thập.')
      return
    }

    const cost = forageCost.value
    if (!playerStore.consumeStamina(cost)) {
      addLog('Không đủ thể lực để thu thập.')
      return
    }

    sfxForage()

    const items = currentForage.value
    const gathered: ForageResult[] = []
    const skill = foragingSkill.value
    const forestFarm = isForestFarm.value
    const forestXpBonus = forestFarm ? 1.25 : 1.0
    const hiddenNpcStore = useHiddenNpcStore()
    const herbDouble = hiddenNpcStore.isAbilityActive('yue_tu_1')
    const moonHerbChance = hiddenNpcStore.isAbilityActive('yue_tu_3')

    for (const item of items) {
      const herbalistBonus = skill.perk5 === 'herbalist' ? 1.2 : 1.0
      const cookingBuff = cookingStore.activeBuff?.type === 'luck' ? cookingStore.activeBuff.value / 100 : 0
      const adjustedChance = Math.min(
        1,
        item.chance * (WEATHER_FORAGE_MODIFIER[gameStore.weather] ?? 1) * herbalistBonus * (1 + cookingBuff)
      )
      if (Math.random() < adjustedChance) {
        const forageAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
        let quality = skillStore.rollForageQuality(forageAllSkillsBuff)
        const walletBoost = walletStore.getForageQualityBoost()
        if (walletBoost > 0) {
          const qualityOrder: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
          const idx = qualityOrder.indexOf(quality)
          const newIdx = Math.min(idx + walletBoost, qualityOrder.length - 1)
          quality = qualityOrder[newIdx]!
        }
        const qty = forestFarm && Math.random() < 0.2 ? 2 : 1
        // 仙缘能力：药知（yue_tu_1）草药采集双倍
        const finalQty = herbDouble && (item.itemId === 'herb' || item.itemId === 'ginseng') ? qty * 2 : qty
        inventoryStore.addItem(item.itemId, finalQty, quality)
        achievementStore.discoverItem(item.itemId)
        useQuestStore().onItemObtained(item.itemId, finalQty)
        const itemDef = getItemById(item.itemId)
        const name = itemDef?.name ?? item.itemId
        gathered.push({
          label: `Nhận được ${finalQty > 1 ? `${name}×${finalQty}` : name}`,
          itemId: item.itemId,
          quantity: finalQty,
          quality
        })
        skillStore.addExp('foraging', Math.floor(item.expReward * forestXpBonus))
      }
    }

    if (skill.perk10 === 'forester') {
      inventoryStore.addItem('wood')
      gathered.push({ label: 'Nhận được gỗ', itemId: 'wood', quantity: 1 })
    } else if (skill.perk5 === 'lumberjack' && Math.random() < 0.25) {
      inventoryStore.addItem('wood')
      gathered.push({ label: 'Nhận được gỗ', itemId: 'wood', quantity: 1 })
    }

    if (skill.perk10 === 'tracker' && items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)]!
      const trackerAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
      const quality = skillStore.rollForageQuality(trackerAllSkillsBuff)
      inventoryStore.addItem(randomItem.itemId, 1, quality)
      achievementStore.discoverItem(randomItem.itemId)
      const itemDef = getItemById(randomItem.itemId)
      const name = itemDef?.name ?? randomItem.itemId
      gathered.push({
        label: `Nhận được ${name}`,
        itemId: randomItem.itemId,
        quantity: 1,
        quality
      })
    }

    // tiênduyênnănglực：thánghoa lệ（yue_tu_3）thu háithập8%kháisuấtnhậnđượcthángcỏ
    if (moonHerbChance && Math.random() < 0.08) {
      inventoryStore.addItem('moon_herb', 1)
      achievementStore.discoverItem('moon_herb')
      gathered.push({ label: 'Nhận được cỏ Nguyệt', itemId: 'moon_herb', quantity: 1 })
      skillStore.addExp('foraging', 15)
    }

    if (gathered.length === 0) {
      gathered.push({ label: 'Không tìm thấy gì…', quantity: 0 })
    }

    lastResults.value = gathered
    const { leveledUp, newLevel } = skillStore.addExp('foraging', 0)
    const names = gathered
      .filter(g => g.itemId)
      .map(g => {
        const def = getItemById(g.itemId!)
        const name = def?.name ?? g.itemId!
        return g.quantity > 1 ? `${name}×${g.quantity}` : name
      })
    let msg = `Thu thập trong rừng trúc, nhận ${names.join(', ') || 'không khí'}. (-${cost} thể lực)`
    if (leveledUp) msg += ` Kỹ năng thu thập tăng lên cấp ${newLevel}!`
    addLog(msg)

    const tr = gameStore.advanceTime(forageTime.value)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) {
      handleEndDay()
      return
    }

    // tácvậtgặpgặpphánđịnh
    if (Math.random() < FOREST_ENCOUNTER_CHANCE) {
      const enc = rollForestEncounter(gameStore.season)
      if (enc) {
        if (enc.type === 'friendly') {
          encounter.value = enc
        } else {
          encounter.value = enc
          startForestCombat(enc.monster)
        }
      }
    }
  }

  // ===== 动物遭遇 =====

  const encounter = ref<{ type: 'friendly'; animal: FriendlyAnimalDef } | { type: 'hostile'; monster: MonsterDef } | null>(null)

  // --- ấmvàtácvật ---

  const handleFriendlyCollect = () => {
    if (!encounter.value || encounter.value.type !== 'friendly') return
    const animal = encounter.value.animal
    const forageAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
    let quality = skillStore.rollForageQuality(forageAllSkillsBuff)
    const walletBoost = walletStore.getForageQualityBoost()
    if (walletBoost > 0) {
      const qualityOrder: Quality[] = ['normal', 'fine', 'excellent', 'supreme']
      const idx = qualityOrder.indexOf(quality)
      const newIdx = Math.min(idx + walletBoost, qualityOrder.length - 1)
      quality = qualityOrder[newIdx]!
    }
    inventoryStore.addItem(animal.productItemId, 1, quality)
    achievementStore.discoverItem(animal.productItemId)
    useQuestStore().onItemObtained(animal.productItemId, 1)
    const { leveledUp, newLevel } = skillStore.addExp('foraging', animal.collectExp)
    const itemDef = getItemById(animal.productItemId)
    const qLabel = quality !== 'normal' ? `(${QUALITY_NAMES[quality]})` : ''
    lastResults.value.push({
      label: `Nhận ${itemDef?.name ?? animal.productItemId}${qLabel} từ ${animal.name}`,
      itemId: animal.productItemId,
      quantity: 1,
      quality
    })
    let msg = `Gặp ${animal.name} trong rừng trúc, thu được ${itemDef?.name ?? animal.productItemId}${qLabel}!`
    if (leveledUp) msg += ` Kỹ năng thu thập tăng lên cấp ${newLevel}!`
    addLog(msg)
    encounter.value = null
  }

  const handleFriendlyChase = () => {
    if (!encounter.value || encounter.value.type !== 'friendly') return
    const animal = encounter.value.animal
    const { leveledUp, newLevel } = skillStore.addExp('foraging', animal.chaseExp)
    lastResults.value.push({
      label: `Đuổi ${animal.name} đi (+${animal.chaseExp} kinh nghiệm)`,
      quantity: 0
    })
    let msg = `Gặp ${animal.name} trong rừng trúc và đuổi đi. (+${animal.chaseExp} kinh nghiệm thu thập)`
    if (leveledUp) msg += ` Kỹ năng thu thập tăng lên cấp ${newLevel}!`
    addLog(msg)
    encounter.value = null
  }

  // --- hoang dãthúchiếnđấu ---

  const miningStore = useMiningStore()
  const inForestCombat = ref(false)
  const forestCombatMonster = ref<MonsterDef | null>(null)
  const forestCombatMonsterHp = ref(0)
  const forestCombatLog = ref<string[]>([])
  const forestCombatRound = ref(0)
  const forestCombatAnimLock = ref(false)

  const forestWeaponAttack = computed(() => {
    const cookingAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
    const ringAttackBonus = inventoryStore.getRingEffectValue('attack_bonus')
    return (
      inventoryStore.getWeaponAttack() +
      (skillStore.combatLevel + cookingAllSkillsBuff) * 2 +
      ringAttackBonus +
      miningStore.guildBadgeBonusAttack
    )
  })

  const startForestCombat = (monster: MonsterDef) => {
    inForestCombat.value = true
    forestCombatMonster.value = monster
    forestCombatMonsterHp.value = monster.hp
    forestCombatLog.value = [`${monster.name} chặn đường!`]
    forestCombatRound.value = 0
  }

  const handleForestCombat = (action: CombatAction) => {
    if (!inForestCombat.value || !forestCombatMonster.value) return
    forestCombatRound.value++
    const monster = forestCombatMonster.value

    // chạy trốnchạy —— trerừng100%成công
    if (action === 'flee') {
      forestCombatLog.value.push('Bạn quay người bỏ chạy!')
      addLog(`Gặp ${monster.name} trong rừng trúc, bạn chọn bỏ chạy.`)
      endForestCombat(false)
      return
    }

    // phòngngự
    if (action === 'defend') {
      const tankReduction = skillStore.getSkill('combat').perk10 === 'tank' ? 0.7 : 0.6
      const cookingDefBuff = cookingStore.activeBuff?.type === 'defense' ? cookingStore.activeBuff.value / 100 : 0
      const ringDefenseBonus = inventoryStore.getRingEffectValue('defense_bonus')
      const damage = Math.max(
        1,
        Math.floor(
          monster.attack * (1 - tankReduction) * (1 - cookingDefBuff) * (1 - ringDefenseBonus) * (1 - miningStore.guildBonusDefense)
        )
      )
      playerStore.takeDamage(damage)
      let defendMsg = `Bạn giơ khiên phòng thủ và chịu ${damage} sát thương.`
      if (skillStore.getSkill('combat').perk5 === 'defender') {
        playerStore.restoreHealth(5)
        defendMsg += '(Hộ vệ hồi 5 HP)'
      }
      forestCombatLog.value.push(defendMsg)

      if (playerStore.hp <= 0) {
        handleForestDefeat()
        return
      }
      return
    }

    // 攻击
    const owned = inventoryStore.getEquippedWeapon()
    const weaponDef = getWeaponById(owned.defId)
    const enchant = owned.enchantmentId ? getEnchantmentById(owned.enchantmentId) : null

    const cookingAllSkillsBuff = cookingStore.activeBuff?.type === 'all_skills' ? cookingStore.activeBuff.value : 0
    const ringAttackBonus = inventoryStore.getRingEffectValue('attack_bonus')
    const baseAttack =
      inventoryStore.getWeaponAttack() +
      (skillStore.combatLevel + cookingAllSkillsBuff) * 2 +
      ringAttackBonus +
      miningStore.guildBadgeBonusAttack

    // 暴击
    const critChance = (weaponDef?.critRate ?? 0.05) + (enchant?.critBonus ?? 0)
    const isCrit = Math.random() < critChance
    const critMultiplier = isCrit ? 2.0 : 1.0
    const bruteBonus = skillStore.getSkill('combat').perk10 === 'brute' ? 1.25 : 1.0

    const playerDmg = Math.max(1, Math.floor(baseAttack * critMultiplier * bruteBonus) - monster.defense)
    // 夹在 0 以上：致死一击若让血量变成负数，胜利弹窗停留期间血条会停在旧宽度
    forestCombatMonsterHp.value = Math.max(0, forestCombatMonsterHp.value - playerDmg)
    let atkMsg = isCrit ? `Bạo kích! Gây ${playerDmg} sát thương lên ${monster.name}!` : `Gây ${playerDmg} sát thương lên ${monster.name}.`

    // 吸血附魔
    if (enchant?.special === 'vampiric' && isCrit) {
      const heal = Math.floor(playerDmg * 0.2)
      playerStore.restoreHealth(heal)
      atkMsg += ` Hút máu hồi ${heal} HP.`
    }

    forestCombatLog.value.push(atkMsg)

    // 检查野兽死亡
    if (forestCombatMonsterHp.value <= 0) {
      handleForestVictory()
      return
    }

    // 野兽反击
    const fighterReduction = skillStore.getSkill('combat').perk5 === 'fighter' ? 0.85 : 1.0
    const ringDefenseBonus = inventoryStore.getRingEffectValue('defense_bonus')
    const monsterDmg = Math.max(
      1,
      Math.floor(monster.attack * fighterReduction * (1 - ringDefenseBonus) * (1 - miningStore.guildBonusDefense))
    )
    playerStore.takeDamage(monsterDmg)
    forestCombatLog.value.push(`${monster.name} phản công, gây ${monsterDmg} sát thương!`)

    // 杂技师反击
    if (skillStore.getSkill('combat').perk10 === 'acrobat' && Math.random() < 0.25) {
      const counterDmg = Math.floor(monsterDmg * 0.5)
      forestCombatMonsterHp.value = Math.max(0, forestCombatMonsterHp.value - counterDmg)
      forestCombatLog.value.push(`Nghệ sĩ nhào lộn né đòn và phản công! Gây ${counterDmg} sát thương!`)
      if (forestCombatMonsterHp.value <= 0) {
        handleForestVictory()
        return
      }
    }

    if (playerStore.hp <= 0) {
      handleForestDefeat()
    }
  }

  const handleForestVictory = () => {
    const monster = forestCombatMonster.value!
    forestCombatLog.value.push(`Bạn đánh bại ${monster.name}!`)

    // rơirơivật
    const drops: string[] = []
    const dropRateBonus = miningStore.guildBonusDropRate
    for (const drop of monster.drops) {
      if (Math.random() < drop.chance + dropRateBonus) {
        inventoryStore.addItem(drop.itemId)
        achievementStore.discoverItem(drop.itemId)
        const itemDef = getItemById(drop.itemId)
        drops.push(itemDef?.name ?? drop.itemId)
      }
    }

    // 战斗经验
    const { leveledUp, newLevel } = skillStore.addExp('combat', monster.expReward)

    let msg = `Đánh bại ${monster.name} trong rừng trúc!`
    if (drops.length > 0) msg += ` Nhận ${drops.join(', ')}.`
    msg += ` (+${monster.expReward} kinh nghiệm chiến đấu)`
    if (leveledUp) msg += ` Kỹ năng chiến đấu tăng lên cấp ${newLevel}!`
    addLog(msg)

    // kéo dàitrễquan hệđóngđểchơinhàxemđếnkếtquả
    forestCombatAnimLock.value = true
    setTimeout(() => {
      endForestCombat(false)
    }, 1200)
  }

  const handleForestDefeat = () => {
    const monster = forestCombatMonster.value!
    forestCombatLog.value.push(`Bạn bị ${monster.name} đánh bại…`)

    // phạtphạt：tổn thấtmấtvàngtiền
    const moneyLoss = Math.min(Math.floor(playerStore.money * FOREST_DEFEAT_MONEY_PENALTY_RATE), FOREST_DEFEAT_MONEY_PENALTY_CAP)
    if (moneyLoss > 0) playerStore.spendMoney(moneyLoss)

    // thanhlépbảnlầnthu háithậpkếtquả
    lastResults.value = [{ label: `Bị ${monster.name} đánh bại, vật thu thập rơi tung tóe…`, quantity: 0 }]

    // HPhồi phụchồi50%
    playerStore.restoreHealth(Math.floor(playerStore.getMaxHp() * 0.5))

    let msg = `Bị ${monster.name} đánh bại trong rừng trúc…`
    if (moneyLoss > 0) msg += ` Mất ${moneyLoss} văn.`
    msg += ' Tất cả vật thu thập đều rơi mất.'
    addLog(msg)

    forestCombatAnimLock.value = true
    setTimeout(() => {
      endForestCombat(false)
    }, 1200)
  }

  const endForestCombat = (_won: boolean) => {
    inForestCombat.value = false
    forestCombatMonster.value = null
    forestCombatMonsterHp.value = 0
    forestCombatLog.value = []
    forestCombatRound.value = 0
    forestCombatAnimLock.value = false
    encounter.value = null
  }
</script>
