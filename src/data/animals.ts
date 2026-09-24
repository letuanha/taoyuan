import type { AnimalBuildingDef, AnimalDef, AnimalBuildingType, AnimalType } from '@/types'

/**
 * 每级畜舍容纳的牲畜数。
 * 原先固定「等级 × 4」，满级也只有 12 只，牧场后期完全放不下。
 */
export const BUILDING_CAPACITY_PER_LEVEL = 6

/** 畜舍定义 */
export const ANIMAL_BUILDINGS: AnimalBuildingDef[] = [
  {
    type: 'coop',
    name: 'Chuồng gà',
    description: 'Nuôi gà, vịt và gia cầm nhỏ.',
    capacity: 6,
    cost: 4000,
    materialCost: [
      { itemId: 'wood', quantity: 100 },
      { itemId: 'bamboo', quantity: 50 }
    ]
  },
  {
    type: 'barn',
    name: 'Chuồng gia súc',
    description: 'Nuôi bò, dê và gia súc lớn.',
    capacity: 6,
    cost: 6000,
    materialCost: [
      { itemId: 'wood', quantity: 150 },
      { itemId: 'iron_ore', quantity: 20 }
    ]
  },
  {
    type: 'stable',
    name: 'Chuồng ngựa',
    description: 'Nuôi ngựa, cưỡi ngựa đi lại nhanh hơn.',
    capacity: 1,
    cost: 10000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'iron_ore', quantity: 30 }
    ]
  }
]

/** 动物定义 */
export const ANIMAL_DEFS: AnimalDef[] = [
  // ===== 鸡舍动物 (8种) =====
  {
    type: 'chicken',
    name: 'Gà',
    building: 'coop',
    cost: 800,
    productId: 'egg',
    productName: 'Trứng Gà',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'duck',
    name: 'Vịt',
    building: 'coop',
    cost: 1200,
    productId: 'duck_egg',
    productName: 'Trứng Vịt',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'rabbit',
    name: 'Thỏ',
    building: 'coop',
    cost: 2000,
    productId: 'rabbit_fur',
    productName: 'Lông Thỏ',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'goose',
    name: 'Ngỗng',
    building: 'coop',
    cost: 1500,
    productId: 'goose_egg',
    productName: 'Trứng Ngỗng',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'quail',
    name: 'Chim cút',
    building: 'coop',
    cost: 500,
    productId: 'quail_egg',
    productName: 'Trứng Cút',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'pigeon',
    name: 'Bồ câu',
    building: 'coop',
    cost: 1000,
    productId: 'pigeon_egg',
    productName: 'Trứng Bồ Câu',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'silkie',
    name: 'Gà ác',
    building: 'coop',
    cost: 3000,
    productId: 'silkie_egg',
    productName: 'Trứng Gà Ác',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'peacock',
    name: 'Công',
    building: 'coop',
    cost: 8000,
    productId: 'peacock_feather',
    productName: 'Lông Khổng Tước',
    produceDays: 4,
    friendship: { min: 0, max: 1000 }
  },
  // ===== 牲口棚动物 (11种) =====
  {
    type: 'cow',
    name: 'Bò',
    building: 'barn',
    cost: 1500,
    productId: 'milk',
    productName: 'Sữa Bò',
    produceDays: 1,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'sheep',
    name: 'Cừu',
    building: 'barn',
    cost: 8000,
    productId: 'wool',
    productName: 'Len Cừu',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'goat',
    name: 'Dê',
    building: 'barn',
    cost: 4000,
    productId: 'goat_milk',
    productName: 'Sữa Dê',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'pig',
    name: 'Lợn',
    building: 'barn',
    cost: 16000,
    productId: 'truffle',
    productName: 'Nấm Truffle',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'buffalo',
    name: 'Trâu nước',
    building: 'barn',
    cost: 3000,
    productId: 'buffalo_milk',
    productName: 'Sữa Trâu Nước',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'yak',
    name: 'Bò Tây Tạng',
    building: 'barn',
    cost: 5000,
    productId: 'yak_milk',
    productName: 'Sữa Bò Tây Tạng',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'alpaca',
    name: 'Lạc đà Alpaca',
    building: 'barn',
    cost: 6000,
    productId: 'alpaca_wool',
    productName: 'Lông Alpaca',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'deer',
    name: 'Hươu',
    building: 'barn',
    cost: 12000,
    productId: 'antler_velvet',
    productName: 'Lộc Nhung',
    produceDays: 5,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'donkey',
    name: 'Lừa',
    building: 'barn',
    cost: 3000,
    productId: 'donkey_milk',
    productName: 'Sữa Lừa',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'camel',
    name: 'Lạc đà',
    building: 'barn',
    cost: 7000,
    productId: 'camel_milk',
    productName: 'Sữa Lạc Đà',
    produceDays: 2,
    friendship: { min: 0, max: 1000 }
  },
  {
    type: 'ostrich',
    name: 'Đà điểu',
    building: 'barn',
    cost: 10000,
    productId: 'ostrich_egg',
    productName: 'Trứng Đà Điểu',
    produceDays: 3,
    friendship: { min: 0, max: 1000 }
  },
  // ===== 马厩 (1种) =====
  {
    type: 'horse',
    name: 'Ngựa',
    building: 'stable',
    cost: 5000,
    productId: '',
    productName: '',
    produceDays: 0,
    friendship: { min: 0, max: 1000 }
  }
]

/** 干草物品ID */
export const HAY_ITEM_ID = 'hay'

/** 干草购买价格 */
export const HAY_PRICE = 50

export const PREMIUM_FEED_ID = 'premium_feed'
export const NOURISHING_FEED_ID = 'nourishing_feed'
export const VITALITY_FEED_ID = 'vitality_feed'

/** 所有饲料定义（UI 遍历用） */
export const FEED_DEFS: {
  id: string
  name: string
  price: number
  description: string
}[] = [
  { id: 'hay', name: 'Cỏ Khô', price: 50, description: 'Hay cho chăn nuôi.' },
  {
    id: 'premium_feed',
    name: 'Thức Ăn Tinh Chất',
    price: 200,
    description: 'Thức ăn chất lượng cao được phối trộn kỹ lưỡng, tăng rõ rệt tâm trạng và độ thiện cảm của động vật.'
  },
  {
    id: 'nourishing_feed',
    name: 'Thức Ăn Bồi Bổ',
    price: 250,
    description: 'Thức ăn được thêm thành phần bổ dưỡng, đẩy nhanh chu kỳ sản sinh của động vật.'
  },
  {
    id: 'vitality_feed',
    name: 'Thức Ăn Sinh Lực',
    price: 300,
    description: 'Thức ăn chứa tinh chất thảo dược, sau khi cho ăn chắc chắn sẽ chữa khỏi bệnh tật.'
  }
]

export const getAnimalDef = (type: string): AnimalDef | undefined => {
  return ANIMAL_DEFS.find(d => d.type === type)
}

export const getBuildingDef = (type: string): AnimalBuildingDef | undefined => {
  return ANIMAL_BUILDINGS.find(b => b.type === type)
}

/** 畜舍升级定义：容量 = 等级 × BUILDING_CAPACITY_PER_LEVEL */
export const BUILDING_UPGRADES: {
  type: AnimalBuildingType
  level: number
  name: string
  capacity: number
  cost: number
  materialCost: { itemId: string; quantity: number }[]
}[] = [
  {
    type: 'coop',
    level: 2,
    name: 'Chuồng gà lớn',
    capacity: 12,
    cost: 10000,
    materialCost: [
      { itemId: 'wood', quantity: 200 },
      { itemId: 'iron_ore', quantity: 15 }
    ]
  },
  {
    type: 'coop',
    level: 3,
    name: 'Chuồng gà sang trọng',
    capacity: 18,
    cost: 20000,
    materialCost: [
      { itemId: 'wood', quantity: 300 },
      { itemId: 'gold_ore', quantity: 10 }
    ]
  },
  {
    type: 'barn',
    level: 2,
    name: 'Chuồng gia súc lớn',
    capacity: 12,
    cost: 12000,
    materialCost: [
      { itemId: 'wood', quantity: 250 },
      { itemId: 'iron_ore', quantity: 25 }
    ]
  },
  {
    type: 'barn',
    level: 3,
    name: 'Chuồng gia súc sang trọng',
    capacity: 18,
    cost: 25000,
    materialCost: [
      { itemId: 'wood', quantity: 400 },
      { itemId: 'gold_ore', quantity: 15 }
    ]
  }
]

export const getBuildingUpgrade = (type: AnimalBuildingType, toLevel: number) => {
  return BUILDING_UPGRADES.find(u => u.type === type && u.level === toLevel)
}

/** 孵化映射：蛋 → 动物类型 + 孵化天数 + 所属建筑 */
export const INCUBATION_MAP: Record<string, { animalType: AnimalType; days: number; building: AnimalBuildingType }> = {
  egg: { animalType: 'chicken', days: 5, building: 'coop' },
  duck_egg: { animalType: 'duck', days: 7, building: 'coop' },
  goose_egg: { animalType: 'goose', days: 6, building: 'coop' },
  quail_egg: { animalType: 'quail', days: 4, building: 'coop' },
  pigeon_egg: { animalType: 'pigeon', days: 5, building: 'coop' },
  silkie_egg: { animalType: 'silkie', days: 6, building: 'coop' },
  ostrich_egg: { animalType: 'ostrich', days: 10, building: 'barn' }
}
