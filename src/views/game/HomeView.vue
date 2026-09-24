<template>
  <div>
    <h3 class="text-accent text-sm mb-3">
      <Building :size="14" class="inline" />
      thiếtbón
    </h3>

    <!-- 山洞 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <p class="text-sm text-accent mb-2">
        <Mountain :size="14" class="inline" />
        {{ homeStore.caveUnlocked && homeStore.caveChoice !== 'none' ? homeStore.caveName : 'Hang động' }}
      </p>
      <div v-if="!homeStore.caveUnlocked">
        <p class="text-xs text-muted">Hang núi chưa mở. (Sẽ tự động mở khi tổng thu nhập tích lũy đạt một mức nhất định.)</p>
      </div>
      <div v-else-if="homeStore.caveChoice === 'none'">
        <p class="text-xs text-muted mb-2">Chọn công dụng của hang (đã chọn thì không thể thay đổi):</p>
        <div class="flex flex-col space-y-1">
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
            @click="handleChooseCave('mushroom')"
          >
            <span class="text-xs">Hang nấm</span>
            <span class="text-xs text-muted">mỗingày60%kháisuấtsảnnấmnấm</span>
          </div>
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
            @click="handleChooseCave('fruit_bat')"
          >
            <span class="text-xs">Hang dơi</span>
            <span class="text-xs text-muted">mỗingày50%kháisuấtsảnnướcquả</span>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-xs mb-1">
          {{ homeStore.caveChoice === 'mushroom' ? 'Hang nấm — mỗi ngày có cơ hội tạo ra vật phẩm nấm.' : 'Hang dơi — mỗi ngày có cơ hội tạo ra trái cây theo mùa.' }}
        </p>
        <div class="border border-accent/10 rounded-xs p-2 mb-2 space-y-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-muted">Cấp</span>
            <span class="text-[10px] text-accent">{{ homeStore.caveName }}（Lv.{{ homeStore.caveLevel }}）</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-muted">Số ngày hoạt động</span>
            <span class="text-[10px]">{{ homeStore.caveDaysActive }}ngày</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-muted">sảnraChất lượng</span>
            <span class="text-[10px]" :class="caveQualityClass">{{ caveQualityLabel }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-muted">sảnrakháisuất</span>
            <span class="text-[10px]">{{ caveChanceText }}</span>
          </div>
          <div v-if="currentCaveDef && currentCaveDef.doubleChance > 0" class="flex items-center justify-between">
            <span class="text-[10px] text-muted">đôilầnkháisuất</span>
            <span class="text-[10px]">{{ Math.round(currentCaveDef.doubleChance * 100) }}%</span>
          </div>
        </div>
        <!-- 山洞升级 -->
        <div v-if="homeStore.nextCaveUpgrade" class="border border-accent/10 rounded-xs p-2">
          <p class="text-[10px] text-muted mb-1">Nâng cấpđến {{ homeStore.nextCaveUpgrade.name }}</p>
          <div class="space-y-0.5 mb-1.5">
            <div v-for="mat in homeStore.nextCaveUpgrade.materialCost" :key="mat.itemId" class="flex items-center justify-between">
              <span class="text-[10px] text-muted">{{ getItemName(mat.itemId) }}</span>
              <span class="text-[10px]" :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? '' : 'text-danger'">
                {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-muted">Tiền đồng</span>
              <span class="text-[10px]" :class="playerStore.money >= homeStore.nextCaveUpgrade.cost ? '' : 'text-danger'">
                {{ homeStore.nextCaveUpgrade.cost }}văn
              </span>
            </div>
          </div>
          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canUpgradeCave }"
            :disabled="!canUpgradeCave"
            :icon="ArrowUp"
            :icon-size="12"
            @click="handleUpgradeCave"
          >
            tăngcấpnúihang
          </Button>
        </div>
        <div v-else class="text-[10px] text-muted">núihangđã tăngđếnnhấtcaocấp。</div>
      </div>
    </div>

    <!-- 温室 -->
    <div class="border border-accent/20 rounded-xs p-3 mb-4">
      <p class="text-sm text-accent mb-2">
        <Leaf :size="14" class="inline" />
        ấmphòng
      </p>
      <div v-if="!homeStore.greenhouseUnlocked">
        <p class="text-xs text-muted mb-2">Sau khi mở khóa nhà kính có thể trồng cây ở mọi mùa, cây sẽ tự động được tưới.</p>
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
          @click="showGreenhouseModal = true"
        >
          <span class="text-xs">Mở khóa nhà kính</span>
          <span class="text-xs text-accent whitespace-nowrap">{{ GREENHOUSE_UNLOCK_COST }}văn</span>
        </div>
      </div>
      <div v-else>
        <p class="text-xs text-success">Nhà kínhđã mởđặt。có thể đangNông trạimặtbảngtrongchuyểnđổiđếnNhà kínhtiếnhànhtrồng。</p>
      </div>
    </div>

    <!-- 仓库 -->
    <div class="border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-accent">
          <Warehouse :size="14" class="inline" />
          khokho
        </p>
        <span v-if="warehouseStore.unlocked" class="text-xs text-muted">
          rươngcon {{ warehouseStore.craftedChestCount }}/{{ warehouseStore.maxChests }}
        </span>
      </div>

      <!-- 未解锁 -->
      <div v-if="!warehouseStore.unlocked">
        <p class="text-xs text-muted mb-2">Sau khi mở khóa sẽ có kho tổng được phân loại, có thể cất đồ trực tiếp; ngoài ra có thể chế tạo thêm rương để quản lý chi tiết.</p>
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
          @click="showWarehouseUnlockModal = true"
        >
          <span class="text-xs">Mở khóa kho</span>
          <span class="text-xs text-accent whitespace-nowrap">{{ warehouseStore.UNLOCK_COST }}văn</span>
        </div>
      </div>

      <!-- 已解锁 -->
      <template v-else>
        <!-- 总仓：解锁即有，按类归档，一键收纳 -->
        <div v-if="warehouseStore.mainChest" class="border border-accent/30 rounded-xs p-2 mb-3">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center space-x-1.5">
              <Warehouse :size="12" class="text-accent" />
              <span class="text-xs text-accent">Kho tổng</span>
              <span class="text-[10px] text-muted">{{ warehouseStore.mainChest.items.length }}/{{ warehouseStore.mainChestCapacity }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <Button class="py-0 px-1.5 text-[10px]" :icon="ArrowDownToLine" :icon-size="10" @click="handleStowToMain(false)">
                bổ sunghàngvàokho
              </Button>
              <Button class="py-0 px-1.5 text-[10px]" :icon="ArrowDown" :icon-size="10" @click="handleStowToMain(true)">Cất tất cả vào kho</Button>
              <Button class="py-0 px-1.5 text-[10px]" @click="openChestId = warehouseStore.mainChest.id">Mở</Button>
            </div>
          </div>
          <p class="text-[10px] text-muted/60 mb-1.5">
            「Bổ sung vào kho」 thu các vật phẩm cùng loại đã có trong kho tổng; 「Cất tất cả vào kho」 chuyển mọi vật phẩm có thể lưu từ túi vào kho (trừ hạt giống và vật phẩm giới hạn).
          </p>
          <!-- 按类别分区概览 -->
          <div v-if="mainChestGroups.length > 0" class="flex flex-wrap">
            <span
              v-for="g in mainChestGroups"
              :key="g.category"
              class="text-[10px] border border-accent/15 rounded-xs px-1.5 py-0.5 mr-1 mb-1 text-muted"
            >
              {{ g.name }}
              <span class="text-text">{{ g.items.length }}</span>
            </span>
          </div>
          <p v-else class="text-[10px] text-muted/50">Kho tổngcònlàlép của ，điểm「Cất tất cả vào kho」đemTúi đồtrong của đôngtâythutiếnđến。</p>
        </div>

        <!-- 自造箱子列表（不含总仓） -->
        <div v-if="craftedChests.length > 0" class="flex flex-col space-y-1.5 mb-2">
          <div
            v-for="(chest, chestIdx) in craftedChests"
            :key="chest.id"
            class="border border-accent/10 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
            @click="openChestId = chest.id"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-1.5">
                <span
                  class="text-[10px] px-1 rounded-xs border border-accent/30"
                  :class="chest.tier === 'void' ? 'text-quality-supreme' : 'text-accent'"
                >
                  {{ CHEST_DEFS[chest.tier].name }}
                </span>
                <span v-if="renamingChestId !== chest.id" class="text-xs">{{ chest.label }}</span>
                <input
                  v-else
                  v-model="renameInput"
                  class="text-xs bg-transparent border-b border-accent/40 outline-none w-20"
                  maxlength="8"
                  @keyup.enter="confirmRenameChest"
                  @keyup.escape="renamingChestId = null"
                  @click.stop
                />
                <button
                  v-if="renamingChestId !== chest.id"
                  class="text-muted hover:text-accent"
                  @click.stop="startRenameChest(chest.id, chest.label)"
                >
                  <Pencil :size="10" />
                </button>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="text-[10px] text-muted">{{ chest.items.length }}/{{ warehouseStore.getChestCapacity(chest.id) }}</span>
                <button
                  v-if="craftedChests.length > 1 && chestIdx > 0"
                  class="text-muted hover:text-accent"
                  @click.stop="warehouseStore.moveChest(chest.id, 'up')"
                >
                  <ChevronUp :size="12" />
                </button>
                <button
                  v-if="craftedChests.length > 1 && chestIdx < craftedChests.length - 1"
                  class="text-muted hover:text-accent"
                  @click.stop="warehouseStore.moveChest(chest.id, 'down')"
                >
                  <ChevronDown :size="12" />
                </button>
                <button class="text-muted hover:text-danger" @click.stop="openDismantleConfirm(chest.id)">
                  <Trash2 :size="10" />
                </button>
              </div>
            </div>
            <!-- 虚空箱角色 -->
            <template v-if="chest.tier === 'void'">
              <div class="flex items-center space-x-1 mt-1">
                <button
                  v-for="role in VOID_ROLES"
                  :key="role.value"
                  class="text-[10px] px-1 rounded-xs border"
                  :class="chest.voidRole === role.value ? 'border-accent text-accent' : 'border-accent/20 text-muted'"
                  @click.stop="handleSetVoidRole(chest.id, role.value)"
                >
                  {{ role.label }}
                </button>
              </div>
            </template>
          </div>
        </div>
        <p v-else class="text-[10px] text-muted/50 mb-2 px-0.5">Hiện chưa cần thêm rương. Kho tổng đã đủ cho nhu cầu thường ngày; nếu muốn quản lý chi tiết theo mục đích thì có thể xây thêm.</p>

        <!-- 添加箱子：进阶细分用，总仓不占名额 -->
        <Button
          v-if="warehouseStore.craftedChestCount < warehouseStore.maxChests"
          class="w-full"
          :icon="Plus"
          :icon-size="12"
          @click="showAddChestModal = true"
        >
          Thêm rương (có thể quản lý chi tiết và chọn phân loại)
        </Button>
      </template>
    </div>

    <!-- 解锁温室弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showGreenhouseModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showGreenhouseModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showGreenhouseModal = false">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">Mở khóa nhà kính</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">Sau khi mở khóa có thể trồng cây ở mọi mùa, cây sẽ tự động được tưới.</p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2 space-y-1">
            <p class="text-xs text-muted mb-1">Nguyên liệu cần thiết</p>
            <div v-for="mat in GREENHOUSE_MATERIAL_COST" :key="mat.itemId" class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ getItemName(mat.itemId) }}</span>
              <span class="text-xs" :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? '' : 'text-danger'">
                {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Tiền đồng</span>
              <span class="text-xs" :class="playerStore.money >= GREENHOUSE_UNLOCK_COST ? '' : 'text-danger'">
                {{ GREENHOUSE_UNLOCK_COST }}văn
              </span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canUnlockGreenhouse }"
            :disabled="!canUnlockGreenhouse"
            :icon="Unlock"
            :icon-size="12"
            @click="handleUnlockFromModal"
          >
            giảikhóa
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 仓库解锁弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showWarehouseUnlockModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showWarehouseUnlockModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showWarehouseUnlockModal = false">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">Mở khóa kho</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">Sau khi mở khóa có thể đặt rương để phân loại vật phẩm; ban đầu có thể đặt 3 rương và nâng cấp tại cửa hàng.</p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2 space-y-1">
            <div v-for="mat in WAREHOUSE_UNLOCK_MATERIALS" :key="mat.itemId" class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ getItemName(mat.itemId) }}</span>
              <span class="text-xs" :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? '' : 'text-danger'">
                {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Tiền đồng</span>
              <span class="text-xs" :class="playerStore.money >= warehouseStore.UNLOCK_COST ? '' : 'text-danger'">
                {{ warehouseStore.UNLOCK_COST }}văn
              </span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="{ '!bg-accent !text-bg': canUnlockWarehouse }"
            :disabled="!canUnlockWarehouse"
            :icon="Unlock"
            :icon-size="12"
            @click="handleUnlockWarehouse"
          >
            giảikhóa
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 箱子详情弹窗 -->
    <Transition name="panel-fade">
      <div v-if="openChestId" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="openChestId = null">
        <div v-if="currentOpenChest" class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-1.5">
              <span
                class="text-[10px] px-1 rounded-xs border border-accent/30"
                :class="currentOpenChest.tier === 'void' ? 'text-quality-supreme' : 'text-accent'"
              >
                {{ CHEST_DEFS[currentOpenChest.tier].name }}
              </span>
              <p class="text-sm text-accent">{{ currentOpenChest.label }}</p>
              <span class="text-[10px] text-muted">
                {{ currentOpenChest.items.length }}/{{ warehouseStore.getChestCapacity(currentOpenChest.id) }}
              </span>
            </div>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="openChestId = null" />
          </div>

          <!-- 箱子物品列表：总仓按类别分区显示，其它箱子平铺 -->
          <div v-if="currentOpenChest.items.length > 0" class="flex flex-col space-y-1 mb-2 max-h-64 overflow-y-auto">
            <template v-for="group in openChestGroups" :key="group.category">
              <p v-if="currentOpenChest.tier === 'main'" class="text-[10px] text-accent/70 mt-1.5 first:mt-0 px-0.5">
                {{ group.name }}
                <span class="text-muted/50">({{ group.items.length }})</span>
              </p>
              <div
                v-for="(item, idx) in group.items"
                :key="group.category + ':' + idx"
                class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1 mr-1"
                @click="
                  chestItemDetail = {
                    itemId: item.itemId,
                    quality: item.quality,
                    quantity: item.quantity
                  }
                "
              >
                <span class="text-xs truncate mr-2 cursor-pointer hover:underline" :class="qualityTextClass(item.quality)">
                  {{ getItemName(item.itemId) }}
                  <span v-if="item.quality !== 'normal'" class="text-[10px]">[{{ QUALITY_LABEL[item.quality] }}]</span>
                  <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
                </span>
                <div class="flex items-center space-x-1.5">
                  <Button
                    class="py-0 px-1"
                    @click.stop="openChestQtyModal('withdraw', openChestId!, item.itemId, item.quality, item.quantity)"
                  >
                    Lấy ra
                  </Button>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-6 mb-2">
            <Warehouse :size="36" class="text-accent/20 mb-2" />
            <p class="text-xs text-muted">Rương đang trống</p>
            <p class="text-[10px] text-muted/50 mt-0.5">Nhấn 「Cất vật phẩm」 bên dưới để thêm</p>
          </div>

          <!-- 一键整理 -->
          <Button
            v-if="currentOpenChest && currentOpenChest.items.length > 1"
            class="w-full mb-1"
            :icon="ArrowDown01"
            :icon-size="12"
            @click="warehouseStore.sortChest(openChestId!)"
          >
            chỉnhquản lý
          </Button>
          <!-- 一键存入重复物品 -->
          <Button
            v-if="duplicateDepositItems.length > 0"
            class="w-full mb-1"
            :icon="ArrowDownToLine"
            :icon-size="12"
            @click="handleDepositDuplicates"
          >
            Cất nhanh đồ trùngvậtphẩm
          </Button>
          <!-- 存入按钮 -->
          <Button v-if="depositableItems.length > 0" class="w-full" :icon="ArrowDown" :icon-size="12" @click="showChestDepositModal = true">
            Cất vàovậtphẩm
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 箱子存入弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showChestDepositModal && openChestId"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showChestDepositModal = false"
      >
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">Cất vật phẩm</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showChestDepositModal = false" />
          </div>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="item in depositableItems"
              :key="item.itemId + item.quality"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="openChestQtyModal('deposit', openChestId!, item.itemId, item.quality, item.quantity)"
            >
              <span class="text-xs truncate mr-2" :class="qualityTextClass(item.quality)">
                {{ getItemName(item.itemId) }}
                <span v-if="item.quality !== 'normal'" class="text-[10px]">({{ QUALITY_LABEL[item.quality] }})</span>
              </span>
              <span class="text-xs text-muted">&times;{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 箱子数量选择弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="chestQtyModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
        @click.self="chestQtyModal = null"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">
              {{ chestQtyModal.mode === 'withdraw' ? 'Lấy ra' : 'Cất vào' }}
            </p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="chestQtyModal = null" />
          </div>
          <p class="text-xs mb-2" :class="qualityTextClass(chestQtyModal.quality)">
            {{ getItemName(chestQtyModal.itemId) }}
            <span v-if="chestQtyModal.quality !== 'normal'" class="text-[10px]">({{ QUALITY_LABEL[chestQtyModal.quality] }})</span>
          </p>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">Số lượng</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="chestQty <= 1" @click="addChestQty(-1)">-</Button>
                <input
                  type="number"
                  :value="chestQty"
                  min="1"
                  :max="chestQtyModal.max"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none"
                  @input="onChestQtyInput"
                />
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="chestQty >= chestQtyModal.max" @click="addChestQty(1)">
                  +
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="chestQty <= 1" @click="setChestQty(1)">Ít nhất</Button>
              <Button class="flex-1 justify-center" :disabled="chestQty >= chestQtyModal.max" @click="setChestQty(chestQtyModal!.max)">
                nhấtnhiều
              </Button>
            </div>
          </div>
          <Button class="w-full justify-center !bg-accent !text-bg" @click="confirmChestQty">
            {{ chestQtyModal.mode === 'withdraw' ? 'Lấy ra' : 'Cất vào' }} &times;{{ chestQty }}
          </Button>
        </div>
      </div>
    </Transition>

    <!-- 拆卸箱子确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="dismantleChestId"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="dismantleChestId = null"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">tháotháoxác nhận </p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="dismantleChestId = null" />
          </div>
          <template v-if="dismantleChestInfo">
            <p class="text-xs mb-2">
              xácđịnhmuốntháotháo「{{ dismantleChestInfo.label }}」sao？
              <span v-if="dismantleChestInfo.itemCount > 0" class="text-danger">
                rươngtrong{{ dismantleChestInfo.itemCount }}ôvậtphẩmsẽtrả lạicònlưnggói。
              </span>
            </p>
            <div class="border border-accent/10 rounded-xs p-2 mb-3">
              <p class="text-[10px] text-muted mb-1">Hoàn trả nguyên liệu (50%)</p>
              <div class="flex flex-wrap gap-x-3 gap-y-0.5">
                <span v-for="mat in dismantleChestInfo.refund" :key="mat.itemId" class="text-[10px] text-success">
                  {{ getItemName(mat.itemId) }} ×{{ mat.quantity }}
                </span>
                <span v-if="dismantleChestInfo.refund.length === 0" class="text-[10px] text-muted">Không</span>
              </div>
            </div>
            <div class="flex space-x-3 justify-center">
              <Button @click="dismantleChestId = null">Hủy</Button>
              <Button class="btn-danger" :icon="Trash2" :icon-size="12" @click="confirmDismantle">tháotháo</Button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 箱子道具信息弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="chestItemDetail && chestItemDef"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="chestItemDetail = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="chestItemDetail = null">
            <X :size="14" />
          </button>
          <p class="text-sm mb-2" :class="qualityTextClass(chestItemDetail.quality, 'text-accent')">
            {{ chestItemDef.name }}
          </p>
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">{{ chestItemDef.description }}</p>
          </div>
          <div class="border border-accent/10 rounded-xs p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Số lượng</span>
              <span class="text-xs">×{{ chestItemDetail.quantity }}</span>
            </div>
            <div v-if="chestItemDetail.quality !== 'normal'" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Chất lượng</span>
              <span class="text-xs" :class="qualityTextClass(chestItemDetail.quality)">{{ QUALITY_LABEL[chestItemDetail.quality] }}</span>
            </div>
            <div v-if="chestItemDef.sellPrice" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Giá bán</span>
              <span class="text-xs text-accent">{{ chestItemDef.sellPrice }}văn</span>
            </div>
            <div v-if="chestItemDef.staminaRestore" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Hồi phục</span>
              <span class="text-xs text-success">
                +{{ chestItemDef.staminaRestore }}thểlực
                <template v-if="chestItemDef.healthRestore">/ +{{ chestItemDef.healthRestore }}HP</template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 添加箱子弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showAddChestModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showAddChestModal = false"
      >
        <div class="game-panel max-w-sm w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">Chế tạorương</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="showAddChestModal = false" />
          </div>
          <div class="flex flex-col space-y-1.5">
            <div v-for="tier in CHEST_TIER_ORDER" :key="tier" class="border border-accent/20 rounded-xs p-2">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs font-bold" :class="tier === 'void' ? 'text-quality-supreme' : 'text-accent'">
                    {{ CHEST_DEFS[tier].name }}
                  </span>
                  <span class="text-[10px] text-muted">{{ CHEST_DEFS[tier].capacity }}ô</span>
                </div>
                <Button
                  class="py-0 px-1.5"
                  :class="{ '!bg-accent !text-bg': canCraftChest(tier) }"
                  :disabled="!canCraftChest(tier)"
                  @click="handleCraftChest(tier)"
                >
                  chếlàm
                </Button>
              </div>
              <p class="text-[10px] text-muted mb-1">
                {{ CHEST_DEFS[tier].description }}
              </p>
              <div class="flex flex-wrap gap-x-3 gap-y-0.5">
                <span
                  v-for="mat in CHEST_DEFS[tier].craftCost"
                  :key="mat.itemId"
                  class="text-[10px]"
                  :class="getCombinedItemCount(mat.itemId) >= mat.quantity ? 'text-muted' : 'text-danger'"
                >
                  {{ getItemName(mat.itemId) }}
                  {{ getCombinedItemCount(mat.itemId) }}/{{ mat.quantity }}
                </span>
                <span class="text-[10px]" :class="playerStore.money >= CHEST_DEFS[tier].craftMoney ? 'text-muted' : 'text-danger'">
                  {{ CHEST_DEFS[tier].craftMoney }}văn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import {
    ArrowDown,
    ArrowDown01,
    ArrowDownToLine,
    ArrowUp,
    Building,
    ChevronDown,
    ChevronUp,
    Mountain,
    Leaf,
    Pencil,
    Plus,
    Trash2,
    Unlock,
    Warehouse,
    X
  } from 'lucide-vue-next'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useProcessingStore } from '@/stores/useProcessingStore'
  import { useWarehouseStore } from '@/stores/useWarehouseStore'
  import { getCombinedItemCount, removeCombinedItem } from '@/composables/useCombinedInventory'
  import { getItemById } from '@/data'
  import { GREENHOUSE_UNLOCK_COST, GREENHOUSE_MATERIAL_COST, WAREHOUSE_UNLOCK_MATERIALS, getCaveUpgrade } from '@/data/buildings'
  import { CHEST_DEFS, CHEST_TIER_ORDER } from '@/data/items'
  import type { Quality, ChestTier, VoidChestRole } from '@/types'
  import { addLog } from '@/composables/useGameLog'
  import Button from '@/components/game/Button.vue'

  const homeStore = useHomeStore()
  const inventoryStore = useInventoryStore()
  const playerStore = usePlayerStore()
  const warehouseStore = useWarehouseStore()
  const processingStore = useProcessingStore()

  const showGreenhouseModal = ref(false)
  const showWarehouseUnlockModal = ref(false)
  const showAddChestModal = ref(false)
  const showChestDepositModal = ref(false)
  const openChestId = ref<string | null>(null)
  const renamingChestId = ref<string | null>(null)
  const renameInput = ref('')

  const getItemName = (itemId: string): string => {
    return getItemById(itemId)?.name ?? itemId
  }

  // === núihang ===

  const handleChooseCave = (choice: 'mushroom' | 'fruit_bat') => {
    if (homeStore.chooseCave(choice)) {
      const name = choice === 'mushroom' ? 'Hang nấm' : 'Hang dơi'
      addLog(`Đã chọn ${name}, mỗi ngày sẽ có sản lượng thụ động.`)
    }
  }

  const currentCaveDef = computed(() => getCaveUpgrade(homeStore.caveLevel) ?? null)

  const caveQualityLabel = computed(() => QUALITY_LABEL[homeStore.caveQuality])

  const caveQualityClass = computed(() => qualityTextClass(homeStore.caveQuality))

  const caveChanceText = computed(() => {
    const def = currentCaveDef.value
    if (!def) return ''
    if (homeStore.caveChoice === 'mushroom') return `${Math.round(def.mushroomChance * 100)}%`
    if (homeStore.caveChoice === 'fruit_bat') return `${Math.round(def.fruitBatChance * 100)}%`
    return ''
  })

  const canUpgradeCave = computed(() => {
    const upgrade = homeStore.nextCaveUpgrade
    if (!upgrade) return false
    if (playerStore.money < upgrade.cost) return false
    return upgrade.materialCost.every(mat => getCombinedItemCount(mat.itemId) >= mat.quantity)
  })

  const handleUpgradeCave = () => {
    if (homeStore.upgradeCave()) {
      addLog(`Hang động nâng cấp thành ${homeStore.caveName}!`)
    } else {
      addLog('Không đủ tiền hoặc nguyên liệu, không thể nâng cấp hang động.')
    }
  }

  // === ấmphòng ===

  const canUnlockGreenhouse = computed(() => {
    if (playerStore.money < GREENHOUSE_UNLOCK_COST) return false
    return GREENHOUSE_MATERIAL_COST.every(mat => getCombinedItemCount(mat.itemId) >= mat.quantity)
  })

  const handleUnlockFromModal = () => {
    if (homeStore.unlockGreenhouse()) {
      addLog('Nhà kính đã mở khóa! Có thể chuyển sang nhà kính trong bảng nông trại để trồng cây.')
      showGreenhouseModal.value = false
    } else {
      addLog('Không đủ tiền hoặc nguyên liệu, không thể mở khóa nhà kính.')
    }
  }

  // === khokho ===

  const canUnlockWarehouse = computed(() => {
    if (playerStore.money < warehouseStore.UNLOCK_COST) return false
    return WAREHOUSE_UNLOCK_MATERIALS.every(mat => getCombinedItemCount(mat.itemId) >= mat.quantity)
  })

  const handleUnlockWarehouse = () => {
    if (warehouseStore.unlocked) return
    if (!canUnlockWarehouse.value) {
      addLog('Không đủ tiền hoặc nguyên liệu, không thể mở khóa kho.')
      return
    }
    for (const mat of WAREHOUSE_UNLOCK_MATERIALS) {
      removeCombinedItem(mat.itemId, mat.quantity)
    }
    playerStore.spendMoney(warehouseStore.UNLOCK_COST)
    warehouseStore.unlock()
    showWarehouseUnlockModal.value = false
    addLog(`Kho đã mở khóa! Kho tổng đã sẵn sàng, có thể cất vật phẩm trực tiếp. (-${warehouseStore.UNLOCK_COST} văn)`)
  }

  // === rươngconquản lýquản lý ===

  /** rươngconđạocông cụthông tintinđạncửa sổ */
  const chestItemDetail = ref<{
    itemId: string
    quality: Quality
    quantity: number
  } | null>(null)
  const chestItemDef = computed(() => {
    if (!chestItemDetail.value) return null
    return getItemById(chestItemDetail.value.itemId) ?? null
  })

  const QUALITY_LABEL: Record<Quality, string> = {
    normal: 'Thường',
    fine: 'Tốt',
    excellent: 'Tinh phẩm',
    supreme: 'Cực phẩm'
  }

  const qualityTextClass = (q: Quality, fallback = ''): string => {
    if (q === 'fine') return 'text-quality-fine'
    if (q === 'excellent') return 'text-quality-excellent'
    if (q === 'supreme') return 'text-quality-supreme'
    return fallback
  }

  const VOID_ROLES: { value: VoidChestRole; label: string }[] = [
    { value: 'none', label: 'Không' },
    { value: 'input', label: 'Rương nguyên liệu' },
    { value: 'output', label: 'Rương thành phẩm' }
  ]

  const currentOpenChest = computed(() => {
    if (!openChestId.value) return null
    return warehouseStore.getChest(openChestId.value) ?? null
  })

  /** chơinhàtựxây的rươngcon（khôngbao gồmtổngkho，tổngkhođơnđộc lậptriển lãmhiển thị） */
  const craftedChests = computed(() => warehouseStore.chests.filter(c => c.tier !== 'main'))

  /** tổngkho的nhấnloàiđiểmkhukháixem */
  const mainChestGroups = computed(() => warehouseStore.getMainChestGroups())

  /**
   * đánhmở的rươngconnhấnloàikhácđiểmnhóm。
   * tổngkhođiểmkhutriển lãmhiển thị；phổ thônggiaorươngcontrở về成đơnnhómbìnhquán，tổngdùngcùngmộtđoạnmô hìnhbảng。
   */
  const openChestGroups = computed(() => {
    const chest = currentOpenChest.value
    if (!chest) return []
    if (chest.tier === 'main') return warehouseStore.getMainChestGroups()
    return [{ category: 'all', name: '', items: chest.items }]
  })

  /** mộtphímthunhậnđếntổngkho */
  const handleStowToMain = (all: boolean) => {
    const { kinds, total } = warehouseStore.stowToMain(all)
    if (total > 0) {
      addLog(`Đã cất ${total} vật phẩm thuộc ${kinds} loại vào kho tổng.`)
    } else if (all) {
      addLog('Túi không có vật phẩm để cất hoặc kho tổng đã đầy.')
    } else {
      addLog('Túi không có vật phẩm cùng loại với kho tổng. Muốn cất đồ mới hãy dùng 「Cất tất cả」.')
    }
  }

  /** lưnggóitrong可lưuvàorươngcon的vậtphẩm（xếpxóagiốngconvàkhóađịnhvậtphẩm） */
  const depositableItems = computed(() =>
    inventoryStore.items.filter(i => {
      if (i.locked) return false
      const def = getItemById(i.itemId)
      return def && def.category !== 'seed'
    })
  )

  /** lưnggóitrong可mộtphímlưuvào的lạihồivậtphẩm（rươngcontrongđãcóvàchưakhóađịnh、không phảigiốngcon） */
  const duplicateDepositItems = computed(() => {
    if (!currentOpenChest.value) return []
    const chestItemIds = new Set(currentOpenChest.value.items.map(i => i.itemId))
    return inventoryStore.items.filter(i => {
      if (i.locked) return false
      const def = getItemById(i.itemId)
      if (!def || def.category === 'seed') return false
      return chestItemIds.has(i.itemId)
    })
  })

  /** chếlàmrươngcon */
  const canCraftChest = (tier: ChestTier): boolean => {
    if (warehouseStore.chests.length >= warehouseStore.maxChests) return false
    return processingStore.canCraft(CHEST_DEFS[tier].craftCost, CHEST_DEFS[tier].craftMoney)
  }

  const handleCraftChest = (tier: ChestTier) => {
    if (!canCraftChest(tier)) {
      addLog('Không đủ nguyên liệu hoặc tiền.')
      return
    }
    if (!processingStore.consumeCraftMaterials(CHEST_DEFS[tier].craftCost, CHEST_DEFS[tier].craftMoney)) return
    warehouseStore.addChest(tier)
    addLog(`Đã chế tạo ${CHEST_DEFS[tier].name}! (-${CHEST_DEFS[tier].craftMoney} văn)`)
    if (warehouseStore.chests.length >= warehouseStore.maxChests) {
      showAddChestModal.value = false
    }
  }

  /** tháotháorươngconxácxác nhận */
  const dismantleChestId = ref<string | null>(null)

  const dismantleChestInfo = computed(() => {
    if (!dismantleChestId.value) return null
    const chest = warehouseStore.getChest(dismantleChestId.value)
    if (!chest) return null
    const def = CHEST_DEFS[chest.tier]
    const refund = def.craftCost
      .map(mat => ({
        itemId: mat.itemId,
        quantity: Math.floor(mat.quantity * 0.5)
      }))
      .filter(m => m.quantity > 0)
    return {
      label: chest.label,
      tier: chest.tier,
      itemCount: chest.items.length,
      refund
    }
  })

  const openDismantleConfirm = (chestId: string) => {
    dismantleChestId.value = chestId
  }

  const confirmDismantle = () => {
    const chestId = dismantleChestId.value
    if (!chestId) return
    const chest = warehouseStore.getChest(chestId)
    if (!chest) return
    const info = dismantleChestInfo.value
    if (!info) return
    // rươngtrongvậtphẩmtrả lạicònlưnggói
    for (const item of [...chest.items]) {
      inventoryStore.addItem(item.itemId, item.quantity, item.quality)
    }
    chest.items.length = 0
    // tháoxóarươngcon
    const name = chest.label
    warehouseStore.removeChest(chestId)
    // trả lạicòn50%nguyên liệuliệu
    for (const mat of info.refund) {
      inventoryStore.addItem(mat.itemId, mat.quantity)
    }
    const refundText = info.refund.map(m => `${getItemName(m.itemId)}×${m.quantity}`).join('、')
    addLog(`Đã tháo ${name}. ${refundText ? `Đã hoàn trả: ${refundText}.` : ''}`)
    dismantleChestId.value = null
    if (openChestId.value === chestId) openChestId.value = null
  }

  /** lạimệnhtênrươngcon */
  const startRenameChest = (chestId: string, currentLabel: string) => {
    renamingChestId.value = chestId
    renameInput.value = currentLabel
  }

  const confirmRenameChest = () => {
    if (renamingChestId.value) {
      warehouseStore.renameChest(renamingChestId.value, renameInput.value)
    }
    renamingChestId.value = null
  }

  /** hư khôngléprươnggócmàu */
  const handleSetVoidRole = (chestId: string, role: VoidChestRole) => {
    warehouseStore.setVoidRole(chestId, role)
    const chest = warehouseStore.getChest(chestId)
    if (!chest) return
    if (role === 'none') addLog(`Đã hủy thiết lập vai trò của ${chest.label}.`)
    else if (role === 'input') addLog(`${chest.label} được đặt làm rương nguyên liệu, xưởng sẽ tự lấy nguyên liệu từ đây.`)
    else addLog(`${chest.label} được đặt làm rương thành phẩm, sản phẩm xưởng sẽ tự động cho vào đây.`)
  }

  // === rươngconsốlượngchọnchọn ===
  interface ChestQtyModalData {
    mode: 'withdraw' | 'deposit'
    chestId: string
    itemId: string
    quality: Quality
    max: number
  }
  const chestQtyModal = ref<ChestQtyModalData | null>(null)
  const chestQty = ref(1)

  const openChestQtyModal = (mode: 'withdraw' | 'deposit', chestId: string, itemId: string, quality: Quality, max: number) => {
    if (max <= 1) {
      if (mode === 'withdraw') executeChestWithdraw(chestId, itemId, quality, 1)
      else executeChestDeposit(chestId, itemId, quality, 1)
      return
    }
    chestQtyModal.value = { mode, chestId, itemId, quality, max }
    chestQty.value = max
  }

  const setChestQty = (val: number) => {
    if (!chestQtyModal.value) return
    chestQty.value = Math.max(1, Math.min(val, chestQtyModal.value.max))
  }
  const addChestQty = (delta: number) => setChestQty(chestQty.value + delta)
  const onChestQtyInput = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10)
    if (!isNaN(val)) setChestQty(val)
  }

  const executeChestWithdraw = (chestId: string, itemId: string, quality: Quality, qty: number) => {
    if (!warehouseStore.withdrawFromChest(chestId, itemId, qty, quality)) {
      addLog('Balo đã đầy, không thể lấy ra.')
      return
    }
    addLog(`Đã lấy ${getItemName(itemId)}×${qty}.`)
  }

  const executeChestDeposit = (chestId: string, itemId: string, quality: Quality, qty: number) => {
    const actualQty = warehouseStore.depositToChest(chestId, itemId, qty, quality)
    if (actualQty <= 0) {
      addLog('Rương đã đầy, không thể cất thêm.')
      return
    }
    addLog(`Đã cất ${getItemName(itemId)}×${actualQty}.`)
    if (depositableItems.value.length === 0 || warehouseStore.isChestFull(chestId)) {
      showChestDepositModal.value = false
    }
  }

  const confirmChestQty = () => {
    if (!chestQtyModal.value) return
    const { mode, chestId, itemId, quality } = chestQtyModal.value
    if (mode === 'withdraw') executeChestWithdraw(chestId, itemId, quality, chestQty.value)
    else executeChestDeposit(chestId, itemId, quality, chestQty.value)
    chestQtyModal.value = null
  }

  /** mộtphímlưuvàolạihồivậtphẩm */
  const handleDepositDuplicates = () => {
    if (!openChestId.value) return
    const chestId = openChestId.value
    const snapshot = duplicateDepositItems.value.map(i => ({
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
      addLog(`Đã cất một chạm ${kindCount} loại vật phẩm, tổng ${totalDeposited} món.`)
    } else {
      addLog('Rương đã đầy, không thể cất thêm.')
    }
  }
</script>
