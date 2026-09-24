import type { FarmMapType } from '@/types'

export interface FarmMapDef {
  type: FarmMapType
  name: string
  description: string
  bonus: string
}

export const FARM_MAP_DEFS: FarmMapDef[] = [
  {
    type: 'standard',
    name: 'Trang trại Đào Nguyên',
    description: 'Đồng bằng rộng lớn, thích hợp trồng trọt quy mô lớn.',
    bonus: 'Ban đầu 6×6, mở rộng tới 10×10, tự động bón phân khi đổi mùa (nâng theo cấp trồng trọt), thu hoạch thêm 15%.'
  },
  {
    type: 'riverland',
    name: 'Trang trại Suối Khê',
    description: 'Ruộng được bao quanh bởi dòng suối, thủy sản phong phú.',
    bonus: 'Kinh nghiệm câu cá +25%, giá cá +10%, mỗi ngày có cá suối, ngày mưa chất lượng cá tăng.'
  },
  {
    type: 'forest',
    name: 'Trang trại Rừng Trúc',
    description: 'Khoảng đất giữa rừng, có nhiều loại vật phẩm hái lượm.',
    bonus: 'Kinh nghiệm thu thập +25%, 20% cơ hội thu thập gấp đôi, mỗi ngày có vật nhặt trong rừng.'
  },
  {
    type: 'hilltop',
    name: 'Trang trại Đồi Núi',
    description: 'Ruộng bậc thang trên sườn núi, ẩn chứa mạch quặng.',
    bonus: 'Kinh nghiệm khai mỏ +25%, quặng +1, có mạch quặng trên mặt đất nông trại.'
  },
  {
    type: 'wilderness',
    name: 'Trang trại Hoang Dã',
    description: 'Vùng đất hoang xa xôi, ban đêm có thú dữ.',
    bonus: 'Kinh nghiệm chiến đấu +50%, mỗi ngày nhận quặng, ban đêm có thể gặp thú dữ.'
  },
  {
    type: 'meadowlands',
    name: 'Trang trại Đồng Cỏ',
    description: 'Đồng cỏ rộng, thích hợp nuôi gia súc.',
    bonus: 'Bắt đầu với chuồng gà +2 gà, thân thiện +50%, động vật không mắc bệnh, sản lượng thêm.'
  }
]
