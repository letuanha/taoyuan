<template>
  <Transition name="panel-fade">
    <div v-if="open" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
      <div class="game-panel w-full max-w-xs text-center relative">
        <button class="absolute top-2 right-2 text-muted hover:text-text" @click="$emit('close')">
          <X :size="14" />
        </button>
        <Divider title class="my-4" label="Cài đặt" />
        <!-- 分类导航 -->
        <div class="grid grid-cols-3 justify-center gap-1 mb-3">
          <button
            v-for="tab in SETTINGS_TABS"
            :key="tab.key"
            class="text-xs py-1 px-3 border rounded-xs transition-colors"
            :class="activeTab === tab.key ? 'border-accent bg-accent/20 text-accent' : 'border-accent/20 text-muted hover:text-text'"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" :size="12" class="inline-block align-[-2px] mr-1" />
            {{ tab.label }}
          </button>
        </div>

        <div class="flex flex-col space-y-3">
          <!-- ===== 通用 ===== -->
          <template v-if="activeTab === 'general'">
            <div class="max-h-[40vh] overflow-y-auto">
              <!-- 时间控制 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1 mb-2">
                <p class="text-xs text-muted mb-2">Điều khiển thời gian</p>
                <div class="flex items-center justify-center space-x-2">
                  <Button :icon="isPaused ? Play : Pause" :icon-size="12" class="py-1 px-3" @click="togglePause">
                    {{ isPaused ? 'Tiếp tục' : 'Tạm dừng' }}
                  </Button>
                  <Button class="py-1 px-3" @click="cycleSpeed">Tốc độ {{ gameSpeed }}×</Button>
                </div>
              </div>

              <!-- 音频控制 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1 mb-2">
                <p class="text-xs text-muted mb-2">Âm thanh</p>
                <div class="flex items-center justify-center space-x-2">
                  <Button :icon="sfxEnabled ? Volume2 : VolumeX" :icon-size="12" class="py-1 px-3" @click="toggleSfx">Hiệu ứng âm thanh</Button>
                  <Button :icon="bgmEnabled ? Headphones : HeadphoneOff" :icon-size="12" class="py-1 px-3" @click="toggleBgm">Nhạc</Button>
                </div>
              </div>

              <!-- 农事：换季自动施肥（仅桃源田庄有此特性） -->
              <div v-if="gameStore.farmMapType === 'standard'" class="border border-accent/20 rounded-xs p-3 mr-1 mb-2">
                <p class="text-xs text-muted mb-2">Tự động bón phân khi đổi mùa</p>
                <p class="text-[10px] text-muted/50 mb-2">
                  Tính năng nông trại Đào Nguyên: tự động bón phân cho đất trống khi đổi mùa. Phân tự động vẫn chiếm ô đất, nhưng bạn có thể phủ bằng loại phân tốt hơn.
                </p>
                <div class="flex items-center justify-center space-x-2">
                  <Button
                    class="py-1 px-3"
                    :class="{
                      '!bg-accent !text-bg': settingsStore.autoFertilizeOnSeasonChange
                    }"
                    @click="settingsStore.autoFertilizeOnSeasonChange = true"
                  >
                    Bật
                  </Button>
                  <Button
                    class="py-1 px-3"
                    :class="{
                      '!bg-accent !text-bg': !settingsStore.autoFertilizeOnSeasonChange
                    }"
                    @click="settingsStore.autoFertilizeOnSeasonChange = false"
                  >
                    Tắt
                  </Button>
                </div>
              </div>

              <!-- 一键钓鱼：跳过收线小游戏 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1 mb-2">
                <p class="text-xs text-muted mb-2">Câu cá một chạm</p>
                <p class="text-[10px] text-muted/50 mb-2">
                  Khi bật, ném cần sẽ cho kết quả ngay, không cần chơi mini-game kéo cá. Tỷ lệ thành công vẫn phụ thuộc cần câu, cấp câu cá, mồi/phao và độ khó của cá; chỉ là hạng hoàn hảo sẽ ít xuất hiện hơn so với câu thủ công.
                </p>
                <div class="flex items-center justify-center space-x-2">
                  <Button
                    class="py-1 px-3"
                    :class="{ '!bg-accent !text-bg': settingsStore.autoFishing }"
                    @click="settingsStore.autoFishing = true"
                  >
                    Bật
                  </Button>
                  <Button
                    class="py-1 px-3"
                    :class="{ '!bg-accent !text-bg': !settingsStore.autoFishing }"
                    @click="settingsStore.autoFishing = false"
                  >
                    Tắt
                  </Button>
                </div>
              </div>

              <!-- 新手提示 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1 mb-2">
                <p class="text-xs text-muted mb-2">Gợi ý cho người mới</p>
                <p class="text-[10px] text-muted/50 mb-2">Liễulàngtrưởng của sánggianxâygợi ý và mặtbảnghướngdẫnvănchữ</p>
                <div class="flex items-center justify-center space-x-2">
                  <Button class="py-1 px-3" :class="{ '!bg-accent !text-bg': tutorialStore.enabled }" @click="tutorialStore.enabled = true">
                    Bật
                  </Button>
                  <Button
                    class="py-1 px-3"
                    :class="{ '!bg-accent !text-bg': !tutorialStore.enabled }"
                    @click="tutorialStore.enabled = false"
                  >
                    Tắt
                  </Button>
                </div>
              </div>

              <!-- WebDAV 云同步 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs text-muted">Đồng bộ WebDAV</p>
                  <div class="flex space-x-1">
                    <Button
                      class="py-0.5 px-2 text-[10px]"
                      :class="{ '!bg-accent !text-bg': webdavConfig.enabled }"
                      @click="setWebdavEnabled(true)"
                    >
                      Bật
                    </Button>
                    <Button
                      class="py-0.5 px-2 text-[10px]"
                      :class="{ '!bg-accent !text-bg': !webdavConfig.enabled }"
                      @click="setWebdavEnabled(false)"
                    >
                      Tắt
                    </Button>
                  </div>
                </div>

                <!-- 新手说明：不解释清楚，小白根本不知道这四个输入框该填什么 -->
                <div class="border border-accent/10 rounded-xs p-2 mb-2">
                  <button class="flex items-center justify-between w-full" @click="showWebdavHelp = !showWebdavHelp">
                    <span class="text-[10px] text-accent">
                      <HelpCircle :size="10" class="inline" />
                      Đây là gì? Dùng thế nào?
                    </span>
                    <span class="text-[10px] text-muted">{{ showWebdavHelp ? 'Thu gọn' : 'Mở rộng' }}</span>
                  </button>
                  <div v-if="showWebdavHelp" class="mt-2 space-y-1.5">
                    <p class="text-[10px] text-muted leading-relaxed">
                      Bản lưu mặc định chỉ tồn tại trong trình duyệt của thiết bị này. Đổi điện thoại hoặc xóa bộ nhớ trình duyệt sẽ mất bản lưu. WebDAV
                      WebDAV giống như ổ đám mây của riêng bạn. Sau khi bật, bạn có thể tải bản lưu lên và tải xuống trên thiết bị khác để tiếp tục chơi.
                    </p>
                    <p class="text-[10px] text-accent/80">Chỉ ba bước là dùng được:</p>
                    <p class="text-[10px] text-muted leading-relaxed">
                      ① Tìm một dịch vụ lưu trữ hỗ trợ WebDAV, đăng ký rồi vào phần cài đặt 「WebDAV」 để lấy
                      <span class="text-text">Địa chỉ máy chủ</span>
                      、
                      <span class="text-text">Tài khoản</span>
                      và
                      <span class="text-text">Mật khẩu</span>
                      。Một số dịch vụ phổ biến: Jianguoyun (trong nước, dung lượng miễn phí đủ dùng), InfiniCLOUD, TeraCLOUD, hoặc tự dựng Nextcloud / Synology NAS.
                    </p>
                    <p class="text-[10px] text-muted leading-relaxed">
                      ② Điền ba thông tin này vào các ô bên dưới.
                      <span class="text-text">Đường dẫn lưu trữ</span>
                      Có thể để trống, hoặc điền tên một thư mục (ví dụ
                      <span class="text-text">taoyuan</span>
                      ）đemlưulưuđơnđộc lậptrở vềđặt。
                    </p>
                    <p class="text-[10px] text-muted leading-relaxed">
                      ③ Nhấn 「Kiểm tra kết nối」. Nếu kết nối thành công là đã thiết lập xong. Sau đó dùng 「Tải lên」 để tải tiến độ hiện tại lên; khi đổi thiết bị, với cùng cấu hình hãy nhấn 「Tải xuống」 để lấy lại bản lưu.
                    </p>
                    <p class="text-[10px] text-muted/60 leading-relaxed">
                      Lưu ý: mật khẩu được lưu trong trình duyệt trên máy. Nên tạo riêng một 「mật khẩu ứng dụng」 trên dịch vụ đám mây để nhập tại đây, không dùng mật khẩu tài khoản chính.
                    </p>
                    <p class="text-[10px] text-muted/60 leading-relaxed">
                      Lưu ý: địa chỉ WebDAV của các dịch vụ như Jianguoyun thường có dạng https://dav.jianguoyun.com/dav/，muốnđiềnhoànchỉnh（bao gồm https:// vàkếtđuôi的 /）。
                    </p>
                  </div>
                </div>
                <template v-if="webdavConfig.enabled">
                  <div class="flex flex-col space-y-2">
                    <div>
                      <label class="text-[10px] text-muted mb-0.5 block">Địa chỉ máy chủ</label>
                      <input
                        v-model="webdavConfig.serverUrl"
                        placeholder="Vui lòng nhập địa chỉ máy chủ đồng bộ WebDAV"
                        class="w-full px-2 py-1.5 bg-bg border border-accent/30 rounded-xs text-xs text-text focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                        @change="saveWebdavConfig"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] text-muted mb-0.5 block">Đường dẫn lưu trữ</label>
                      <input
                        v-model="webdavConfig.path"
                        placeholder="Có thể để trống nếu không cần đường dẫn"
                        class="w-full px-2 py-1.5 bg-bg border border-accent/30 rounded-xs text-xs text-text focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                        @change="saveWebdavConfig"
                      />
                      <p class="text-[10px] text-muted/50 mt-0.5">Nhập tên thư mục có sẵn trên ổ đám mây, để trống sẽ lưu vào thư mục gốc</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="text-[10px] text-muted mb-0.5 block">Tên người dùng</label>
                        <input
                          v-model="webdavConfig.username"
                          placeholder="Nhập tên người dùng"
                          class="w-full px-2 py-1.5 bg-bg border border-accent/30 rounded-xs text-xs text-text focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                          @change="saveWebdavConfig"
                        />
                      </div>
                      <div>
                        <label class="text-[10px] text-muted mb-0.5 block">Mật khẩu</label>
                        <input
                          v-model="webdavConfig.password"
                          type="password"
                          placeholder="Nhập mật khẩu"
                          class="w-full px-2 py-1.5 bg-bg border border-accent/30 rounded-xs text-xs text-text focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                          @change="saveWebdavConfig"
                        />
                      </div>
                    </div>
                    <Button
                      class="py-1 px-3 text-xs w-full justify-center"
                      :disabled="webdavTestStatus === 'testing' || !webdavConfig.serverUrl"
                      @click="handleTestWebdav"
                    >
                      {{ webdavTestStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra kết nối' }}
                    </Button>
                    <p v-if="webdavTestStatus === 'success'" class="text-success text-xs text-center mt-1 break-words">Kết nối thành công</p>
                    <p v-if="webdavTestStatus === 'failed'" class="text-danger text-xs text-center mt-1 break-words">
                      {{ webdavTestError || 'Kết nối thất bại' }}
                    </p>
                    <div v-if="webdavTraceLogs.length" class="border border-accent/20 rounded-xs p-2 bg-bg/40">
                      <div class="flex items-center justify-between mb-1">
                        <p class="text-[10px] text-muted">Nhật ký yêu cầu</p>
                        <button class="text-[10px] text-muted hover:text-text" @click="clearWebdavTrace">Xóa sạch</button>
                      </div>
                      <div class="max-h-28 overflow-y-auto text-left">
                        <p v-for="(line, idx) in webdavTraceLogs" :key="idx" class="text-[10px] text-muted/80 leading-4 break-all">
                          {{ line }}
                        </p>
                      </div>
                      <button class="webdav-log-copy text-[10px] text-muted hover:text-text">Sao chép nhật ký</button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <!-- ===== 外观 ===== -->
          <template v-if="activeTab === 'display'">
            <!-- 字体大小 -->
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-xs text-muted mb-2">Cỡ chữ</p>
              <div class="flex items-center justify-center space-x-3">
                <Button
                  class="py-1 px-3"
                  :icon="Minus"
                  :icon-size="12"
                  :disabled="settingsStore.fontSize <= 12"
                  @click="settingsStore.changeFontSize(-1)"
                />
                <span class="text-sm w-8 text-center">{{ settingsStore.fontSize }}</span>
                <Button
                  class="py-1 px-3"
                  :icon="Plus"
                  :icon-size="12"
                  :disabled="settingsStore.fontSize >= 24"
                  @click="settingsStore.changeFontSize(1)"
                />
              </div>
            </div>

            <!-- 矿洞行动描述 -->
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-xs text-muted mb-2">Mô tả hành động trong hang mỏ</p>
              <div class="flex items-center justify-center space-x-2">
                <Button
                  v-for="n in MINE_LOG_LINE_OPTIONS"
                  :key="n"
                  class="py-1 px-3"
                  :class="settingsStore.mineLogLines === n ? '!bg-accent !text-bg' : ''"
                  @click="settingsStore.mineLogLines = n"
                >
                  {{ n === 0 ? 'Không hiển thị' : `${n} dòng` }}
                </Button>
              </div>
              <p class="text-[10px] text-muted/50 mt-1.5 text-center">Giảm số dòng để dễ nhìn thanh thể lực và các ô</p>
            </div>

            <!-- 配色主题 -->
            <div class="border border-accent/20 rounded-xs p-3">
              <p class="text-xs text-muted mb-2">Chủ đề màu</p>
              <div class="flex items-center justify-center space-x-2">
                <button
                  v-for="t in THEMES"
                  :key="t.key"
                  class="w-8 h-8 border rounded-xs flex items-center justify-center text-[10px] transition-colors"
                  :class="settingsStore.theme === t.key ? 'border-accent' : 'border-accent/20'"
                  :style="{ backgroundColor: t.bg, color: t.text }"
                  :title="t.name"
                  @click="settingsStore.changeTheme(t.key)"
                >
                  {{ t.name.charAt(0) }}
                </button>
              </div>
            </div>
          </template>

          <!-- ===== 通知 ===== -->
          <template v-if="activeTab === 'notification'">
            <div class="max-h-[40vh] overflow-y-auto flex flex-col space-y-3">
              <!-- 通知位置 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1">
                <p class="text-xs text-muted mb-2">Vị trí thông báo</p>
                <div class="grid grid-cols-3 gap-1 w-24 mx-auto">
                  <button
                    v-for="pos in QMSG_POSITIONS"
                    :key="pos.value"
                    class="w-8 h-6 border rounded-xs transition-colors flex items-center justify-center"
                    :class="
                      settingsStore.qmsgPosition === pos.value ? 'border-accent bg-accent/20 text-accent' : 'border-accent/20 text-muted'
                    "
                    :title="pos.label"
                    @click="settingsStore.changeQmsgPosition(pos.value)"
                  >
                    <component :is="pos.icon" :size="10" />
                  </button>
                </div>
              </div>

              <!-- 持续时间 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1">
                <p class="text-xs text-muted mb-2">Thời lượng</p>
                <div class="flex items-center justify-center space-x-2">
                  <Button
                    class="py-0 px-1.5"
                    :icon="Minus"
                    :icon-size="10"
                    :disabled="settingsStore.qmsgTimeout <= 500"
                    @click="changeTimeout(-500)"
                  />
                  <span class="text-xs w-12 text-center">{{ (settingsStore.qmsgTimeout / 1000).toFixed(1) }}s</span>
                  <Button
                    class="py-0 px-1.5"
                    :icon="Plus"
                    :icon-size="10"
                    :disabled="settingsStore.qmsgTimeout >= 10000"
                    @click="changeTimeout(500)"
                  />
                </div>
              </div>

              <!-- 最大数量 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1">
                <p class="text-xs text-muted mb-2">Số lượng tối đa</p>
                <div class="flex items-center justify-center space-x-2">
                  <Button
                    class="py-0 px-1.5"
                    :icon="Minus"
                    :icon-size="10"
                    :disabled="settingsStore.qmsgMaxNums <= 1"
                    @click="changeMaxNums(-1)"
                  />
                  <span class="text-xs w-6 text-center">{{ settingsStore.qmsgMaxNums }}</span>
                  <Button
                    class="py-0 px-1.5"
                    :icon="Plus"
                    :icon-size="10"
                    :disabled="settingsStore.qmsgMaxNums >= 20"
                    @click="changeMaxNums(1)"
                  />
                </div>
              </div>

              <!-- 宽度限制 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1">
                <p class="text-xs text-muted mb-2">Giới hạn chiều rộng</p>
                <div class="flex items-center justify-center space-x-1 mb-2">
                  <Button
                    class="py-0 px-2"
                    :class="settingsStore.qmsgIsLimitWidth ? '!bg-accent/20 !text-accent !border-accent' : ''"
                    @click="setBool('qmsgIsLimitWidth', true)"
                  >
                    Bật
                  </Button>
                  <Button
                    class="py-0 px-2"
                    :class="!settingsStore.qmsgIsLimitWidth ? '!bg-accent/20 !text-accent !border-accent' : ''"
                    @click="setBool('qmsgIsLimitWidth', false)"
                  >
                    Tắt
                  </Button>
                </div>
                <template v-if="settingsStore.qmsgIsLimitWidth">
                  <p class="text-xs text-muted mb-2">Chiều rộng (px)</p>
                  <div class="flex items-center justify-center space-x-2 mb-2">
                    <Button
                      class="py-0 px-1.5"
                      :icon="Minus"
                      :icon-size="10"
                      :disabled="settingsStore.qmsgLimitWidthNum <= 100"
                      @click="changeLimitWidth(-50)"
                    />
                    <span class="text-xs w-10 text-center">{{ settingsStore.qmsgLimitWidthNum }}</span>
                    <Button
                      class="py-0 px-1.5"
                      :icon="Plus"
                      :icon-size="10"
                      :disabled="settingsStore.qmsgLimitWidthNum >= 800"
                      @click="changeLimitWidth(50)"
                    />
                  </div>
                  <p class="text-xs text-muted mb-2">Xử lý khi vượt quá</p>
                  <div class="flex items-center justify-center space-x-1">
                    <Button
                      v-for="opt in WRAP_OPTIONS"
                      :key="opt.value"
                      class="!text-[10px] py-0 px-1.5"
                      :class="settingsStore.qmsgLimitWidthWrap === opt.value ? '!bg-accent/20 !text-accent !border-accent' : ''"
                      @click="changeWrap(opt.value)"
                    >
                      {{ opt.label }}
                    </Button>
                  </div>
                </template>
              </div>

              <!-- 开关选项 -->
              <div class="border border-accent/20 rounded-xs p-3 mr-1 flex flex-col space-y-2">
                <div v-for="opt in TOGGLE_OPTIONS" :key="opt.key" class="flex flex-col items-center space-y-1">
                  <span class="text-xs text-muted">{{ opt.label }}</span>
                  <div class="flex items-center space-x-1">
                    <Button
                      class="py-0 px-2"
                      :class="settingsStore[opt.key] ? '!bg-accent/20 !text-accent !border-accent' : ''"
                      @click="setBool(opt.key, true)"
                    >
                      Bật
                    </Button>
                    <Button
                      class="py-0 px-2"
                      :class="!settingsStore[opt.key] ? '!bg-accent/20 !text-accent !border-accent' : ''"
                      @click="setBool(opt.key, false)"
                    >
                      Tắt
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 存档管理（全局底部） -->
        <Button :icon="FolderOpen" :icon-size="12" class="py-1 px-3 w-full justify-center mt-3" @click="showSaveManager = true">
          Quản lý bản lưu
        </Button>
      </div>
    </div>
  </Transition>

  <!-- 存档管理弹窗 -->
  <Transition name="panel-fade">
    <SaveManager v-if="showSaveManager" @close="showSaveManager = false" />
  </Transition>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, type Component } from 'vue'
  import {
    X,
    Pause,
    Play,
    Volume2,
    VolumeX,
    Headphones,
    HeadphoneOff,
    FolderOpen,
    Minus,
    Plus,
    ArrowUpLeft,
    ArrowUp,
    ArrowUpRight,
    ArrowLeft,
    Circle,
    ArrowRight,
    ArrowDownLeft,
    ArrowDown,
    ArrowDownRight,
    Settings,
    Palette,
    Bell,
    HelpCircle
  } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import { useAudio } from '@/composables/useAudio'
  import { useGameClock } from '@/composables/useGameClock'
  import { useGameLog } from '@/composables/useGameLog'
  import { useSettingsStore, MINE_LOG_LINE_OPTIONS, type QmsgPosition, type QmsgLimitWidthWrap } from '@/stores/useSettingsStore'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useWebdav } from '@/composables/useWebdav'
  import { THEMES } from '@/data/themes'
  import SaveManager from '@/components/game/SaveManager.vue'
  import ClipboardJS from 'clipboard'

  type SettingsTab = 'general' | 'display' | 'notification'

  type BoolSettingKey = 'qmsgIsLimitWidth' | 'qmsgAnimation' | 'qmsgAutoClose' | 'qmsgShowClose' | 'qmsgShowIcon' | 'qmsgShowReverse'

  const SETTINGS_TABS: { key: SettingsTab; label: string; icon: Component }[] = [
    { key: 'general', label: 'Chung', icon: Settings },
    { key: 'display', label: 'Giao diện', icon: Palette },
    { key: 'notification', label: 'Thông báo', icon: Bell }
  ]

  const QMSG_POSITIONS: {
    value: QmsgPosition
    label: string
    icon: Component
  }[] = [
    { value: 'topleft', label: 'Trên trái', icon: ArrowUpLeft },
    { value: 'top', label: 'Trên', icon: ArrowUp },
    { value: 'topright', label: 'Trên phải', icon: ArrowUpRight },
    { value: 'left', label: 'Trái', icon: ArrowLeft },
    { value: 'center', label: 'Giữa', icon: Circle },
    { value: 'right', label: 'Phải', icon: ArrowRight },
    { value: 'bottomleft', label: 'Dưới trái', icon: ArrowDownLeft },
    { value: 'bottom', label: 'Dưới', icon: ArrowDown },
    { value: 'bottomright', label: 'Dưới phải', icon: ArrowDownRight }
  ]

  const WRAP_OPTIONS: { value: QmsgLimitWidthWrap; label: string }[] = [
    { value: 'no-wrap', label: 'Không xử lý' },
    { value: 'wrap', label: 'Xuống dòng' },
    { value: 'ellipsis', label: 'Dấu ba chấm' }
  ]

  const TOGGLE_OPTIONS: { key: BoolSettingKey; label: string }[] = [
    { key: 'qmsgAnimation', label: 'Hoạt ảnh thông báo' },
    { key: 'qmsgAutoClose', label: 'Tự động đóng' },
    { key: 'qmsgShowClose', label: 'Hiện biểu tượng đóng' },
    { key: 'qmsgShowIcon', label: 'Hiện biểu tượng bên trái' },
    { key: 'qmsgShowReverse', label: 'Đảo hướng thông báo' }
  ]

  defineProps<{ open: boolean }>()
  defineEmits<{ close: [] }>()

  const activeTab = ref<SettingsTab>('general')
  /** WebDAV mớitaynóingày mailàkhôngtriển lãmmở */
  const showWebdavHelp = ref(false)
  const { sfxEnabled, bgmEnabled, toggleSfx, toggleBgm } = useAudio()
  const { isPaused, gameSpeed, togglePause, cycleSpeed } = useGameClock()
  const { showFloat } = useGameLog()
  const settingsStore = useSettingsStore()
  const gameStore = useGameStore()
  const tutorialStore = useTutorialStore()
  const {
    webdavConfig,
    webdavTestStatus,
    webdavTestError,
    webdavTraceLogs,
    saveConfig: saveWebdavConfig,
    clearTrace: clearWebdavTrace,
    testConnection
  } = useWebdav()

  const showSaveManager = ref(false)
  let clipboard: ClipboardJS | null = null

  onMounted(() => {
    clipboard = new ClipboardJS('.webdav-log-copy', {
      text: () => webdavTraceLogs.value.join('\n')
    })
    clipboard.on('success', e => {
      e.clearSelection()
      showFloat('Đã sao chép nhật ký', 'success')
    })
    clipboard.on('error', () => {
      document.body.classList.remove('select-none')
      showFloat('Sao chép thất bại, hãy sao chép thủ công', 'danger')
    })
  })

  onBeforeUnmount(() => {
    clipboard?.destroy()
    clipboard = null
  })

  const handleTestWebdav = async () => {
    await testConnection()
  }

  const setWebdavEnabled = (val: boolean) => {
    webdavConfig.value.enabled = val
    saveWebdavConfig()
  }

  const changeTimeout = (delta: number) => {
    settingsStore.qmsgTimeout = Math.min(10000, Math.max(500, settingsStore.qmsgTimeout + delta))
    settingsStore.syncQmsgConfig()
  }

  const changeMaxNums = (delta: number) => {
    settingsStore.qmsgMaxNums = Math.min(20, Math.max(1, settingsStore.qmsgMaxNums + delta))
    settingsStore.syncQmsgConfig()
  }

  const changeLimitWidth = (delta: number) => {
    settingsStore.qmsgLimitWidthNum = Math.min(800, Math.max(100, settingsStore.qmsgLimitWidthNum + delta))
    settingsStore.syncQmsgConfig()
  }

  const changeWrap = (value: QmsgLimitWidthWrap) => {
    settingsStore.qmsgLimitWidthWrap = value
    settingsStore.syncQmsgConfig()
  }

  const setBool = (key: BoolSettingKey, value: boolean) => {
    settingsStore[key] = value
    settingsStore.syncQmsgConfig()
  }
</script>

<style scoped>
  .yes-select {
    -webkit-user-select: unset;
    user-select: unset;
    -webkit-touch-callout: unset;
  }
</style>
