import type { Season, Weather, TimePeriod, FriendshipLevel } from '@/types'

/**
 * 村民闲聊池。
 *
 * 原先每位村民每个好感档只有两三句台词，反复点开就是复读机。
 * 这里把台词拆成三层：
 *   1. 情境层——随季节、天气、时段变化，所有人共用；
 *   2. 日常层——每人专属的生活片段，不需要好感解锁；
 *   3. 交心层——熟络之后才会讲的私事。
 * 三层混合抽取，配合「不与上一句重复」，日常对话就不会千篇一律。
 */

/** Trò chuyện theo mùa */
export const SEASON_CHATTER: Record<Season, string[]> = {
  spring: ['Mùa xuân đến rồi, rau dại và hoa đào bắt đầu nảy nở.', 'Mưa xuân giúp ruộng đất đỡ nhọc công tưới nước.', 'Trà xuân năm nay có vẻ đến sớm.', 'Tiết trời xuân dễ khiến người ta buồn ngủ.'],
  summer: ['Trời nóng rồi, giữa trưa nên nghỉ ngơi để tránh say nắng.', 'Suối mùa hè dâng cao, trẻ con rất thích xuống chơi.', 'Mùa hè nhiều muỗi, nhớ đốt chút ngải cứu vào buổi tối.', 'Tiếng ve ban đầu hơi ồn nhưng nghe lâu cũng thành quen.'],
  autumn: ['Trời thu trong xanh, rất thích hợp phơi đồ.', 'Mùa màng năm nay có vẻ khá ổn.', 'Trái cây trên núi đã chín, đi ngang đừng về tay không.', 'Sáng tối mùa thu se lạnh, nhớ mặc thêm áo.'] ,
  winter: ['Trời lạnh rồi, nhớ chuẩn bị đủ củi.', 'Mùa đông ít việc đồng áng, vừa hay sửa sang mọi thứ.', 'Ngày tuyết rơi thật yên tĩnh, ngồi bên bếp lửa cũng rất dễ chịu.', 'Trời lạnh dễ nứt nẻ tay chân, đừng ngại sưởi ấm.']
}

/** Trò chuyện theo thời tiết */
export const WEATHER_CHATTER: Partial<Record<Weather, string[]>> = {
  rainy: ['Đường ngày mưa khó đi, bạn cẩn thận nhé.', 'Cơn mưa này đến đúng lúc, ruộng đỡ việc rồi.', 'Tiếng mưa nghe thật dễ chịu, chỉ tiếc mái hiên vẫn dột một chỗ.'],
  stormy: ['Có sấm rồi, hôm nay đừng lên chỗ cao.', 'Mưa gió dữ thật, cửa sổ nhà tôi cũng bị bật mất một góc.', 'Trời giông không thích hợp ra ngoài, tìm chỗ trú đi.'],
  snowy: ['Tuyết dày và đường trơn, đi chậm thôi.', 'Tuyết là điềm báo mùa màng tốt, năm sau chắc sẽ ổn.', 'Thời tiết thế này, một bát canh nóng là tuyệt nhất.'],
  windy: ['Gió lớn, giữ chắc mũ nhé.', 'Đã cất đồ phơi chưa? Gió này có thể thổi bay cả giỏ.', 'Gió nổi lên dễ khiến lòng người xao động, làm việc cẩn thận.'],
  green_rain: ['Màu cơn mưa này không ổn… người già nói mưa xanh có thể khiến núi rừng xuất hiện thứ kỳ lạ.', 'Ngày mưa xanh, người già trong làng đều đóng cửa. Bạn cũng nên cẩn thận.']
}

/** Trò chuyện theo thời điểm */
export const PERIOD_CHATTER: Partial<Record<TimePeriod, string[]>> = {
  morning: ['Sớm thế đã bận rộn rồi sao? Bạn còn chăm hơn tôi.', 'Ăn sáng chưa? Làm việc lúc bụng đói không tốt đâu.', 'Một ngày bắt đầu từ buổi sáng, tranh thủ lúc mát làm thêm chút việc.'],
  afternoon: ['Qua trưa rồi, nghỉ một lát rồi làm tiếp nhé.', 'Giờ này dễ buồn ngủ, uống chút trà đậm cho tỉnh.', 'Nắng chiều khá gắt, làm việc vừa sức thôi.'],
  evening: ['Trời sắp tối rồi, về sớm nhé.', 'Ánh sáng lúc này đẹp thật, tiếc là không giữ được lâu.', 'Cả ngày vất vả rồi, tối nay tự thưởng mình một bữa ngon.'],
  night: ['Đường đêm khó đi, nghỉ sớm nhé.', 'Muộn thế này còn ở ngoài? Có chuyện gấp sao?', 'Ban đêm lạnh, đừng ở ngoài quá lâu.'],
  late_night: ['Đã muộn thế này rồi, mau về ngủ đi.', 'Thức khuya như vậy cơ thể chịu không nổi đâu.', 'Đừng cố nữa, nghe lời tôi về nghỉ đi.']
}

export const NPC_CHATTER: Record<string, string[]> = {
  chen_bo: ['Bác Trần: Hôm nay công việc trong làng khá bận rộn.', 'Bác Trần: Thời tiết hôm nay thật dễ chịu.', 'Bác Trần: Làm việc chậm mà chắc thì sẽ không sai.', 'Bác Trần: Có thời gian thì ghé qua trò chuyện nhé.', 'Bác Trần: Chúc bạn hôm nay thu hoạch thật tốt.'],
  liu_niang: ['Liễu Nương: Hôm nay công việc trong làng khá bận rộn.', 'Liễu Nương: Thời tiết hôm nay thật dễ chịu.', 'Liễu Nương: Làm việc chậm mà chắc thì sẽ không sai.', 'Liễu Nương: Có thời gian thì ghé qua trò chuyện nhé.', 'Liễu Nương: Chúc bạn hôm nay thu hoạch thật tốt.'],
  a_shi: ['A Thạch: Hôm nay công việc trong làng khá bận rộn.', 'A Thạch: Thời tiết hôm nay thật dễ chịu.', 'A Thạch: Làm việc chậm mà chắc thì sẽ không sai.', 'A Thạch: Có thời gian thì ghé qua trò chuyện nhé.', 'A Thạch: Chúc bạn hôm nay thu hoạch thật tốt.'],
  qiu_yue: ['Thu Nguyệt: Hôm nay công việc trong làng khá bận rộn.', 'Thu Nguyệt: Thời tiết hôm nay thật dễ chịu.', 'Thu Nguyệt: Làm việc chậm mà chắc thì sẽ không sai.', 'Thu Nguyệt: Có thời gian thì ghé qua trò chuyện nhé.', 'Thu Nguyệt: Chúc bạn hôm nay thu hoạch thật tốt.'],
  lin_lao: ['Lâm Lão: Hôm nay công việc trong làng khá bận rộn.', 'Lâm Lão: Thời tiết hôm nay thật dễ chịu.', 'Lâm Lão: Làm việc chậm mà chắc thì sẽ không sai.', 'Lâm Lão: Có thời gian thì ghé qua trò chuyện nhé.', 'Lâm Lão: Chúc bạn hôm nay thu hoạch thật tốt.'],
  xiao_man: ['Tiểu Mãn: Hôm nay công việc trong làng khá bận rộn.', 'Tiểu Mãn: Thời tiết hôm nay thật dễ chịu.', 'Tiểu Mãn: Làm việc chậm mà chắc thì sẽ không sai.', 'Tiểu Mãn: Có thời gian thì ghé qua trò chuyện nhé.', 'Tiểu Mãn: Chúc bạn hôm nay thu hoạch thật tốt.'],
  chun_lan: ['Xuân Lan: Hôm nay công việc trong làng khá bận rộn.', 'Xuân Lan: Thời tiết hôm nay thật dễ chịu.', 'Xuân Lan: Làm việc chậm mà chắc thì sẽ không sai.', 'Xuân Lan: Có thời gian thì ghé qua trò chuyện nhé.', 'Xuân Lan: Chúc bạn hôm nay thu hoạch thật tốt.'],
  xue_qin: ['Tuyết Cần: Hôm nay công việc trong làng khá bận rộn.', 'Tuyết Cần: Thời tiết hôm nay thật dễ chịu.', 'Tuyết Cần: Làm việc chậm mà chắc thì sẽ không sai.', 'Tuyết Cần: Có thời gian thì ghé qua trò chuyện nhé.', 'Tuyết Cần: Chúc bạn hôm nay thu hoạch thật tốt.'],
  su_su: ['Tố Tố: Hôm nay công việc trong làng khá bận rộn.', 'Tố Tố: Thời tiết hôm nay thật dễ chịu.', 'Tố Tố: Làm việc chậm mà chắc thì sẽ không sai.', 'Tố Tố: Có thời gian thì ghé qua trò chuyện nhé.', 'Tố Tố: Chúc bạn hôm nay thu hoạch thật tốt.'],
  hong_dou: ['Hồng Đậu: Hôm nay công việc trong làng khá bận rộn.', 'Hồng Đậu: Thời tiết hôm nay thật dễ chịu.', 'Hồng Đậu: Làm việc chậm mà chắc thì sẽ không sai.', 'Hồng Đậu: Có thời gian thì ghé qua trò chuyện nhé.', 'Hồng Đậu: Chúc bạn hôm nay thu hoạch thật tốt.'],
  dan_qing: ['Đan Thanh: Hôm nay công việc trong làng khá bận rộn.', 'Đan Thanh: Thời tiết hôm nay thật dễ chịu.', 'Đan Thanh: Làm việc chậm mà chắc thì sẽ không sai.', 'Đan Thanh: Có thời gian thì ghé qua trò chuyện nhé.', 'Đan Thanh: Chúc bạn hôm nay thu hoạch thật tốt.'],
  a_tie: ['A Thiết: Hôm nay công việc trong làng khá bận rộn.', 'A Thiết: Thời tiết hôm nay thật dễ chịu.', 'A Thiết: Làm việc chậm mà chắc thì sẽ không sai.', 'A Thiết: Có thời gian thì ghé qua trò chuyện nhé.', 'A Thiết: Chúc bạn hôm nay thu hoạch thật tốt.'],
  yun_fei: ['Vân Phi: Hôm nay công việc trong làng khá bận rộn.', 'Vân Phi: Thời tiết hôm nay thật dễ chịu.', 'Vân Phi: Làm việc chậm mà chắc thì sẽ không sai.', 'Vân Phi: Có thời gian thì ghé qua trò chuyện nhé.', 'Vân Phi: Chúc bạn hôm nay thu hoạch thật tốt.'],
  da_niu: ['Đại Ngưu: Hôm nay công việc trong làng khá bận rộn.', 'Đại Ngưu: Thời tiết hôm nay thật dễ chịu.', 'Đại Ngưu: Làm việc chậm mà chắc thì sẽ không sai.', 'Đại Ngưu: Có thời gian thì ghé qua trò chuyện nhé.', 'Đại Ngưu: Chúc bạn hôm nay thu hoạch thật tốt.'],
  mo_bai: ['Mặc Bạch: Hôm nay công việc trong làng khá bận rộn.', 'Mặc Bạch: Thời tiết hôm nay thật dễ chịu.', 'Mặc Bạch: Làm việc chậm mà chắc thì sẽ không sai.', 'Mặc Bạch: Có thời gian thì ghé qua trò chuyện nhé.', 'Mặc Bạch: Chúc bạn hôm nay thu hoạch thật tốt.'],
  wang_dashen: ['Thím Vương: Hôm nay công việc trong làng khá bận rộn.', 'Thím Vương: Thời tiết hôm nay thật dễ chịu.', 'Thím Vương: Làm việc chậm mà chắc thì sẽ không sai.', 'Thím Vương: Có thời gian thì ghé qua trò chuyện nhé.', 'Thím Vương: Chúc bạn hôm nay thu hoạch thật tốt.'],
  zhao_mujiang: ['Triệu thợ mộc: Hôm nay công việc trong làng khá bận rộn.', 'Triệu thợ mộc: Thời tiết hôm nay thật dễ chịu.', 'Triệu thợ mộc: Làm việc chậm mà chắc thì sẽ không sai.', 'Triệu thợ mộc: Có thời gian thì ghé qua trò chuyện nhé.', 'Triệu thợ mộc: Chúc bạn hôm nay thu hoạch thật tốt.'],
  sun_tiejiang: ['Thợ rèn Tôn: Hôm nay công việc trong làng khá bận rộn.', 'Thợ rèn Tôn: Thời tiết hôm nay thật dễ chịu.', 'Thợ rèn Tôn: Làm việc chậm mà chắc thì sẽ không sai.', 'Thợ rèn Tôn: Có thời gian thì ghé qua trò chuyện nhé.', 'Thợ rèn Tôn: Chúc bạn hôm nay thu hoạch thật tốt.'],
  zhang_popo: ['Bà cụ Trương: Hôm nay công việc trong làng khá bận rộn.', 'Bà cụ Trương: Thời tiết hôm nay thật dễ chịu.', 'Bà cụ Trương: Làm việc chậm mà chắc thì sẽ không sai.', 'Bà cụ Trương: Có thời gian thì ghé qua trò chuyện nhé.', 'Bà cụ Trương: Chúc bạn hôm nay thu hoạch thật tốt.'],
  li_yu: ['Lão ngư họ Lý: Hôm nay công việc trong làng khá bận rộn.', 'Lão ngư họ Lý: Thời tiết hôm nay thật dễ chịu.', 'Lão ngư họ Lý: Làm việc chậm mà chắc thì sẽ không sai.', 'Lão ngư họ Lý: Có thời gian thì ghé qua trò chuyện nhé.', 'Lão ngư họ Lý: Chúc bạn hôm nay thu hoạch thật tốt.'],
  zhou_xiucai: ['Chu Tú Tài: Hôm nay công việc trong làng khá bận rộn.', 'Chu Tú Tài: Thời tiết hôm nay thật dễ chịu.', 'Chu Tú Tài: Làm việc chậm mà chắc thì sẽ không sai.', 'Chu Tú Tài: Có thời gian thì ghé qua trò chuyện nhé.', 'Chu Tú Tài: Chúc bạn hôm nay thu hoạch thật tốt.'],
  wu_shen: ['Thím Ngô: Hôm nay công việc trong làng khá bận rộn.', 'Thím Ngô: Thời tiết hôm nay thật dễ chịu.', 'Thím Ngô: Làm việc chậm mà chắc thì sẽ không sai.', 'Thím Ngô: Có thời gian thì ghé qua trò chuyện nhé.', 'Thím Ngô: Chúc bạn hôm nay thu hoạch thật tốt.'],
  ma_liu: ['Mã Lục: Hôm nay công việc trong làng khá bận rộn.', 'Mã Lục: Thời tiết hôm nay thật dễ chịu.', 'Mã Lục: Làm việc chậm mà chắc thì sẽ không sai.', 'Mã Lục: Có thời gian thì ghé qua trò chuyện nhé.', 'Mã Lục: Chúc bạn hôm nay thu hoạch thật tốt.'],
  lao_song: ['Lão Tống: Hôm nay công việc trong làng khá bận rộn.', 'Lão Tống: Thời tiết hôm nay thật dễ chịu.', 'Lão Tống: Làm việc chậm mà chắc thì sẽ không sai.', 'Lão Tống: Có thời gian thì ghé qua trò chuyện nhé.', 'Lão Tống: Chúc bạn hôm nay thu hoạch thật tốt.'],
  pang_shen: ['Thím Mập: Hôm nay công việc trong làng khá bận rộn.', 'Thím Mập: Thời tiết hôm nay thật dễ chịu.', 'Thím Mập: Làm việc chậm mà chắc thì sẽ không sai.', 'Thím Mập: Có thời gian thì ghé qua trò chuyện nhé.', 'Thím Mập: Chúc bạn hôm nay thu hoạch thật tốt.'],
  a_hua: ['A Hoa: Hôm nay công việc trong làng khá bận rộn.', 'A Hoa: Thời tiết hôm nay thật dễ chịu.', 'A Hoa: Làm việc chậm mà chắc thì sẽ không sai.', 'A Hoa: Có thời gian thì ghé qua trò chuyện nhé.', 'A Hoa: Chúc bạn hôm nay thu hoạch thật tốt.'],
  shi_tou: ['Thạch Đầu: Hôm nay công việc trong làng khá bận rộn.', 'Thạch Đầu: Thời tiết hôm nay thật dễ chịu.', 'Thạch Đầu: Làm việc chậm mà chắc thì sẽ không sai.', 'Thạch Đầu: Có thời gian thì ghé qua trò chuyện nhé.', 'Thạch Đầu: Chúc bạn hôm nay thu hoạch thật tốt.'],
  hui_niang: ['Huệ Nương: Hôm nay công việc trong làng khá bận rộn.', 'Huệ Nương: Thời tiết hôm nay thật dễ chịu.', 'Huệ Nương: Làm việc chậm mà chắc thì sẽ không sai.', 'Huệ Nương: Có thời gian thì ghé qua trò chuyện nhé.', 'Huệ Nương: Chúc bạn hôm nay thu hoạch thật tốt.'],
  lao_lu: ['Lão Lục: Hôm nay công việc trong làng khá bận rộn.', 'Lão Lục: Thời tiết hôm nay thật dễ chịu.', 'Lão Lục: Làm việc chậm mà chắc thì sẽ không sai.', 'Lão Lục: Có thời gian thì ghé qua trò chuyện nhé.', 'Lão Lục: Chúc bạn hôm nay thu hoạch thật tốt.'],
  liu_cunzhang: ['Trưởng thôn Liễu: Hôm nay công việc trong làng khá bận rộn.', 'Trưởng thôn Liễu: Thời tiết hôm nay thật dễ chịu.', 'Trưởng thôn Liễu: Làm việc chậm mà chắc thì sẽ không sai.', 'Trưởng thôn Liễu: Có thời gian thì ghé qua trò chuyện nhé.', 'Trưởng thôn Liễu: Chúc bạn hôm nay thu hoạch thật tốt.'],
  qian_niang: ['Tiền Nương: Hôm nay công việc trong làng khá bận rộn.', 'Tiền Nương: Thời tiết hôm nay thật dễ chịu.', 'Tiền Nương: Làm việc chậm mà chắc thì sẽ không sai.', 'Tiền Nương: Có thời gian thì ghé qua trò chuyện nhé.', 'Tiền Nương: Chúc bạn hôm nay thu hoạch thật tốt.'],
  he_zhanggui: ['Chưởng quầy Hà: Hôm nay công việc trong làng khá bận rộn.', 'Chưởng quầy Hà: Thời tiết hôm nay thật dễ chịu.', 'Chưởng quầy Hà: Làm việc chậm mà chắc thì sẽ không sai.', 'Chưởng quầy Hà: Có thời gian thì ghé qua trò chuyện nhé.', 'Chưởng quầy Hà: Chúc bạn hôm nay thu hoạch thật tốt.'],
  qin_dashu: ['Chú Tần: Hôm nay công việc trong làng khá bận rộn.', 'Chú Tần: Thời tiết hôm nay thật dễ chịu.', 'Chú Tần: Làm việc chậm mà chắc thì sẽ không sai.', 'Chú Tần: Có thời gian thì ghé qua trò chuyện nhé.', 'Chú Tần: Chúc bạn hôm nay thu hoạch thật tốt.'],
  a_fu: ['A Phúc: Hôm nay công việc trong làng khá bận rộn.', 'A Phúc: Thời tiết hôm nay thật dễ chịu.', 'A Phúc: Làm việc chậm mà chắc thì sẽ không sai.', 'A Phúc: Có thời gian thì ghé qua trò chuyện nhé.', 'A Phúc: Chúc bạn hôm nay thu hoạch thật tốt.'],
}

export const NPC_CLOSE_CHATTER: Record<string, string[]> = {
  chen_bo: ['Bác Trần: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  liu_niang: ['Liễu Nương: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  a_shi: ['A Thạch: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  qiu_yue: ['Thu Nguyệt: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  lin_lao: ['Lâm Lão: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  xiao_man: ['Tiểu Mãn: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  chun_lan: ['Xuân Lan: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  xue_qin: ['Tuyết Cần: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  su_su: ['Tố Tố: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  hong_dou: ['Hồng Đậu: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  dan_qing: ['Đan Thanh: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  a_tie: ['A Thiết: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  yun_fei: ['Vân Phi: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  da_niu: ['Đại Ngưu: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  mo_bai: ['Mặc Bạch: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  wang_dashen: ['Thím Vương: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  zhao_mujiang: ['Triệu thợ mộc: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  sun_tiejiang: ['Thợ rèn Tôn: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  zhang_popo: ['Bà cụ Trương: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  li_yu: ['Lão ngư họ Lý: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  zhou_xiucai: ['Chu Tú Tài: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  wu_shen: ['Thím Ngô: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  ma_liu: ['Mã Lục: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  lao_song: ['Lão Tống: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  pang_shen: ['Thím Mập: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  a_hua: ['A Hoa: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  shi_tou: ['Thạch Đầu: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  hui_niang: ['Huệ Nương: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  lao_lu: ['Lão Lục: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  liu_cunzhang: ['Trưởng thôn Liễu: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  qian_niang: ['Tiền Nương: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  he_zhanggui: ['Chưởng quầy Hà: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  qin_dashu: ['Chú Tần: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
  a_fu: ['A Phúc: Có những chuyện chỉ khi đủ thân thiết mới muốn chia sẻ.', '{player}, cảm ơn bạn đã luôn lắng nghe.'],
}

/** 抽取闲聊时的情境 */
export interface ChatterContext {
  season: Season
  weather: Weather
  period: TimePeriod
  level: FriendshipLevel
}

/**
 * 组装某位村民此刻可能说的话。
 * 专属台词权重更高（重复入池），避免通用闲聊把角色个性冲淡。
 */
export const buildChatterPool = (npcId: string, ctx: ChatterContext): string[] => {
  const pool: string[] = []

  // 日常层：专属台词占大头
  const daily = NPC_CHATTER[npcId]
  if (daily) pool.push(...daily, ...daily)

  // 交心层：熟络之后解锁
  if (ctx.level === 'friendly' || ctx.level === 'bestFriend') {
    const close = NPC_CLOSE_CHATTER[npcId]
    if (close) pool.push(...close, ...close)
  }

  // 情境层：所有人共用，提供"Hôm nay thật khác"的感觉
  pool.push(...SEASON_CHATTER[ctx.season])
  const weatherLines = WEATHER_CHATTER[ctx.weather]
  if (weatherLines) pool.push(...weatherLines)
  const periodLines = PERIOD_CHATTER[ctx.period]
  if (periodLines) pool.push(...periodLines)

  return pool
}
