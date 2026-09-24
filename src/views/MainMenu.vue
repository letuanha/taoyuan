<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center space-y-8 px-4"
    @click.once="startBgm"
    :class="{ 'py-10': Capacitor.isNativePlatform() }"
    @click="slotMenuOpen = null"
  >
    <!-- 标题 -->
    <div class="flex items-center space-x-3">
      <div class="logo" />
      <h1 class="text-accent text-2xl md:text-4xl tracking-widest">
        {{ pkg.title }}
      </h1>
    </div>

    <!-- 主菜单 -->
    <div class="flex flex-col space-y-3 w-full md:w-6/12">
      <Button class="text-center justify-center py-3" :icon="Play" @click="showPrivacy = true">Hành trình mới</Button>

      <!-- 存档列表 -->
      <div v-for="info in slots" :key="info.slot" class="w-full">
        <div v-if="info.exists" class="flex space-x-1 w-full">
          <button class="btn flex-1 !justify-between" @click="handleLoadGame(info.slot)">
            <span class="inline-flex items-center space-x-1">
              <FolderOpen :size="14" />
              <span>Bản lưu {{ info.slot + 1 }}</span>
            </span>
            <span class="text-muted text-xs">
              {{ info.playerName ?? 'Chưa đặt tên' }} · thứ{{ info.year }}năm {{ SEASON_NAMES[info.season as keyof typeof SEASON_NAMES] }} thứ{{
                info.day
              }}ngày
            </span>
          </button>
          <div class="relative">
            <Button
              class="px-2 h-full"
              :icon="Settings"
              :icon-size="12"
              @click.stop="slotMenuOpen = slotMenuOpen === info.slot ? null : info.slot"
            />
            <div
              v-if="slotMenuOpen === info.slot"
              class="absolute right-0 top-full mt-1 z-10 flex flex-col border border-accent/30 rounded-xs overflow-hidden w-30"
            >
              <Button
                v-if="!Capacitor.isNativePlatform()"
                class="text-center !rounded-none justify-center !text-sm"
                :icon="Download"
                :icon-size="12"
                @click="handleExportSlot(info.slot)"
              >
                Xuất
              </Button>
              <Button
                class="btn-danger !rounded-none text-center justify-center !text-sm"
                :icon="Trash2"
                :icon-size="12"
                @click="handleDeleteSlot(info.slot)"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 导入Bản lưu -->
      <template v-if="!Capacitor.isNativePlatform()">
        <Button class="text-center justify-center" :icon="Upload" @click="triggerImport">Nhập bản lưu</Button>
        <input ref="fileInputRef" type="file" accept=".tyx" class="hidden" @change="handleImportFile" />
      </template>
      <!-- 关于 -->
      <Button class="text-center justify-center text-muted" :icon="Info" @click="showAbout = true">Về trò chơi</Button>
    </div>

    <!-- 关于弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showAbout" class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80" @click.self="showAbout = false">
        <div class="game-panel w-full max-w-md mx-4 text-center relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showAbout = false">
            <X :size="14" />
          </button>
          <h2 class="text-accent text-lg mb-3">关于{{ pkg.title }}</h2>
          <!-- 分区标签 -->
          <div class="flex space-x-1.5 mb-3">
            <Button
              class="flex-1 justify-center"
              :class="{ '!bg-accent !text-bg': aboutTab === 'about' }"
              :icon="Info"
              @click="aboutTab = 'about'"
            >
              Về trò chơi
            </Button>
            <Button
              class="flex-1 justify-center"
              :class="{ '!bg-accent !text-bg': aboutTab === 'author' }"
              :icon="UserRound"
              @click="aboutTab = 'author'"
            >
              Ủng hộ tác giả
            </Button>
          </div>
          <!-- 关于 -->
          <div v-if="aboutTab === 'about'" class="flex flex-col space-y-3 text-sm">
            <p class="text-xs text-muted">Cảm hứng của trò chơi đến từ Stardew Valley</p>
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-muted text-xs mb-1">Phiên bản hiện tại</p>
              <p class="text-accent">v{{ pkg.version }}</p>
            </div>
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-muted text-xs mb-1">Nhóm QQ</p>
              <a href="https://qm.qq.com/q/2BVaTTwDkI" target="_blank" class="text-accent underline break-all">
                {{ pkg.qq }}
              </a>
            </div>
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-muted text-xs mb-1">Kho GitHub</p>
              <a :href="`https://github.com/${pkg.author}/${pkg.name}`" target="_blank" class="text-accent underline break-all">
                https://github.com/{{ pkg.author }}/{{ pkg.name }}
              </a>
            </div>
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-muted text-xs mb-1">TapTap</p>
              <a :href="`https://www.taptap.cn/app/${pkg.tapid}`" target="_blank" class="text-accent underline break-all">
                https://www.taptap.cn/app/{{ pkg.tapid }}
              </a>
            </div>
          </div>
          <!-- 赞助作者 -->
          <div v-if="aboutTab === 'author'" class="flex flex-col space-y-3 text-sm">
            <p class="text-xs text-muted">Nếu bạn thích trò chơi này, có thể mời tác giả một ly trà sữa hoặc một bữa ăn. Sự ủng hộ của bạn là động lực lớn nhất để tác giả tiếp tục cập nhật!</p>
            <div class="flex space-x-3">
              <div class="flex-1 border border-accent/20 rounded-xs p-3">
                <p class="text-muted text-xs mb-2">Alipay</p>
                <img
                  src="@/assets/alipay.png"
                  alt="Alipay"
                  class="mx-auto"
                  style="width: 120px; height: 120px; image-rendering: pixelated"
                />
              </div>
              <div class="flex-1 border border-accent/20 rounded-xs p-3">
                <p class="text-muted text-xs mb-2">WeChat</p>
                <img src="@/assets/wechat.png" alt="WeChat" class="mx-auto" style="width: 120px; height: 120px; image-rendering: pixelated" />
              </div>
            </div>
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-muted text-xs mb-1">Afdian</p>
              <a :href="`https://afdian.com/a/${pkg.author}`" target="_blank" class="text-accent underline break-all">
                https://afdian.com/a/{{ pkg.author }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 角色创建弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showCharCreate && !showFarmSelect" class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80">
        <div class="game-panel w-full max-w-xs mx-4 relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="handleBackToMenu">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-4 text-center">Tạo nhân vật</p>
          <div class="flex flex-col space-y-4">
            <!-- 名字输入 -->
            <div>
              <label class="text-xs text-muted mb-1 block">Tên của bạn</label>
              <input
                v-model="charName"
                type="text"
                maxlength="4"
                placeholder="Nhập tên của bạn"
                class="w-full px-3 py-2 bg-bg border border-accent/30 rounded-xs text-sm focus:border-accent outline-none"
              />
            </div>
            <!-- 性别选择 -->
            <div>
              <label class="text-xs text-muted mb-1 block">Giới tính</label>
              <div class="flex space-x-3">
                <Button
                  class="flex-1 justify-center py-2"
                  :class="charGender === 'male' ? '!border-accent !bg-accent/10' : ''"
                  @click="charGender = 'male'"
                >
                  Nam
                </Button>
                <Button
                  class="flex-1 justify-center py-2"
                  :class="charGender === 'female' ? '!border-accent !bg-accent/10' : ''"
                  @click="charGender = 'female'"
                >
                  Nữ
                </Button>
              </div>
            </div>
          </div>
          <div class="flex space-x-3 justify-center mt-4">
            <Button :icon-size="12" :icon="ArrowLeft" @click="handleBackToMenu">Quay lại</Button>
            <Button class="px-6" :disabled="!charName.trim()" :icon-size="12" :icon="Play" @click="handleCharCreateNext">Tiếp theo</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 农场选择弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showFarmSelect" class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4">
        <div class="game-panel w-full max-w-xl max-h-[80vh] flex flex-col relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text z-10" @click="handleBackToCharCreate">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-3 text-center shrink-0">Chọn kiểu nông trại của bạn</p>
          <div class="flex-1 overflow-y-auto min-h-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                v-for="farm in FARM_MAP_DEFS"
                :key="farm.type"
                class="border border-accent/20 rounded-xs p-3 text-left transition-all cursor-pointer hover:border-accent/50"
                @click="handleSelectFarm(farm.type)"
              >
                <div class="text-sm mb-0.5">{{ farm.name }}</div>
                <div class="text-muted text-xs mb-1">
                  {{ farm.description }}
                </div>
                <div class="text-accent text-xs">{{ farm.bonus }}</div>
              </button>
            </div>
          </div>
          <div class="flex justify-center mt-3 shrink-0">
            <Button :icon-size="12" :icon="ArrowLeft" @click="handleBackToCharCreate">Quay lại</Button>
          </div>
        </div>

        <!-- 田庄确认弹窗 -->
        <Transition name="panel-fade">
          <div
            v-if="showFarmConfirm"
            class="fixed inset-0 z-60 flex items-center justify-center bg-bg/80"
            @click.self="showFarmConfirm = false"
          >
            <div class="game-panel w-full max-w-xs mx-4 text-center relative">
              <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showFarmConfirm = false">
                <X :size="14" />
              </button>
              <Divider title>{{ selectedFarmDef?.name }}</Divider>
              <p class="text-xs text-muted mb-2">
                {{ selectedFarmDef?.description }}
              </p>
              <p class="text-xs text-accent mb-4">
                {{ selectedFarmDef?.bonus }}
              </p>
              <div class="flex space-x-3 justify-center">
                <Button :icon-size="12" :icon="ArrowLeft" @click="showFarmConfirm = false">Hủy</Button>
                <Button class="px-6" :icon-size="12" :icon="Play" @click="handleNewGame">Bắt đầu hành trình</Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- 旧存档身份设置弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showIdentitySetup" class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80">
        <div class="game-panel w-full max-w-xs mx-4 relative">
          <p class="text-accent text-sm mb-2 text-center">Thiết lập thông tin nhân vật</p>
          <p class="text-xs text-muted mb-4 text-center">Phát hiện thông tin nhân vật đang trống, hãy thiết lập thông tin của bạn</p>
          <div class="flex flex-col space-y-4">
            <div>
              <label class="text-xs text-muted mb-1 block">Tên của bạn</label>
              <input
                v-model="charName"
                type="text"
                maxlength="4"
                placeholder="Nhập tên của bạn"
                class="w-full px-3 py-2 bg-bg border border-accent/30 rounded-xs text-sm focus:border-accent outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-muted mb-1 block">Giới tính</label>
              <div class="flex space-x-3">
                <Button
                  class="flex-1 justify-center py-2"
                  :class="charGender === 'male' ? '!border-accent !bg-accent/10' : ''"
                  @click="charGender = 'male'"
                >
                  Nam
                </Button>
                <Button
                  class="flex-1 justify-center py-2"
                  :class="charGender === 'female' ? '!border-accent !bg-accent/10' : ''"
                  @click="charGender = 'female'"
                >
                  Nữ
                </Button>
              </div>
            </div>
          </div>
          <div class="flex justify-center mt-4">
            <Button class="px-6" :disabled="!charName.trim()" :icon-size="12" :icon="Play" @click="handleIdentityConfirm">
              Xác nhận và tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 删除存档确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="deleteTargetSlot !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80"
        @click.self="deleteTargetSlot = null"
      >
        <div class="game-panel w-full max-w-xs mx-4 text-center">
          <p class="text-danger text-sm mb-3">Xác nhận xóa bản lưu {{ deleteTargetSlot + 1 }}?</p>
          <p class="text-xs text-muted mb-4">Thao tác này không thể hoàn tác.</p>
          <div class="flex space-x-3 justify-center">
            <Button @click="deleteTargetSlot = null">Hủy</Button>
            <Button class="btn-danger" @click="confirmDeleteSlot">Xác nhận xóa</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 隐私协议弹窗 -->
    <Transition name="panel-fade">
      <div v-if="showPrivacy" class="fixed inset-0 z-50 flex items-center justify-center bg-bg/80" @click.self="handlePrivacyDecline">
        <div class="game-panel w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
          <h2 class="text-accent text-lg mb-3 text-center">
            <ShieldCheck :size="14" class="inline" />
            Chính sách quyền riêng tư
          </h2>
          <div class="flex-1 overflow-y-auto text-xs text-muted space-y-2 mb-4 pr-1">
            <p>Chào mừng đến với Đào Nguyên Hương! Trước khi bắt đầu, vui lòng đọc chính sách quyền riêng tư sau:</p>
            <p class="text-text">1. Lưu trữ dữ liệu</p>
            <p>Bản lưu, cài đặt và dữ liệu khác được lưu trong bộ nhớ cục bộ của trình duyệt (localStorage). Dữ liệu lưu game không được tải lên máy chủ.</p>
            <p class="text-text">2. Thống kê truy cập</p>
            <p>
              Trò chơi sử dụng dịch vụ thống kê bên thứ ba để thu thập dữ liệu truy cập ẩn danh (như lượt xem trang, thời gian truy cập, loại thiết bị, thông tin trình duyệt…) nhằm phân tích việc sử dụng và cải thiện trải nghiệm. Dữ liệu này không chứa thông tin nhận dạng cá nhân.
            </p>
            <p class="text-text">3. Kết nối mạng</p>
            <p>Ngoài thống kê truy cập, các chức năng cốt lõi chạy cục bộ và không gửi bản lưu hay dữ liệu thao tác của bạn tới máy chủ.</p>
            <p class="text-text">4. An toàn dữ liệu</p>
            <p>Xóa dữ liệu trình duyệt hoặc đổi thiết bị có thể làm mất bản lưu; nên thường xuyên dùng chức năng xuất để sao lưu.</p>
            <p class="text-text">5. Dịch vụ bên thứ ba</p>
            <p>
              Các dịch vụ thống kê bên thứ ba có chính sách riêng; chúng tôi không chịu trách nhiệm về cách họ xử lý dữ liệu. Các liên kết ngoài trong game cũng dẫn tới những trang bên thứ ba không thuộc phạm vi chính sách này.
            </p>
            <p class="text-text">6. Thay đổi chính sách</p>
            <p>Chính sách này có thể được điều chỉnh theo từng phiên bản. Khi thay đổi, game sẽ thông báo lại. Tiếp tục sử dụng được xem là đồng ý với phiên bản mới nhất.</p>
          </div>
          <div class="flex space-x-3 justify-center">
            <Button class="!text-sm" :icon="ArrowLeft" @click="handlePrivacyDecline">Không đồng ý</Button>
            <Button class="!text-sm px-6" :icon="ShieldCheck" @click="handlePrivacyAgree">Đồng ý và tiếp tục</Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { Play, FolderOpen, ArrowLeft, Trash2, Download, Upload, Info, Settings, ShieldCheck, X, UserRound } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useSaveStore } from '@/stores/useSaveStore'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useAnimalStore } from '@/stores/useAnimalStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useQuestStore } from '@/stores/useQuestStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { FARM_MAP_DEFS } from '@/data/farmMaps'
  import _pkg from '../../package.json'
  import { useAudio } from '@/composables/useAudio'
  import { showFloat, addLog } from '@/composables/useGameLog'
  import { resetAllStoresForNewGame } from '@/composables/useResetGame'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import type { FarmMapType, Gender } from '@/types'
  import { Capacitor } from '@capacitor/core'

  const router = useRouter()
  const { startBgm } = useAudio()
  const pkg = _pkg as typeof _pkg & {
    title: string
    qq: string
    version: string
    name: string
    author: string
  }

  const gameStore = useGameStore()
  const saveStore = useSaveStore()
  const farmStore = useFarmStore()
  const animalStore = useAnimalStore()
  const playerStore = usePlayerStore()
  const questStore = useQuestStore()
  const inventoryStore = useInventoryStore()

  const slots = ref(saveStore.getSlots())
  const showCharCreate = ref(false)
  const showFarmSelect = ref(false)
  const showIdentitySetup = ref(false)
  const showAbout = ref(false)
  const aboutTab = ref<'about' | 'author'>('about')
  const slotMenuOpen = ref<number | null>(null)
  const selectedMap = ref<FarmMapType>('standard')
  const charName = ref('')
  const charGender = ref<Gender>('male')
  const showPrivacy = ref(false)
  const showFarmConfirm = ref(false)

  const deleteTargetSlot = ref<number | null>(null)

  const selectedFarmDef = computed(() => FARM_MAP_DEFS.find(f => f.type === selectedMap.value))

  const handleSelectFarm = (type: FarmMapType) => {
    selectedMap.value = type
    showFarmConfirm.value = true
  }

  const handlePrivacyAgree = () => {
    localStorage.setItem('taoyuan_privacy_agreed', '1')
    showPrivacy.value = false
    showCharCreate.value = true
  }

  const handlePrivacyDecline = () => {
    showPrivacy.value = false
  }

  const refreshSlots = () => {
    slots.value = saveStore.getSlots()
  }

  const handleBackToMenu = () => {
    showCharCreate.value = false
    showFarmSelect.value = false
    selectedMap.value = 'standard'
    charName.value = ''
    charGender.value = 'male'
  }

  const handleCharCreateNext = () => {
    showFarmSelect.value = true
  }

  const handleBackToCharCreate = () => {
    showFarmSelect.value = false
    showFarmConfirm.value = false
  }

  const handleNewGame = () => {
    // 分配空闲存档槽位
    const slot = saveStore.assignNewSlot()
    if (slot < 0) {
      showFloat('Ô lưu đã đầy, hãy xóa một bản lưu cũ trước.')
      return
    }
    // 重置所有游戏 store 到初始状态，防止上一个存档数据残留
    resetAllStoresForNewGame()
    playerStore.setIdentity((charName.value.trim() || 'Chưa đặt tên').slice(0, 4), charGender.value)
    gameStore.startNewGame(selectedMap.value)
    // 标准农场初始6×6，其余4×4
    farmStore.resetFarm(selectedMap.value === 'standard' ? 6 : 4)
    // 新手赠送：10个青菜种子
    inventoryStore.addItem('seed_cabbage', 10)
    // 草地农场：免费鸡舍 + 2只鸡
    if (selectedMap.value === 'meadowlands') {
      const coop = animalStore.buildings.find(b => b.type === 'coop')
      if (coop) {
        coop.built = true
        coop.level = 1
      }
      animalStore.animals.push(
        {
          id: 'chicken_init_1',
          type: 'chicken',
          name: 'Tiểu Hoa',
          friendship: 100,
          mood: 200,
          daysOwned: 0,
          daysSinceProduct: 0,
          wasFed: false,
          fedWith: null,
          wasPetted: false,
          hunger: 0,
          sick: false,
          sickDays: 0
        },
        {
          id: 'chicken_init_2',
          type: 'chicken',
          name: 'Tiểu Bạch',
          friendship: 100,
          mood: 200,
          daysOwned: 0,
          daysSinceProduct: 0,
          wasFed: false,
          fedWith: null,
          wasPetted: false,
          hunger: 0,
          sick: false,
          sickDays: 0
        }
      )
    }
    questStore.initMainQuest()
    // 新手引导：游戏开始时立即显示欢迎提示
    const tutorialStore = useTutorialStore()
    if (tutorialStore.enabled) {
      addLog('Trưởng thôn Liễu nói: 「Chào mừng đến Đào Nguyên Hương! Trong túi có hạt giống cải xanh, hãy ra nông trại khai hoang và gieo trồng nhé.」')
      tutorialStore.markTipShown('tip_welcome')
    }
    void router.push('/game')
  }

  const handleLoadGame = (slot: number) => {
    if (saveStore.loadFromSlot(slot)) {
      if (playerStore.needsIdentitySetup) {
        // 旧存档没有性别/名字数据，先让玩家设置
        showIdentitySetup.value = true
      } else {
        void router.push('/game')
      }
    }
  }

  /** 旧存档身份设置完成 */
  const handleIdentityConfirm = () => {
    playerStore.setIdentity((charName.value.trim() || 'Chưa đặt tên').slice(0, 4), charGender.value)
    showIdentitySetup.value = false
    void router.push('/game')
  }

  const handleDeleteSlot = (slot: number) => {
    deleteTargetSlot.value = slot
  }

  const confirmDeleteSlot = () => {
    if (deleteTargetSlot.value !== null) {
      saveStore.deleteSlot(deleteTargetSlot.value)
      refreshSlots()
      deleteTargetSlot.value = null
      slotMenuOpen.value = null
    }
  }

  const handleExportSlot = (slot: number) => {
    if (!saveStore.exportSave(slot)) {
      showFloat('Xuất dữ liệu thất bại.', 'danger')
    }
  }

  const fileInputRef = ref<HTMLInputElement | null>(null)

  const triggerImport = () => {
    fileInputRef.value?.click()
  }

  const handleImportFile = (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      // 找到thứ一个空槽位导入，没有则提示
      const emptySlot = slots.value.find(s => !s.exists)
      if (!emptySlot) {
        showFloat('Ô lưu đã đầy, hãy xóa một bản lưu cũ trước.')
      } else if (saveStore.importSave(emptySlot.slot, content)) {
        refreshSlots()
        showFloat(`Đã nhập vào bản lưu ${emptySlot.slot + 1}.`, 'success')
      } else {
        showFloat('Tệp lưu không hợp lệ hoặc đã hỏng.', 'danger')
      }
      input.value = ''
    }
    reader.readAsText(file)
  }
</script>

<style scoped>
  .logo {
    width: 50px;
    height: 50px;
    background: url(@/assets/logo.png) center / contain no-repeat;
    image-rendering: pixelated;
    flex-shrink: 0;
  }
</style>
