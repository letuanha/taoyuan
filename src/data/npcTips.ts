import type { Weather } from '@/types'

/** 李渔翁 - 天气预报台词 */
export const WEATHER_TIPS: Record<Weather, string> = {
  sunny: 'Ngày mai trời quang mây tạnh, thích hợp ra ngoài hoạt động.',
  rainy: 'Ngày mai có mưa, nhớ mang ô… nhưng cá lại rất thích cắn câu.',
  stormy: 'Ngày mai mưa giông, tốt nhất nên nghỉ ở nhà.',
  snowy: 'Ngày mai có tuyết, nhớ giữ ấm. Mặt sông có thể đóng băng.',
  windy: 'Ngày mai nổi gió, nhớ cất đồ đang phơi.',
  green_rain: 'Lão phu cảm thấy ngày mai… có gì đó bất thường.'
}

/** 周秀才 - 运势台词阈值 */
export const FORTUNE_TIERS: { min: number; message: string }[] = [
  { min: 0.07, message: 'Tử khí từ phương Đông, hôm nay đại cát! Làm gì cũng thuận lợi.' },
  { min: 0.03, message: 'Hôm nay vận may khá tốt, thích hợp ra ngoài làm việc.' },
  { min: -0.03, message: 'Hôm nay vận may bình thường, cứ làm mọi việc như thường là được.' },
  { min: -0.07, message: 'Hôm nay vận may không tốt, làm việc cần cẩn thận.' },
  { min: -Infinity, message: 'Hôm nay không thích hợp làm việc gì lớn, nên nghỉ ở nhà.' }
]

/** 根据 dailyLuck 获取运势台词 */
export const getFortuneTip = (luck: number): string => {
  for (const tier of FORTUNE_TIERS) {
    if (luck >= tier.min) return tier.message
  }
  return FORTUNE_TIERS[FORTUNE_TIERS.length - 1]!.message
}

/** 柳村长 - 生活提示 (25条循环) */
export const LIVING_TIPS: string[] = [
  'Mùa xuân là thời điểm tốt để trồng khoai tây và cải xanh, gieo sớm thu sớm.',
  'Bón phân cho cây giúp tăng chất lượng; chất lượng càng cao thì giá bán càng tốt.',
  'Ngày mưa không cần tưới nước, có thể dành thời gian làm việc khác.',
  'Măng trong rừng trúc nhiều nhất vào mùa xuân, đừng quên đi thu thập.',
  'Khi câu cá hãy chú ý thời điểm; mỗi loài cá có khung giờ câu tốt nhất khác nhau.',
  'Hầm mỏ càng sâu càng nguy hiểm, nhớ mang đủ thức ăn và thuốc.',
  'Tặng quà giúp tăng tình bạn với dân làng; mỗi người có sở thích khác nhau.',
  'Nâng cấp công cụ giúp tăng hiệu suất, đừng quên ghé tiệm rèn.',
  'Đào mật và dưa hấu mùa hè bán khá được giá, đáng để trồng diện tích lớn.',
  'Chế tạo vòi phun giúp tự động tưới nước, tiết kiệm rất nhiều thời gian.',
  'Mùa thu có thể trồng cây nhiều mùa, thu nhập ổn định hơn.',
  'Mùa đông tuy không thể trồng trọt nhưng lợi nhuận từ hầm mỏ cao hơn.',
  'Trò chuyện nhiều với dân làng; khi đạt đủ hảo cảm bạn sẽ học được công thức mới.',
  'Quyên góp cho bảo tàng có thể nhận phần thưởng cột mốc, nhớ thu thập hóa thạch và cổ vật.',
  'Nhiệm vụ chinh phạt của hội có phần thưởng hậu hĩnh, rất đáng làm.',
  'Mồi câu và phao có thể tăng hiệu quả và chất lượng câu cá.',
  'Máy chế biến có thể biến nguyên liệu thành hàng hóa có giá trị hơn.',
  'Sự kiện lễ hội có phần thưởng giới hạn, đừng bỏ lỡ lễ hội nào.',
  'Bom có thể phá một vùng quặng lớn trong một lần, hiệu quả rất cao.',
  'Trước khi xuống mỏ đừng quên trang bị nhẫn, các chỉ số cộng thêm rất quan trọng.',
  'Cây trồng chất lượng cao có thể làm ra món ăn ngon hơn.',
  'Nuôi thú cưng lâu ngày sẽ có những thu hoạch bất ngờ.',
  'Nghe nói sâu trong rừng hoa đào có vật phẩm hái lượm quý hiếm.',
  'Hãy chăm chỉ quản lý nông trại, mọi người đều đang dõi theo bạn.',
  'Bí mật của Đào Nguyên Hương nằm trong những ghi chép bí mật, hãy chú ý.'
]

/** 获取当天的生活提示 */
export const getLivingTip = (day: number, year: number): string => {
  const index = ((year - 1) * 112 + day - 1) % LIVING_TIPS.length
  return LIVING_TIPS[index]!
}

/** 王大婶 - 食谱推荐台词模板 */
export const getRecipeTipMessage = (recipeName: string, ingredientNames: string[]): string => {
  return `Hôm nay dạy bạn làm ${recipeName}, cần ${ingredientNames.join(', ')}.`
}

/** 王大婶 - 无可推荐食谱时的通用台词 */
export const NO_RECIPE_TIP = 'Học nấu ăn cho tốt, cuộc sống phía trước còn dài.'

/** 有每日提示功能的NPC ID列表 */
export const TIP_NPC_IDS = ['li_yu', 'zhou_xiucai', 'wang_dashen', 'liu_cunzhang'] as const

/** NPC提示类型 */
export type TipNpcId = (typeof TIP_NPC_IDS)[number]

/** NPC提示标签 */
export const TIP_NPC_LABELS: Record<TipNpcId, string> = {
  li_yu: 'Dự báo thời tiết',
  zhou_xiucai: 'Vận may hôm nay',
  wang_dashen: 'Công thức đề xuất',
  liu_cunzhang: 'Mẹo cuộc sống'
}
