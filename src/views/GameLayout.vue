<template>
  <div
    v-if="gameStore.isGameStarted"
    class="flex flex-col space-y-2 md:space-y-4 h-screen p-2 md:p-4"
    :class="{ 'py-10': Capacitor.isNativePlatform() }"
  >
    <!-- 状态栏 -->
    <StatusBar @request-sleep="showSleepConfirm = true" />

    <div class="flex space-x-1.5">
      <Button class="flex-1 text-center justify-center !text-sm" :icon="Moon" :icon-size="12" @click.stop="showSleepConfirm = true">
        {{ sleepLabel }}
      </Button>
      <!-- 手动存档：与「休息」分开，随时可以落盘，不必熬到睡觉 -->
      <Button class="text-center justify-center !text-sm" :icon="Save" :icon-size="12" :disabled="isSaving" @click.stop="handleManualSave">
        {{ isSaving ? 'Đang lưu' : 'Lưu' }}
      </Button>
    </div>

    <!-- 内容 -->
    <div class="game-panel flex-1 min-h-0 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <Transition name="panel-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </div>

    <!-- 移动端地图按钮 -->
    <button class="mobile-map-btn" @click="showMobileMap = true">
      <Map :size="20" />
    </button>
    <button class="mobile-setting-btn" @click="showSettings = true">
      <SettingsIcon :size="20" />
    </button>
    <!-- 虚空箱远程访问按钮 -->
    <button v-if="warehouseStore.hasVoidChest" class="mobile-void-btn" @click="showVoidModal = true">
      <Archive :size="20" />
    </button>
    <!-- 日志按钮 -->
    <button class="mobile-log-btn" :class="{ 'with-void': warehouseStore.hasVoidChest }" @click="showLogModal = true">
      <History :size="20" />
    </button>
    <!-- 待办按钮 -->
    <button class="mobile-todo-btn" :class="{ 'with-void': warehouseStore.hasVoidChest }" @click="showTodoModal = true">
      <ListChecks :size="20" />
      <span v-if="todoUrgentCount > 0" class="todo-badge">{{ todoUrgentCount }}</span>
    </button>
    <!-- 背包按钮：随手清包 / 吃东西，不必特地跑一趟 -->
    <button class="mobile-bag-btn" :class="{ 'with-void': warehouseStore.hasVoidChest }" @click="showBagModal = true">
      <Package :size="20" />
    </button>

    <TodoPanel :open="showTodoModal" @close="showTodoModal = false" />

    <!-- 背包快捷弹窗：直接嵌入背包面板，不走路由，因此不消耗移动时间与体力 -->
    <Transition name="panel-fade">
      <div
        v-if="showBagModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showBagModal = false"
      >
        <div class="game-panel max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text z-10" @click="showBagModal = false">
            <X :size="14" />
          </button>
          <InventoryView />
        </div>
      </div>
    </Transition>

    <SettingsDialog :open="showSettings" @close="showSettings = false" />

    <!-- 移动端地图菜单 -->
    <MobileMapMenu :open="showMobileMap" :current="currentPanel" @close="showMobileMap = false" />

    <!-- 季节事件弹窗 -->
    <Transition name="panel-fade">
      <EventDialog v-if="currentEvent" :event="currentEvent" @close="closeEvent" />
    </Transition>

    <!-- 心事件弹窗 -->
    <Transition name="panel-fade">
      <HeartEventDialog v-if="pendingHeartEvent" :event="pendingHeartEvent" @close="closeHeartEvent" />
    </Transition>

    <!-- 仙灵发现场景弹窗 -->
    <Transition name="panel-fade">
      <DiscoveryScene
        v-if="pendingDiscoveryScene"
        :npc-id="pendingDiscoveryScene.npcId"
        :step="pendingDiscoveryScene.step"
        @close="closeDiscoveryScene"
      />
    </Transition>

    <!-- 互动节日 -->
    <Transition name="panel-fade">
      <div v-if="currentFestival" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <FishingContestView v-if="currentFestival === 'fishing_contest'" @complete="closeFestival" />
        <HarvestFairView v-if="currentFestival === 'harvest_fair'" @complete="closeFestival" />
        <DragonBoatView v-if="currentFestival === 'dragon_boat'" @complete="closeFestival" />
        <LanternRiddleView v-if="currentFestival === 'lantern_riddle'" @complete="closeFestival" />
        <PotThrowingView v-if="currentFestival === 'pot_throwing'" @complete="closeFestival" />
        <DumplingMakingView v-if="currentFestival === 'dumpling_making'" @complete="closeFestival" />
        <FireworkShowView v-if="currentFestival === 'firework_show'" @complete="closeFestival" />
        <TeaContestView v-if="currentFestival === 'tea_contest'" @complete="closeFestival" />
        <KiteFlyingView v-if="currentFestival === 'kite_flying'" @complete="closeFestival" />
      </div>
    </Transition>

    <!-- 技能专精选择弹窗 -->
    <Transition name="panel-fade">
      <PerkSelectDialog v-if="pendingPerk" :skill-type="pendingPerk.skillType" :level="pendingPerk.level" @select="handlePerkSelect" />
    </Transition>

    <!-- 宠物领养弹窗 -->
    <Transition name="panel-fade">
      <div v-if="pendingPetAdoption" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="Động vật nhỏ ghé thăm" />
          <p class="text-xs leading-relaxed mb-3">Một con vật nhỏ đang quanh quẩn trước cửa nhà bạn, trông có vẻ rất muốn có một mái ấm. Bạn có muốn nhận nuôi nó không?</p>
          <div class="flex space-x-3 justify-center mb-3">
            <Button :class="petChoice === 'cat' ? '!bg-accent !text-bg' : ''" @click="petChoice = 'cat'">Mèo</Button>
            <Button :class="petChoice === 'dog' ? '!bg-accent !text-bg' : ''" @click="petChoice = 'dog'">Chó</Button>
          </div>
          <div v-if="petChoice" class="mb-3">
            <p class="text-xs text-muted mb-1">Đặt tên cho nó:</p>
            <input
              v-model="petNameInput"
              class="w-full bg-bg border border-accent/30 rounded-xs px-2 py-1 text-xs text-text focus:border-accent accent outline-none placeholder:text-muted/40 transition-colors"
              :placeholder="petChoice === 'cat' ? 'Tiểu Hoa' : 'Vượng Tài'"
              maxlength="8"
            />
          </div>
          <Button :disabled="!petChoice" @click="confirmPetAdoption">Nhận nuôi</Button>
        </div>
      </div>
    </Transition>

    <!-- 子女提议弹窗 -->
    <Transition name="panel-fade">
      <div v-if="childProposalVisible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="Đề nghị của gia đình" />
          <p class="text-xs leading-relaxed mb-4">{{ proposalSpouseName }}nhẹnóinóiđạo：「nhấtGầntôiđangnghĩ，tôichúng talàkhônglànênmuốn cáitrẻconđã？」</p>
          <div class="flex flex-col space-y-1.5">
            <Button class="w-full justify-center" @click="handleChildProposalResponse('accept')">「Tôi cũng nghĩ vậy.」</Button>
            <Button class="w-full justify-center" @click="handleChildProposalResponse('wait')">「Đợi thêm chút nữa nhé.」</Button>
            <Button class="w-full justify-center text-muted" @click="handleChildProposalResponse('decline')">「Bây giờ chưa phải lúc.」</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 晨间选项事件弹窗 -->
    <Transition name="panel-fade">
      <div v-if="pendingFarmEvent" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <p class="text-xs leading-relaxed mb-4">
            {{ pendingFarmEvent.message }}
          </p>
          <div class="flex flex-col space-y-1.5">
            <Button v-for="(c, i) in pendingFarmEvent.choices" :key="i" class="w-full justify-center" @click="handleFarmEventChoice(c)">
              {{ c.label }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 虚空箱远程存取弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showVoidModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showVoidModal = false"
      >
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">
              <Archive :size="14" class="inline" />
              hư khôngléprương
            </p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showVoidModal = false" />
          </div>

          <!-- 虚空箱列表 -->
          <div class="flex flex-col space-y-1.5">
            <div
              v-for="vc in voidChests"
              :key="vc.id"
              @click="toggleVoidChest(vc.id)"
              class="border border-accent/10 rounded-xs p-2 cursor-pointer"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs text-quality-supreme">{{ vc.label }}</span>
                  <span v-if="vc.voidRole === 'input'" class="text-[10px] px-1 border border-accent/30 rounded-xs text-accent">Rương nguyên liệu</span>
                  <span v-if="vc.voidRole === 'output'" class="text-[10px] px-1 border border-accent/30 rounded-xs text-accent">
                    Rương thành phẩm
                  </span>
                </div>
                <span class="text-[10px] text-muted">{{ vc.items.length }}/{{ voidChestCapacity }}</span>
              </div>

              <!-- 展开的物品列表 -->
              <template v-if="expandedVoidChestId === vc.id">
                <div v-if="vc.items.length > 0" class="flex flex-col space-y-0.5 mb-1.5 max-h-36 overflow-y-auto">
                  <div
                    v-for="(item, idx) in vc.items"
                    :key="idx"
                    class="flex items-center justify-between px-2 py-0.5 border border-accent/5 rounded-xs mr-1"
                    @click.stop="
                      voidItemDetail = {
                        itemId: item.itemId,
                        quality: item.quality,
                        quantity: item.quantity
                      }
                    "
                  >
                    <span class="text-[10px] truncate mr-2 cursor-pointer hover:underline" :class="voidQualityClass(item.quality)">
                      {{ getItemName(item.itemId) }}
                      <span class="text-[10px] text-muted">&times;{{ item.quantity }}</span>
                    </span>
                    <div class="flex items-center space-x-1">
                      <Button
                        class="py-0 px-1 text-[10px]"
                        @click.stop="openVoidQtyModal('withdraw', vc.id, item.itemId, item.quality, item.quantity)"
                      >
                        Lấy ra
                      </Button>
                    </div>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center py-4">
                  <Archive :size="28" class="text-accent/20 mb-1.5" />
                  <p class="text-[10px] text-muted">Rương đang trống</p>
                  <p class="text-[10px] text-muted/50 mt-0.5">Nhấn 「Cất vào」 bên dưới để thêm</p>
                </div>
                <Button
                  v-if="voidDuplicateDepositItems.length > 0"
                  class="w-full text-[10px] mb-1"
                  :icon="ArrowDownToLine"
                  :icon-size="10"
                  @click.stop="handleVoidDepositDuplicates"
                >
                  Cất nhanh đồ trùngvậtphẩm
                </Button>
                <Button
                  v-if="voidDepositableItems.length > 0"
                  class="w-full text-[10px]"
                  :icon="ArrowDown"
                  :icon-size="10"
                  @click.stop="openVoidDeposit(vc.id)"
                >
                  Cất vào
                </Button>
              </template>
            </div>
          </div>
          <div v-if="voidChests.length === 0" class="flex flex-col items-center justify-center py-8">
            <Archive :size="40" class="text-accent/20 mb-2" />
            <p class="text-xs text-muted">Chưa có Rương hư không</p>
            <p class="text-[10px] text-muted/50 mt-0.5">Chế tạo Rương hư không trong kho để có thể cất/lấy đồ từ xa</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 虚空箱存入弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showVoidDepositModal && voidDepositChestId"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showVoidDepositModal = false"
      >
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">Cất vật phẩm</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showVoidDepositModal = false" />
          </div>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="item in voidDepositableItems"
              :key="item.itemId + item.quality"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="openVoidQtyModal('deposit', voidDepositChestId!, item.itemId, item.quality, item.quantity)"
            >
              <span class="text-xs truncate mr-2" :class="voidQualityClass(item.quality)">
                {{ getItemName(item.itemId) }}
                <span v-if="item.quality !== 'normal'" class="text-[10px]">({{ VOID_QUALITY_LABEL[item.quality] }})</span>
              </span>
              <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 虚空箱数量选择弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="voidQtyModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
        @click.self="voidQtyModal = null"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">
              {{ voidQtyModal.mode === 'withdraw' ? 'Lấy ra' : 'Cất vào' }}
            </p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="voidQtyModal = null" />
          </div>
          <p class="text-xs mb-2" :class="voidQualityClass(voidQtyModal.quality)">
            {{ getItemName(voidQtyModal.itemId) }}
            <span v-if="voidQtyModal.quality !== 'normal'" class="text-[10px]">({{ VOID_QUALITY_LABEL[voidQtyModal.quality] }})</span>
          </p>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">Số lượng</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="voidQty <= 1" @click="addVoidQty(-1)">-</Button>
                <input
                  type="number"
                  :value="voidQty"
                  min="1"
                  :max="voidQtyModal.max"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none"
                  @input="onVoidQtyInput"
                />
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="voidQty >= voidQtyModal.max" @click="addVoidQty(1)">
                  +
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="voidQty <= 1" @click="setVoidQty(1)">Ít nhất</Button>
              <Button class="flex-1 justify-center" :disabled="voidQty >= voidQtyModal.max" @click="setVoidQty(voidQtyModal!.max)">
                nhấtnhiều
              </Button>
            </div>
          </div>
          <Button class="w-full justify-center !bg-accent !text-bg" @click="confirmVoidQty">
            {{ voidQtyModal.mode === 'withdraw' ? 'Lấy ra' : 'Cất vào' }} &times;{{ voidQty }}
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 虚空箱道具信息弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="voidItemDetail && voidItemDef"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="voidItemDetail = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="voidItemDetail = null">
            <X :size="14" />
          </button>
          <p class="text-sm mb-2" :class="voidQualityClass(voidItemDetail.quality) || 'text-accent'">
            {{ voidItemDef.name }}
          </p>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">{{ voidItemDef.description }}</p>
          </div>
          <div class="border border-accent/10 rounded-xs p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Số lượng</span>
              <span class="text-xs">×{{ voidItemDetail.quantity }}</span>
            </div>
            <div v-if="voidItemDetail.quality !== 'normal'" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Chất lượng</span>
              <span class="text-xs" :class="voidQualityClass(voidItemDetail.quality)">
                {{ VOID_QUALITY_LABEL[voidItemDetail.quality] }}
              </span>
            </div>
            <div v-if="voidItemDef.sellPrice" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Giá bán</span>
              <span class="text-xs text-accent">{{ voidItemDef.sellPrice }}văn</span>
            </div>
            <div v-if="voidItemDef.staminaRestore" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Hồi phục</span>
              <span class="text-xs text-success">
                +{{ voidItemDef.staminaRestore }}thểlực
                <template v-if="voidItemDef.healthRestore">/ +{{ voidItemDef.healthRestore }}HP</template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 日志弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showLogModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showLogModal = false"
      >
        <div class="game-panel max-w-md w-full max-h-[80vh] flex flex-col relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showLogModal = false">
            <X :size="14" />
          </button>
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-accent">
              <History :size="14" class="inline" />
              ngàychí
            </p>
            <Button
              v-if="groupedLogs.length > 0"
              class="py-0 px-1.5 text-[10px] mr-5"
              :icon="Trash2"
              :icon-size="10"
              @click="requestClearLogs(null)"
            >
              thanhlépTất cả
            </Button>
          </div>
          <div class="flex-1 overflow-y-auto min-h-0">
            <div v-if="groupedLogs.length === 0" class="flex flex-col items-center justify-center py-8 text-muted">
              <History :size="32" class="mb-2" />
              <p class="text-xs">Chưa có nhật ký</p>
            </div>
            <div v-for="(group, gi) in groupedLogs" :key="gi" class="mb-3">
              <div class="flex items-center justify-between">
                <Divider :label="group.label" class="flex-1" />
                <button
                  class="text-muted hover:text-danger ml-1.5 flex-shrink-0"
                  title="Xóa nhật ký ngày này"
                  @click="requestClearLogs(group.label)"
                >
                  <X :size="12" />
                </button>
              </div>
              <div class="flex flex-col space-y-0.5">
                <p v-for="(msg, mi) in group.messages" :key="mi" class="text-xs text-muted px-1">
                  {{ msg }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 日志清空确认 -->
    <Transition name="panel-fade">
      <div v-if="clearLogTarget !== undefined" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <p class="text-xs leading-relaxed mb-4">
            {{ clearLogTarget === null ? 'Xác nhận xóa toàn bộ nhật ký?' : `Xác nhận xóa nhật ký 「${clearLogTarget}」?` }}
          </p>
          <div class="flex space-x-3 justify-center">
            <Button @click="clearLogTarget = undefined">Hủy</Button>
            <Button class="btn-danger" :icon="Trash2" :icon-size="12" @click="executeClearLogs">Xác nhận</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 体力即将耗尽确认：这一步做完体力就归零了，先问一声 -->
    <Transition name="panel-fade">
      <div v-if="playerStore.exhaustPrompt" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="Thể lực sắp cạn" />
          <p class="text-xs leading-relaxed mb-2">Làm thêm bước này là thể lực sẽ cạn.</p>
          <p class="text-[10px] text-muted mb-1">Khi thể lực về 0 hôm nay bạn không thể làm việc nữa, chỉ có thể về nhà ngủ.</p>
          <p class="text-[10px] text-muted mb-3">Tự về nhà sẽ không mất tiền; nhưng nếu để đến 2 giờ sáng mới gục, bạn sẽ mất {{ passOutPenaltyPct }}% tiền đồng.</p>
          <p v-if="!hasEdibleItem" class="text-[10px] text-danger mb-3">Trong túi không có gì ăn được, làm xong bước này sẽ không thể hồi HP.</p>
          <div class="flex space-x-3 justify-center">
            <Button :icon="X" :icon-size="12" @click="playerStore.cancelExhaust()">Nghỉ một chút</Button>
            <Button class="!bg-accent !text-bg" @click="playerStore.confirmExhaust()">Tiếp tục (hôm nay không hỏi lại)</Button>
          </div>
          <p class="text-[10px] text-muted/50 mt-2">Nhấn 「Tiếp tục」 rồi thực hiện thêm một thao tác là được.</p>
        </div>
      </div>
    </Transition>

    <!-- 深夜就寝询问（凌晨1点） -->
    <Transition name="panel-fade">
      <div v-if="showBedtimePrompt" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="Đêm đã khuya" />
          <p class="text-xs leading-relaxed mb-2">Bây giờ là {{ formatTime(gameStore.hour) }}, bạn bắt đầu buồn ngủ.</p>
          <p class="text-danger text-xs mb-1">Sau một canh giờ nữa (2 giờ sáng) bạn sẽ ngất ngay tại chỗ.</p>
          <p class="text-danger text-xs mb-1">Ngất sẽ mất {{ passOutPenaltyPct }}% tiền đồng (tối đa {{ PASSOUT_MONEY_PENALTY_CAP }} văn),</p>
          <p class="text-danger text-xs mb-1">và ngày hôm sau chỉ hồi {{ passOutRecoveryPct }}% thể lực.</p>
          <p class="text-xs text-muted mb-1">Về nghỉ ngay, thể lực có thể hồi {{ lateRecoveryPct }}%.</p>
          <div class="flex space-x-3 justify-center mt-4">
            <Button :icon="X" :icon-size="12" @click="declineBedtime">Cố thêm một chút</Button>
            <Button class="!bg-accent !text-bg" :icon="Moon" :icon-size="12" @click="acceptBedtime">Về ngủ</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 昏倒结算告知 -->
    <Transition name="panel-fade">
      <div v-if="lastPassOutNotice" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title label="Bạn đã ngất" />
          <p class="text-xs leading-relaxed mb-3 text-danger">
            {{ lastPassOutNotice }}
          </p>
          <p class="text-[10px] text-muted mb-3">Lần sau hãy nhớ nghỉ trước 2 giờ sáng hoặc để ý thanh thể lực.</p>
          <Button class="w-full justify-center" @click="closePassOutNotice">Đã hiểu</Button>
        </div>
      </div>
    </Transition>

    <!-- 休息确认 -->
    <Transition name="panel-fade">
      <div v-if="showSleepConfirm" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="game-panel max-w-xs w-full text-center">
          <Divider title>{{ sleepLabel }}</Divider>
          <p class="text-xs leading-relaxed mb-1">{{ sleepSummary }}</p>
          <p v-for="(warn, wi) in sleepWarning.split('\n').filter(Boolean)" :key="wi" class="text-danger text-xs mb-1">
            {{ warn }}
          </p>
          <div class="flex space-x-3 justify-center mt-4">
            <Button :icon="X" :icon-size="12" @click="showSleepConfirm = false">Đợi thêm</Button>
            <Button class="btn-danger" :icon="Moon" :icon-size="12" @click="confirmSleep">{{ sleepLabel }}</Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAnimalStore } from '@/stores/useAnimalStore'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useNpcStore } from '@/stores/useNpcStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useWarehouseStore } from '@/stores/useWarehouseStore'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useDialogs } from '@/composables/useDialogs'
  import type { MorningChoiceEvent } from '@/data/farmEvents'
  import { handleEndDay, lastPassOutNotice } from '@/composables/useEndDay'
  import { addLog, showFloat, logHistory, clearAllLogs, clearDayLogs, _registerDayLabelGetter } from '@/composables/useGameLog'
  import { useSaveStore } from '@/stores/useSaveStore'
  import {
    LATE_NIGHT_RECOVERY_MAX,
    LATE_NIGHT_RECOVERY_MIN,
    PASSOUT_STAMINA_RECOVERY,
    PASSOUT_MONEY_PENALTY_RATE,
    PASSOUT_MONEY_PENALTY_CAP,
    PASSOUT_HOUR,
    BEDTIME_PROMPT_HOUR,
    formatTime
  } from '@/data/timeConstants'
  import { getNpcById, getItemById, getCropById } from '@/data'
  import { CHEST_DEFS } from '@/data/items'
  import { useGameClock } from '@/composables/useGameClock'
  import { useAudio } from '@/composables/useAudio'
  import type { Quality } from '@/types'
  import {
    Moon,
    X,
    Map,
    Settings as SettingsIcon,
    Archive,
    ArrowDown,
    ArrowDownToLine,
    History,
    Trash2,
    Save,
    ListChecks,
    Package
  } from 'lucide-vue-next'
  import TodoPanel from '@/components/game/TodoPanel.vue'
  import InventoryView from '@/views/game/InventoryView.vue'
  import { useTodoList } from '@/composables/useTodoList'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import MobileMapMenu from '@/components/game/MobileMapMenu.vue'
  import StatusBar from '@/components/game/StatusBar.vue'
  import EventDialog from '@/components/game/EventDialog.vue'
  import HeartEventDialog from '@/components/game/HeartEventDialog.vue'
  import PerkSelectDialog from '@/components/game/PerkSelectDialog.vue'
  import FishingContestView from '@/components/game/FishingContestView.vue'
  import HarvestFairView from '@/components/game/HarvestFairView.vue'
  import DragonBoatView from '@/components/game/DragonBoatView.vue'
  import LanternRiddleView from '@/components/game/LanternRiddleView.vue'
  import PotThrowingView from '@/components/game/PotThrowingView.vue'
  import DumplingMakingView from '@/components/game/DumplingMakingView.vue'
  import FireworkShowView from '@/components/game/FireworkShowView.vue'
  import TeaContestView from '@/components/game/TeaContestView.vue'
  import KiteFlyingView from '@/components/game/KiteFlyingView.vue'
  import SettingsDialog from '@/components/game/SettingsDialog.vue'
  import DiscoveryScene from '@/components/game/DiscoveryScene.vue'
  import { Capacitor } from '@capacitor/core'

  const router = useRouter()
  const route = useRoute()
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const farmStore = useFarmStore()
  const { switchToSeasonalBgm } = useAudio()

  // chơitrò chơichưamởbắt đầuthờilạiđịnhhướngđếnchínhrauđơn
  if (!gameStore.isGameStarted) {
    void router.replace('/')
  }

  const {
    currentEvent,
    pendingHeartEvent,
    currentFestival,
    pendingPerk,
    pendingPetAdoption,
    childProposalVisible,
    pendingFarmEvent,
    pendingDiscoveryScene,
    closeEvent,
    closeHeartEvent,
    closeFestival,
    handlePerkSelect,
    closePetAdoption,
    closeChildProposal,
    closeFarmEvent,
    closeDiscoveryScene
  } = useDialogs()

  const npcStore = useNpcStore()

  const { startClock, stopClock, setClockBlocker } = useGameClock()

  /** chuyểntácđầuđấtbộ sưu tậprauđơn */
  const showMobileMap = ref(false)

  /** nghỉtinxácxác nhậnđạncửa sổ */
  const showSleepConfirm = ref(false)

  /** thiếtđặtđạncửa sổ */
  const showSettings = ref(false)

  /** ngàychíđạncửa sổ */
  const showLogModal = ref(false)

  /** chờlàmđạncửa sổ */
  const showTodoModal = ref(false)
  const { urgentCount: todoUrgentCount } = useTodoList()

  /** lưnggóinhanhnhanhđạncửa sổ */
  const showBagModal = ref(false)
  /** ngàychíthanhlépxácxác nhận：undefined=khônghiểnhiển thị, null=thanhlépTất cả, string=thanhlépchỉđịnhngày */
  const clearLogTarget = ref<string | null | undefined>(undefined)
  const requestClearLogs = (dayLabel: string | null) => {
    clearLogTarget.value = dayLabel
  }
  const executeClearLogs = () => {
    if (clearLogTarget.value === null) clearAllLogs()
    else if (clearLogTarget.value) clearDayLogs(clearLogTarget.value)
    clearLogTarget.value = undefined
  }
  watch(showLogModal, v => {
    if (!v) clearLogTarget.value = undefined
  })

  // cượcsổngàysốnhãnthẻnhậnlấydụng cụ
  _registerDayLabelGetter(() => `Năm ${gameStore.year}, mùa ${SEASON_NAMES[gameStore.season]}, ngày ${gameStore.day}`)

  /** nhấnngàyđiểmnhóm的ngàychí（nhấtmớingàyđangtrước，mỗingàytrongcũnggụcthứ tự） */
  const groupedLogs = computed(() => {
    const groups: { label: string; messages: string[] }[] = []
    let currentLabel: string | null = null
    for (const entry of logHistory.value) {
      if (entry.dayLabel !== currentLabel) {
        currentLabel = entry.dayLabel
        groups.push({ label: currentLabel, messages: [] })
      }
      groups[groups.length - 1]!.messages.push(entry.msg)
    }
    for (const g of groups) g.messages.reverse()
    return groups.reverse()
  })

  // thậtthờithờigiờsinhmệnhtuầnkỳ
  onMounted(() => startClock())
  onUnmounted(() => stopClock())

  /** lăngsáng1điểm的「làkhôngvềđinghỉtin」hỏihỏi */
  const showBedtimePrompt = ref(false)

  // đạncửa sổđánhmởthờitựtáctạmdừngthờigiờ，Tất cảquan hệđóngsauhồi phụchồi
  watch(
    () =>
      !!(
        currentEvent.value ||
        pendingHeartEvent.value ||
        currentFestival.value ||
        pendingPerk.value ||
        pendingPetAdoption.value ||
        childProposalVisible.value ||
        pendingFarmEvent.value ||
        pendingDiscoveryScene.value ||
        showSleepConfirm.value ||
        showBedtimePrompt.value ||
        lastPassOutNotice.value ||
        playerStore.exhaustPrompt
      ),
    hasModal => setClockBlocker('modal', hasModal),
    { immediate: true }
  )

  // === sâuđêmnângtỉnhvớingấtgụcbáotri ===
  watch(
    () => gameStore.hour,
    h => {
      if (!gameStore.isGameStarted) return
      // lăngsáng2điểm：thờigiờđãdừngđangnênthờikhắc，kếttínhvàbáotrichơinhà
      if (h >= PASSOUT_HOUR) {
        if (!lastPassOutNotice.value) {
          showBedtimePrompt.value = false
          setClockBlocker('endday', true)
          handleEndDay()
          switchToSeasonalBgm()
          setClockBlocker('endday', false)
        }
        return
      }
      // lăngsáng1điểm：chínhtáchỏihỏilàkhôngvềđinghỉtin（mỗingàychỉmộtlần）
      if (h >= BEDTIME_PROMPT_HOUR && !gameStore.bedtimePrompted) {
        gameStore.bedtimePrompted = true
        showBedtimePrompt.value = true
      }
    }
  )

  /** thìngủhỏihỏi：đingủcảm */
  const acceptBedtime = () => {
    showBedtimePrompt.value = false
    confirmSleep()
  }

  /** thìngủhỏihỏi：lạichốngmộthộitrẻ */
  const declineBedtime = () => {
    showBedtimePrompt.value = false
    addLog('Bạn quyết định cố thêm một lúc… nhớ về nghỉ trước 2 giờ sáng.')
  }

  /** quan hệđóngngấtgụcbáotri */
  const closePassOutNotice = () => {
    lastPassOutNotice.value = null
  }

  /** từđườngdotêngọinhậnlấykhitrướcmặtbảngnhãnbiết */
  const currentPanel = computed(() => {
    return (route.name as string) ?? 'farm'
  })

  const sleepLabel = computed(() => {
    if (gameStore.hour >= 24) return 'Ngả lưng ngủ ngay'
    if (gameStore.hour >= 20) return 'Về nhà nghỉ'
    return 'Nghỉ ngơi'
  })

  const sleepSummary = computed(() => {
    if (gameStore.hour >= 26) {
      return 'Bạn đã kiệt sức… sẽ ngất ngay tại chỗ.'
    }
    if (gameStore.hour >= 24) {
      return 'Đã quá nửa đêm, bạn lê thân mệt mỏi về nhà…'
    }
    if (playerStore.stamina <= 0) {
      return 'Thể lực đã cạn, may mà vẫn đi được về nhà. Ngủ một giấc, ngày mai lại là ngày mới.'
    }
    return 'Về đến nhà, bạn ngủ yên bình. Ngày mai lại là một ngày mới.'
  })

  const sleepWarning = computed(() => {
    const warnings: string[] = []
    const homeStore = useHomeStore()
    const staminaBonus = homeStore.getStaminaRecoveryBonus()
    if (gameStore.hour >= 26) {
      const pct = Math.round(Math.min(PASSOUT_STAMINA_RECOVERY + staminaBonus, 1) * 100)
      const penaltyPct = Math.round(PASSOUT_MONEY_PENALTY_RATE * 100)
      if (pct < 100) {
        warnings.push(`Chỉ hồi ${pct}% thể lực và mất ${penaltyPct}% tiền (tối đa ${PASSOUT_MONEY_PENALTY_CAP} văn)`)
      } else {
        warnings.push(`Mất ${penaltyPct}% tiền (tối đa ${PASSOUT_MONEY_PENALTY_CAP} văn)`)
      }
    } else if (gameStore.hour >= 24) {
      const t = Math.min(Math.max(gameStore.hour - 24, 0), 1)
      const pct = Math.round(
        Math.min(LATE_NIGHT_RECOVERY_MAX - t * (LATE_NIGHT_RECOVERY_MAX - LATE_NIGHT_RECOVERY_MIN) + staminaBonus, 1) * 100
      )
      if (pct < 100) {
        warnings.push(`Chỉ hồi ${pct}% thể lực`)
      }
    }
    // 第28天换季警告：统计将枯萎的作物
    if (gameStore.day === 28) {
      const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'] as const
      const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(gameStore.season) + 1) % 4]!
      let willWitherCount = 0
      let harvestableCount = 0
      for (const plot of farmStore.plots) {
        if ((plot.state === 'planted' || plot.state === 'growing' || plot.state === 'harvestable') && plot.cropId) {
          const crop = getCropById(plot.cropId)
          if (crop && !crop.season.includes(nextSeason)) {
            willWitherCount++
            if (plot.state === 'harvestable') harvestableCount++
          }
        }
      }
      if (willWitherCount > 0) {
        const nextName = SEASON_NAMES[nextSeason]
        let msg = `Ngày mai bước vào mùa ${nextName}, ${willWitherCount} cây sẽ héo!`
        if (harvestableCount > 0) {
          msg += `(Trong đó ${harvestableCount} cây đã có thể thu hoạch)`
        }
        warnings.push(msg)
      }
    }
    return warnings.join('\n')
  })

  /** ngấtgụcphạtvàngso sánhví dụ（trămđiểmsố） */
  const passOutPenaltyPct = Math.round(PASSOUT_MONEY_PENALTY_RATE * 100)

  /** lưnggóitronglàkhôngcónănghồi phụchồithểlực的đôngtây（dùngtạihaohếtxácxác nhậnthời的nânghiển thị） */
  const hasEdibleItem = computed(() => inventoryStore.items.some(i => (getItemById(i.itemId)?.staminaRestore ?? 0) > 0))

  /** ngấtgụcsaulầnngàythểlựchồi phụchồiso sánhví dụ（bao gồmởnhàthêm成） */
  const passOutRecoveryPct = computed(() => {
    const bonus = useHomeStore().getStaminaRecoveryBonus()
    return Math.round(Math.min(PASSOUT_STAMINA_RECOVERY + bonus, 1) * 100)
  })

  /** nàykhắcthìngủ的thểlựchồi phụchồiso sánhví dụ（bao gồmởnhàthêm成） */
  const lateRecoveryPct = computed(() => {
    const bonus = useHomeStore().getStaminaRecoveryBonus()
    const t = Math.min(Math.max(gameStore.hour - 24, 0), 1)
    const pct = LATE_NIGHT_RECOVERY_MAX - t * (LATE_NIGHT_RECOVERY_MAX - LATE_NIGHT_RECOVERY_MIN) + bonus
    return Math.round(Math.min(pct, 1) * 100)
  })

  // === lưulưu：taytácbảo vệlưu + rờimởtrangmặttrướctựtácbảo vệlưu ===
  const saveStore = useSaveStore()
  const isSaving = ref(false)

  /** taytácbảo vệlưuđếnkhitrướcôvị trí */
  const handleManualSave = () => {
    if (isSaving.value) return
    isSaving.value = true
    const ok = saveStore.autoSave()
    showFloat(ok ? 'Đã lưu tiến trình' : 'Lưu thất bại, hãy kiểm tra bản lưu trong cài đặt', ok ? 'success' : 'danger')
    if (ok) addLog('Đã lưu tiến trình game thủ công.')
    // ngắntạmkhóađịnh，tránhmiễnliên tụcđiểmlạihồiviếtmâm
    setTimeout(() => {
      isSaving.value = false
    }, 600)
  }

  /**
   * quan hệđóngnhãnthẻtrang / chuyểnđếnsaubànthờirơimâm。
   * pagehide với visibilitychange mộtlêndùng：chuyểntácđầuduyệtxemdụng cụvà App đếnđếnkhôngchạmphát beforeunload。
   */
  const saveBeforeExit = () => {
    if (!gameStore.isGameStarted) return
    saveStore.autoSave()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) saveBeforeExit()
  }

  onMounted(() => {
    window.addEventListener('beforeunload', saveBeforeExit)
    window.addEventListener('pagehide', saveBeforeExit)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', saveBeforeExit)
    window.removeEventListener('pagehide', saveBeforeExit)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    saveBeforeExit()
  })

  /** thú cưngvậtnhậnnuôi */
  const petChoice = ref<'cat' | 'dog' | null>(null)
  const petNameInput = ref('')

  const confirmPetAdoption = () => {
    if (!petChoice.value) return
    const animalStore = useAnimalStore()
    const defaultName = petChoice.value === 'cat' ? 'Tiểu Hoa' : 'Vượng Tài'
    const name = petNameInput.value.trim() || defaultName
    animalStore.adoptPet(petChoice.value, name)
    closePetAdoption()
    petChoice.value = null
    petNameInput.value = ''
  }

  /** connữnânggợi ývềnên */
  const proposalSpouseName = computed(() => {
    const spouse = npcStore.getSpouse()
    if (!spouse) return 'Bạn đời'
    return getNpcById(spouse.npcId)?.name ?? 'Bạn đời'
  })

  const handleChildProposalResponse = (response: 'accept' | 'decline' | 'wait') => {
    const result = npcStore.respondToChildProposal(response)
    addLog(result.message)
    if (result.friendshipChange !== 0) {
      addLog(`(Hảo cảm ${result.friendshipChange > 0 ? '+' : ''}${result.friendshipChange})`)
    }
    closeChildProposal()
  }

  const inventoryStore = useInventoryStore()
  const warehouseStore = useWarehouseStore()

  const handleFarmEventChoice = (choice: MorningChoiceEvent['choices'][number]) => {
    addLog(choice.result)
    if (choice.effect) {
      switch (choice.effect.type) {
        case 'gainItem':
          inventoryStore.addItem(choice.effect.itemId, choice.effect.qty)
          break
        case 'gainMoney':
          playerStore.earnMoney(choice.effect.amount)
          break
        case 'gainFriendship':
          for (const s of npcStore.npcStates) {
            s.friendship += choice.effect.amount
          }
          break
      }
    }
    closeFarmEvent()
  }

  // === hư khôngléprươngxatrìnhthămhỏi ===
  const showVoidModal = ref(false)
  const showVoidDepositModal = ref(false)
  const expandedVoidChestId = ref<string | null>(null)
  const voidDepositChestId = ref<string | null>(null)

  const voidChests = computed(() => warehouseStore.getVoidChests())
  const voidChestCapacity = CHEST_DEFS.void.capacity

  const getItemName = (itemId: string): string => getItemById(itemId)?.name ?? itemId

  const VOID_QUALITY_LABEL: Record<Quality, string> = {
    normal: 'Thường',
    fine: 'Tốt',
    excellent: 'Tinh phẩm',
    supreme: 'Cực phẩm'
  }

  const voidQualityClass = (q: Quality): string => {
    if (q === 'fine') return 'text-quality-fine'
    if (q === 'excellent') return 'text-quality-excellent'
    if (q === 'supreme') return 'text-quality-supreme'
    return ''
  }

  const toggleVoidChest = (chestId: string) => {
    expandedVoidChestId.value = expandedVoidChestId.value === chestId ? null : chestId
  }

  const openVoidDeposit = (chestId: string) => {
    voidDepositChestId.value = chestId
    showVoidDepositModal.value = true
  }

  const voidDepositableItems = computed(() =>
    inventoryStore.items.filter(i => {
      if (i.locked) return false
      const def = getItemById(i.itemId)
      return def && def.category !== 'seed'
    })
  )

  /** lưnggóitrong可mộtphímlưuvào的lạihồivậtphẩm（hư khôngléprươngtrongđãcóvàchưakhóađịnh、không phảigiốngcon） */
  const voidDuplicateDepositItems = computed(() => {
    if (!expandedVoidChestId.value) return []
    const chest = warehouseStore.getChest(expandedVoidChestId.value)
    if (!chest) return []
    const chestItemIds = new Set(chest.items.map(i => i.itemId))
    return inventoryStore.items.filter(i => {
      if (i.locked) return false
      const def = getItemById(i.itemId)
      if (!def || def.category === 'seed') return false
      return chestItemIds.has(i.itemId)
    })
  })

  /** mộtphímlưuvàolạihồivậtphẩmđếnhư khôngléprương */
  const handleVoidDepositDuplicates = () => {
    if (!expandedVoidChestId.value) return
    const chestId = expandedVoidChestId.value
    const snapshot = voidDuplicateDepositItems.value.map(i => ({
      itemId: i.itemId,
      quality: i.quality,
      quantity: i.quantity
    }))
    let totalDeposited = 0
    let kindCount = 0
    for (const item of snapshot) {
      const actual = warehouseStore.depositToChest(chestId, item.itemId, item.quantity, item.quality)
      if (actual > 0) {
        totalDeposited += actual
        kindCount++
      }
    }
    if (totalDeposited > 0) {
      addLog(`Đã cất một chạm ${kindCount} loại vật phẩm, tổng ${totalDeposited} món vào rương hư không.`)
    } else {
      addLog('Rương hư không đã đầy, không thể cất thêm.')
    }
  }

  /** hư khôngléprươngđạocông cụthông tintinđạncửa sổ */
  const voidItemDetail = ref<{
    itemId: string
    quality: Quality
    quantity: number
  } | null>(null)
  const voidItemDef = computed(() => {
    if (!voidItemDetail.value) return null
    return getItemById(voidItemDetail.value.itemId) ?? null
  })

  // === hư khôngléprươngsốlượngchọnchọn ===
  interface VoidQtyModalData {
    mode: 'withdraw' | 'deposit'
    chestId: string
    itemId: string
    quality: Quality
    max: number
  }
  const voidQtyModal = ref<VoidQtyModalData | null>(null)
  const voidQty = ref(1)

  const openVoidQtyModal = (mode: 'withdraw' | 'deposit', chestId: string, itemId: string, quality: Quality, max: number) => {
    if (max <= 1) {
      // 数量为1时直接执行，不弹窗
      if (mode === 'withdraw') executeVoidWithdraw(chestId, itemId, quality, 1)
      else executeVoidDeposit(chestId, itemId, quality, 1)
      return
    }
    voidQtyModal.value = { mode, chestId, itemId, quality, max }
    voidQty.value = max
  }

  const setVoidQty = (val: number) => {
    if (!voidQtyModal.value) return
    voidQty.value = Math.max(1, Math.min(val, voidQtyModal.value.max))
  }
  const addVoidQty = (delta: number) => setVoidQty(voidQty.value + delta)
  const onVoidQtyInput = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10)
    if (!isNaN(val)) setVoidQty(val)
  }

  const executeVoidWithdraw = (chestId: string, itemId: string, quality: Quality, qty: number) => {
    if (!warehouseStore.withdrawFromChest(chestId, itemId, qty, quality)) {
      addLog('Balo đã đầy, không thể lấy ra.')
      return
    }
    addLog(`Đã lấy ${getItemName(itemId)}×${qty} khỏi rương hư không.`)
  }

  const executeVoidDeposit = (chestId: string, itemId: string, quality: Quality, qty: number) => {
    const actualQty = warehouseStore.depositToChest(chestId, itemId, qty, quality)
    if (actualQty <= 0) {
      addLog('Rương hư không đã đầy, không thể cất thêm.')
      return
    }
    addLog(`Đã cất ${getItemName(itemId)}×${actualQty} vào rương hư không.`)
    if (voidDepositableItems.value.length === 0 || warehouseStore.isChestFull(chestId)) {
      showVoidDepositModal.value = false
    }
  }

  const confirmVoidQty = () => {
    if (!voidQtyModal.value) return
    const { mode, chestId, itemId, quality } = voidQtyModal.value
    if (mode === 'withdraw') executeVoidWithdraw(chestId, itemId, quality, voidQty.value)
    else executeVoidDeposit(chestId, itemId, quality, voidQty.value)
    voidQtyModal.value = null
  }

  const confirmSleep = () => {
    showSleepConfirm.value = false
    setClockBlocker('endday', true)
    handleEndDay()
    switchToSeasonalBgm()
    setClockBlocker('endday', false)
  }
</script>

<style scoped>
  /* chuyểntácđầuđấtbộ sưu tậpnhấnnút */
  .mobile-map-btn,
  .mobile-setting-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-setting-btn {
    bottom: calc(calc(0.35rem * 10) + 48px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 48px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-void-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 96px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 96px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-log-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 96px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 96px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-log-btn.with-void {
    bottom: calc(calc(0.35rem * 10) + 144px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 144px + env(safe-area-inset-bottom, 0px));
  }

  /* chờlàmnhấnnút：xếp chồngđangngàychínhấnnútlênphươngmộtô */
  .mobile-todo-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 144px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 144px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-todo-btn.with-void {
    bottom: calc(calc(0.35rem * 10) + 192px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 192px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-todo-btn:hover,
  .mobile-todo-btn:active {
    background: var(--color-accent);
    color: rgb(var(--color-bg));
  }

  /* lưnggóinhấnnút：lạiđếnlênxếp chồngmộtô */
  .mobile-bag-btn {
    position: fixed;
    bottom: calc(calc(0.35rem * 10) + 192px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 192px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    z-index: 40;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background: rgb(var(--color-panel));
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .mobile-bag-btn.with-void {
    bottom: calc(calc(0.35rem * 10) + 240px + constant(safe-area-inset-bottom, 0px));
    bottom: calc(calc(0.35rem * 10) + 240px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-bag-btn:hover,
  .mobile-bag-btn:active {
    background: var(--color-accent);
    color: rgb(var(--color-bg));
  }

  /* muốngấpviệcmụcgócnhãn */
  .todo-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border-radius: 2px;
    background: var(--color-danger);
    color: rgb(var(--color-bg));
    font-size: 10px;
    line-height: 16px;
    text-align: center;
  }

  .mobile-map-btn:hover,
  .mobile-map-btn:active,
  .mobile-void-btn:hover,
  .mobile-void-btn:active,
  .mobile-log-btn:hover,
  .mobile-log-btn:active {
    background: var(--color-accent);
    color: rgb(var(--color-bg));
  }
</style>
