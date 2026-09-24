<template>
  <div>
    <h3 class="text-accent text-sm mb-3 flex items-center justify-between">
      <span>
        <component :is="npcStore.getSpouse() ? Heart : Home" :size="14" class="inline" />
        Nhà
      </span>
      <button class="text-muted hover:text-accent transition-colors" @click="showCalendarModal = true">
        <Calendar :size="14" />
      </button>
    </h3>

    <!-- 农舍升级 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm text-accent">{{ homeStore.farmhouseName }}</span>
        <span class="text-xs text-muted">cấp {{ homeStore.farmhouseLevel }}</span>
      </div>
      <p class="text-xs text-muted mb-2">{{ currentBenefit }}</p>
      <div
        v-if="homeStore.nextUpgrade"
        class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
        @click="showUpgradeModal = true"
      >
        <span class="text-xs">Nâng cấp thành「{{ homeStore.nextUpgrade.name }}」</span>
        <span class="text-xs text-accent whitespace-nowrap">{{ homeStore.nextUpgrade.cost }}văn</span>
      </div>
    </div>

    <!-- 家人 -->
    <div v-if="npcStore.getSpouse()" class="border border-accent/20 rounded-xs p-3 mb-4">
      <p class="text-sm text-accent mb-2">
        <Users :size="14" class="inline" />
        Gia đình
      </p>

      <!-- 配偶互动 -->
      <div class="border border-accent/10 rounded-xs p-2 mb-2">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-accent">{{ spouseDef?.name }}</span>
          <span class="text-[10px] text-danger">
            <Heart :size="10" class="inline" />
            Bạn đời
          </span>
        </div>
        <div v-if="spouseDialogue" class="border border-accent/10 rounded-xs p-2 mb-1.5">
          <p class="text-[10px] text-accent mb-0.5">「{{ spouseDef?.name }}」</p>
          <p class="text-xs">{{ spouseDialogue }}</p>
        </div>
        <div class="flex space-x-1.5">
          <Button
            class="flex-1 justify-center py-0.5"
            :icon="MessageCircle"
            :icon-size="10"
            :disabled="spouseState?.talkedToday"
            @click="handleSpouseTalk"
          >
            {{ spouseState?.talkedToday ? 'Đã trò chuyện' : 'Trò chuyện' }}
          </Button>
          <Button
            class="flex-1 justify-center py-0.5"
            :icon="Gift"
            :icon-size="10"
            :disabled="spouseState?.giftedToday || (spouseState?.giftsThisWeek ?? 0) >= 2"
            @click="showSpouseGiftModal = true"
          >
            {{ spouseState?.giftedToday ? 'Đã tặng quà' : (spouseState?.giftsThisWeek ?? 0) >= 2 ? 'Đã đủ trong tuần' : 'Tặng quà' }}
          </Button>
        </div>
      </div>

      <!-- 提议通知 -->
      <div v-if="npcStore.childProposalPending" class="border border-accent/30 rounded-xs p-2 mb-2">
        <p class="text-xs text-accent mb-1.5">Bạn đờicólờinghĩ và bạnnói……</p>
        <Button class="w-full justify-center" @click="showChildProposalDialog">Trả lời</Button>
      </div>

      <!-- 孕期面板 -->
      <div v-if="npcStore.pregnancy" class="border border-success/20 rounded-xs p-2 mb-2">
        <p class="text-xs text-success mb-2">mang thaikỳ · {{ PREGNANCY_STAGE_LABELS[npcStore.pregnancy.stage] }}</p>
        <!-- 阶段进度条 -->
        <div class="flex items-center space-x-1 mb-1.5">
          <span class="text-[10px] text-muted w-8 shrink-0">Tiến độ</span>
          <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs bg-success transition-all"
              :style="{
                width: Math.floor((npcStore.pregnancy.daysInStage / npcStore.pregnancy.stageDays) * 100) + '%'
              }"
            />
          </div>
          <span class="text-[10px] text-muted shrink-0">{{ npcStore.pregnancy.daysInStage }}/{{ npcStore.pregnancy.stageDays }}ngày</span>
        </div>
        <!-- 安产率条 -->
        <div class="flex items-center space-x-1 mb-2">
          <span class="text-[10px] text-muted w-8 shrink-0">Sinh nở an toàn</span>
          <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs transition-all"
              :class="npcStore.pregnancy.careScore >= 70 ? 'bg-success' : npcStore.pregnancy.careScore >= 40 ? 'bg-accent' : 'bg-danger'"
              :style="{ width: npcStore.pregnancy.careScore + '%' }"
            />
          </div>
          <span class="text-[10px] text-muted shrink-0">{{ npcStore.pregnancy.careScore }}%</span>
        </div>
        <!-- 阶段提示 -->
        <p class="text-[10px] text-muted/60 mb-2">
          {{ STAGE_TIPS[npcStore.pregnancy.stage] }}
        </p>
        <!-- 照料操作 -->
        <div class="grid grid-cols-2 gap-1 mb-1">
          <Button
            class="py-0.5 px-1 text-[10px] justify-center"
            :disabled="npcStore.pregnancy.giftedForPregnancy"
            @click="handlePregnancyCare('gift')"
          >
            {{ npcStore.pregnancy.giftedForPregnancy ? 'Đã tặng quà' : 'Tặng quà' }}
          </Button>
          <Button
            class="py-0.5 px-1 text-[10px] justify-center"
            :disabled="npcStore.pregnancy.companionToday"
            @click="handlePregnancyCare('companion')"
          >
            {{ npcStore.pregnancy.companionToday ? 'Đã đồng hành' : 'Trò chuyện cùng nhau' }}
          </Button>
          <Button class="py-0.5 px-1 text-[10px] justify-center" @click="handlePregnancyCare('supplement')">Dùng thuốc bổ</Button>
          <Button
            class="py-0.5 px-1 text-[10px] justify-center"
            :disabled="npcStore.pregnancy.caredToday"
            @click="handlePregnancyCare('rest')"
          >
            {{ npcStore.pregnancy.caredToday ? 'Đã nghỉ ngơi' : 'Sắp xếp nghỉ ngơi' }}
          </Button>
        </div>
        <!-- 医疗方案（待产期） -->
        <div v-if="npcStore.pregnancy.stage === 'ready'" class="border border-accent/20 rounded-xs p-2 mt-2">
          <p class="text-[10px] text-accent mb-1.5">Chọn phương lượtc đỡ sinh</p>
          <div v-if="!npcStore.pregnancy.medicalPlan" class="flex flex-col space-y-1">
            <Button class="py-0.5 px-1 text-[10px] w-full justify-center" @click="handleChooseMedical('normal')">
              phổ thônggiaotiếpsinh（1000văn · 80%an toàntoàn bộ）
            </Button>
            <Button class="py-0.5 px-1 text-[10px] w-full justify-center" @click="handleChooseMedical('advanced')">
              caocấptiếpsinh（5000văn · 95%an toàntoàn bộ）
            </Button>
            <Button class="py-0.5 px-1 text-[10px] w-full justify-center text-accent" @click="handleChooseMedical('luxury')">
              sang trọnghoa lệtiếpsinh（15000văn · 100%an toàntoàn bộ）
            </Button>
          </div>
          <p v-else class="text-[10px] text-success">đã chọn ：{{ MEDICAL_LABELS[npcStore.pregnancy.medicalPlan] }}</p>
        </div>
      </div>

      <!-- 无子女无孕期 -->
      <div v-if="npcStore.children.length === 0 && !npcStore.pregnancy && !npcStore.childProposalPending">
        <div class="flex flex-col items-center justify-center py-6 text-muted">
          <Users :size="32" class="mb-2" />
          <p class="text-xs">Cuộc sống sau hôn nhân yên ổn, có lẽ sau này sẽ có thêm một thành viên nhỏ.</p>
        </div>
      </div>

      <!-- 子女列表 -->
      <div v-if="npcStore.children.length > 0" class="flex flex-col space-y-1">
        <div v-for="child in npcStore.children" :key="child.id" class="border border-accent/10 rounded-xs p-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-accent">
              {{ child.name }}
              <span v-if="child.birthQuality === 'healthy'" class="text-[10px] text-success ml-0.5">[khỏekhỏe mạnh]</span>
              <span v-else-if="child.birthQuality === 'premature'" class="text-[10px] text-muted/60 ml-0.5">[sớmsản]</span>
            </span>
            <div class="flex items-center space-x-1">
              <Button
                v-if="child.stage !== 'baby' && !child.interactedToday"
                class="py-0 px-1"
                :icon="Heart"
                @click="handleInteractChild(child.id)"
              >
                tươngtác
              </Button>
              <span v-else-if="child.stage !== 'baby'" class="text-xs text-muted">đã tươngtác</span>
              <span v-else class="text-xs text-muted">cònquánhỏ</span>
              <Button class="py-0 px-1 text-danger" @click="releaseConfirmChildId = child.id">tặngđi</Button>
            </div>
          </div>
          <p class="text-[10px] text-muted mb-0.5">{{ CHILD_STAGE_NAMES[child.stage] }} · {{ child.daysOld }}ngày</p>
          <div v-if="child.stage !== 'baby'" class="flex items-center space-x-0.5">
            <Heart
              v-for="h in 10"
              :key="h"
              :size="10"
              class="flex-shrink-0"
              :class="child.friendship >= h * 30 ? 'text-danger' : 'text-muted/30'"
              :fill="child.friendship >= h * 30 ? 'currentColor' : 'none'"
            />
          </div>
        </div>
      </div>
      <!-- 送走子女确认 -->
      <div v-if="releaseConfirmChildId !== null" class="mt-2 game-panel border-danger/40">
        <p class="text-xs text-danger mb-2">Xác nhận gửi {{ getChildName(releaseConfirmChildId) }} đến nhà họ hàng phương xa? (Phí 10000 văn)</p>
        <div class="grid grid-cols-2 gap-2">
          <Button class="text-danger" @click="handleReleaseChild">Xác nhận</Button>
          <Button @click="releaseConfirmChildId = null">Hủy</Button>
        </div>
      </div>
    </div>

    <!-- 雇工管理 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">
          <Hammer :size="14" class="inline" />
          Người làm thuê
        </p>
        <Button v-if="currentHelpers.length < 2" class="py-0 px-1.5" :icon="UserPlus" :icon-size="12" @click="showHireModal = true">
          tuyểnmộ
        </Button>
      </div>
      <p class="text-xs text-muted mb-2">Thuê dân làng có hảo cảm ≥4 tim để giúp chăm sóc nông trại, trả lương mỗi ngày.</p>

      <!-- 当前雇工 -->
      <div v-if="currentHelpers.length > 0" class="flex flex-col space-y-1 mb-2">
        <div
          v-for="h in currentHelpers"
          :key="h.npcId"
          class="flex items-center justify-between border border-accent/10 rounded-xs px-3 py-1.5"
        >
          <div>
            <span class="text-xs text-accent">{{ getNpcById(h.npcId)?.name }}</span>
            <span class="text-xs text-muted ml-1">{{ npcStore.HELPER_TASK_NAMES[h.task] }}</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="text-[10px] text-muted">{{ h.dailyWage }}văn/ngày</span>
            <Button class="py-0 px-1 btn-danger" :icon="X" :icon-size="10" @click="dismissConfirmNpcId = h.npcId" />
          </div>
        </div>
      </div>
      <div v-if="currentHelpers.length === 0" class="flex flex-col items-center justify-center py-6 text-muted">
        <Hammer :size="32" class="mb-2" />
        <p class="text-xs">tạmchưa thuêthuê</p>
      </div>
    </div>

    <!-- 酒窖 -->
    <div v-if="homeStore.hasCellar" class="border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">
          <Wine :size="14" class="inline" />
          rượuhầm·Lv.{{ homeStore.cellarLevel }}
          <span class="text-[10px] text-muted ml-1">（{{ homeStore.cellarSlots.length }}/{{ homeStore.cellarMaxSlots }}）</span>
        </p>
        <Button v-if="homeStore.nextCellarUpgrade" class="py-0 px-1" @click="showCellarUpgradeModal = true">
          <ArrowUp :size="12" class="inline" />
          Nâng cấp
        </Button>
      </div>
      <div v-if="homeStore.cellarSlots.length > 0" class="flex flex-col space-y-1.5 mb-3">
        <div v-for="(slot, idx) in homeStore.cellarSlots" :key="idx" class="border border-accent/10 rounded-xs p-2">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center space-x-1">
              <span class="text-xs text-accent">{{ getItemName(slot.itemId) }}</span>
              <span v-if="slot.upgradeCount >= 16" class="text-[10px] text-success">Trầnủ{{ Math.floor(slot.upgradeCount / 16) }}năm</span>
            </div>
            <Button class="py-0 px-1" @click="removeAgingConfirmIdx = idx">Lấy ra</Button>
          </div>
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[10px] text-muted">đã tănggiá trị+{{ slot.addedValue }}văn（nângtăng{{ slot.upgradeCount }}lần）</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="text-[10px] text-muted w-6">tuầnkỳ</span>
            <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
              <div
                class="h-full rounded-xs bg-accent transition-all"
                :style="{
                  width: Math.min(100, Math.floor((slot.daysAging / 7) * 100)) + '%'
                }"
              />
            </div>
            <span class="text-[10px] text-muted">{{ slot.daysAging }}/7ngày</span>
          </div>
        </div>
      </div>
      <div v-if="homeStore.cellarSlots.length === 0" class="flex flex-col items-center justify-center py-6 text-muted mb-3">
        <Wine :size="32" class="mb-2" />
        <p class="text-xs">rượuhầmléplépnhưcũng</p>
      </div>

      <!-- 放入新酒 -->
      <Button
        class="w-full"
        v-if="homeStore.cellarSlots.length < homeStore.cellarMaxSlots && ageableInInventory.length > 0"
        @click="showAgingModal = true"
      >
        đặtvàoTrầnủ
      </Button>
    </div>

    <!-- 升级农舍弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showUpgradeModal && homeStore.nextUpgrade"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showUpgradeModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showUpgradeModal = false">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">Nâng cấpnôngchuồng</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs">Nâng cấp thành「{{ homeStore.nextUpgrade.name }}」</p>
            <p class="text-xs text-muted mt-0.5">
              {{ homeStore.nextUpgrade.description }}
            </p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2 space-y-1">
            <p class="text-xs text-muted mb-1">Nguyên liệu cần thiết</p>
            <div v-for="mat in homeStore.nextUpgrade.materialCost" :key="mat.itemId" class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ getItemName(mat.itemId) }}</span>
              <span class="text-xs" :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? '' : 'text-danger'">
                {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Tiền đồng</span>
              <span class="text-xs" :class="playerStore.money >= homeStore.nextUpgrade.cost ? '' : 'text-danger'">
                {{ homeStore.nextUpgrade.cost }}văn
              </span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canUpgradeFarmhouse }"
            :disabled="!canUpgradeFarmhouse"
            :icon="ArrowUp"
            :icon-size="12"
            @click="handleUpgradeFromModal"
          >
            Nâng cấp
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 放入陈酿列表弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showAgingModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showAgingModal = false"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">đặt vàoTrầnủ</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showAgingModal = false" />
          </div>
          <div class="flex flex-col space-y-1">
            <div
              v-for="item in ageableInInventory"
              :key="item.itemId + item.quality"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleStartAgingFromModal(item.itemId, item.quality)"
            >
              <span
                class="text-xs"
                :class="{
                  'text-quality-fine': item.quality === 'fine',
                  'text-quality-excellent': item.quality === 'excellent',
                  'text-quality-supreme': item.quality === 'supreme'
                }"
              >
                {{ getItemName(item.itemId) }}
              </span>
              <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <CalendarModal :open="showCalendarModal" @close="showCalendarModal = false" />

    <!-- 配偶送礼弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showSpouseGiftModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showSpouseGiftModal = false"
      >
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">tặngquàcho{{ spouseDef?.name }}</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showSpouseGiftModal = false" />
          </div>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="item in spouseGiftableItems"
              :key="item.itemId + item.quality"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleSpouseGift(item.itemId, item.quality)"
            >
              <span class="flex items-center space-x-1">
                <span class="text-xs" :class="qualityTextClass(item.quality)">
                  {{ getItemById(item.itemId)?.name }}
                </span>
                <span
                  v-if="getSpouseGiftPref(item.itemId) !== 'neutral'"
                  class="text-[10px]"
                  :class="GIFT_PREF_CLASS[getSpouseGiftPref(item.itemId)]"
                >
                  {{ GIFT_PREF_LABELS[getSpouseGiftPref(item.itemId)] }}
                </span>
              </span>
              <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
            </div>
          </div>
          <div v-if="spouseGiftableItems.length === 0" class="py-4 text-center text-xs text-muted">Túi đồtrongkhông cócó thể tặngtặng của Vật phẩm</div>
        </div>
      </div>
    </Transition>

    <!-- 招募雇工弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showHireModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="closeHireModal">
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">Tuyển người làm thuê</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="closeHireModal" />
          </div>

          <!-- 任务选择 -->
          <p class="text-xs text-muted mb-1">Chọn nhiệm vụ</p>
          <div class="grid grid-cols-3 gap-1 mb-2">
            <button
              v-for="(label, key) in npcStore.HELPER_TASK_NAMES"
              :key="key"
              class="text-xs py-1 rounded-xs border"
              :class="selectedHireTask === key ? 'border-accent text-accent' : 'border-accent/20 text-muted'"
              @click="selectHireTask(key as FarmHelperTask)"
            >
              {{ label }}
            </button>
          </div>
          <!-- 讲清这份活到底做什么，避免雇了之后看不出效果 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-[10px] text-muted leading-relaxed">
              {{ npcStore.HELPER_TASK_DESCRIPTIONS[selectedHireTask] }}
            </p>
            <p class="text-[10px] text-muted/60 mt-1">Người làm thuê sẽ tự động làm việc vào sáng hôm sau, kết quả được ghi vào nhật ký ngày.</p>
          </div>
          <p class="text-xs text-muted mb-2">ngàylương：{{ npcStore.HELPER_WAGES[selectedHireTask] }}văn</p>

          <!-- 确认雇佣 -->
          <div v-if="hireConfirmNpc" class="border border-accent/30 rounded-xs p-3 mb-2">
            <p class="text-xs text-accent mb-2">
              xácđịnhthuêthuê
              <span class="text-text">{{ hireConfirmNpc.name }}</span>
              mangtrách nhiệm
              <span class="text-text">{{ npcStore.HELPER_TASK_NAMES[selectedHireTask] }}</span>
              sao？
            </p>
            <p class="text-[10px] text-muted mb-2">ngàylương：{{ npcStore.HELPER_WAGES[selectedHireTask] }}văn</p>
            <div class="flex space-x-2">
              <Button class="py-0.5 px-2 text-xs" @click="handleHire(hireConfirmNpcId!)">Xác nhận</Button>
              <Button class="py-0.5 px-2 text-xs" @click="hireConfirmNpcId = null">Hủy</Button>
            </div>
          </div>

          <!-- 可雇佣NPC列表 -->
          <div v-else class="flex flex-col space-y-1 max-h-48 overflow-y-auto">
            <div
              v-for="npc in hireableNpcs"
              :key="npc.npcId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="hireConfirmNpcId = npc.npcId"
            >
              <span class="text-xs">{{ npc.name }}</span>
              <span class="text-[10px] text-muted">
                <Heart :size="10" class="inline" />
                {{ Math.floor(npc.friendship / 250) }}tâm
              </span>
            </div>
          </div>
          <p v-if="!hireConfirmNpc && hireableNpcs.length === 0" class="text-xs text-muted text-center py-3">
            Không có dân làng phù hợp để thuê (cần hảo cảm ≥4 tim và không phải bạn đời/tri kỷ)
          </p>
        </div>
      </div>
    </Transition>

    <!-- 解雇确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="dismissConfirmNpcId"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="dismissConfirmNpcId = null"
      >
        <div class="game-panel max-w-xs w-full text-center">
          <p class="text-sm text-danger mb-3">Xác nhận sa thải {{ getNpcById(dismissConfirmNpcId)?.name }}?</p>
          <p class="text-xs text-muted mb-4">giảithuêsaucần muốn lạimớituyểnmộ。</p>
          <div class="flex space-x-3 justify-center">
            <Button @click="dismissConfirmNpcId = null">Hủy</Button>
            <Button class="btn-danger" @click="handleDismiss(dismissConfirmNpcId!)">xác nhận giảithuê</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 取出陈酿确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="removeAgingConfirmSlot"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="removeAgingConfirmIdx = null"
      >
        <div class="game-panel max-w-xs w-full text-center">
          <p class="text-sm text-accent mb-3">Xác nhận lấy {{ getItemName(removeAgingConfirmSlot.itemId) }} ra?</p>
          <p class="text-xs text-muted mb-2">
            đãtănggiá trị+{{ removeAgingConfirmSlot.addedValue }}văn（nângtăng{{ removeAgingConfirmSlot.upgradeCount }}lần）
          </p>
          <p v-if="removeAgingConfirmSlot.upgradeCount >= 16" class="text-xs text-success mb-2">
            Đã ủ thành {{ Math.floor(removeAgingConfirmSlot.upgradeCount / 16) }} năm, lấy ra sẽ mở sáng mục bộ sưu tập!
          </p>
          <p v-if="removeAgingConfirmSlot.addedValue > 0" class="text-xs text-accent mb-4">
            Lấy rathờisẽnhậnđược{{ removeAgingConfirmSlot.addedValue }}văntănggiá trịđồngtiền。
          </p>
          <p v-else class="text-xs text-muted mb-4">vẫnchưa tănggiá trị，đầy7ngàycó thể nângtănggiágiá trị。</p>
          <div class="flex space-x-3 justify-center">
            <Button @click="removeAgingConfirmIdx = null">Hủy</Button>
            <Button @click="handleRemoveAging(removeAgingConfirmIdx!)">xác nhận Lấy ra</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 酒窖升级弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showCellarUpgradeModal && homeStore.nextCellarUpgrade"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showCellarUpgradeModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showCellarUpgradeModal = false">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">Nâng cấprượuhầm</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs">Nâng cấp thành「{{ homeStore.nextCellarUpgrade.name }}」</p>
            <p class="text-xs text-muted mt-0.5">
              mỗilầntănggiá trị{{ homeStore.nextCellarUpgrade.valuePerCycle }}văn，nhấtlớndung lượnglượng{{ homeStore.nextCellarUpgrade.maxSlots }}cái
            </p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2 space-y-1">
            <p class="text-xs text-muted mb-1">Nguyên liệu cần thiết</p>
            <div v-for="mat in homeStore.nextCellarUpgrade.materialCost" :key="mat.itemId" class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ getItemName(mat.itemId) }}</span>
              <span class="text-xs" :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? '' : 'text-danger'">
                {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Tiền đồng</span>
              <span class="text-xs" :class="playerStore.money >= homeStore.nextCellarUpgrade.cost ? '' : 'text-danger'">
                {{ homeStore.nextCellarUpgrade.cost }}văn
              </span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canUpgradeCellar }"
            :disabled="!canUpgradeCellar"
            :icon="ArrowUp"
            :icon-size="12"
            @click="handleUpgradeCellar"
          >
            Nâng cấp
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ArrowUp, Calendar, Gift, Hammer, Home, Heart, MessageCircle, UserPlus, Users, Wine, X } from 'lucide-vue-next'
  import { useCookingStore } from '@/stores/useCookingStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { useNpcStore } from '@/stores/useNpcStore'
  import { useAchievementStore } from '@/stores/useAchievementStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { getCombinedItemCount } from '@/composables/useCombinedInventory'
  import { getItemById, getNpcById } from '@/data'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import type { Quality, ChildStage, PregnancyStage, FarmHelperTask } from '@/types'
  import { addLog } from '@/composables/useGameLog'
  import { showChildProposal, triggerHeartEvent } from '@/composables/useDialogs'
  import { handleEndDay } from '@/composables/useEndDay'
  import Button from '@/components/game/Button.vue'
  import CalendarModal from '@/components/game/CalendarModal.vue'

  const homeStore = useHomeStore()
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  const npcStore = useNpcStore()
  const playerStore = usePlayerStore()

  const releaseConfirmChildId = ref<number | null>(null)
  const showUpgradeModal = ref(false)
  const showAgingModal = ref(false)
  const showCalendarModal = ref(false)
  const showSpouseGiftModal = ref(false)
  const showHireModal = ref(false)
  const selectedHireTask = ref<FarmHelperTask>('water')
  const hireConfirmNpcId = ref<string | null>(null)
  const dismissConfirmNpcId = ref<string | null>(null)
  const removeAgingConfirmIdx = ref<number | null>(null)
  const showCellarUpgradeModal = ref(false)
  const removeAgingConfirmSlot = computed(() =>
    removeAgingConfirmIdx.value !== null ? (homeStore.cellarSlots[removeAgingConfirmIdx.value] ?? null) : null
  )

  const hireableNpcs = computed(() => npcStore.getHireableNpcs())
  const currentHelpers = computed(() => npcStore.hiredHelpers)
  const hireConfirmNpc = computed(() => (hireConfirmNpcId.value ? getNpcById(hireConfirmNpcId.value) : null))

  const handleHire = (npcId: string) => {
    const result = npcStore.hireHelper(npcId, selectedHireTask.value)
    addLog(result.message)
    if (result.success) {
      hireConfirmNpcId.value = null
      showHireModal.value = false
    }
  }

  const closeHireModal = () => {
    showHireModal.value = false
    hireConfirmNpcId.value = null
  }

  const selectHireTask = (task: FarmHelperTask) => {
    selectedHireTask.value = task
    hireConfirmNpcId.value = null
  }

  const handleDismiss = (npcId: string) => {
    const result = npcStore.dismissHelper(npcId)
    addLog(result.message)
    dismissConfirmNpcId.value = null
  }

  // === phốingẫu nhiêntươngtác ===

  const spouseState = computed(() => npcStore.getSpouse())
  const spouseDef = computed(() => (spouseState.value ? getNpcById(spouseState.value.npcId) : null))
  const spouseDialogue = ref<string | null>(null)

  const handleSpouseTalk = () => {
    if (!spouseState.value) return
    if (gameStore.isPastBedtime) {
      addLog('Muộn quá rồi, nên nghỉ thôi.')
      handleEndDay()
      return
    }
    const result = npcStore.talkTo(spouseState.value.npcId)
    if (result) {
      spouseDialogue.value = result.message
      addLog(`Trò chuyện với ${spouseDef.value?.name}. (+${result.friendshipGain} hảo cảm)`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.talk)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) {
        handleEndDay()
        return
      }
      const heartEvent = npcStore.checkHeartEvent(spouseState.value.npcId)
      if (heartEvent) triggerHeartEvent(heartEvent)
    }
  }

  type GiftPreference = 'loved' | 'liked' | 'hated' | 'neutral'

  const getSpouseGiftPref = (itemId: string): GiftPreference => {
    if (!spouseDef.value) return 'neutral'
    if (spouseDef.value.lovedItems.includes(itemId)) return 'loved'
    if (spouseDef.value.likedItems.includes(itemId)) return 'liked'
    if (spouseDef.value.hatedItems.includes(itemId)) return 'hated'
    return 'neutral'
  }

  const GIFT_PREF_LABELS: Record<GiftPreference, string> = {
    loved: 'Rất thích',
    liked: 'Thích',
    hated: 'Ghét',
    neutral: ''
  }
  const GIFT_PREF_CLASS: Record<GiftPreference, string> = {
    loved: 'text-danger',
    liked: 'text-success',
    hated: 'text-muted',
    neutral: ''
  }
  const GIFT_PREF_ORDER: Record<GiftPreference, number> = {
    loved: 0,
    liked: 1,
    neutral: 2,
    hated: 3
  }

  const spouseGiftableItems = computed(() => {
    const filtered = inventoryStore.items.filter(i => {
      const def = getItemById(i.itemId)
      return def && def.category !== 'seed'
    })
    if (!spouseDef.value) return filtered
    return [...filtered].sort((a, b) => GIFT_PREF_ORDER[getSpouseGiftPref(a.itemId)] - GIFT_PREF_ORDER[getSpouseGiftPref(b.itemId)])
  })

  const handleSpouseGift = (itemId: string, quality: Quality) => {
    if (!spouseState.value) return
    const cookingStore = useCookingStore()
    const cookingGiftBonus = cookingStore.activeBuff?.type === 'giftBonus' ? cookingStore.activeBuff.value : 1
    const ringGiftBonus = inventoryStore.getRingEffectValue('gift_friendship')
    const giftMultiplier = cookingGiftBonus * (1 + ringGiftBonus)
    const result = npcStore.giveGift(spouseState.value.npcId, itemId, giftMultiplier, quality)
    if (result) {
      const itemName = getItemById(itemId)?.name ?? itemId
      const name = spouseDef.value?.name
      if (result.gain > 0) {
        addLog(`Tặng ${itemName} cho ${name}, ${name} cảm thấy ${result.reaction}. (+${result.gain} hảo cảm)`)
      } else if (result.gain < 0) {
        addLog(`Tặng ${itemName} cho ${name}, ${name} ${result.reaction} món này… (${result.gain} hảo cảm)`)
      } else {
        addLog(`Tặng ${itemName} cho ${name}, ${name} cảm thấy ${result.reaction}.`)
      }
      showSpouseGiftModal.value = false
      const heartEvent = npcStore.checkHeartEvent(spouseState.value.npcId)
      if (heartEvent) triggerHeartEvent(heartEvent)
    }
  }

  const qualityTextClass = (q: Quality): string => {
    if (q === 'fine') return 'text-quality-fine'
    if (q === 'excellent') return 'text-quality-excellent'
    if (q === 'supreme') return 'text-quality-supreme'
    return ''
  }

  const CHILD_STAGE_NAMES: Record<ChildStage, string> = {
    baby: 'Em bé',
    toddler: 'Trẻ nhỏ',
    child: 'Trẻ em',
    teen: 'Thiếu niên'
  }

  const PREGNANCY_STAGE_LABELS: Record<PregnancyStage, string> = {
    early: 'Giai đoạn đầu (cần dinh dưỡng)',
    mid: 'Giai đoạn giữa (cần đồng hành)',
    late: 'Giai đoạn cuối (cần nghỉ ngơi)',
    ready: 'Thời kỳ chờ sinh (chuẩn bị đón bé)'
  }

  const STAGE_TIPS: Record<PregnancyStage, string> = {
    early: 'Đầu thai kỳ cần chú ý dinh dưỡng, tặng thức ăn hoặc thuốc bổ là tốt nhất.',
    mid: 'Giữa thai kỳ cần đồng hành nhiều hơn, trò chuyện thường xuyên giúp tăng mạnh tỷ lệ sinh an toàn.',
    late: 'Cuối thai kỳ cần nghỉ ngơi, hãy để bạn đời dưỡng sức.',
    ready: 'Sắp sinh, hãy chọn cách đỡ đẻ và chuẩn bị lần cuối.'
  }

  const MEDICAL_LABELS: Record<string, string> = {
    normal: 'Đỡ sinh thường',
    advanced: 'Đỡ sinh cao cấp',
    luxury: 'Đỡ sinh cao cấp đặc biệt'
  }

  const AGEABLE_ITEMS = ['watermelon_wine', 'osmanthus_wine', 'peach_wine', 'jujube_wine', 'corn_wine', 'rice_vinegar']

  const currentBenefit = computed(() => {
    switch (homeStore.farmhouseLevel) {
      case 0:
        return 'Túp lều đơn sơ.'
      case 1:
        return 'Nâng cấp bếp, hồi phục từ nấu ăn +20%.'
      case 2:
        return 'Mở rộng nhà, mỗi đêm hồi thêm 10% thể lực.'
      case 3:
        return 'Mở hầm rượu ngầm, có thể ủ rượu để tăng chất lượng.'
      default:
        return ''
    }
  })

  const canUpgradeFarmhouse = computed(() => {
    const upgrade = homeStore.nextUpgrade
    if (!upgrade) return false
    if (playerStore.money < upgrade.cost) return false
    return upgrade.materialCost.every(mat => getCombinedItemCount(mat.itemId) >= mat.quantity)
  })

  const ageableInInventory = computed(() => {
    return inventoryStore.items.filter(inv => AGEABLE_ITEMS.includes(inv.itemId))
  })

  const getItemName = (itemId: string): string => {
    return getItemById(itemId)?.name ?? itemId
  }

  const getChildName = (childId: number): string => {
    return npcStore.children.find(c => c.id === childId)?.name ?? 'Con'
  }

  // === thao táclàmnơiquản lý ===

  const handleUpgradeFromModal = () => {
    const upgrade = homeStore.nextUpgrade
    if (!upgrade) return
    if (homeStore.upgradeFarmhouse()) {
      addLog(`Nông trại nâng cấp thành 「${upgrade.name}」! ${upgrade.description}`)
      showUpgradeModal.value = false
    } else {
      addLog('Không đủ tiền hoặc nguyên liệu, không thể nâng cấp.')
    }
  }

  const handleInteractChild = (childId: number) => {
    const result = npcStore.interactWithChild(childId)
    if (result) {
      addLog(result.message)
      if (result.item) {
        inventoryStore.addItem(result.item)
        const itemDef = getItemById(result.item)
        addLog(`Nhận được ${itemDef?.name ?? result.item}!`)
      }
    }
  }

  const handleReleaseChild = () => {
    if (releaseConfirmChildId.value === null) return
    const result = npcStore.releaseChild(releaseConfirmChildId.value)
    addLog(result.message)
    releaseConfirmChildId.value = null
  }

  const showChildProposalDialog = () => {
    showChildProposal()
  }

  const handlePregnancyCare = (action: 'gift' | 'companion' | 'supplement' | 'rest') => {
    const result = npcStore.performPregnancyCare(action)
    addLog(result.message)
    if (result.careGain > 0) addLog(`Tỷ lệ sinh an toàn +${result.careGain}%`)
  }

  const handleChooseMedical = (plan: 'normal' | 'advanced' | 'luxury') => {
    const result = npcStore.chooseMedicalPlan(plan)
    addLog(result.message)
  }

  const handleStartAgingFromModal = (itemId: string, quality: Quality) => {
    if (homeStore.startAging(itemId, quality)) {
      const name = getItemName(itemId)
      addLog(`Đã đặt ${name} vào hầm rượu để ủ.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.aging)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Không thể đặt vào hầm rượu (đã đầy hoặc vật phẩm không thể ủ).')
    }
    // rượuhầmđầyhoặckhôngcòncòn可Trầnủvậtphẩmthờiquan hệđóngđạncửa sổ
    if (homeStore.cellarSlots.length >= homeStore.cellarMaxSlots || ageableInInventory.value.length === 0) {
      showAgingModal.value = false
    }
  }

  const handleRemoveAging = (index: number) => {
    // lấyratrướctrướcghilụccòncònngàysố
    const slotBeforeRemove = homeStore.cellarSlots[index]
    const remainingDays = slotBeforeRemove?.daysAging ?? 0
    const result = homeStore.removeAging(index)
    if (result) {
      inventoryStore.addItem(result.itemId, 1, result.quality)
      const name = getItemName(result.itemId)
      const totalDays = result.upgradeCount * 7 + remainingDays
      let msg = `Đã lấy ${name} khỏi hầm rượu`
      if (result.addedValue > 0) {
        msg += `(Ủ ${totalDays} ngày, tăng giá +${result.addedValue} văn)`
      }
      addLog(msg + '。')
      // đầy1nămđiểmsángbộ sưu tậpgiám
      if (result.upgradeCount >= 16) {
        const achievementStore = useAchievementStore()
        achievementStore.discoverItem('aged_' + result.itemId)
        addLog(`Đã mở mục ủ rượu của ${name}!`)
      }
    }
    removeAgingConfirmIdx.value = null
  }

  const canUpgradeCellar = computed(() => {
    const upgrade = homeStore.nextCellarUpgrade
    if (!upgrade) return false
    if (playerStore.money < upgrade.cost) return false
    return upgrade.materialCost.every(mat => getCombinedItemCount(mat.itemId) >= mat.quantity)
  })

  const handleUpgradeCellar = () => {
    const upgrade = homeStore.nextCellarUpgrade
    if (!upgrade) return
    if (homeStore.upgradeCellar()) {
      addLog(`Hầm rượu nâng cấp thành 「${upgrade.name}」! Mỗi lần tăng giá ${upgrade.valuePerCycle} văn, sức chứa tối đa ${upgrade.maxSlots}.`)
      showCellarUpgradeModal.value = false
    } else {
      addLog('Không đủ tiền hoặc nguyên liệu, không thể nâng cấp hầm rượu.')
    }
  }
</script>
