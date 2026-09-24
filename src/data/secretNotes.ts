import type { SecretNoteDef } from '@/types'

/** 所有秘密笔记 */
export const SECRET_NOTES: SecretNoteDef[] = [
  {
    id: 1,
    type: 'tip',
    title: 'Mảnh giấy rách',
    content: 'Dường như có thứ gì đó ẩn sâu trong rừng hoa đào… Khi hoa đào rụng vào mùa xuân, đôi khi có thể tìm thấy vật quý hiếm trên mặt đất.',
    usable: false
  },
  {
    id: 2,
    type: 'treasure',
    title: 'Di thư của thợ mỏ',
    content: 'Tôi giấu toàn bộ tiền dành dụm cả đời ở một góc bí mật tầng 20 hầm mỏ… Nếu tìm được lá thư này, số tiền đó thuộc về bạn.',
    usable: true,
    reward: { money: 500 }
  },
  {
    id: 3,
    type: 'npc',
    title: 'Sở thích của ngư ông',
    content: 'Lý Ngư Ông thích cá koi nhất. Ông nói cá koi là vua của sông, ai câu được cá koi mới là ngư dân thực thụ.',
    usable: false
  },
  {
    id: 4,
    type: 'story',
    title: 'Đào Nguyên Chí · Thượng',
    content: 'Một trăm năm trước, một vị ẩn sĩ phát hiện thung lũng biệt lập này. Hoa đào nở khắp thung lũng, suối chảy róc rách, tựa chốn đào nguyên. Ông dựng làng và định cư tại đây, đặt tên là "Đào Nguyên Hương".',
    usable: false
  },
  {
    id: 5,
    type: 'treasure',
    title: 'Bản đồ bí mật rừng trúc',
    content: 'Ở nơi rừng trúc rậm rạp nhất có một tảng đá phủ rêu; lật nó lên sẽ tìm được một viên ngọc lục bảo tuyệt đẹp.',
    usable: true,
    reward: { items: [{ itemId: 'jade', quantity: 1 }] }
  },
  {
    id: 6,
    type: 'tip',
    title: 'Kinh nghiệm câu cá',
    content: 'Đêm trăng tròn, cá dưới nước đặc biệt năng động. Nếu muốn câu cá hiếm, hãy thử vào đêm trăng tròn.',
    usable: false
  },
  {
    id: 7,
    type: 'npc',
    title: 'Bí mật của thợ rèn',
    content: 'Tôn thợ rèn cả ngày rèn sắt, nhưng thật ra ông rất thích quặng đồng. Ông nói đồng là kim loại ấm áp nhất.',
    usable: false
  },
  {
    id: 8,
    type: 'story',
    title: 'Đào Nguyên Chí · Hạ',
    content: 'Sau khi vị ẩn sĩ qua đời, dân làng đời đời bảo vệ mảnh đất này. Họ đặt ra quy tắc: không chặt rừng hoa đào, không làm ô nhiễm dòng suối. Đào Nguyên Hương cứ thế lặng lẽ trải qua trăm năm.',
    usable: false
  },
  {
    id: 9,
    type: 'treasure',
    title: 'Bí mật bên bờ sông',
    content: 'Dưới tảng đá lớn ở khúc quanh con suối, tôi từng giấu một khoản tiền. Nếu tìm được thì cứ lấy mà dùng.',
    usable: true,
    reward: { money: 800 }
  },
  {
    id: 10,
    type: 'tip',
    title: 'Ghi chép hái lượm',
    content: 'Những ngày mưa, trên núi sẽ xuất hiện các vật hái lượm hiếm thấy. Rừng trúc sau mưa đặc biệt đáng để ghé qua.',
    usable: false
  },
  {
    id: 11,
    type: 'npc',
    title: 'Tâm sự của Liễu Nương',
    content: 'Liễu Nương thích hoa quế nhất. Mỗi mùa thu, cô ấy đều ngồi cả ngày dưới cây hoa quế.',
    usable: false
  },
  {
    id: 12,
    type: 'treasure',
    title: 'Mật hiệu hầm mỏ',
    content: 'Cuối tầng sông ngầm của hầm mỏ có một hang động do nước xói mòn. Bên trong cất một viên đá ánh trăng quý giá.',
    usable: true,
    reward: { items: [{ itemId: 'moonstone', quantity: 1 }] }
  },
  {
    id: 13,
    type: 'story',
    title: 'Con đường thương mại Hãn Hải',
    content: 'Ngày xưa, Đào Nguyên Hương không hề biệt lập với thế giới. Một tuyến thương mại xuyên qua hoang nguyên phía tây, nối tới những vùng đất xa xôi. Các thương nhân gọi hoang nguyên ấy là "Hãn Hải" vì cát đá rộng lớn như biển.',
    usable: false
  },
  {
    id: 14,
    type: 'tip',
    title: 'Kinh nghiệm trồng trọt',
    content: 'Chất lượng cây trồng chịu ảnh hưởng bởi nhiều yếu tố: độ phì đất, tần suất tưới, mức phù hợp của mùa… thậm chí vận may mỗi ngày cũng có thể ảnh hưởng.',
    usable: false
  },
  {
    id: 15,
    type: 'npc',
    title: 'Ước nguyện của đầu bếp',
    content: 'Thím Vương luôn muốn nấu được nồi cơm hoàn hảo nhất. Bà nói gạo ngon là nền tảng của mọi món ăn.',
    usable: false
  },
  {
    id: 16,
    type: 'treasure',
    title: 'Truyền thuyết giếng cổ',
    content: 'Dưới đáy giếng cổ bỏ hoang ở đầu làng, tương truyền có báu vật trấn làng được chôn từ ngày lập làng. Giếng đã khô nhưng báu vật hẳn vẫn còn.',
    usable: true,
    reward: { money: 1500 }
  },
  {
    id: 17,
    type: 'story',
    title: 'Chuyện xưa của hội',
    content: 'Hội Mạo hiểm ban đầu chỉ là một căn nhà nhỏ nơi các thợ săn tụ tập. Sau này quái vật trong hầm mỏ ngày càng nhiều, các thợ săn lập hội để chuyên tiêu diệt quái vật và bảo vệ dân làng.',
    usable: false
  },
  {
    id: 18,
    type: 'tip',
    title: 'Hầm mỏ sấm sét',
    content: 'Nghe nói khi vào hầm mỏ trong thời tiết có sấm chớp, chất lượng quặng sẽ cao hơn. Có lẽ dòng điện đã đánh thức thứ gì đó…',
    usable: false
  },
  {
    id: 19,
    type: 'npc',
    title: 'Sở thích của Chu Tú Tài',
    content: 'Chu Tú Tài ngày nào cũng phải uống một ấm trà ngon. Ông nói trà có thể gột rửa tâm hồn, sáng mắt tỉnh thần. Tặng ông trà ngon chắc chắn không sai.',
    usable: false
  },
  {
    id: 20,
    type: 'treasure',
    title: 'Báu vật rừng hoa đào',
    content: 'Dưới cây đào cổ nhất trong rừng hoa đào chôn một hạt giống cổ xưa. Tương truyền đó là thứ vị ẩn sĩ lập làng để lại.',
    usable: true,
    reward: { items: [{ itemId: 'ancient_seed', quantity: 1 }] }
  },
  {
    id: 21,
    type: 'story',
    title: 'Bí mật bảo tàng',
    content:
      'Bảo tàng vốn là từ đường của làng. Sau này một học giả đề nghị tập trung bảo quản hóa thạch và cổ vật dân làng đào được, nên từ đường được cải tạo thành bảo tàng. Tương truyền khi sưu tầm đủ mọi hiện vật, một điều kỳ diệu sẽ xảy ra.',
    usable: false
  },
  {
    id: 22,
    type: 'tip',
    title: 'Bí quyết nhà kính',
    content: 'Mùa đông vạn vật tàn úa nhưng trong nhà kính vẫn như mùa xuân quanh năm. Nếu có nhà kính, mùa đông bạn vẫn có thể trồng trọt.',
    usable: false
  },
  {
    id: 23,
    type: 'npc',
    title: 'Bí quyết dưỡng sinh của Bác Trần',
    content: 'Bác Trần rất coi trọng dưỡng sinh, ông nói nhân sâm là vua của trăm loại thảo dược. Nếu tặng ông nhân sâm, ông chắc chắn sẽ rất vui.',
    usable: false
  },
  {
    id: 24,
    type: 'treasure',
    title: 'Hầm mỏ bỏ hoang',
    content: 'Sâu trong hầm mỏ có một đường hầm phụ bị phong kín, tương truyền là di tích của một mỏ cổ hơn. Bên trong không chỉ có vàng bạc mà còn có quặng iridi quý giá.',
    usable: true,
    reward: { money: 2000, items: [{ itemId: 'iridium_ore', quantity: 1 }] }
  },
  {
    id: 25,
    type: 'story',
    title: 'Mật sự Đào Nguyên',
    content:
      'Sâu dưới lòng đất Đào Nguyên Hương, tương truyền phong ấn một sức mạnh cổ xưa. Vị ẩn sĩ lập làng chọn nơi này không phải ngẫu nhiên — ông là người bảo hộ sức mạnh ấy. Nay người bảo hộ đã qua đời, sức mạnh dần thức tỉnh… Có lẽ đó là nguyên nhân quái vật trong hầm mỏ ngày càng nhiều.',
    usable: false
  },
  // 仙灵线索
  {
    id: 26,
    type: 'story',
    title: 'Lời thì thầm dưới ánh vảy sáng',
    content:
      'Theo lời các cụ trong làng, sâu trong thác nước sau núi có một linh long màu ngọc bích. Mỗi đêm mưa xuân, vảy của nó lấp lánh dưới nước. Nếu câu được cá Thanh Long trong truyền thuyết, có lẽ sẽ cảm nhận được sự tồn tại của nó.',
    usable: false
  },
  {
    id: 27,
    type: 'story',
    title: 'Mảnh vỡ ngọc chày',
    content:
      'Khi hái thuốc, bạn tình cờ nhặt được một mảnh trắng như ngọc, hình dạng giống mảnh vỡ của chày cối. Người già nói vào đêm trăng tròn, sâu trong rừng trúc đôi khi nghe tiếng giã thuốc leng keng. Nhưng không ai biết ai đang giã thuốc.',
    usable: false
  },
  {
    id: 28,
    type: 'story',
    title: 'Bóng vàng lướt qua',
    content:
      'Không chỉ một dân làng từng nhìn thấy một vệt sáng vàng lướt qua lúc hoàng hôn. Tương truyền trong núi gần làng có một hồ ly tinh tu luyện nghìn năm — vừa chính vừa tà, thích ra câu đố trêu người qua đường. Nghe nói chỉ người đủ giàu và có quan hệ tốt mới thu hút được sự chú ý của nó.',
    usable: false
  }
]
