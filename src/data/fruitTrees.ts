import type { FruitTreeDef } from '@/types'

/** 果树定义 */
export const FRUIT_TREE_DEFS: FruitTreeDef[] = [
  {
    type: 'peach_tree',
    name: 'Cây đào',
    saplingId: 'sapling_peach',
    saplingPrice: 300,
    fruitId: 'tree_peach',
    fruitName: 'Đào tươi',
    fruitSeason: 'spring',
    growthDays: 28,
    fruitSellPrice: 60
  },
  {
    type: 'lychee_tree',
    name: 'Cây vải',
    saplingId: 'sapling_lychee',
    saplingPrice: 400,
    fruitId: 'lychee',
    fruitName: 'Vải',
    fruitSeason: 'summer',
    growthDays: 28,
    fruitSellPrice: 80
  },
  {
    type: 'mandarin_tree',
    name: 'Cây quýt',
    saplingId: 'sapling_mandarin',
    saplingPrice: 350,
    fruitId: 'mandarin',
    fruitName: 'Cam',
    fruitSeason: 'autumn',
    growthDays: 28,
    fruitSellPrice: 70
  },
  {
    type: 'plum_tree',
    name: 'Cây mơ',
    saplingId: 'sapling_plum',
    saplingPrice: 500,
    fruitId: 'plum_blossom',
    fruitName: 'Hoa mai',
    fruitSeason: 'winter',
    growthDays: 28,
    fruitSellPrice: 100
  },
  {
    type: 'apricot_tree',
    name: 'Cây mơ vàng',
    saplingId: 'sapling_apricot',
    saplingPrice: 350,
    fruitId: 'apricot',
    fruitName: 'Mơ',
    fruitSeason: 'spring',
    growthDays: 28,
    fruitSellPrice: 55
  },
  {
    type: 'pomegranate_tree',
    name: 'Cây lựu',
    saplingId: 'sapling_pomegranate',
    saplingPrice: 500,
    fruitId: 'pomegranate',
    fruitName: 'Lựu',
    fruitSeason: 'summer',
    growthDays: 28,
    fruitSellPrice: 95
  },
  {
    type: 'persimmon_tree',
    name: 'Cây hồng',
    saplingId: 'sapling_persimmon',
    saplingPrice: 400,
    fruitId: 'persimmon',
    fruitName: 'Hồng tươi',
    fruitSeason: 'autumn',
    growthDays: 28,
    fruitSellPrice: 85
  },
  {
    type: 'hawthorn_tree',
    name: 'Cây táo gai',
    saplingId: 'sapling_hawthorn',
    saplingPrice: 350,
    fruitId: 'hawthorn',
    fruitName: 'Táo gai',
    fruitSeason: 'winter',
    growthDays: 28,
    fruitSellPrice: 65
  }
]

/** 最大果树数量 */
/** 果树位置上限：取 9 的倍数，方便按 3×3 成片规划 */
export const MAX_FRUIT_TREES = 9

export const getFruitTreeDef = (type: string): FruitTreeDef | undefined => {
  return FRUIT_TREE_DEFS.find(d => d.type === type)
}
