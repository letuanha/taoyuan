import type { MonsterGoalDef, GuildShopItemDef, GuildDonationDef, GuildLevelDef } from '@/types'

/** 怪物讨伐目标 */
export const MONSTER_GOALS: MonsterGoalDef[] = [
  // ===== 浅层 =====
  {
    monsterId: 'mud_worm',
    monsterName: 'Trùn đất',
    zone: 'shallow',
    killTarget: 25,
    reward: { money: 200 },
    description: 'Tiêu diệt sâu bùn tầng nông.'
  },
  {
    monsterId: 'stone_crab',
    monsterName: 'Cua đá',
    zone: 'shallow',
    killTarget: 25,
    reward: { money: 300 },
    description: 'Tiêu diệt cua đá tầng nông.'
  },
  // ===== 冰霜 =====
  {
    monsterId: 'ice_bat',
    monsterName: 'Dơi băng',
    zone: 'frost',
    killTarget: 25,
    reward: { money: 500 },
    description: 'Hạ dơi băng tầng băng giá.'
  },
  {
    monsterId: 'ghost',
    monsterName: 'U linh',
    zone: 'frost',
    killTarget: 25,
    reward: { money: 500 },
    description: 'Xua đuổi hồn ma tầng băng giá.'
  },
  // ===== 熔岩 =====
  {
    monsterId: 'fire_bat',
    monsterName: 'Dơi lửa',
    zone: 'lava',
    killTarget: 50,
    reward: { money: 800 },
    description: 'Đẩy lùi dơi lửa tầng dung nham.'
  },
  {
    monsterId: 'shadow_warrior',
    monsterName: 'Chiến sĩ bóng tối',
    zone: 'lava',
    killTarget: 50,
    reward: { money: 1000 },
    description: 'Đánh bại võ sĩ bóng tối tầng dung nham.'
  },
  // ===== 水晶 =====
  {
    monsterId: 'crystal_golem',
    monsterName: 'Ma tượng pha lê',
    zone: 'crystal',
    killTarget: 50,
    reward: { money: 1500 },
    description: 'Đập tan golem tầng pha lê.'
  },
  {
    monsterId: 'prism_spider',
    monsterName: 'Nhện lăng kính',
    zone: 'crystal',
    killTarget: 50,
    reward: { money: 1500 },
    description: 'Tiêu diệt nhện lăng kính tầng pha lê.'
  },
  // ===== 暗影 =====
  {
    monsterId: 'shadow_lurker',
    monsterName: 'Kẻ rình rập bóng tối',
    zone: 'shadow',
    killTarget: 75,
    reward: { money: 2000 },
    description: 'Săn kẻ ẩn nấp tầng bóng tối.'
  },
  {
    monsterId: 'void_wraith',
    monsterName: 'U hồn hư không',
    zone: 'shadow',
    killTarget: 75,
    reward: { money: 2500 },
    description: 'Thanh tẩy u hồn hư không tầng bóng tối.'
  },
  // ===== 深渊 =====
  {
    monsterId: 'abyss_serpent',
    monsterName: 'Cự mãng vực thẳm',
    zone: 'abyss',
    killTarget: 100,
    reward: { money: 3000 },
    description: 'Chinh phạt mãng xà khổng lồ tầng vực sâu.'
  },
  {
    monsterId: 'bone_dragon',
    monsterName: 'Cốt Long',
    zone: 'abyss',
    killTarget: 100,
    reward: { money: 4000 },
    description: 'Đánh bại rồng xương tầng vực sâu.'
  },
  // ===== BOSS =====
  {
    monsterId: 'mud_golem',
    monsterName: 'Cự thú bùn đá',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 500, items: [{ itemId: 'copper_bar', quantity: 10 }] },
    description: 'Đánh bại thú đá bùn 3 lần.'
  },
  {
    monsterId: 'frost_queen',
    monsterName: 'Nữ hoàng Băng Giá',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 800, items: [{ itemId: 'iron_bar', quantity: 10 }] },
    description: 'Đánh bại Nữ hoàng Băng giá 3 lần.'
  },
  {
    monsterId: 'lava_lord',
    monsterName: 'Chúa tể Dung Nham',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 1500, items: [{ itemId: 'gold_bar', quantity: 10 }] },
    description: 'Đánh bại Chúa tể Dung nham 3 lần.'
  },
  {
    monsterId: 'crystal_king',
    monsterName: 'Vua Pha Lê',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 2500, items: [{ itemId: 'moonstone', quantity: 3 }] },
    description: 'Đánh bại Vua Pha lê 3 lần.'
  },
  {
    monsterId: 'shadow_sovereign',
    monsterName: 'Chúa tể Bóng Tối',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 4000, items: [{ itemId: 'obsidian', quantity: 3 }] },
    description: 'Đánh bại Chúa tể Bóng tối 3 lần.'
  },
  {
    monsterId: 'abyss_dragon',
    monsterName: 'Long Vương Vực Thẳm',
    zone: 'boss',
    killTarget: 3,
    reward: { money: 6000, items: [{ itemId: 'dragon_jade', quantity: 2 }] },
    description: 'Đánh bại Long vương Vực sâu 3 lần.'
  },
  // ===== 骷髅矿穴 =====
  {
    monsterId: 'iridium_golem',
    monsterName: 'Ma tượng Iridium',
    zone: 'skull',
    killTarget: 50,
    reward: { money: 3000 },
    description: 'Chinh phạt golem iridi trong Hang Mỏ Xương.'
  },
  {
    monsterId: 'skull_serpent',
    monsterName: 'Phi xà đầu lâu',
    zone: 'skull',
    killTarget: 50,
    reward: { money: 3000 },
    description: 'Tiêu diệt rắn bay xương trong Hang Mỏ Xương.'
  },
  {
    monsterId: 'ancient_mummy',
    monsterName: 'Xác ướp viễn cổ',
    zone: 'skull',
    killTarget: 50,
    reward: { money: 5000 },
    description: 'Đánh bại xác ướp cổ đại trong Hang Mỏ Xương.'
  }
]

/** 公会商店物品 (与镖局互补，不重复) */
export const GUILD_SHOP_ITEMS: GuildShopItemDef[] = [
  // --- 消耗品（铜钱购买，不限购）---
  {
    itemId: 'combat_tonic',
    name: 'Thuốc Bổ Trợ Chiến Đấu',
    price: 200,
    description: 'Hồi phục 30 điểm HP.'
  },
  {
    itemId: 'adventurer_ration',
    name: 'Lương Khô Thám Hiểm',
    price: 350,
    description: 'Hồi phục 25 thể lực và 25 HP.',
    unlockGuildLevel: 2
  },
  {
    itemId: 'fortify_brew',
    name: 'Thuốc Tăng Lực',
    price: 500,
    description: 'Hồi phục 60 điểm HP.'
  },
  {
    itemId: 'ironhide_potion',
    name: 'Dược Tề Thiết Bích',
    price: 800,
    description: 'Hồi phục toàn bộ HP.'
  },
  {
    itemId: 'warriors_feast',
    name: 'Yến Tiệc Dũng Sĩ',
    price: 1000,
    description: 'Hồi phục 50 thể lực và 50 HP.',
    unlockGuildLevel: 5
  },
  {
    itemId: 'slayer_charm',
    name: 'Phù Săn Ma',
    price: 1500,
    description: 'Tỷ lệ rớt đồ của quái vật +20% (Trong lần thám hiểm này).',
    unlockGuildLevel: 3
  },
  {
    itemId: 'stamina_elixir',
    name: 'Dược Tề Tinh Lực',
    price: 600,
    description: 'Hồi phục 120 điểm thể lực.',
    unlockGuildLevel: 4
  },
  {
    itemId: 'monster_lure',
    name: 'Mồi Nhử Quái Vật',
    price: 2000,
    description: 'Số lượng quái vật ở tầng này tăng gấp đôi.',
    unlockGuildLevel: 7
  },
  // --- 装备（贡献点+材料，限购1件）---
  {
    itemId: 'guild_cloud_horse',
    name: 'Tuấn mã Đạp Vân',
    price: 0,
    contributionCost: 600,
    description: 'Tuấn mã do hội thuần dưỡng. Nâng ngựa của bạn thành Đạp Vân Câu: đi đường rất nhanh và giúp trông đàn khi chăn thả.',
    unlockGuildLevel: 8,
    totalLimit: 1,
    horseUpgrade: 'cloud',
    materials: [
      { itemId: 'iridium_bar', quantity: 3 },
      { itemId: 'hay', quantity: 50 }
    ]
  },
  {
    itemId: 'guild_war_ring',
    name: 'Nhẫn chiến công hội',
    price: 0,
    contributionCost: 200,
    description: 'Tấn công +4, phòng thủ +6%.',
    unlockGuildLevel: 5,
    totalLimit: 1,
    equipType: 'ring',
    materials: [
      { itemId: 'gold_bar', quantity: 5 },
      { itemId: 'ruby', quantity: 2 }
    ]
  },
  {
    itemId: 'guild_war_helm',
    name: 'Mũ Chiến Công Hội',
    price: 0,
    contributionCost: 250,
    description: 'Tấn công +3, HP +15.',
    unlockGuildLevel: 6,
    totalLimit: 1,
    equipType: 'hat',
    materials: [
      { itemId: 'gold_bar', quantity: 5 },
      { itemId: 'moonstone', quantity: 1 }
    ]
  },
  {
    itemId: 'guild_war_boots',
    name: 'Ủng chiến công hội',
    price: 0,
    contributionCost: 250,
    description: 'Tấn công +2, phòng thủ +5%, tốc độ +10%.',
    unlockGuildLevel: 7,
    totalLimit: 1,
    equipType: 'shoe',
    materials: [
      { itemId: 'gold_bar', quantity: 5 },
      { itemId: 'obsidian', quantity: 1 }
    ]
  },
  {
    itemId: 'guild_war_blade',
    name: 'Chiến Nhẫn Công Hội',
    price: 0,
    contributionCost: 350,
    description: 'Tấn công 36, tỷ lệ chí mạng 10%.',
    unlockGuildLevel: 9,
    totalLimit: 1,
    equipType: 'weapon',
    materials: [
      { itemId: 'gold_bar', quantity: 10 },
      { itemId: 'dragon_jade', quantity: 1 }
    ]
  },
  // --- 永久品（贡献点购买，每日限购）---
  {
    itemId: 'guild_badge',
    name: 'Huy Hiệu Công Hội',
    price: 0,
    contributionCost: 150,
    description: 'Lực tấn công vĩnh viễn +3.',
    unlockGuildLevel: 6,
    weeklyLimit: 10
  },
  {
    itemId: 'life_talisman',
    name: 'Bùa Hộ Mệnh Sinh Mệnh',
    price: 0,
    contributionCost: 200,
    description: 'Sinh lực tối đa vĩnh viễn +15.',
    unlockGuildLevel: 8,
    dailyLimit: 1,
    totalLimit: 100
  },
  {
    itemId: 'defense_charm',
    name: 'Bùa Hộ Vệ',
    price: 0,
    contributionCost: 180,
    description: 'Phòng ngự vĩnh viễn +3%.',
    unlockGuildLevel: 7,
    weeklyLimit: 3,
    totalLimit: 10
  },
  {
    itemId: 'lucky_coin',
    name: 'Đồng Tiền May Mắn',
    price: 0,
    contributionCost: 300,
    description: 'Tỷ lệ rớt đồ của quái vật vĩnh viễn +5%.',
    unlockGuildLevel: 10,
    weeklyLimit: 3,
    totalLimit: 10
  }
]

/** 捐献物品表 */
export const GUILD_DONATIONS: GuildDonationDef[] = [
  // 矿石
  { itemId: 'copper_ore', points: 2 },
  { itemId: 'iron_ore', points: 4 },
  { itemId: 'gold_ore', points: 8 },
  { itemId: 'crystal_ore', points: 12 },
  { itemId: 'shadow_ore', points: 18 },
  { itemId: 'void_ore', points: 25 },
  { itemId: 'iridium_ore', points: 35 },
  // 宝石
  { itemId: 'quartz', points: 4 },
  { itemId: 'jade', points: 12 },
  { itemId: 'ruby', points: 18 },
  { itemId: 'moonstone', points: 25 },
  { itemId: 'obsidian', points: 35 },
  { itemId: 'dragon_jade', points: 50 },
  { itemId: 'prismatic_shard', points: 80 }
]

/** 公会等级表（10级） */
export const GUILD_LEVELS: GuildLevelDef[] = [
  { level: 1, expRequired: 100 },
  { level: 2, expRequired: 300 },
  { level: 3, expRequired: 600 },
  { level: 4, expRequired: 1000 },
  { level: 5, expRequired: 1500 },
  { level: 6, expRequired: 2200 },
  { level: 7, expRequired: 3000 },
  { level: 8, expRequired: 4000 },
  { level: 9, expRequired: 5500 },
  { level: 10, expRequired: 7500 }
]

/** 每公会等级的被动增益 */
export const GUILD_BONUS_PER_LEVEL = {
  attack: 1, // 每级+1攻击力
  maxHp: 5 // 每级+5最大生命值
}

/** 根据怪物ID查找讨伐目标 */
export const getMonsterGoal = (monsterId: string): MonsterGoalDef | undefined => MONSTER_GOALS.find(g => g.monsterId === monsterId)
