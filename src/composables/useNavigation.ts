import type { Component } from 'vue'
import router from '@/router'
import { useGameStore } from '@/stores/useGameStore'
import { isShopOpen, TAB_TO_LOCATION_GROUP } from '@/data/timeConstants'
import { addLog, showFloat } from './useGameLog'
import { handleEndDay } from './useEndDay'
import { sfxClick, useAudio } from './useAudio'
import { setClockBlocker } from './useGameClock'
import { useTutorialStore } from '@/stores/useTutorialStore'
import {
  Wheat,
  Egg,
  Home,
  Heart,
  Building,
  Users,
  Store,
  TreePine,
  Fish,
  Pickaxe,
  Flame,
  Cog,
  Wrench,
  Package,
  Star,
  BookOpen,
  Wallet,
  ScrollText,
  User,
  FlaskConical,
  Landmark,
  Swords,
  Tent,
  Waves
} from 'lucide-vue-next'
import { useNpcStore } from '@/stores/useNpcStore'

export type PanelKey =
  | 'farm'
  | 'shop'
  | 'inventory'
  | 'fishing'
  | 'mining'
  | 'village'
  | 'cooking'
  | 'forage'
  | 'upgrade'
  | 'skills'
  | 'workshop'
  | 'achievement'
  | 'animal'
  | 'home'
  | 'wallet'
  | 'quest'
  | 'charinfo'
  | 'breeding'
  | 'museum'
  | 'guild'
  | 'hanhai'
  | 'fishpond'
  | 'cottage'

export const TABS: {
  key: PanelKey
  label: string
  icon: Component
  getIcon?: () => Component
}[] = [
  { key: 'farm', label: 'Nông trại', icon: Wheat },
  { key: 'animal', label: 'Mục trường', icon: Egg },
  {
    key: 'cottage',
    label: 'Nhà',
    icon: Home,
    getIcon: () => (useNpcStore().getSpouse() ? Heart : Home)
  },
  { key: 'home', label: 'Công trình', icon: Building },
  { key: 'breeding', label: 'Nhân giống', icon: FlaskConical },
  { key: 'fishpond', label: 'Ao cá', icon: Waves },
  { key: 'village', label: 'Làng Đào Nguyên', icon: Users },
  { key: 'shop', label: 'Khu thương mại', icon: Store },
  { key: 'forage', label: 'Rừng trúc', icon: TreePine },
  { key: 'fishing', label: 'Thanh Khê', icon: Fish },
  { key: 'mining', label: 'Hang mỏ', icon: Pickaxe },
  { key: 'cooking', label: 'Bếp', icon: Flame },
  { key: 'workshop', label: 'Xưởng chế biến', icon: Cog },
  { key: 'upgrade', label: 'Xưởng', icon: Wrench },
  { key: 'charinfo', label: 'Nhân vật', icon: User },
  { key: 'inventory', label: 'Balo', icon: Package },
  { key: 'skills', label: 'Kỹ năng', icon: Star },
  { key: 'achievement', label: 'Bộ sưu tập', icon: BookOpen },
  { key: 'wallet', label: 'Túi tiền', icon: Wallet },
  { key: 'quest', label: 'Bảng thông báo', icon: ScrollText },
  { key: 'museum', label: 'Bảo tàng', icon: Landmark },
  { key: 'guild', label: 'Công hội', icon: Swords },
  { key: 'hanhai', label: 'Hãn Hải', icon: Tent }
]

/** 导航到游戏面板，检查旅行时间、就寝时间和商店营业时间 */
export const navigateToPanel = (panelKey: PanelKey) => {
  const gameStore = useGameStore()
  const { startBgm } = useAudio()

  if (gameStore.isPastBedtime) {
    addLog('Đã 2 giờ sáng rồi, bạn phải nghỉ ngơi.')
    handleEndDay()
    return
  }

  // 商店营业检查
  const shopCheck = isShopOpen(panelKey, gameStore.day, gameStore.hour)
  if (!shopCheck.open) {
    showFloat(shopCheck.reason!, 'danger')
    return
  }

  // 旅行时间
  const travelResult = gameStore.travelTo(panelKey)
  if (travelResult.timeCost > 0) {
    addLog(travelResult.message)
  }
  if (travelResult.passedOut) {
    handleEndDay()
    return
  }

  sfxClick()
  startBgm()
  void router.push({ name: panelKey })
  useTutorialStore().markPanelVisited(panelKey)

  // 纯 UI 面板（无对应地点）暂停时钟，回到游戏面板时解除
  const targetGroup = TAB_TO_LOCATION_GROUP[panelKey]
  setClockBlocker('panel', targetGroup === null || targetGroup === undefined)
}

export const useNavigation = () => {
  return {
    TABS,
    navigateToPanel
  }
}
