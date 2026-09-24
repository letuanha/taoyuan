// === 晨间随机事件数据 ===
// 设计理念：不是系统，是"Một câu dẫn chuyện buổi sáng"

/** 效果类型 */
export type MorningEffect =
  | { type: 'loseCrop' }
  | { type: 'gainItem'; itemId: string; qty: number }
  | { type: 'gainMoney'; amount: number }
  | { type: 'gainFriendship'; amount: number }

/** 小偷/动物旁白（4%） */
export interface MorningNarration {
  message: string
  effect?: MorningEffect
}

/** 带选项事件（0.8%） */
export interface MorningChoiceEvent {
  id: string
  message: string
  choices: {
    label: string
    result: string
    effect?: MorningEffect
  }[]
}

/** 彩蛋旁白（0.2%） */
export interface MorningEasterEgg {
  message: string
  effect?: MorningEffect
}

// ==================== 4% 小偷/动物旁白（25条） ====================

export const MORNING_NARRATIONS: MorningNarration[] = [
  // —— 有轻微损失 ——
  {
    message: 'Rau trong ruộng bị thứ gì đó gặm một miếng, bên cạnh còn để lại một hàng dấu chân nhỏ.',
    effect: { type: 'loseCrop' }
  },
  {
    message: 'Một con quạ tha đi một quả vừa chín, đậu trên cành kêu hai tiếng đầy đắc ý.',
    effect: { type: 'loseCrop' }
  },
  {
    message: 'Một cây trồng ngoài ruộng bị nhổ bật cả rễ và vứt bên cạnh, có vẻ là do lợn rừng.',
    effect: { type: 'loseCrop' }
  },
  {
    message: 'Một cây con ở góc ruộng bị ai đó giẫm gãy, trên đất còn dấu móng.',
    effect: { type: 'loseCrop' }
  },
  // —— 有轻微收获 ——
  {
    message: 'Có vẻ ai đó đã hái một nắm rau dại, nhưng để lại ba văn trước cửa.',
    effect: { type: 'gainMoney', amount: 3 }
  },
  {
    message: 'Ngoài hàng rào có một chiếc giỏ nhỏ đan bằng cỏ, bên trong có vài cây thuốc, không biết ai để lại.',
    effect: { type: 'gainItem', itemId: 'herb', qty: 1 }
  },
  {
    message: 'Bên đống củi sau nhà có thêm một bó tre nhỏ được xếp ngay ngắn. Có lẽ là người tiều phu tốt bụng nào đó.',
    effect: { type: 'gainItem', itemId: 'bamboo', qty: 2 }
  },
  // —— 纯旁白 ——
  { message: 'Trên hàng rào mắc vài sợi lông thỏ, xem ra đêm qua có vị khách không mời.' },
  { message: 'Một con mèo hoang đang ngủ gật bên bờ ruộng, xem ra đã ở lì cả đêm.' },
  { message: 'Bên vườn rau có một đống vỏ hạt do sóc giấu, có vẻ chúng rất thích nông trại của bạn.' },
  { message: 'Sáng sớm ra ngoài, bạn thấy một hàng dấu chân nhỏ kéo dài từ vườn rau ra ngoài hàng rào.' },
  { message: 'Một con nhím làm tổ trong đống phân ủ, trông có vẻ rất hài lòng với chỗ ở mới.' },
  { message: 'Bù nhìn bên ruộng bị nghiêng, như thể vừa bị thứ gì đó va vào. Có lẽ là hươu hoang đi ngang ban đêm.' },
  { message: 'Bên giếng có vài chiếc lông rơi rải rác, có lẽ gà lôi hoang đã tới uống nước.' },
  { message: 'Một con cú đậu trên mái nhà, nghiêng đầu quan sát bạn. Bạn vừa cử động, nó đã bay đi.' },
  { message: 'Bên bờ ruộng có thêm một cái hang nhỏ, trông như do chuột đồng đào. May là cây trồng không bị hại.' },
  { message: 'Sương sớm tan đi, trên hàng rào còn một mạng nhện, giọt sương lấp lánh dưới nắng.' },
  { message: 'Mấy con chim sẻ cãi nhau ầm ĩ dưới mái hiên, không biết chúng đang tranh chuyện gì.' },
  { message: 'Trong mương nước có thêm vài chú nòng nọc, xem ra ếch cũng thích nông trại của bạn.' },
  { message: 'Một con thạch sùng nằm im trên tảng đá lớn đầu ruộng để sưởi nắng.' },
  { message: 'Gió thổi tới một làn hương hoa quế, không biết từ sân nhà ai bay sang.' },
  { message: 'Bù nhìn của bạn nghiêng hơn nữa. Biết đâu ban đêm nó đã lén hoạt động.' },
  { message: 'Sáng sớm có một con chuồn chuồn đậu trên chiếc cuốc của bạn, đôi cánh mỏng đến mức xuyên sáng.' },
  { message: 'Một đàn kiến đang tha thứ gì đó qua bờ ruộng, hàng dài đến mức không thấy điểm cuối.' },
  { message: 'Góc nông trại có thêm một tổ chim nhỏ, xem ra có chim định làm nhà ở đây.' }
]

/** 纯旁白（无 loseCrop）的子集，空农场回退用 */
export const NARRATIONS_NO_LOSS: MorningNarration[] = MORNING_NARRATIONS.filter(n => !n.effect || n.effect.type !== 'loseCrop')

// ==================== 0.8% 带选项事件（15条） ====================

export const MORNING_CHOICE_EVENTS: MorningChoiceEvent[] = [
  {
    id: 'injured_bird',
    message: 'Sáng sớm, bạn phát hiện một chú chim nhỏ bị thương bên bờ ruộng, nó dùng đôi mắt đen láy như hạt đậu nhìn bạn chằm chằm.',
    choices: [
      {
        label: 'Băng bó vết thương, để nó dưỡng thương một thời gian',
        result: 'Bạn cẩn thận băng bó lại đôi cánh cho chú chim nhỏ. Dân làng nghe được chuyện này, ai nấy đều khen bạn tốt bụng.',
        effect: { type: 'gainFriendship', amount: 10 }
      },
      {
        label: 'Thả nó lại vào lùm cây',
        result: 'Chú chim nhỏ vỗ cánh bay đi, trước lúc rời đi còn kêu lên hai tiếng, tựa như đang muốn nói lời cảm ơn.'
      }
    ]
  },
  {
    id: 'hungry_traveler',
    message: 'Bên ngoài nông trại có một lữ khách phong trần mệt mỏi đi tới, trông có vẻ vừa mệt vừa đói.',
    choices: [
      {
        label: 'Mời người đó một bữa cơm',
        result: 'Lữ khách ăn no xong thì muôn vàn cảm tạ, lúc rời đi còn lấy từ trong tay nải ra một nắm thảo dược để tặng cho bạn.',
        effect: { type: 'gainItem', itemId: 'herb', qty: 3 }
      },
      {
        label: 'Chỉ đường cho người đó đi vào làng',
        result: 'Lữ khách cúi người chào bạn một cái, rồi dọc theo con đường mòn đi về phía ngôi làng.'
      }
    ]
  },
  {
    id: 'stealing_child',
    message: 'Một đứa trẻ đang lén lút nhổ củ cải trong ruộng của bạn, thấy bạn bước ra thì sợ đến mức sững sờ.',
    choices: [
      {
        label: 'Tặng thêm cho đứa bé vài củ',
        result: 'Đứa trẻ đỏ mặt nhận lấy rau củ, cúi chào một cái rồi bỏ chạy. Sau này mẹ của đứa bé đã đích thân tới cảm ơn.',
        effect: { type: 'gainFriendship', amount: 15 }
      },
      {
        label: 'Giả vờ như không nhìn thấy',
        result: 'Bạn quay người về nhà, nghe thấy phía sau lưng có tiếng sột soạt, sau đó là tiếng bước chân đi xa dần.'
      }
    ]
  },
  {
    id: 'mysterious_cat',
    message: 'Một con mèo đen chưa từng gặp bao giờ đang ngồi xổm trên ruộng, trước mặt nó đặt ngay ngắn một quả thông.',
    choices: [
      {
        label: 'Nhận lấy quả thông',
        result: 'Bạn khom lưng nhặt quả thông lên, mèo đen kêu meo một tiếng, chậm rãi biến mất trong màn sương sớm.',
        effect: { type: 'gainItem', itemId: 'pine_cone', qty: 1 }
      },
      {
        label: 'Sờ sờ đầu nó',
        result: 'Mèo đen kêu gừ gừ vài tiếng, cọ cọ vào tay bạn, sau đó trèo qua tường bỏ đi.'
      }
    ]
  },
  {
    id: 'old_man_fishing',
    message: 'Một ông lão râu trắng đang câu cá ở mương nước cạnh nông trại của bạn, thấy bạn bước ra thì cười chào hỏi.',
    choices: [
      {
        label: 'Ngồi xuống trò chuyện một lát',
        result: 'Ông lão đã chia sẻ không ít mánh khóe trồng trọt. Bạn cảm thấy được hưởng lợi rất nhiều.',
        effect: { type: 'gainFriendship', amount: 8 }
      },
      {
        label: 'Pha cho ông ấy một tách trà',
        result: 'Ông lão vui vẻ uống trà, trước khi đi còn để lại vài con cá trong thùng cho bạn.',
        effect: { type: 'gainMoney', amount: 50 }
      }
    ]
  },
  {
    id: 'lost_dog',
    message: 'Một chú chó nhỏ bẩn thỉu cuộn tròn trước cửa nhà bạn, trông có vẻ như đã đi lạc từ rất lâu rồi.',
    choices: [
      {
        label: 'Tắm rửa và cho nó ăn chút gì đó',
        result: 'Chú chó nhỏ vẫy đuôi liếm tay bạn. Nó ở nhà bạn một ngày, đến chập tối thì được chủ nhân đón đi. Chủ nhân của nó để lại một ít tiền thay cho lời cảm ơn.',
        effect: { type: 'gainMoney', amount: 30 }
      },
      {
        label: 'Dẫn nó vào làng tìm chủ',
        result: 'Bạn dẫn chú chó nhỏ đi một vòng quanh làng, rất nhanh đã tìm thấy chủ của nó. Mọi người đều khen bạn nhiệt tình.',
        effect: { type: 'gainFriendship', amount: 8 }
      }
    ]
  },
  {
    id: 'herb_woman',
    message: 'Một bà lão đeo gùi tre đi ngang qua, hỏi xin bạn một bát nước để uống.',
    choices: [
      {
        label: 'Bưng một bát nước ra cho bà',
        result: 'Bà lão uống xong thì cảm tạ, trước lúc rời đi còn nắm một nắm thảo dược từ trong gùi tre đưa cho bạn.',
        effect: { type: 'gainItem', itemId: 'herb', qty: 2 }
      },
      {
        label: 'Mời bà lão nghỉ chân một lát',
        result: 'Bà lão ngồi nghỉ một lát, luôn miệng khen ngợi người trẻ tuổi tốt bụng. Bạn lờ mờ cảm thấy bà lão này trông có vẻ hơi quen quen.',
        effect: { type: 'gainFriendship', amount: 5 }
      }
    ]
  },
  {
    id: 'fox_standoff',
    message: 'Một con hồ ly đang ngậm thứ gì đó ngồi chồm hổm trong luống rau, thấy bạn bước ra cũng không thèm chạy, cứ thế trố mắt nhìn nhau.',
    choices: [
      {
        label: 'Xua tay đuổi nó đi',
        result: 'Hồ ly thong dong chạy mất. Bạn kiểm tra lại một vòng, luống rau không có tổn thất gì cả.'
      },
      {
        label: 'Ném cho nó một miếng bánh',
        result: 'Hồ ly nhả thứ đang ngậm trong miệng ra, ngoạm lấy miếng bánh bỏ chạy. Bạn nhặt lên xem thử, thì ra là một quả thông.',
        effect: { type: 'gainItem', itemId: 'pine_cone', qty: 1 }
      }
    ]
  },
  {
    id: 'broken_fence',
    message: 'Một đoạn hàng rào bị thứ gì đó húc vỡ ra thành một cái lỗ, vài con thỏ rừng đang nhàn nhã gặm cỏ trên đồng.',
    choices: [
      {
        label: 'Sửa hàng rào trước',
        result: 'Bạn mất chút công sức để vá lại hàng rào. Bầy thỏ rừng hoảng hốt chạy thoát ra từ chỗ hổng đó.'
      },
      {
        label: 'Xem thử xem bọn chúng đang ăn gì',
        result: 'Thỏ rừng đang gặm cỏ dại, hoàn toàn không chạm vào cây trồng. Bạn bật cười, mặc kệ bọn chúng. Bọn chúng ngược lại còn giúp bạn diệt trừ bớt cỏ dại.'
      }
    ]
  },
  {
    id: 'rain_mushroom',
    message: 'Đêm qua trời đổ mưa, bên bờ ruộng mọc lên vài cây nấm.',
    choices: [
      {
        label: 'Hái một ít',
        result: 'Bạn nhận ra đây là nấm rừng có thể ăn được, thuận tay hái vài cây.',
        effect: { type: 'gainItem', itemId: 'wild_mushroom', qty: 2 }
      },
      { label: 'Cứ giữ nguyên đó đừng động vào', result: 'Bạn quyết định cứ để chúng tiếp tục lớn. Không chừng vài ngày nữa sẽ mọc ra nhiều hơn.' }
    ]
  },
  {
    id: 'painting_visitor',
    message: 'Một thanh niên đeo bảng vẽ đang đứng bên bờ ruộng, vẽ lại nông trại của bạn.',
    choices: [
      {
        label: 'Đi qua xem thử',
        result: 'Vẽ cũng khá đẹp đấy. Thanh niên kia bảo cảnh sắc nơi này mang lại cho cậu ta rất nhiều cảm hứng, tặng bạn vài đồng xu để thay cho lời cảm ơn.',
        effect: { type: 'gainMoney', amount: 20 }
      },
      {
        label: 'Mang cho cậu ta một tách trà',
        result: 'Người thanh niên cảm kích nhận lấy tách trà. Cậu ta bảo sau này sẽ gửi lại bức tranh cho bạn. Bạn đã mong chờ điều đó suốt một thời gian dài.',
        effect: { type: 'gainFriendship', amount: 5 }
      }
    ]
  },
  {
    id: 'snake_shed',
    message: 'Bên mương nước phát hiện một lớp xác rắn lột hoàn chỉnh, mỏng đến mức gần như trong suốt.',
    choices: [
      {
        label: 'Cất đi',
        result: 'Người xưa bảo xác rắn là một điềm tốt. Bạn đem treo nó dưới mái hiên, tâm trạng khá vui vẻ.'
      },
      {
        label: 'Đặt lại chỗ cũ',
        result: 'Bạn đặt xác rắn lại cẩn thận, quay người rời đi. Những thứ thuộc về thiên nhiên, tốt nhất vẫn nên để lại cho thiên nhiên vậy.'
      }
    ]
  },
  {
    id: 'wild_bee_nest',
    message: 'Trên cây cổ thụ sau nhà có thêm một cái tổ ong nhỏ, vài con ong mật đang bay vo ve bận rộn.',
    choices: [
      {
        label: 'Cứ để chúng ở đó',
        result: 'Ong mật giúp thụ phấn cho hoa màu rất tốt. Bạn quyết định chung sống hòa bình với chúng.'
      },
      {
        label: 'Cẩn thận lấy một ít mật',
        result: 'Bạn dùng phương pháp hun khói để lấy một tảng mật ong nhỏ. Tuy không nhiều, nhưng hương vị lại vô cùng ngọt ngào.',
        effect: { type: 'gainItem', itemId: 'honey', qty: 1 }
      }
    ]
  },
  {
    id: 'stone_buddha',
    message: 'Lúc xới đất đào được một hòn đá to bằng nắm tay, nhìn kỹ thì thấy giống một bức tượng Phật nhỏ.',
    choices: [
      {
        label: 'Lau sạch sẽ rồi đặt cạnh bờ ruộng',
        result: 'Bạn lau sạch bức tượng Phật nhỏ rồi đặt lại ngay ngắn. Dân làng đi ngang qua bảo đây là một điềm lành, vận may của mọi người sắp tốt lên rồi.',
        effect: { type: 'gainFriendship', amount: 10 }
      },
      {
        label: 'Cất đi đem bán',
        result: 'Bạn đem tới cho thương nhân đồ cổ trong làng xem thử, đổi được một vài đồng xu.',
        effect: { type: 'gainMoney', amount: 66 }
      }
    ]
  },
  {
    id: 'bamboo_shoots',
    message: 'Sau cơn mưa đêm qua, dưới chân hàng rào nhú lên vài búp măng.',
    choices: [
      {
        label: 'Đào lên',
        result: 'Măng tươi thế này, đem nấu ăn chắc chắn sẽ rất ngon.',
        effect: { type: 'gainItem', itemId: 'bamboo', qty: 3 }
      },
      {
        label: 'Để cho chúng lớn',
        result: 'Bạn quyết định để cho măng tiếp tục lớn. Chẳng bao lâu nữa, nơi này sẽ có thêm vài cây trúc.'
      }
    ]
  }
]

// ==================== 0.2% 彩蛋（10条） ====================

export const MORNING_EASTER_EGGS: MorningEasterEgg[] = [
  {
    message: 'Khi xới đất, bạn đào được một đồng tiền đồng cổ. Chữ trên đó đã mờ nhưng vẫn thấp thoáng ánh sáng.',
    effect: { type: 'gainItem', itemId: 'ancient_coin', qty: 1 }
  },
  {
    message: 'Một con bướm vàng bay giữa ruộng, lượn quanh bạn ba vòng rồi bay về núi xa. Người ta nói ai nhìn thấy nó sẽ gặp may.'
  },
  {
    message: 'Đêm qua dường như có một trận mưa cánh hoa, cả nông trại ngập trong hương hoa nhè nhẹ. Không ai biết hoa từ đâu tới.'
  },
  {
    message: 'Bạn nhìn thấy bóng mình dưới đáy giếng, nhưng cái bóng dường như đã mỉm cười. Chắc là bạn vẫn chưa tỉnh ngủ.'
  },
  {
    message: 'Sáng sớm mở cửa, bạn thấy trước cửa có một bó hoa dại không tên được buộc ngay ngắn bằng dây cỏ. Không ai biết ai đã đặt nó ở đó.',
    effect: { type: 'gainMoney', amount: 88 }
  },
  {
    message: 'Một con hạc trắng bay từ chân trời tới, dừng trên ruộng bạn một lúc rồi vỗ cánh bay đi. Người xưa nói hạc trắng là vật cưỡi của tiên nhân.'
  },
  {
    message: 'Sáng nay dường như mọi cây trồng đều khỏe khoắn hơn hôm qua một chút. Có thể chỉ là ảo giác, cũng có thể không.'
  },
  {
    message: 'Bạn tìm thấy một đồng tiền đồng không biết từ đâu dưới gối. Nghĩ kỹ lại, hình như đêm qua bạn mơ thấy Thần Tài.',
    effect: { type: 'gainMoney', amount: 66 }
  },
  {
    message: 'Hôm nay bù nhìn quay sang hướng khác. Bạn chắc chắn hôm qua nó không đặt như vậy. …Chắc chứ?'
  },
  {
    message: 'Trời chưa sáng, bạn nghe vài tiếng sáo từ xa, du dương đến mức không giống người phàm thổi. Khi mở cửa nhìn, chẳng có gì cả.'
  }
]
