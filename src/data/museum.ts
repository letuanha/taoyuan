import type { MuseumItemDef, MuseumMilestone } from '@/types'

/** 博物馆可捐赠物品全目录 */
export const MUSEUM_ITEMS: MuseumItemDef[] = [
  // ===== 矿石 (7) =====
  {
    id: 'copper_ore',
    name: 'Quặng đồng',
    category: 'ore',
    sourceHint: 'Thu thập tầng nông hầm mỏ'
  },
  {
    id: 'iron_ore',
    name: 'Quặng sắt',
    category: 'ore',
    sourceHint: 'Thu thập tầng băng giá hầm mỏ'
  },
  {
    id: 'gold_ore',
    name: 'Quặng vàng',
    category: 'ore',
    sourceHint: 'Thu thập tầng dung nham hầm mỏ'
  },
  {
    id: 'crystal_ore',
    name: 'Quặng pha lê',
    category: 'ore',
    sourceHint: 'Thu thập tầng pha lê hầm mỏ'
  },
  {
    id: 'shadow_ore',
    name: 'Quặng bóng tối',
    category: 'ore',
    sourceHint: 'Thu thập tầng bóng tối hầm mỏ'
  },
  {
    id: 'void_ore',
    name: 'Quặng hư không',
    category: 'ore',
    sourceHint: 'Thu thập tầng vực sâu hầm mỏ'
  },
  {
    id: 'iridium_ore',
    name: 'Quặng Iridium',
    category: 'ore',
    sourceHint: 'Thu thập Hang Mỏ Xương'
  },

  // ===== 宝石 (7) =====
  { id: 'quartz', name: 'Thạch anh', category: 'gem', sourceHint: 'Thu thập ở các tầng hầm mỏ' },
  { id: 'jade', name: 'Phỉ thúy', category: 'gem', sourceHint: 'Dưới tầng băng giá hầm mỏ' },
  { id: 'ruby', name: 'Hồng ngọc', category: 'gem', sourceHint: 'Dưới tầng dung nham hầm mỏ' },
  {
    id: 'moonstone',
    name: 'Đá Nguyệt Quang',
    category: 'gem',
    sourceHint: 'Tầng pha lê hầm mỏ'
  },
  { id: 'obsidian', name: 'Đá hắc diện', category: 'gem', sourceHint: 'Tầng bóng tối hầm mỏ' },
  {
    id: 'dragon_jade',
    name: 'Long Ngọc',
    category: 'gem',
    sourceHint: 'Tầng vực sâu hầm mỏ'
  },
  {
    id: 'prismatic_shard',
    name: 'Mảnh Vỡ Ngũ Sắc',
    category: 'gem',
    sourceHint: 'Cực kỳ hiếm, rương báu tầng sâu'
  },

  // ===== 金属锭 (4) =====
  {
    id: 'copper_bar',
    name: 'Thỏi Đồng',
    category: 'bar',
    sourceHint: 'Luyện quặng đồng bằng lò'
  },
  { id: 'iron_bar', name: 'Thỏi Sắt', category: 'bar', sourceHint: 'Luyện quặng sắt bằng lò' },
  { id: 'gold_bar', name: 'Thỏi Vàng', category: 'bar', sourceHint: 'Luyện quặng vàng bằng lò' },
  {
    id: 'iridium_bar',
    name: 'Thỏi Iridium',
    category: 'bar',
    sourceHint: 'Luyện quặng iridi bằng lò'
  },

  // ===== 化石 (8) =====
  {
    id: 'trilobite_fossil',
    name: 'Hóa thạch bọ ba thùy',
    category: 'fossil',
    sourceHint: 'Rương báu tầng nông/tầng băng giá'
  },
  {
    id: 'amber',
    name: 'Hổ phách',
    category: 'fossil',
    sourceHint: 'Vật phẩm rơi ở tầng sông ngầm'
  },
  {
    id: 'ammonite_fossil',
    name: 'Hóa thạch cúc đá',
    category: 'fossil',
    sourceHint: 'Rương báu tầng dung nham / pha lê'
  },
  {
    id: 'fern_fossil',
    name: 'Hóa thạch lá dương xỉ',
    category: 'fossil',
    sourceHint: 'Thu thập hiếm ở rừng trúc'
  },
  {
    id: 'shell_fossil',
    name: 'Hóa thạch vỏ ốc',
    category: 'fossil',
    sourceHint: 'Rương báu tầng nông/tầng băng giá'
  },
  {
    id: 'bone_fragment',
    name: 'Mảnh vụn xương cốt',
    category: 'fossil',
    sourceHint: 'Rơi hiếm từ quái vật tầng sâu'
  },
  {
    id: 'petrified_wood',
    name: 'Gỗ hóa đá',
    category: 'fossil',
    sourceHint: 'Thu thập hiếm ở rừng trúc'
  },
  {
    id: 'dragon_tooth',
    name: 'Hóa thạch nanh rồng',
    category: 'fossil',
    sourceHint: 'Rương tầng vực sâu hoặc rơi từ rồng xương'
  },

  // ===== 古物 (10) =====
  {
    id: 'ancient_pottery',
    name: 'Mảnh gốm cổ',
    category: 'artifact',
    sourceHint: 'Thu thập hiếm ở rừng trúc'
  },
  {
    id: 'jade_disc',
    name: 'Mảnh vỡ ngọc bích',
    category: 'artifact',
    sourceHint: 'Rương tầng pha lê'
  },
  {
    id: 'bronze_mirror',
    name: 'Gương đồng',
    category: 'artifact',
    sourceHint: 'Rương báu tầng dung nham'
  },
  {
    id: 'ancient_coin',
    name: 'Đồng tiền cổ',
    category: 'artifact',
    sourceHint: 'Vật phẩm rơi ở tầng sông ngầm'
  },
  {
    id: 'oracle_bone',
    name: 'Mảnh giáp cốt',
    category: 'artifact',
    sourceHint: 'Rương tầng bóng tối'
  },
  {
    id: 'jade_pendant',
    name: 'Ngọc bội',
    category: 'artifact',
    sourceHint: 'Rơi ở tầng pha lê'
  },
  {
    id: 'ancient_seed',
    name: 'Hạt giống viễn cổ',
    category: 'artifact',
    sourceHint: 'Cực hiếm từ rương tầng sâu'
  },
  {
    id: 'bamboo_scroll',
    name: 'Thẻ tre',
    category: 'artifact',
    sourceHint: 'Thu thập hiếm ở rừng trúc'
  },
  {
    id: 'stone_axe_head',
    name: 'Rìu đá',
    category: 'artifact',
    sourceHint: 'Thu thập hiếm ở rừng trúc'
  },
  {
    id: 'painted_pottery',
    name: 'Mảnh gốm màu',
    category: 'artifact',
    sourceHint: 'Rương báu tầng dung nham'
  },

  // ===== 仙灵 (4) =====
  {
    id: 'fox_bead',
    name: 'Hồ châu',
    category: 'spirit',
    sourceHint: 'Sâu trong hầm mỏ (manh mối hồ ly)'
  },
  {
    id: 'spirit_peach',
    name: 'Linh đào',
    category: 'spirit',
    sourceHint: 'Có xác suất nhận được từ cây đào sau khi được Đào Yêu ban phúc'
  },
  {
    id: 'moon_herb',
    name: 'Nguyệt thảo',
    category: 'spirit',
    sourceHint: 'Có xác suất nhận được khi thu thập sau khi được Thỏ Nguyệt ban phúc'
  },
  {
    id: 'dream_silk',
    name: 'Mộng ty',
    category: 'spirit',
    sourceHint: 'Có xác suất nhận được từ máy dệt sau khi được Quy Nữ ban phúc'
  }
]

/** 博物馆分类标签 */
export const MUSEUM_CATEGORIES = [
  { key: 'ore' as const, label: 'Quặng' },
  { key: 'gem' as const, label: 'Đá quý' },
  { key: 'bar' as const, label: 'Thỏi kim loại' },
  { key: 'fossil' as const, label: 'Hóa thạch' },
  { key: 'artifact' as const, label: 'Cổ vật' },
  { key: 'spirit' as const, label: 'Tiên linh' }
]

/** 博物馆里程碑奖励 */
export const MUSEUM_MILESTONES: MuseumMilestone[] = [
  { count: 5, name: 'Mới nhập môn', reward: { money: 300 } },
  {
    count: 10,
    name: 'Có chút sưu tầm',
    reward: { money: 500, items: [{ itemId: 'ancient_seed', quantity: 1 }] }
  },
  { count: 15, name: 'Nhà thưởng thức quặng', reward: { money: 1000 } },
  {
    count: 20,
    name: 'Thông kim bác cổ',
    reward: {
      money: 1500,
      items: [{ itemId: 'prismatic_shard', quantity: 1 }]
    }
  },
  { count: 25, name: 'Người bảo vệ cổ vật', reward: { money: 3000 } },
  {
    count: 30,
    name: 'Khám phá thời viễn cổ',
    reward: { money: 5000, items: [{ itemId: 'iridium_bar', quantity: 3 }] }
  },
  { count: 36, name: 'Ngôi sao bảo tàng', reward: { money: 10000 } },
  {
    count: 40,
    name: 'Linh vật toàn giám',
    reward: { money: 8000, items: [{ itemId: 'moonstone', quantity: 3 }] }
  }
]

/** 根据ID查找博物馆物品 */
export const getMuseumItemById = (id: string): MuseumItemDef | undefined => MUSEUM_ITEMS.find(item => item.id === id)
