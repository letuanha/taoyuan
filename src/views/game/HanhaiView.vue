<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center space-x-1.5 text-sm text-accent">
        <Tent :size="14" />
        <span>Hãn Hải</span>
      </div>
      <span v-if="hanhaiStore.unlocked" class="text-xs text-success">Đã mở khóa</span>
      <span v-else class="text-xs text-muted">Chưa mở khóa</span>
    </div>

    <!-- 未解锁 -->
    <div v-if="!hanhaiStore.unlocked" class="flex flex-col items-center justify-center py-10 space-y-3">
      <Tent :size="48" class="text-accent/30" />
      <p class="text-sm text-muted">Tuyến thương mại chưa mở khóa</p>
      <p class="text-xs text-muted/60 text-center max-w-60">cần muốn đánhbạiMỏlượt120tầngBOSSvàchitrả{{ HANHAI_UNLOCK_COST }}vănsửađườngphí</p>
      <Button v-if="bossDefeated" :class="canUnlock ? '!bg-accent !text-bg' : 'opacity-50'" :disabled="!canUnlock" @click="handleUnlock">
        mởgiaothương mạiđường ({{ HANHAI_UNLOCK_COST }}văn)
      </Button>
      <p v-if="bossDefeated && !canUnlock" class="text-xs text-danger">Tiềnkhôngđủ（cần muốn {{ HANHAI_UNLOCK_COST }}văn）</p>
      <p v-if="!bossDefeated" class="text-xs text-danger">Cần đánh bại BOSS tầng 120 của mỏ trước</p>
    </div>

    <!-- 已解锁 -->
    <template v-else>
      <!-- 标签页 -->
      <div class="flex space-x-1 mb-3">
        <Button class="flex-1 justify-center" :class="{ '!bg-accent !text-bg': activeTab === 'shop' }" @click="activeTab = 'shop'">
          Cửa hàng trạm dịch
        </Button>
        <Button class="flex-1 justify-center" :class="{ '!bg-accent !text-bg': activeTab === 'trade' }" @click="activeTab = 'trade'">
          Thông thương
        </Button>
        <Button class="flex-1 justify-center" :class="{ '!bg-accent !text-bg': activeTab === 'casino' }" @click="activeTab = 'casino'">
          Sòng bạc Hãn Hải
        </Button>
      </div>

      <!-- 驿站商店 -->
      <template v-if="activeTab === 'shop'">
        <div class="flex flex-col space-y-1 max-h-80 overflow-y-auto">
          <!-- 固定商品 -->
          <p class="text-xs text-muted mb-0.5">Hàng thường trực</p>
          <div
            v-for="item in HANHAI_FIXED_ITEMS"
            :key="item.itemId"
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5 transition-colors mr-1"
            @click="shopModalItem = item"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs truncate">{{ item.name }}</p>
              <p class="text-xs text-muted truncate">{{ item.description }}</p>
            </div>
            <div class="flex flex-col items-end ml-2 shrink-0">
              <span class="text-xs text-accent">{{ item.price }}văn</span>
              <span
                v-if="item.weeklyLimit"
                class="text-[10px]"
                :class="hanhaiStore.getWeeklyRemaining(item.itemId) > 0 ? 'text-muted' : 'text-danger'"
              >
                giới hạnmua {{ hanhaiStore.getWeeklyRemaining(item.itemId) }}/{{ item.weeklyLimit }}
              </span>
            </div>
          </div>
          <!-- 轮换商品 -->
          <p class="text-xs text-muted mt-2 mb-0.5">Luân phiên tuần này</p>
          <div
            v-for="item in hanhaiStore.weeklyRotatingStock"
            :key="item.itemId"
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5 transition-colors mr-1"
            @click="shopModalItem = item"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs truncate">{{ item.name }}</p>
              <p class="text-xs text-muted truncate">{{ item.description }}</p>
            </div>
            <div class="flex flex-col items-end ml-2 shrink-0">
              <span class="text-xs text-accent">{{ item.price }}văn</span>
              <span
                v-if="item.weeklyLimit"
                class="text-[10px]"
                :class="hanhaiStore.getWeeklyRemaining(item.itemId) > 0 ? 'text-muted' : 'text-danger'"
              >
                giới hạnmua {{ hanhaiStore.getWeeklyRemaining(item.itemId) }}/{{ item.weeklyLimit }}
              </span>
            </div>
          </div>
        </div>
        <!-- 藏宝图寻宝 -->
        <Button v-if="treasureMapCount > 0" :icon="Map" :icon-size="12" class="w-full justify-center mt-2" @click="handleUseTreasureMap">
          khiếndùnggiấubáubộ sưu tậpkiếmbáu（{{ treasureMapCount }}lá）
        </Button>
      </template>

      <!-- 通商 -->
      <template v-if="activeTab === 'trade'">
        <!-- 通商积分 -->
        <div class="border border-accent/20 rounded-xs p-2 mb-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">Điểm thông thương</span>
            <span class="text-xs text-accent">{{ hanhaiStore.tradePoints }}</span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <span class="text-xs text-muted">Cấp cửa hàng</span>
            <span class="text-xs">{{ hanhaiStore.tradeShopConfig.name }}（Lv.{{ hanhaiStore.tradeShopLevel }}）</span>
          </div>
        </div>

        <!-- 售货槽位 -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <p class="text-xs text-accent flex items-center space-x-1">
              <Store :size="12" />
              <span>Quầy bán hàng</span>
            </p>
            <span class="text-xs text-muted">{{ hanhaiStore.tradeSlots.length }}/{{ hanhaiStore.tradeShopConfig.maxSlots }}</span>
          </div>
          <!-- 已有槽位 -->
          <div v-for="(slot, idx) in hanhaiStore.tradeSlots" :key="idx" class="border border-accent/10 rounded-xs px-2 py-1.5 mb-1">
            <div class="flex items-center justify-between">
              <span class="text-xs">{{ getItemName(slot.itemId) }}×{{ slot.quantity }}</span>
              <span class="text-xs text-muted">{{ slot.daysRemaining }}ngàysaubánra</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-[10px] text-muted">{{ qualityLabel(slot.quality) }}</span>
              <span class="text-[10px] text-accent">+{{ slot.pointsReward }}tíchđiểm</span>
            </div>
          </div>
          <!-- 上架按钮 -->
          <Button
            v-if="hanhaiStore.tradeSlots.length < hanhaiStore.tradeShopConfig.maxSlots"
            class="w-full justify-center mt-1"
            @click="showTradeAddModal = true"
          >
            Đăng bán vật phẩm
          </Button>
        </div>

        <!-- 店铺升级 -->
        <div v-if="hanhaiStore.nextTradeShopUpgrade" class="border border-accent/20 rounded-xs p-2 mb-3">
          <p class="text-xs text-accent mb-1">Nâng cấp cửa hàng</p>
          <p class="text-xs text-muted mb-1">
            Cấp tiếp theo: {{ hanhaiStore.nextTradeShopUpgrade.name }} ({{ hanhaiStore.nextTradeShopUpgrade.maxSlots }} ô · {{
              hanhaiStore.nextTradeShopUpgrade.sellDays
            }}ngày）
          </p>
          <p class="text-xs text-muted mb-1">
            phídùng：{{ hanhaiStore.nextTradeShopUpgrade.cost }}văn
            <template v-for="mat in hanhaiStore.nextTradeShopUpgrade.materialCost" :key="mat.itemId">
              + {{ getItemName(mat.itemId) }}×{{ mat.quantity }}
            </template>
          </p>
          <Button class="w-full justify-center" @click="handleUpgradeTrade">Nâng cấp</Button>
        </div>
        <div v-else class="text-xs text-muted text-center mb-3">cửa hàngquánđã đầycấp</div>

        <!-- 积分兑换商店 -->
        <div class="mb-2">
          <p class="text-xs text-accent mb-1 flex items-center space-x-1">
            <Gift :size="12" />
            <span>tíchđiểmđổiđổi</span>
          </p>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="exItem in TRADE_EXCHANGE_ITEMS"
              :key="exItem.itemId"
              class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1.5 cursor-pointer hover:bg-accent/5 transition-colors mr-1"
              @click="exchangeModalItem = exItem"
            >
              <div class="flex-1 min-w-0">
                <p class="text-xs truncate">{{ exItem.name }}</p>
                <p class="text-[10px] text-muted truncate">
                  {{ exItem.description }}
                </p>
              </div>
              <div class="flex flex-col items-end ml-2 shrink-0">
                <span class="text-xs text-accent">{{ exItem.pointsCost }}tíchđiểm</span>
                <span v-if="exItem.weeklyLimit" class="text-[10px] text-muted">tuầngiới hạn{{ getExchangeWeeklyRemaining(exItem) }}</span>
                <span
                  v-if="exItem.totalLimit"
                  class="text-[10px]"
                  :class="getExchangeTotalRemaining(exItem) > 0 ? 'text-muted' : 'text-danger'"
                >
                  {{ getExchangeTotalRemaining(exItem) > 0 ? 'Có thể đổi' : 'Đã đổi' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 赌坊 -->
      <template v-if="activeTab === 'casino'">
        <div class="border border-accent/20 rounded-xs p-2 mb-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">hôm nayngàycòn cònlầnsố</span>
            <span class="text-xs" :class="hanhaiStore.canBet ? 'text-accent' : 'text-danger'">
              {{ hanhaiStore.betsRemaining }}/{{ MAX_DAILY_BETS }}
            </span>
          </div>
        </div>

        <!-- 次数用完 -->
        <div v-if="!hanhaiStore.canBet" class="flex flex-col items-center justify-center py-8 space-y-3">
          <Dices :size="48" class="text-accent/30" />
          <p class="text-sm text-muted">Hôm nay đã dùng hết số lượt cờ bạc</p>
          <p class="text-xs text-muted/60">ngày maingàylạiđếngặpgặpvậnkhínhé</p>
        </div>

        <div v-else class="flex flex-col space-y-2">
          <!-- 幸运轮盘 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <CircleDot :size="12" />
              <span>Vòng quay may mắn</span>
            </p>
            <p class="text-xs text-muted mb-2">chọn némcượcvàngsố tiền，xoaytácvòngmâmthắnglấylầnsốphần thưởng</p>
            <div class="flex space-x-1">
              <Button
                v-for="tier in ROULETTE_BET_TIERS"
                :key="tier"
                class="flex-1 justify-center"
                :disabled="playerStore.money < tier"
                @click="handleRoulette(tier)"
              >
                {{ tier }}văn
              </Button>
            </div>
          </div>

          <!-- 骰子猜大小 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Dices :size="12" />
              <span>Đoán lớn nhỏ bằng xúc xắc</span>
            </p>
            <p class="text-xs text-muted mb-2">némcược{{ DICE_BET_AMOUNT }}văn，đoánđúnglớnnhỏthắng2lần</p>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="playerStore.money < DICE_BET_AMOUNT" @click="handleDice(false)">
                đoánnhỏ (2-6)
              </Button>
              <Button class="flex-1 justify-center" :disabled="playerStore.money < DICE_BET_AMOUNT" @click="handleDice(true)">
                đoánlớn (7-12)
              </Button>
            </div>
          </div>

          <!-- 猜杯 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Trophy :size="12" />
              <span>Đoán cốc</span>
            </p>
            <p class="text-xs text-muted mb-2">némcược{{ CUP_BET_AMOUNT }}văn，3chọn1đoántrongthắng{{ CUP_WIN_MULTIPLIER }}lần</p>
            <div class="flex space-x-1">
              <Button
                v-for="i in 3"
                :key="i"
                class="flex-1 justify-center"
                :disabled="playerStore.money < CUP_BET_AMOUNT"
                @click="handleCup(i - 1)"
              >
                thứ{{ i }}cốc
              </Button>
            </div>
          </div>

          <!-- 斗蛐蛐 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Bug :size="12" />
              <span>Đấu dế</span>
            </p>
            <p class="text-xs text-muted mb-2">némcược{{ CRICKET_BET_AMOUNT }}văn，chọndếdếlêntrậnđúngchiến，thắng{{ CRICKET_WIN_MULTIPLIER }}lần</p>
            <div class="flex space-x-1">
              <Button
                v-for="c in CRICKETS"
                :key="c.id"
                class="flex-1 justify-center"
                :disabled="playerStore.money < CRICKET_BET_AMOUNT"
                @click="handleCricket(c)"
              >
                {{ c.name }}
              </Button>
            </div>
          </div>

          <!-- 翻牌寻宝 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Gem :size="12" />
              <span>Lật bài tìm kho báu</span>
            </p>
            <p class="text-xs text-muted mb-2">némcược{{ CARD_BET_AMOUNT }}văn，{{ CARD_TOTAL }}lábàitrong{{ CARD_TREASURE_COUNT }}lácóbáu</p>
            <div class="flex space-x-1">
              <Button
                v-for="i in CARD_TOTAL"
                :key="i"
                class="flex-1 justify-center"
                :disabled="playerStore.money < CARD_BET_AMOUNT"
                @click="handleCardFlip(i - 1)"
              >
                {{ i }}
              </Button>
            </div>
          </div>

          <!-- 瀚海扑克 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Spade :size="12" />
              <span>HãnHảipokerkhắc</span>
            </p>
            <p class="text-xs text-muted mb-2">chọn trậnlầnvàotrận，vàotrậnphítứcchipsố，mỗivánphínướcchochia bàiquan</p>
            <div class="flex flex-col space-y-1">
              <div
                v-for="t in TEXAS_TIERS"
                :key="t.id"
                class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1.5"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-xs">{{ t.name }}</p>
                  <p class="text-xs text-muted">vàotrận{{ t.entryFee }}văn + phínước{{ t.rake }}văn · mùcược{{ t.blind }} · {{ t.rounds }}ván</p>
                </div>
                <Button class="ml-2 shrink-0" :disabled="playerStore.money < t.minMoney" @click="handleTexas(t.id)">
                  {{ playerStore.money < t.minMoney ? `Cần ${t.minMoney} văn` : 'Vào cửa' }}
                </Button>
              </div>
            </div>
          </div>

          <!-- 恶魔轮盘 -->
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-xs text-accent mb-2 flex items-center space-x-1">
              <Crosshair :size="12" />
              <span>quỷmavòngmâm</span>
            </p>
            <p class="text-xs text-muted mb-2">némcược{{ BUCKSHOT_BET_AMOUNT }}văn，vớiNhà cáivònglưumởsúng，thắngngườiđược{{ BUCKSHOT_WIN_MULTIPLIER }}lần</p>
            <Button class="w-full justify-center" :disabled="playerStore.money < BUCKSHOT_BET_AMOUNT" @click="handleBuckshot">tháchchiến</Button>
          </div>
        </div>
      </template>

      <!-- 底部统计 -->
      <div class="mt-3 border border-accent/20 rounded-xs p-2">
        <div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">Sở hữuTiền</span>
            <span class="text-xs">{{ playerStore.money }}văn</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">Điểm thông thương</span>
            <span class="text-xs text-accent">{{ hanhaiStore.tradePoints }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">hôm nayngàycờ bạcbảo tàng</span>
            <span class="text-xs">{{ MAX_DAILY_BETS - hanhaiStore.betsRemaining }}/{{ MAX_DAILY_BETS }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted">Cấp cửa hàng</span>
            <span class="text-xs">{{ hanhaiStore.tradeShopConfig.name }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 商品购买弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="shopModalItem"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="shopModalItem = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="shopModalItem = null">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">{{ shopModalItem.name }}</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">{{ shopModalItem.description }}</p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">giá</span>
              <span class="text-xs text-accent">{{ shopModalItem.price }}văn</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sở hữu</span>
              <span class="text-xs">{{ playerStore.money }}văn</span>
            </div>
            <div v-if="shopModalItem.weeklyLimit" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Giới hạn mua trong tuần</span>
              <span class="text-xs" :class="hanhaiStore.getWeeklyRemaining(shopModalItem.itemId) > 0 ? '' : 'text-danger'">
                còncòn
                {{ hanhaiStore.getWeeklyRemaining(shopModalItem.itemId) }}/{{ shopModalItem.weeklyLimit }}
              </span>
            </div>
          </div>

          <Button
            class="w-full justify-center !bg-accent !text-bg"
            :disabled="playerStore.money < shopModalItem.price || hanhaiStore.getWeeklyRemaining(shopModalItem.itemId) <= 0"
            @click="handleBuyItem(shopModalItem.itemId)"
          >
            {{ hanhaiStore.getWeeklyRemaining(shopModalItem.itemId) <= 0 ? 'Tuần này đã bán hết' : 'Mua' }}
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 幸运轮盘弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showRouletteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent text-center mb-1">Vòng quay may mắn</p>
          <p class="text-xs text-muted text-center mb-3">némcược {{ rouletteBetAmount }}văn</p>

          <!-- 转盘格子 -->
          <div class="flex flex-col space-y-1 mb-3">
            <div
              v-for="(outcome, i) in ROULETTE_OUTCOMES"
              :key="i"
              class="border rounded-xs px-3 py-1.5 text-xs text-center transition-all duration-100"
              :class="rouletteHighlight === i ? 'border-accent bg-accent/15 text-accent' : 'border-accent/10 text-muted/40'"
            >
              {{ outcome.label }}
              <span class="ml-1 opacity-60">×{{ outcome.multiplier }}</span>
            </div>
          </div>

          <!-- 结果 -->
          <template v-if="roulettePhase === 'done' && rouletteAnimResult">
            <div class="border border-accent/10 rounded-xs p-3 text-center mb-3">
              <p class="text-sm mb-0.5" :class="rouletteAnimResult.multiplier > 0 ? 'text-success' : 'text-danger'">
                {{ rouletteAnimResult.multiplier > 0 ? 'Thắng lớn!' : 'Trượt…' }}
              </p>
              <p v-if="rouletteAnimResult.multiplier > 0" class="text-xs text-success">+{{ rouletteAnimResult.winnings }}văn</p>
              <p v-else class="text-xs text-danger">-{{ rouletteBetAmount }}văn</p>
            </div>
            <Button class="w-full justify-center" @click="showRouletteModal = false">Xác nhận</Button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 骰子弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showDiceModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent text-center mb-1">Đoán lớn nhỏ bằng xúc xắc</p>
          <p class="text-xs text-muted text-center mb-4">
            bạnđoán
            <span class="text-accent">{{ diceGuessIsBig ? 'Lớn (7-12)' : 'Nhỏ (2-6)' }}</span>
          </p>

          <!-- 骰子面 -->
          <div class="flex justify-center space-x-4 mb-3">
            <div v-for="(val, di) in diceDisplay" :key="di" class="dice-face" :class="{ 'dice-rolling': dicePhase === 'rolling' }">
              <div v-for="pos in 9" :key="pos" class="flex items-center justify-center">
                <div
                  v-if="DICE_DOTS[val]?.includes(pos - 1)"
                  class="w-2.5 h-2.5 rounded-full transition-colors"
                  :class="dicePhase === 'rolling' ? 'bg-muted/60' : 'bg-text'"
                />
              </div>
            </div>
          </div>

          <!-- 点数 -->
          <p v-if="dicePhase !== 'rolling'" class="text-xs text-center mb-3">
            <span class="text-muted">{{ diceDisplay[0] }} + {{ diceDisplay[1] }} =</span>
            <span class="text-accent">{{ diceSum }}</span>
            <span class="text-muted">（{{ diceSum >= 7 ? 'Lớn' : 'Nhỏ' }}）</span>
          </p>
          <p v-else class="text-xs text-muted/40 text-center mb-3">némxúc xắctrong…</p>

          <!-- 结果 -->
          <template v-if="dicePhase === 'done' && diceAnimResult">
            <div class="border border-accent/10 rounded-xs p-3 text-center mb-3">
              <p class="text-sm" :class="diceAnimResult.won ? 'text-success' : 'text-danger'">
                {{ diceAnimResult.won ? 'Đoán đúng!' : 'Đoán sai…' }}
              </p>
              <p class="text-xs mt-0.5" :class="diceAnimResult.won ? 'text-success' : 'text-danger'">
                {{ diceAnimResult.won ? '+' + diceAnimResult.winnings + 'xu' : '-' + DICE_BET_AMOUNT + 'xu' }}
              </p>
            </div>
            <Button class="w-full justify-center" @click="showDiceModal = false">Xác nhận</Button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 猜杯弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showCupModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent text-center mb-1">Đoán cốc</p>
          <p class="text-xs text-muted text-center mb-4">bạnchọnđãlượt{{ cupGuess + 1 }}cốc</p>

          <!-- 三个杯子 -->
          <div class="flex justify-center space-x-3 mb-3">
            <div
              v-for="i in 3"
              :key="i"
              class="cup-box"
              :class="{
                'cup-highlight': cupPhase === 'shuffling' && cupShuffleIndex === i - 1,
                'cup-correct': cupPhase === 'done' && cupAnimResult && cupAnimResult.correctCup === i - 1,
                'cup-picked': cupPhase === 'done' && cupGuess === i - 1 && cupAnimResult && !cupAnimResult.won
              }"
            >
              <div class="cup-body" :class="{ 'cup-shake': cupPhase === 'shuffling' }">
                <Trophy :size="20" class="text-accent/60" />
              </div>
              <p
                class="text-xs text-center mt-1"
                :class="cupPhase === 'done' && cupAnimResult?.correctCup === i - 1 ? 'text-accent' : 'text-muted/40'"
              >
                {{ i }}
              </p>
              <div
                v-if="cupPhase === 'done' && cupAnimResult?.correctCup === i - 1"
                class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success flex items-center justify-center"
              >
                <Check :size="10" class="text-bg" />
              </div>
            </div>
          </div>

          <p v-if="cupPhase === 'shuffling'" class="text-xs text-muted/40 text-center mb-3">xáocốctrong…</p>

          <!-- 结果 -->
          <template v-if="cupPhase === 'done' && cupAnimResult">
            <div class="border border-accent/10 rounded-xs p-3 text-center mb-3">
              <p class="text-sm" :class="cupAnimResult.won ? 'text-success' : 'text-danger'">
                {{ cupAnimResult.won ? 'Đoán đúng!' : 'Đoán sai…' }}
              </p>
              <p class="text-xs mt-0.5" :class="cupAnimResult.won ? 'text-success' : 'text-danger'">
                {{ cupAnimResult.won ? '+' + cupAnimResult.winnings + 'xu' : '-' + CUP_BET_AMOUNT + 'xu' }}
              </p>
            </div>
            <Button class="w-full justify-center" @click="showCupModal = false">Xác nhận</Button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 斗蛐蛐弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showCricketModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent text-center mb-1">Đấu dế</p>
          <p class="text-xs text-muted text-center mb-4">
            Dế của bạn:
            <span class="text-accent">{{ cricketChoiceName }}</span>
          </p>

          <!-- 对战面板 -->
          <div class="flex items-center justify-between space-x-2 mb-3">
            <!-- 我方 -->
            <div class="flex-1 text-center">
              <p class="text-xs text-accent mb-1">{{ cricketChoiceName }}</p>
              <div class="border border-accent/20 rounded-xs p-2">
                <div class="cricket-icon" :class="{ 'cricket-fight': cricketPhase === 'fighting' }">
                  <Bug :size="24" class="text-accent" />
                </div>
                <div class="mt-1 h-1.5 bg-panel rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-500"
                    :class="
                      cricketPhase === 'fighting'
                        ? 'bg-accent/40'
                        : cricketAnimResult && cricketAnimResult.won
                          ? 'bg-success'
                          : cricketAnimResult && cricketAnimResult.draw
                            ? 'bg-accent'
                            : 'bg-danger'
                    "
                    :style="{
                      width:
                        cricketPhase === 'fighting'
                          ? (cricketDisplayPower[0] ?? 5) * 10 + '%'
                          : (cricketAnimResult?.playerPower ?? 0) * 10 + '%'
                    }"
                  />
                </div>
                <p class="text-xs mt-0.5" :class="cricketPhase === 'fighting' ? 'text-muted/40' : 'text-accent'">
                  {{ cricketPhase === 'fighting' ? '?' : cricketAnimResult?.playerPower }}
                </p>
              </div>
            </div>

            <span class="text-xs text-muted/40">VS</span>

            <!-- 对方 -->
            <div class="flex-1 text-center">
              <p class="text-xs text-danger mb-1">đúngván</p>
              <div class="border border-danger/20 rounded-xs p-2">
                <div class="cricket-icon" :class="{ 'cricket-fight': cricketPhase === 'fighting' }">
                  <Bug :size="24" class="text-danger -scale-x-100" />
                </div>
                <div class="mt-1 h-1.5 bg-panel rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-500"
                    :class="
                      cricketPhase === 'fighting'
                        ? 'bg-danger/40'
                        : cricketAnimResult && !cricketAnimResult.won && !cricketAnimResult.draw
                          ? 'bg-success'
                          : cricketAnimResult && cricketAnimResult.draw
                            ? 'bg-accent'
                            : 'bg-danger'
                    "
                    :style="{
                      width:
                        cricketPhase === 'fighting'
                          ? (cricketDisplayPower[1] ?? 5) * 10 + '%'
                          : (cricketAnimResult?.opponentPower ?? 0) * 10 + '%'
                    }"
                  />
                </div>
                <p class="text-xs mt-0.5" :class="cricketPhase === 'fighting' ? 'text-muted/40' : 'text-danger'">
                  {{ cricketPhase === 'fighting' ? '?' : cricketAnimResult?.opponentPower }}
                </p>
              </div>
            </div>
          </div>

          <p v-if="cricketPhase === 'fighting'" class="text-xs text-muted/40 text-center mb-3">đúngchiếntrong…</p>

          <!-- 结果 -->
          <template v-if="cricketPhase === 'done' && cricketAnimResult">
            <div class="border border-accent/10 rounded-xs p-3 text-center mb-3">
              <p class="text-sm" :class="cricketAnimResult.won ? 'text-success' : cricketAnimResult.draw ? 'text-accent' : 'text-danger'">
                {{ cricketAnimResult.won ? 'Đại thắng!' : cricketAnimResult.draw ? 'Ngang tài ngang sức' : 'Thất bại…' }}
              </p>
              <p
                class="text-xs mt-0.5"
                :class="cricketAnimResult.won ? 'text-success' : cricketAnimResult.draw ? 'text-muted' : 'text-danger'"
              >
                {{
                  cricketAnimResult.won
                    ? '+' + cricketAnimResult.winnings + 'xu'
                    : cricketAnimResult.draw
                      ? 'Hoàn lại' + CRICKET_BET_AMOUNT + 'xu'
                      : '-' + CRICKET_BET_AMOUNT + 'xu'
                }}
              </p>
            </div>
            <Button class="w-full justify-center" @click="showCricketModal = false">Xác nhận</Button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 翻牌寻宝弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showCardModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent text-center mb-1">Lật bài tìm kho báu</p>
          <p class="text-xs text-muted text-center mb-4">bạnchọnđãlượt{{ cardPick + 1 }}lá</p>

          <!-- 牌面 -->
          <div class="flex justify-center space-x-2 mb-3">
            <div
              v-for="i in CARD_TOTAL"
              :key="i"
              class="card-tile"
              :class="{
                'card-flipping': cardPhase === 'flipping' && cardFlipIndex === i - 1,
                'card-treasure': cardPhase === 'done' && cardAnimResult && cardAnimResult.treasures.includes(i - 1),
                'card-empty': cardPhase === 'done' && cardAnimResult && !cardAnimResult.treasures.includes(i - 1),
                'card-picked': cardPick === i - 1
              }"
            >
              <template v-if="cardPhase === 'done' && cardAnimResult">
                <Gem v-if="cardAnimResult.treasures.includes(i - 1)" :size="16" class="text-success" />
                <X v-else :size="14" class="text-muted/30" />
              </template>
              <template v-else>
                <span class="text-sm" :class="cardPhase === 'flipping' && cardFlipIndex === i - 1 ? 'text-accent' : 'text-muted/30'">
                  ?
                </span>
              </template>
              <p class="text-xs mt-0.5" :class="cardPick === i - 1 ? 'text-accent' : 'text-muted/30'">
                {{ i }}
              </p>
            </div>
          </div>

          <p v-if="cardPhase === 'flipping'" class="text-xs text-muted/40 text-center mb-3">lậtbàitrong…</p>

          <!-- 结果 -->
          <template v-if="cardPhase === 'done' && cardAnimResult">
            <div class="border border-accent/10 rounded-xs p-3 text-center mb-3">
              <p class="text-sm" :class="cardAnimResult.won ? 'text-success' : 'text-danger'">
                {{ cardAnimResult.won ? 'Lật trúng báu vật!' : 'Lá bài trống…' }}
              </p>
              <p class="text-xs mt-0.5" :class="cardAnimResult.won ? 'text-success' : 'text-danger'">
                {{ cardAnimResult.won ? '+' + cardAnimResult.winnings + 'xu' : '-' + CARD_BET_AMOUNT + 'xu' }}
              </p>
            </div>
            <Button class="w-full justify-center" @click="showCardModal = false">Xác nhận</Button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 瀚海扑克弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showTexasModal && texasSetup" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <TexasHoldemGame :setup="texasSetup" @complete="handleTexasComplete" />
      </div>
    </Transition>

    <!-- 恶魔轮盘弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showBuckshotModal && buckshotSetup" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <BuckshotRouletteGame :setup="buckshotSetup" @complete="handleBuckshotComplete" />
      </div>
    </Transition>

    <!-- 通商上架弹窗：物品列表 -->
    <Transition name="panel-fade">
      <div
        v-if="showTradeAddModal && !tradeSelectedItem"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showTradeAddModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showTradeAddModal = false">
            <X :size="14" />
          </button>
          <p class="text-sm text-accent mb-2">Đăng bán vật phẩm</p>
          <p class="text-xs text-muted mb-2">Chọn vật phẩm trong Túi đồ để bày bán tại sạp giao thương</p>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="inv in sellableItems"
              :key="inv.id + '-' + inv.quality"
              class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="selectTradeItem(inv)"
            >
              <div class="flex-1 min-w-0">
                <span class="text-xs">{{ inv.name }}</span>
                <span v-if="inv.quality !== 'normal'" class="text-[10px] ml-1" :class="qualityColor(inv.quality)">
                  {{ qualityLabel(inv.quality) }}
                </span>
                <span class="text-[10px] text-muted ml-1">×{{ inv.quantity }}</span>
              </div>
              <span class="text-[10px] text-accent shrink-0">~{{ calcPreviewPoints(inv) }}tíchđiểm</span>
            </div>
          </div>
          <p v-if="sellableItems.length === 0" class="text-xs text-muted text-center py-4">Túi đồtrongkhông cócó thể bánVật phẩm</p>
        </div>
      </div>
    </Transition>

    <!-- 通商上架弹窗：数量选择 -->
    <Transition name="panel-fade">
      <div
        v-if="tradeSelectedItem"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="tradeSelectedItem = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="tradeSelectedItem = null">
            <X :size="14" />
          </button>
          <p class="text-sm text-accent mb-2">lênbày：{{ tradeSelectedItem.name }}</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Chất lượng</span>
              <span class="text-xs" :class="qualityColor(tradeSelectedItem.quality)">{{ qualityLabel(tradeSelectedItem.quality) }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sở hữu</span>
              <span class="text-xs">{{ tradeSelectedItem.quantity }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Chu kỳ bán</span>
              <span class="text-xs">{{ hanhaiStore.tradeShopConfig.sellDays }}ngày</span>
            </div>
          </div>

          <!-- 数量选择器 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">Số lượng</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="tradeQuantity <= 1" @click="tradeQuantity--">-</Button>
                <input
                  type="number"
                  :value="tradeQuantity"
                  min="1"
                  :max="tradeSelectedItem.quantity"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none focus:border-accent transition-colors"
                  @input="onTradeQuantityInput"
                />
                <Button
                  class="h-6 px-1.5 py-0.5 text-xs justify-center"
                  :disabled="tradeQuantity >= tradeSelectedItem.quantity"
                  @click="tradeQuantity++"
                >
                  +
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="tradeQuantity <= 1" @click="tradeQuantity = 1">Ít nhất</Button>
              <Button
                class="flex-1 justify-center"
                :disabled="tradeQuantity >= tradeSelectedItem.quantity"
                @click="tradeQuantity = tradeSelectedItem.quantity"
              >
                nhấtnhiều
              </Button>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-xs text-muted">Điểm dự kiến</span>
              <span class="text-xs text-accent">~{{ tradePreviewPoints }}tíchđiểm</span>
            </div>
          </div>

          <Button class="w-full justify-center !bg-accent !text-bg" @click="handleConfirmTradeSlot">lênbày ×{{ tradeQuantity }}</Button>
        </div>
      </div>
    </Transition>

    <!-- 积分兑换弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="exchangeModalItem"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="exchangeModalItem = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="exchangeModalItem = null">
            <X :size="14" />
          </button>
          <p class="text-sm text-accent mb-2">{{ exchangeModalItem.name }}</p>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">
              {{ exchangeModalItem.description }}
            </p>
          </div>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">điềucần tíchđiểm</span>
              <span class="text-xs text-accent">{{ exchangeModalItem.pointsCost }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sở hữutíchđiểm</span>
              <span class="text-xs">{{ hanhaiStore.tradePoints }}</span>
            </div>
            <div v-if="exchangeModalItem.weeklyLimit" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Còn lại trong tuần</span>
              <span class="text-xs">{{ getExchangeWeeklyRemaining(exchangeModalItem) }}</span>
            </div>
            <div v-if="exchangeModalItem.totalLimit" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Tổng giới hạn mua</span>
              <span class="text-xs" :class="getExchangeTotalRemaining(exchangeModalItem) > 0 ? '' : 'text-danger'">
                còncòn {{ getExchangeTotalRemaining(exchangeModalItem) }}
              </span>
            </div>
          </div>
          <Button
            class="w-full justify-center !bg-accent !text-bg"
            :disabled="!canExchange(exchangeModalItem)"
            @click="handleExchange(exchangeModalItem.itemId)"
          >
            {{ canExchange(exchangeModalItem) ? 'Đổi' : 'Không thể đổi' }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { Tent, X, Dices, Trophy, Bug, Gem, Check, CircleDot, Spade, Crosshair, Map, Store, Gift } from 'lucide-vue-next'
  import { useHanhaiStore } from '@/stores/useHanhaiStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useMiningStore } from '@/stores/useMiningStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useWalletStore } from '@/stores/useWalletStore'
  import {
    HANHAI_FIXED_ITEMS,
    ROULETTE_BET_TIERS,
    ROULETTE_OUTCOMES,
    DICE_BET_AMOUNT,
    MAX_DAILY_BETS,
    HANHAI_UNLOCK_COST,
    CUP_BET_AMOUNT,
    CUP_WIN_MULTIPLIER,
    CRICKET_BET_AMOUNT,
    CRICKET_WIN_MULTIPLIER,
    CRICKETS,
    CARD_BET_AMOUNT,
    CARD_TOTAL,
    CARD_TREASURE_COUNT,
    TEXAS_TIERS,
    BUCKSHOT_BET_AMOUNT,
    BUCKSHOT_WIN_MULTIPLIER,
    TRADE_EXCHANGE_ITEMS,
    calcTradePoints
  } from '@/data/hanhai'
  import { getItemById } from '@/data/items'
  import type { HanhaiShopItemDef, CricketDef, TexasSetup, TexasTierId, BuckshotSetup, TradeExchangeItemDef } from '@/types'
  import { addLog } from '@/composables/useGameLog'
  import { useAudio } from '@/composables/useAudio'
  import {
    sfxRouletteSpin,
    sfxRouletteStop,
    sfxRouletteTick,
    sfxDiceRoll,
    sfxDiceLand,
    sfxDiceTick,
    sfxCupShuffle,
    sfxCupReveal,
    sfxCupTick,
    sfxCricketChirp,
    sfxCricketClash,
    sfxCricketTick,
    sfxCardFlip,
    sfxCasinoWin,
    sfxCasinoLose,
    sfxBuy
  } from '@/composables/useAudio'
  import TexasHoldemGame from '@/components/game/TexasHoldemGame.vue'
  import BuckshotRouletteGame from '@/components/game/BuckshotRouletteGame.vue'
  import Button from '@/components/game/Button.vue'

  // suppress unused warnings for template-only refs
  void CRICKET_WIN_MULTIPLIER
  void CARD_TREASURE_COUNT
  void BUCKSHOT_WIN_MULTIPLIER

  const hanhaiStore = useHanhaiStore()
  const playerStore = usePlayerStore()
  const walletStore = useWalletStore()
  const { startHanhaiBgm, endHanhaiBgm } = useAudio()
  const activeTab = ref<'shop' | 'casino' | 'trade'>('shop')
  const shopModalItem = ref<HanhaiShopItemDef | null>(null)

  onMounted(() => {
    startHanhaiBgm()
  })

  onUnmounted(() => {
    endHanhaiBgm()
  })

  // === giảikhóalogicchỉnh sửa ===
  const miningStore = useMiningStore()
  const bossDefeated = computed(() => miningStore.defeatedBosses.includes('abyss_dragon'))
  const canUnlock = computed(() => bossDefeated.value && playerStore.money >= HANHAI_UNLOCK_COST)
  const handleUnlock = () => {
    const result = hanhaiStore.unlockHanhai()
    if (result.success) addLog(result.message)
  }

  // === vòngmâmtáctranhtrạng tháitrạng thái ===
  const showRouletteModal = ref(false)
  const roulettePhase = ref<'spinning' | 'done'>('spinning')
  const rouletteHighlight = ref(0)
  const rouletteAnimResult = ref<{ multiplier: number; winnings: number } | null>(null)
  const rouletteBetAmount = ref(0)

  // === xúc xắccontáctranhtrạng tháitrạng thái ===
  const showDiceModal = ref(false)
  const dicePhase = ref<'rolling' | 'done'>('rolling')
  const diceDisplay = ref<number[]>([1, 1])
  const diceAnimResult = ref<{ won: boolean; winnings: number } | null>(null)
  const diceGuessIsBig = ref(false)

  const diceSum = computed(() => (diceDisplay.value[0] ?? 0) + (diceDisplay.value[1] ?? 0))

  /** xúc xắcmặtđiểmvị trí (3×3 grid, 0-indexed) */
  const DICE_DOTS: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  }

  // === đoáncốctáctranhtrạng tháitrạng thái ===
  const showCupModal = ref(false)
  const cupPhase = ref<'shuffling' | 'done'>('shuffling')
  const cupGuess = ref(0)
  const cupShuffleIndex = ref(0)
  const cupAnimResult = ref<{
    correctCup: number
    won: boolean
    winnings: number
  } | null>(null)

  // === đấudếdếtáctranhtrạng tháitrạng thái ===
  const showCricketModal = ref(false)
  const cricketPhase = ref<'fighting' | 'done'>('fighting')
  const cricketChoiceName = ref('')
  const cricketDisplayPower = ref<number[]>([5, 5])
  const cricketAnimResult = ref<{
    playerPower: number
    opponentPower: number
    won: boolean
    draw: boolean
    winnings: number
  } | null>(null)

  // === lậtbàitáctranhtrạng tháitrạng thái ===
  const showCardModal = ref(false)
  const cardPhase = ref<'flipping' | 'done'>('flipping')
  const cardPick = ref(0)
  const cardFlipIndex = ref(-1)
  const cardAnimResult = ref<{
    treasures: number[]
    won: boolean
    winnings: number
  } | null>(null)

  const handleBuyItem = (itemId: string) => {
    const result = hanhaiStore.buyShopItem(itemId)
    if (result.success) {
      sfxBuy()
      addLog(result.message)
      shopModalItem.value = null
    }
  }

  // === giấubáubộ sưu tập ===
  const inventoryStore = useInventoryStore()
  const treasureMapCount = computed(() => inventoryStore.getItemCount('hanhai_map'))
  const handleUseTreasureMap = () => {
    const result = hanhaiStore.useTreasureMap()
    if (result.success) {
      sfxCasinoWin()
    }
  }

  // === vòngmâmlogicchỉnh sửa ===
  const startRouletteSpin = (targetIndex: number) => {
    const len = ROULETTE_OUTCOMES.length
    const fullCycles = 3 + Math.floor(Math.random() * 2) // 3~4 vòngtăngthêmtheomáynhiễm
    const totalSteps = fullCycles * len + targetIndex
    let step = 0

    const tick = () => {
      rouletteHighlight.value = step % len
      sfxRouletteTick()

      if (step >= totalSteps) {
        // táctranhkếtbuộc，dừngđang targetIndex lên，kéo dàitrễhiểnhiển thịkếtquả
        sfxRouletteStop()
        setTimeout(() => {
          roulettePhase.value = 'done'
          if (rouletteAnimResult.value && rouletteAnimResult.value.multiplier > 0) sfxCasinoWin()
          else sfxCasinoLose()
        }, 400)
        return
      }

      step++
      const remaining = totalSteps - step
      let delay: number
      if (remaining > 10) delay = 60
      else if (remaining > 6) delay = 120
      else if (remaining > 3) delay = 200
      else if (remaining > 1) delay = 350
      else delay = 500

      setTimeout(tick, delay)
    }

    setTimeout(tick, 60)
  }

  const handleRoulette = (betTier: number) => {
    const result = hanhaiStore.playRoulette(betTier)
    if (!result.success) return

    rouletteBetAmount.value = betTier
    rouletteAnimResult.value = {
      multiplier: result.multiplier,
      winnings: result.winnings
    }
    roulettePhase.value = 'spinning'
    rouletteHighlight.value = 0
    showRouletteModal.value = true
    sfxRouletteSpin()

    const targetIndex = ROULETTE_OUTCOMES.findIndex(o => o.multiplier === result.multiplier)
    startRouletteSpin(targetIndex >= 0 ? targetIndex : 0)
  }

  // === xúc xắcconlogicchỉnh sửa ===
  const startDiceRoll = (finalDice1: number, finalDice2: number) => {
    let step = 0
    const totalSteps = 14

    const tick = () => {
      if (step < totalSteps) {
        diceDisplay.value = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
        sfxDiceTick()
        step++
        const delay = step < 8 ? 80 : step < 11 ? 150 : 250
        setTimeout(tick, delay)
      } else {
        diceDisplay.value = [finalDice1, finalDice2]
        sfxDiceLand()
        setTimeout(() => {
          dicePhase.value = 'done'
          if (diceAnimResult.value?.won) sfxCasinoWin()
          else sfxCasinoLose()
        }, 500)
      }
    }

    tick()
  }

  const handleDice = (guessBig: boolean) => {
    const result = hanhaiStore.playDice(guessBig)
    if (!result.success) return

    diceGuessIsBig.value = guessBig
    diceAnimResult.value = { won: result.won, winnings: result.winnings }
    dicePhase.value = 'rolling'
    diceDisplay.value = [1, 1]
    showDiceModal.value = true
    sfxDiceRoll()

    startDiceRoll(result.dice1, result.dice2)
  }

  // === đoáncốclogicchỉnh sửa ===
  const startCupShuffle = () => {
    let step = 0
    const totalSteps = 12

    const tick = () => {
      if (step < totalSteps) {
        cupShuffleIndex.value = Math.floor(Math.random() * 3)
        sfxCupTick()
        step++
        const delay = step < 6 ? 100 : step < 10 ? 180 : 300
        setTimeout(tick, delay)
      } else {
        cupShuffleIndex.value = -1
        sfxCupReveal()
        setTimeout(() => {
          cupPhase.value = 'done'
          if (cupAnimResult.value?.won) sfxCasinoWin()
          else sfxCasinoLose()
        }, 400)
      }
    }

    tick()
  }

  const handleCup = (guess: number) => {
    const result = hanhaiStore.playCup(guess)
    if (!result.success) return

    cupGuess.value = guess
    cupAnimResult.value = {
      correctCup: result.correctCup,
      won: result.won,
      winnings: result.winnings
    }
    cupPhase.value = 'shuffling'
    cupShuffleIndex.value = 0
    showCupModal.value = true
    sfxCupShuffle()

    startCupShuffle()
  }

  // === đấudếdếlogicchỉnh sửa ===
  const startCricketFight = () => {
    let step = 0
    const totalSteps = 12

    const tick = () => {
      if (step < totalSteps) {
        cricketDisplayPower.value = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1]
        sfxCricketTick()
        step++
        const delay = step < 6 ? 120 : step < 10 ? 200 : 350
        setTimeout(tick, delay)
      } else {
        sfxCricketClash()
        setTimeout(() => {
          cricketPhase.value = 'done'
          if (cricketAnimResult.value?.won) sfxCasinoWin()
          else if (!cricketAnimResult.value?.draw) sfxCasinoLose()
        }, 400)
      }
    }

    tick()
  }

  const handleCricket = (cricket: CricketDef) => {
    const result = hanhaiStore.playCricketFight(cricket.name)
    if (!result.success) return

    cricketChoiceName.value = cricket.name
    cricketAnimResult.value = {
      playerPower: result.playerPower,
      opponentPower: result.opponentPower,
      won: result.won,
      draw: result.draw,
      winnings: result.winnings
    }
    cricketPhase.value = 'fighting'
    cricketDisplayPower.value = [5, 5]
    showCricketModal.value = true
    sfxCricketChirp()

    startCricketFight()
  }

  // === lậtbàilogicchỉnh sửa ===
  const startCardFlip = (pickIndex: number) => {
    let step = 0
    const order: number[] = []
    // Flip picked card first, then others
    order.push(pickIndex)
    for (let i = 0; i < CARD_TOTAL; i++) {
      if (i !== pickIndex) order.push(i)
    }

    const tick = () => {
      if (step < order.length) {
        cardFlipIndex.value = order[step]!
        sfxCardFlip()
        step++
        const delay = step === 1 ? 600 : 300
        setTimeout(tick, delay)
      } else {
        cardFlipIndex.value = -1
        setTimeout(() => {
          cardPhase.value = 'done'
          if (cardAnimResult.value?.won) sfxCasinoWin()
          else sfxCasinoLose()
        }, 200)
      }
    }

    tick()
  }

  const handleCardFlip = (pick: number) => {
    const result = hanhaiStore.playCardFlip(pick)
    if (!result.success) return

    cardPick.value = pick
    cardAnimResult.value = {
      treasures: result.treasures,
      won: result.won,
      winnings: result.winnings
    }
    cardPhase.value = 'flipping'
    cardFlipIndex.value = -1
    showCardModal.value = true

    startCardFlip(pick)
  }

  // === HãnHảipokerkhắc ===
  const showTexasModal = ref(false)
  const texasSetup = ref<TexasSetup | null>(null)

  const handleTexas = (tierId: TexasTierId) => {
    const result = hanhaiStore.startTexas(tierId)
    if (!result.success) return
    texasSetup.value = result as TexasSetup
    showTexasModal.value = true
  }

  const handleTexasComplete = (finalChips: number, tierName: string) => {
    hanhaiStore.endTexas(finalChips, tierName)
    showTexasModal.value = false
  }

  // === quỷmavòngmâm ===
  const showBuckshotModal = ref(false)
  const buckshotSetup = ref<BuckshotSetup | null>(null)

  const handleBuckshot = () => {
    const result = hanhaiStore.startBuckshot()
    if (!result.success) return
    buckshotSetup.value = result as BuckshotSetup
    showBuckshotModal.value = true
  }

  const handleBuckshotComplete = (won: boolean, draw: boolean) => {
    hanhaiStore.endBuckshot(won, draw)
    showBuckshotModal.value = false
  }

  // === giaothương mạihệhệ thống ===
  const showTradeAddModal = ref(false)
  const exchangeModalItem = ref<TradeExchangeItemDef | null>(null)

  const getItemName = (itemId: string): string => {
    return getItemById(itemId)?.name ?? itemId
  }

  const QUALITY_LABELS: Record<string, string> = {
    normal: 'Thường',
    fine: 'Tốt',
    excellent: 'Xuất sắc',
    supreme: 'Cực phẩm'
  }

  const qualityLabel = (quality: string): string => QUALITY_LABELS[quality] ?? quality

  const qualityColor = (quality: string): string => {
    if (quality === 'fine') return 'text-quality-fine'
    if (quality === 'excellent') return 'text-quality-excellent'
    if (quality === 'supreme') return 'text-quality-supreme'
    return ''
  }

  /** lưnggóitrong可lênbày的vậtphẩm（cóbángiá的vậtphẩm；giốngconlưuđanggiốngcontúitrong，cũngmộtvà可bán） */
  const sellableItems = computed(() => {
    const result: {
      id: string
      name: string
      quality: string
      quantity: number
      sellPrice: number
    }[] = []
    for (const item of [...inventoryStore.items, ...inventoryStore.seedItems]) {
      const def = getItemById(item.itemId)
      if (def && def.sellPrice > 0 && !def.protected) {
        result.push({
          id: item.itemId,
          name: def.name,
          quality: item.quality ?? 'normal',
          quantity: item.quantity,
          sellPrice: def.sellPrice
        })
      }
    }
    return result
  })

  /** tínhtínhtíchđiểmdự kiếnxem（bao gồmtiềntúithêm成） */
  const calcPreviewPoints = (inv: { sellPrice: number; quality: string; quantity: number }): number => {
    const base = calcTradePoints(inv.sellPrice * inv.quantity, inv.quality)
    return Math.ceil(base * (1 + walletStore.getTradeBonus()))
  }

  // sốlượngchọnchọntươngquan hệ
  const tradeSelectedItem = ref<{
    id: string
    name: string
    quality: string
    quantity: number
    sellPrice: number
  } | null>(null)
  const tradeQuantity = ref(1)

  const selectTradeItem = (inv: { id: string; name: string; quality: string; quantity: number; sellPrice: number }) => {
    tradeSelectedItem.value = inv
    tradeQuantity.value = 1
  }

  const tradePreviewPoints = computed(() => {
    if (!tradeSelectedItem.value) return 0
    const base = calcTradePoints(tradeSelectedItem.value.sellPrice * tradeQuantity.value, tradeSelectedItem.value.quality)
    return Math.ceil(base * (1 + walletStore.getTradeBonus()))
  })

  const onTradeQuantityInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    let v = parseInt(target.value, 10)
    if (isNaN(v) || v < 1) v = 1
    if (tradeSelectedItem.value && v > tradeSelectedItem.value.quantity) v = tradeSelectedItem.value.quantity
    tradeQuantity.value = v
  }

  const handleConfirmTradeSlot = () => {
    if (!tradeSelectedItem.value) return
    const result = hanhaiStore.addTradeSlot(tradeSelectedItem.value.id, tradeSelectedItem.value.quality, tradeQuantity.value)
    if (result.success) {
      sfxBuy()
      tradeSelectedItem.value = null
      showTradeAddModal.value = false
    }
  }

  const handleUpgradeTrade = () => {
    const result = hanhaiStore.upgradeTradeShop()
    if (result.success) {
      sfxBuy()
      addLog(result.message)
    } else {
      addLog(result.message)
    }
  }

  const getExchangeWeeklyRemaining = (item: TradeExchangeItemDef): number => {
    if (!item.weeklyLimit) return Infinity
    return Math.max(0, item.weeklyLimit - (hanhaiStore.weeklyExchangePurchases[item.itemId] ?? 0))
  }

  const getExchangeTotalRemaining = (item: TradeExchangeItemDef): number => {
    if (!item.totalLimit) return Infinity
    return Math.max(0, item.totalLimit - (hanhaiStore.totalExchangePurchases[item.itemId] ?? 0))
  }

  const canExchange = (item: TradeExchangeItemDef): boolean => {
    if (hanhaiStore.tradePoints < item.pointsCost) return false
    if (item.weeklyLimit && getExchangeWeeklyRemaining(item) <= 0) return false
    if (item.totalLimit && getExchangeTotalRemaining(item) <= 0) return false
    return true
  }

  const handleExchange = (itemId: string) => {
    const result = hanhaiStore.exchangeItem(itemId)
    if (result.success) {
      sfxBuy()
      exchangeModalItem.value = null
    }
  }
</script>

<style scoped>
  .dice-face {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 3.5rem;
    height: 3.5rem;
    border: 1px solid rgba(200, 164, 92, 0.3);
    border-radius: 2px;
    padding: 6px;
    margin: 2px;
  }

  .dice-rolling {
    animation: dice-shake 0.1s infinite;
  }

  @keyframes dice-shake {
    0%,
    100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-1px, 1px);
    }
    50% {
      transform: translate(1px, -1px);
    }
    75% {
      transform: translate(-1px, -1px);
    }
  }

  /* đoáncốc */
  .cup-box {
    position: relative;
    width: 4rem;
    height: 4rem;
    border: 1px solid rgba(200, 164, 92, 0.2);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .cup-highlight {
    border-color: rgba(200, 164, 92, 0.6);
    background: rgba(200, 164, 92, 0.1);
  }

  .cup-correct {
    border-color: rgba(90, 158, 111, 0.6);
    background: rgba(90, 158, 111, 0.1);
  }

  .cup-picked {
    border-color: rgba(195, 64, 67, 0.4);
  }

  .cup-shake {
    animation: cup-wobble 0.15s infinite alternate;
  }

  @keyframes cup-wobble {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-2px);
    }
  }

  /* đấudếdế */
  .cricket-icon {
    display: flex;
    justify-content: center;
    line-height: 1;
  }

  .cricket-fight {
    animation: cricket-bounce 0.2s infinite alternate;
  }

  @keyframes cricket-bounce {
    0% {
      transform: translateX(-2px);
    }
    100% {
      transform: translateX(2px);
    }
  }

  /* lậtbài */
  .card-tile {
    width: 3rem;
    height: 3.5rem;
    border: 1px solid rgba(200, 164, 92, 0.2);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .card-flipping {
    border-color: rgba(200, 164, 92, 0.6);
    background: rgba(200, 164, 92, 0.1);
    animation: card-flip 0.4s ease;
  }

  .card-treasure {
    border-color: rgba(90, 158, 111, 0.6);
    background: rgba(90, 158, 111, 0.08);
  }

  .card-empty {
    border-color: rgba(200, 164, 92, 0.1);
    opacity: 0.5;
  }

  .card-picked {
    border-width: 2px;
  }

  @keyframes card-flip {
    0% {
      transform: scaleX(1);
    }
    50% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(1);
    }
  }
</style>
