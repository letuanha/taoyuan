import type { Weather } from '@/types'

/**
 * 天气图腾。
 *
 * 原本只有雨图腾一种，且价格低到失去调度意义。
 * 现在每种天气各一枚，定价统一提到五千档——它应当是「关键时刻花大钱买确定性」的手段，
 * 而不是随手就能刷天气的廉价道具。
 */
export interface TotemDef {
  id: string
  name: string
  /** 使用后指定的次日天气 */
  weather: Weather
  description: string
  /** 商店基准售价 */
  price: number
  /** 出售给商店的价格 */
  sellPrice: number
}

/** 图腾基准价 */
export const TOTEM_BASE_PRICE = 5000

export const WEATHER_TOTEMS: TotemDef[] = [
  {
    id: 'rain_totem',
    name: 'Đồ Đằng Mưa',
    weather: 'rainy',
    description: 'Cầu một trận mưa tốt. Ngày hôm sau trời mưa, ruộng không cần tưới.',
    price: TOTEM_BASE_PRICE,
    sellPrice: 1500
  },
  {
    id: 'sun_totem',
    name: 'Vật tổ trời quang',
    weather: 'sunny',
    description: 'Xua mây thấy nắng. Ngày hôm sau trời quang, thích hợp đi xa hoặc làm việc.',
    price: TOTEM_BASE_PRICE,
    sellPrice: 1500
  },
  {
    id: 'storm_totem',
    name: 'Vật tổ sấm',
    weather: 'stormy',
    description: 'Gọi mưa giông. Ngày hôm sau sấm chớp, cột thu lôi có thể thu pin.',
    price: Math.round(TOTEM_BASE_PRICE * 1.4),
    sellPrice: 2100
  },
  {
    id: 'snow_totem',
    name: 'Vật tổ tuyết',
    weather: 'snowy',
    description: 'Gọi gió tuyết. Ngày hôm sau có tuyết, xuất hiện cảnh vật và sản phẩm mùa đông.',
    price: Math.round(TOTEM_BASE_PRICE * 1.2),
    sellPrice: 1800
  },
  {
    id: 'wind_totem',
    name: 'Vật tổ gió',
    weather: 'windy',
    description: 'Gọi một trận gió lớn. Ngày hôm sau nổi gió, trong rừng dễ thổi rơi đồ tốt.',
    price: Math.round(TOTEM_BASE_PRICE * 0.8),
    sellPrice: 1200
  },
  {
    id: 'green_rain_totem',
    name: 'Vật tổ mưa xanh',
    weather: 'green_rain',
    description: 'Gọi mưa xanh hiếm gặp. Ngày hôm sau mưa màu ngọc bích, núi rừng thường xuyên biến đổi.',
    price: TOTEM_BASE_PRICE * 4,
    sellPrice: 6000
  }
]

/** 按物品ID查找图腾 */
export const getTotemById = (id: string): TotemDef | undefined => {
  return WEATHER_TOTEMS.find(t => t.id === id)
}

/** 所有图腾物品ID */
export const TOTEM_IDS: string[] = WEATHER_TOTEMS.map(t => t.id)
