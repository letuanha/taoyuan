/**
 * 马匹品种。
 *
 * 原先马只有一种、只影响赶路速度，好感度养满也毫无回报。
 * 这里给出三个档次：普通马可以直接买，好马要靠稀有渠道换，
 * 并让好感度真正起作用——熟悉主人的马赶路更省力，放牧时还会帮着把牲口拢住。
 */
export type HorseBreed = 'common' | 'steppe' | 'cloud' | 'divine'

export interface HorseBreedDef {
  id: HorseBreed
  name: string
  description: string
  /** 旅行耗时倍率，越低越快 */
  travelTimeMultiplier: number
  /** 旅行体力消耗倍率 */
  travelStaminaMultiplier: number
  /** 放牧时每头牲畜额外产出的触发概率 */
  grazeBonusChance: number
  /** 获取途径说明 */
  sourceHint: string
}

export const HORSE_BREEDS: HorseBreedDef[] = [
  {
    id: 'common',
    name: 'Ngựa thường',
    description: 'Ngựa thồ thường thấy trong làng, tính hiền, đi nhanh hơn đi bộ.',
    travelTimeMultiplier: 0.7,
    travelStaminaMultiplier: 0.5,
    grazeBonusChance: 0.05,
    sourceHint: 'Mua tại chuồng ngựa'
  },
  {
    id: 'steppe',
    name: 'Ngựa thảo nguyên',
    description: 'Tuấn mã do thương đội Hãn Hải mang tới, sức bền cực tốt.',
    travelTimeMultiplier: 0.55,
    travelStaminaMultiplier: 0.4,
    grazeBonusChance: 0.12,
    sourceHint: 'Đổi bằng điểm thương mại Hãn Hải'
  },
  {
    id: 'cloud',
    name: 'Tuấn mã Đạp Vân',
    description: 'Tương truyền có thể đạp mây mà đi, vó ngựa sinh gió.',
    travelTimeMultiplier: 0.4,
    travelStaminaMultiplier: 0.3,
    grazeBonusChance: 0.2,
    sourceHint: 'Phần thưởng cấp cao của Hội Mạo hiểm'
  },
  {
    id: 'divine',
    name: 'Long câu',
    description: 'Tương truyền hóa từ long chủng, hiểu lòng người và biết đường về.',
    travelTimeMultiplier: 0.3,
    travelStaminaMultiplier: 0.2,
    grazeBonusChance: 0.3,
    sourceHint: 'Tặng sau khi kết duyên tiên duyên với Long Linh'
  }
]

export const getHorseBreed = (id: HorseBreed | undefined): HorseBreedDef => {
  return HORSE_BREEDS.find(b => b.id === id) ?? HORSE_BREEDS[0]!
}

/**
 * 好感度对马匹能力的加成系数（0~1）。
 * 满好感时再额外减免一成耗时与体力，并提升放牧协助概率。
 */
export const getHorseBondFactor = (friendship: number): number => {
  return Math.min(1, Math.max(0, friendship / 1000))
}

/** 马匹好感带来的额外耗时减免上限 */
export const HORSE_BOND_TIME_BONUS = 0.1

/** 马匹好感带来的额外体力减免上限 */
export const HORSE_BOND_STAMINA_BONUS = 0.15

/** 马匹好感带来的额外放牧协助概率上限 */
export const HORSE_BOND_GRAZE_BONUS = 0.15
