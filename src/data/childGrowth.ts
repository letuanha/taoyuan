import type { ChildStage } from '@/types'

/**
 * 子女成长线。
 *
 * 原先孩子只有 stage 字段在后台默默翻页，玩家除了名字什么都感受不到。
 * 这里补上三样东西：阶段跨越时的里程碑事件、各阶段不同的互动内容、以及长大后能搭把手的产出。
 */

/** 各阶段的中文名 */
export const CHILD_STAGE_NAMES: Record<ChildStage, string> = {
  baby: 'Bọc tã',
  toddler: 'Tập đi',
  child: 'Trẻ em',
  teen: 'Thiếu niên'
}

/** 各阶段起始天数（daysOld 达到即进入该阶段） */
export const CHILD_STAGE_DAYS: Record<ChildStage, number> = {
  baby: 0,
  toddler: 14,
  child: 28,
  teen: 56
}

/** 阶段顺序 */
export const CHILD_STAGE_ORDER: ChildStage[] = ['baby', 'toddler', 'child', 'teen']

/** 进入新阶段时的里程碑文案，{name} 为孩子名，{spouse} 为配偶名 */
export const CHILD_MILESTONES: Record<ChildStage, string[]> = {
  baby: ['{name} chào đời. Một cục nhỏ nhăn nheo nắm chặt ngón tay bạn không chịu buông.'],
  toddler: [
    'Hôm nay {name} vịn khung cửa đứng dậy, lảo đảo đi ba bước rồi ngồi phịch xuống đất,咧 miệng cười.',
    '{name} cất tiếng gọi đầu tiên. {spouse} nghe thấy bên bếp, đến cả xẻng nấu ăn cũng rơi xuống.'
  ],
  child: [
    '{name} đã có thể chạy khắp sân. Sáng nay bạn thấy bé trong chuồng gà, ôm một con gà mái hoảng hốt với vẻ mặt đầy tự hào.',
    '{name} đã biết tự mặc quần áo, dù vẫn cài sai hai chiếc cúc.',
    '{name} theo bạn ra ruộng một lần, ngồi xổm bên luống nhổ cỏ rất ra dáng, nhưng phần lớn thứ nhổ lên lại là cây con.'
  ],
  teen: [
    '{name} cao hơn năm ngoái một cái đầu. Hôm nay bé chủ động nói: 「Cha mẹ, việc đồng áng con cũng làm được rồi.」',
    'Gần đây {name} thường chạy đến trường làng, về nhà lại đọc vài câu thơ cho bạn nghe, đọc sai còn không cho ai sửa.',
    '{name} lau nông cụ sáng bóng rồi xếp ngay ngắn. {spouse} nói, đứa trẻ này giống bạn.'
  ]
}

/** 各阶段的日常互动文案 */
export const CHILD_INTERACTIONS: Record<ChildStage, string[]> = {
  baby: [
    '{name} đang ngủ say, nắm tay nhỏ đặt bên má. Bạn nhẹ nhàng kéo chăn cho bé.',
    'Bạn bế {name} lên đung đưa một chút, bé ê a hai tiếng rồi lại ngủ.',
    '{name} tỉnh giấc, mở đôi mắt đen láy nhìn bạn, nhìn một lúc rồi bật cười.'
  ],
  toddler: [
    '{name} chạy tới ôm lấy chân bạn, ngẩng đầu đòi bế.',
    'Bạn dạy {name} đếm số, đến ba thì bé bắt đầu đếm loạn, nhưng tự mình lại rất hài lòng.',
    '{name} trịnh trọng đặt một viên đá vào tay bạn, như thể đang tặng một báu vật vô giá.',
    'Bạn cùng {name} đuổi gà một vòng quanh sân, bé cười đến thở hổn hển.'
  ],
  child: [
    '{name} kéo bạn xem căn 「nhà」 bé dựng ở góc tường — ba viên gạch và một mảnh ngói.',
    'Bạn kể cho {name} một câu chuyện, nghe xong bé nói: 「Vậy ngày mai kể thêm một chuyện nhé.」',
    'Hôm nay {name} đánh nhau với một viên đá, về nhà còn mạnh miệng nói không đau. Bạn lau đầu gối cho bé.',
    '{name} hỏi bạn: 「Cha mẹ, phía bên kia núi trông thế nào?」 Bạn nhất thời không biết trả lời.',
    'Bạn cùng {name} chơi ném đá trên suối một lúc. Thành tích tốt nhất của bé là nảy bốn lần.'
  ],
  teen: [
    '{name} chủ động giúp bạn gánh đầy chum nước, lau mồ hôi rồi nói: 「Không có gì đâu.」',
    'Bạn và {name} ngồi nói chuyện một lúc trên bậc cửa. Bé giờ đã có suy nghĩ riêng.',
    '{name} nói muốn học một nghề và hỏi trong làng ai làm nghề giỏi nhất.',
    '{name} ghi lại sâu bệnh thấy ngoài ruộng hôm nay trên giấy đưa cho bạn, chữ còn ngay ngắn hơn chữ của bạn.',
    'Bạn phát hiện {name} lén luyện những việc đồng áng bạn từng dạy, động tác đã rất ra dáng.'
  ]
}

/** 孩童/少年偶尔会带回来的小东西 */
export const CHILD_GIFT_POOL: Record<ChildStage, string[]> = {
  baby: [],
  toddler: ['pine_cone', 'wild_berry'],
  child: ['wood', 'herb', 'pine_cone', 'wild_berry', 'clay'],
  teen: ['wood', 'herb', 'bamboo', 'wild_mushroom', 'copper_ore', 'clay']
}

/** 各阶段带回东西的概率 */
export const CHILD_GIFT_CHANCE: Record<ChildStage, number> = {
  baby: 0,
  toddler: 0.08,
  child: 0.15,
  teen: 0.25
}

/** 少年每天能帮忙浇的地块数 */
export const TEEN_HELP_PLOTS = 3

/** 根据天数推算所处阶段 */
export const getChildStageByAge = (daysOld: number): ChildStage => {
  if (daysOld >= CHILD_STAGE_DAYS.teen) return 'teen'
  if (daysOld >= CHILD_STAGE_DAYS.child) return 'child'
  if (daysOld >= CHILD_STAGE_DAYS.toddler) return 'toddler'
  return 'baby'
}

/** 取一条里程碑文案 */
export const pickMilestone = (stage: ChildStage): string => {
  const pool = CHILD_MILESTONES[stage]
  return pool[Math.floor(Math.random() * pool.length)] ?? ''
}

/** 取一条互动文案 */
export const pickInteraction = (stage: ChildStage): string => {
  const pool = CHILD_INTERACTIONS[stage]
  return pool[Math.floor(Math.random() * pool.length)] ?? ''
}

/** 填充文案里的占位符 */
export const fillChildText = (text: string, childName: string, spouseName: string): string => {
  return text.replace(/\{name\}/g, childName).replace(/\{spouse\}/g, spouseName || 'Bạn đời của bạn')
}
