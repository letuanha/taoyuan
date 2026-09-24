<template>
  <div>
    <VillagerPresence spot="farm" />
    <!-- 标签切换 -->
    <div class="flex space-x-1.5 mb-3">
      <Button
        class="flex-1 justify-center"
        :class="{ '!bg-accent !text-bg': farmTab === 'field' }"
        :icon="Sprout"
        @click="farmTab = 'field'"
      >
        Nông trại
      </Button>
      <Button
        class="flex-1 justify-center"
        :class="{ '!bg-accent !text-bg': farmTab === 'tree' }"
        :icon="TreeDeciduous"
        @click="farmTab = 'tree'"
      >
        Vườn cây
      </Button>
    </div>

    <!-- 田庄标签 -->
    <div v-if="farmTab === 'field'">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center space-x-1.5 text-sm text-accent">
          <Sprout :size="14" />
          <span>Nông trại ({{ farmStore.farmSize }}×{{ farmStore.farmSize }})</span>
        </div>
        <div class="text-xs text-muted flex space-x-3">
          <span v-if="farmStore.scarecrows > 0" class="inline-flex items-center space-x-0.5">
            <Bird :size="12" />
            <span>Bù nhìn {{ farmStore.scarecrows }}</span>
          </span>
          <span v-else class="text-danger/80 inline-flex items-center space-x-0.5">
            <Bird :size="12" />
            <span>Không có Bù nhìn</span>
          </span>
          <span v-if="farmStore.lightningRods > 0" class="inline-flex items-center space-x-0.5">
            <Zap :size="12" />
            <span>Cột thu lôi {{ farmStore.lightningRods }}</span>
          </span>
        </div>
      </div>

      <!-- 新手引导 -->
      <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">
        {{ tutorialHint }}
      </p>

      <!-- 批量操作入口 -->
      <div class="mb-3">
        <Button class="w-full md:w-auto" :icon-size="12" :icon="Wrench" @click="showBatchActions = true">Thao tác nhanh</Button>
      </div>

      <!-- 田庄特殊功能 -->
      <div v-if="gameStore.farmMapType === 'riverland' && gameStore.creekCatch.length > 0" class="mb-3">
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
          @click="handleCollectCreekCatch"
        >
          <div>
            <p class="text-xs text-accent">Cá suối</p>
            <p class="text-[10px] text-muted">Bắt được {{ gameStore.creekCatch.length }} con cá ở suối</p>
          </div>
          <span class="text-xs text-success">Thu thập</span>
        </div>
      </div>

      <div v-if="gameStore.farmMapType === 'hilltop' && gameStore.surfaceOrePatch" class="mb-3">
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
          @click="handleMineSurfaceOre"
        >
          <div>
            <p class="text-xs text-accent">Quặng nổi</p>
            <p class="text-[10px] text-muted">Phát hiện {{ surfaceOreName }}&times;{{ gameStore.surfaceOrePatch.quantity }}</p>
          </div>
          <span class="text-xs text-success">Khai thác (-5 thể lực)</span>
        </div>
      </div>

      <!-- 批量操作弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="showBatchActions"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="showBatchActions = false"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showBatchActions = false">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">Thao tác nhanh</p>
            <div class="flex flex-col space-y-1.5">
              <button class="btn text-xs w-full justify-between" :disabled="unwateredCount === 0" @click="doBatchAction('water')">
                <span class="flex items-center space-x-1">
                  <Droplets :size="12" />
                  <span>Tưới hàng loạt</span>
                </span>
                <span class="text-muted">{{ unwateredCount }} ô</span>
              </button>
              <button class="btn text-xs w-full justify-between" :disabled="wastelandCount === 0" @click="doBatchAction('till')">
                <span class="flex items-center space-x-1">
                  <Shovel :size="12" />
                  <span>Khai khẩn hàng loạt</span>
                </span>
                <span class="text-muted">{{ wastelandCount }} ô</span>
              </button>
              <button class="btn text-xs w-full justify-between" :disabled="harvestableCount === 0" @click="doBatchAction('harvest')">
                <span class="flex items-center space-x-1">
                  <Wheat :size="12" />
                  <span>Thu hoạch hàng loạt</span>
                </span>
                <span class="text-muted">{{ harvestableCount }} ô</span>
              </button>
              <button
                class="btn text-xs w-full justify-between"
                :disabled="tilledEmptyCount === 0 || (plantableSeeds.length === 0 && plantableBreedingSeeds.length === 0)"
                @click="doBatchAction('plant')"
              >
                <span class="flex items-center space-x-1">
                  <Sprout :size="12" />
                  <span>Gieo hạt hàng loạt</span>
                </span>
                <span class="text-muted">{{ tilledEmptyCount }} ô</span>
              </button>
              <button
                class="btn text-xs w-full justify-between"
                :disabled="fertilizableCount === 0 || fertilizerItems.length === 0"
                @click="doBatchAction('fertilize')"
              >
                <span class="flex items-center space-x-1">
                  <CirclePlus :size="12" />
                  <span>Bón phân hàng loạt</span>
                </span>
                <span class="text-muted">{{ fertilizableCount }} ô</span>
              </button>
              <button class="btn text-xs w-full justify-between" :disabled="infestedCount === 0" @click="doBatchAction('curePest')">
                <span class="flex items-center space-x-1">
                  <Bug :size="12" />
                  <span>Trừ sâu hàng loạt</span>
                </span>
                <span class="text-muted">{{ infestedCount }} ô</span>
              </button>
              <button class="btn text-xs w-full justify-between" :disabled="weedyCount === 0" @click="doBatchAction('clearWeed')">
                <span class="flex items-center space-x-1">
                  <Leaf :size="12" />
                  <span>Nhổ cỏ hàng loạt</span>
                </span>
                <span class="text-muted">{{ weedyCount }} ô</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 农场网格 -->
      <div class="border border-accent/20 rounded-xs p-2">
        <div
          class="grid gap-0.5 max-w-full md:max-w-md"
          :style="{
            gridTemplateColumns: `repeat(${farmStore.farmSize}, minmax(0, 1fr))`
          }"
        >
          <button
            v-for="plot in farmStore.plots"
            :key="plot.id"
            class="farm-plot rounded-xs cursor-pointer transition-colors relative leading-tight"
            :class="[
              getPlotDisplay(plot).color,
              getPlotDisplay(plot).bg,
              needsWater(plot)
                ? 'border-2 border-danger/50'
                : isSprinklerCovered(plot.id)
                  ? 'border border-water/40'
                  : 'border border-accent/15',
              plot.state === 'harvestable' ? 'hover:border-accent/60' : 'hover:border-accent/40'
            ]"
            :title="getPlotTooltip(plot)"
            @click="activePlotId = plot.id"
          >
            <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <component :is="getPlotDisplay(plot).icon" :size="14" />
              <span v-if="plot.cropId" class="text-[10px] opacity-60 truncate max-w-full px-0.5 mt-1">{{ getCropName(plot.cropId) }}</span>
              <!-- 角标 -->
              <Droplets
                v-if="(plot.state === 'planted' || plot.state === 'growing') && !plot.watered"
                :size="8"
                class="absolute bottom-0 right-0 text-danger drop-shadow-sm"
              />
              <Droplet v-if="hasSprinkler(plot.id)" :size="8" class="absolute top-0 right-0 text-water drop-shadow-sm" />
              <CirclePlus v-if="plot.fertilizer" :size="8" class="absolute bottom-0 left-0 text-success drop-shadow-sm" />
              <Bug v-if="plot.infested" :size="8" class="absolute top-0 left-0 text-danger drop-shadow-sm" />
              <Leaf
                v-if="plot.weedy"
                :size="8"
                class="absolute top-0 left-0 text-success drop-shadow-sm"
                :class="{ 'left-2': plot.infested }"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- 地块操作弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="activePlot"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="activePlotId = null"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="activePlotId = null">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">đấtô #{{ activePlot.id + 1 }}</p>
            <p class="text-xs text-muted mb-2">
              {{ plotStateLabel }}
              <template v-if="activePlot.giantCropGroup !== null">(Khổng lồ)</template>
              <template v-if="activePlot.cropId">
                · {{ activePlot.giantCropGroup !== null ? 'Khổng lồ' : '' }}{{ getCropName(activePlot.cropId) }}
                <span v-if="plotCropRegrowth" class="text-success">[Nhiều vụ {{ activePlot.harvestCount }}/{{ plotCropMaxHarvests }}]</span>
              </template>
              <template v-if="activePlot.cropId && activePlot.giantCropGroup === null">
                ·
                <span :class="activePlot.watered ? 'text-water' : 'text-danger'">{{ activePlot.watered ? 'Đã tưới nước' : 'Chưa tưới' }}</span>
              </template>
              <template v-if="activePlot.fertilizer">
                ·
                <span class="text-success">{{ plotFertName }}</span>
              </template>
              <template v-if="hasSprinkler(activePlot.id)">
                ·
                <span class="text-water">Vòi phun nước</span>
              </template>
              <template v-if="activePlot.infested">
                ·
                <span class="text-danger">Sâu bệnh({{ activePlot.infestedDays }}ngày)</span>
              </template>
              <template v-if="activePlot.weedy">
                ·
                <span class="text-success">Cỏ dại ({{ activePlot.weedyDays }} ngày)</span>
              </template>
            </p>
            <!-- 生长进度条 -->
            <div v-if="activePlot.cropId && activePlot.state !== 'harvestable'" class="flex items-center space-x-2 mb-2">
              <span class="text-xs text-muted shrink-0">Sinh trưởng</span>
              <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs bg-success transition-all"
                  :style="{
                    width: Math.min(100, Math.floor((activePlot.growthDays / (Number(plotCropGrowthDays) || 1)) * 100)) + '%'
                  }"
                />
              </div>
              <span class="text-xs text-muted whitespace-nowrap">
                {{ Number(activePlot.growthDays.toFixed(2)) }}/{{ plotCropGrowthDays }}ngày
              </span>
            </div>
            <p v-if="activePlot.giantCropGroup !== null" class="text-xs text-accent mb-2">thu hoạchcó thể nhận lớnlượngcây trồng！</p>

            <!-- 操作列表 -->
            <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
              <Button
                v-if="activePlot.state === 'wasteland'"
                class="w-full justify-center shrink-0"
                :icon-size="12"
                :icon="Shovel"
                @click="doTill"
              >
                Khai khẩn
              </Button>
              <Button v-if="canWater" class="w-full justify-center shrink-0" :icon-size="12" :icon="Droplets" @click="doWater">Tưới nước</Button>
              <Button
                v-if="activePlot.infested"
                class="w-full justify-center shrink-0 !bg-danger !text-text"
                :icon-size="12"
                :icon="Bug"
                @click="doCurePest"
              >
                Trừ sâu
              </Button>
              <Button
                v-if="activePlot.weedy"
                class="w-full justify-center shrink-0 !bg-success !text-bg"
                :icon-size="12"
                :icon="Leaf"
                @click="doClearWeed"
              >
                Nhổ cỏ
              </Button>
              <Button
                v-if="activePlot.state === 'harvestable'"
                class="w-full justify-center shrink-0 !bg-accent !text-bg"
                :icon-size="12"
                :icon="Wheat"
                @click="doHarvest"
              >
                Thu hoạch
              </Button>
              <Button
                v-if="activePlot.state === 'planted' || activePlot.state === 'growing' || activePlot.state === 'harvestable'"
                class="w-full justify-center shrink-0"
                :icon-size="12"
                :icon="Trash2"
                @click="doRemoveCrop"
              >
                xẻngxóa
              </Button>
              <template v-if="activePlot.state === 'tilled' && plantableSeeds.length > 0">
                <Divider label="Gieo trồng" />
                <button
                  v-for="seed in plantableSeeds"
                  :key="seed.cropId + ':' + seed.quality"
                  class="btn text-xs justify-between mr-1 shrink-0"
                  @click="doPlant(seed.cropId, seed.quality)"
                >
                  <span :class="seed.colorClass">
                    {{ seed.name }}
                    <span
                      v-if="seed.quality !== 'normal'"
                      :class="{
                        'text-quality-fine': seed.quality === 'fine',
                        'text-quality-excellent': seed.quality === 'excellent',
                        'text-quality-supreme': seed.quality === 'supreme'
                      }"
                      class="ml-0.5"
                    >
                      [{{ QUALITY_NAMES[seed.quality] }}]
                    </span>
                    <span v-if="seed.regrowth" class="text-success ml-1">[Nhiều vụ]</span>
                  </span>
                  <span class="text-muted">×{{ seed.count }}</span>
                </button>
              </template>
              <template v-if="activePlot.state === 'tilled' && plantableBreedingSeeds.length > 0">
                <Divider label="Hạt giống lai tạo" class="!my-2" />
                <button
                  v-for="seed in plantableBreedingSeeds"
                  :key="seed.genetics.id"
                  class="btn text-xs justify-between mr-1 shrink-0"
                  @click="doPlantGeneticSeed(seed.genetics.id)"
                >
                  <span>{{ getCropName(seed.genetics.cropId) }} G{{ seed.genetics.generation }}</span>
                  <span class="text-muted flex items-center space-x-px">
                    <Star v-for="n in getStarRating(seed.genetics)" :key="n" :size="10" />
                  </span>
                </button>
              </template>
              <!-- 种子空状态 -->
              <div
                v-if="activePlot.state === 'tilled' && plantableSeeds.length === 0 && plantableBreedingSeeds.length === 0"
                class="flex flex-col items-center py-4"
              >
                <Sprout :size="32" class="text-muted/30" />
                <p class="text-xs text-muted mt-2">Túi đồtrongkhông cókhimùacó thể trồng của Hạt giống</p>
                <Button v-if="isWanwupuOpen" class="mt-2" :icon-size="12" :icon="Store" @click="goToShop">Đến cửa hàng mua</Button>
                <p v-else class="text-[10px] text-muted/60 mt-1">
                  {{ wanwupuClosedReason }}
                </p>
              </div>
              <template v-if="canFertilize && fertilizerItems.length > 0">
                <Divider label="Bón phân" />
                <button
                  v-for="f in fertilizerItems"
                  :key="f.itemId"
                  class="btn text-xs justify-between mr-1 shrink-0"
                  @click="doFertilize(f.type)"
                >
                  <span :class="f.colorClass">{{ f.name }}</span>
                  <span class="text-muted">×{{ f.count }}</span>
                </button>
              </template>
              <template v-if="!hasSprinkler(activePlot.id) && sprinklerItems.length > 0">
                <Divider label="Vòi phun nước" />
                <button
                  v-for="s in sprinklerItems"
                  :key="s.itemId"
                  class="btn text-xs justify-between mr-1 shrink-0"
                  @click="doPlaceSprinkler(s.type)"
                >
                  <span :class="s.colorClass">{{ s.name }}</span>
                  <span class="text-muted">×{{ s.count }}</span>
                </button>
              </template>
              <Button v-if="hasSprinkler(activePlot.id)" class="mr-1 justify-center shrink-0" @click="doRemoveSprinkler">tháoxóatướinướcdụng cụ</Button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 一键种植弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="showBatchPlant"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="showBatchPlant = false"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showBatchPlant = false">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">Gieo hạt hàng loạt</p>
            <p class="text-xs text-muted mb-2">lépcanh tácđất {{ tilledEmptyCount }} ô，chọn muốn trồng của Hạt giống：</p>
            <div class="flex flex-col space-y-1 max-h-40 overflow-y-auto">
              <button
                v-for="seed in plantableSeeds"
                :key="seed.cropId"
                class="btn text-xs justify-between mr-1 shrink-0"
                @click="doBatchPlant(seed.cropId)"
              >
                <span :class="seed.colorClass">
                  {{ seed.name }}
                  <span v-if="seed.regrowth" class="text-success ml-1">[Nhiều vụ]</span>
                </span>
                <span class="text-muted">×{{ seed.count }}</span>
              </button>
            </div>
            <template v-if="batchBreedingSeedGroups.length > 0">
              <Divider label="Hạt giống lai tạo" class="!my-2" />
              <div class="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                <button
                  v-for="group in batchBreedingSeedGroups"
                  :key="group.cropId"
                  class="btn text-xs justify-between mr-1 shrink-0"
                  @click="doBatchPlantBreeding(group.cropId)"
                >
                  <span>
                    {{ group.name }}
                    <span class="text-muted">G{{ group.minGen }}{{ group.minGen !== group.maxGen ? `~${group.maxGen}` : '' }}</span>
                  </span>
                  <span class="text-muted">×{{ group.count }}</span>
                </button>
              </div>
            </template>
            <div v-if="plantableSeeds.length === 0 && batchBreedingSeedGroups.length === 0" class="flex flex-col items-center py-4">
              <Sprout :size="32" class="text-muted/30" />
              <p class="text-xs text-muted mt-2">không cókhimùacó thể trồng của Hạt giống</p>
              <Button v-if="isWanwupuOpen" class="mt-2" :icon-size="12" :icon="Store" @click="goToShop">Đến cửa hàng mua</Button>
              <p v-else class="text-[10px] text-muted/60 mt-1">
                {{ wanwupuClosedReason }}
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 一键施肥弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="showBatchFertilize"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="showBatchFertilize = false"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showBatchFertilize = false">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">Bón phân hàng loạt</p>
            <p class="text-xs text-muted mb-2">có thể bónphânđấtô {{ fertilizableCount }} ô，chọn phânliệu：</p>
            <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
              <button
                v-for="f in fertilizerItems"
                :key="f.itemId"
                class="btn text-xs justify-between mr-1 shrink-0"
                @click="doBatchFertilize(f.type)"
              >
                <span :class="f.colorClass">{{ f.name }}</span>
                <span class="text-muted">×{{ f.count }}</span>
              </button>
            </div>
            <div v-if="fertilizerItems.length === 0" class="flex flex-col items-center py-4">
              <CirclePlus :size="32" class="text-muted/30" />
              <p class="text-xs text-muted mt-2">Không có phân bón có thể sử dụng</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 图例与提示 -->
      <div class="mt-2 border border-accent/10 rounded-xs p-2">
        <div class="grid grid-cols-4 md:space-x-3 md:flex md:flex-wrap text-xs text-muted">
          <span v-for="(item, i) in PLOT_LEGENDS" :key="i">
            <component :is="item.icon" :size="10" :class="[item.color, 'inline']" />
            {{ item.label }}
          </span>
        </div>
        <div v-if="plotWarnings.length > 0" class="flex flex-wrap space-x-2 mt-1.5 border border-accent/20 rounded-xs p-2">
          <span v-for="(w, i) in plotWarnings" :key="i" class="inline-flex items-center space-x-0.5 text-xs" :class="w.color">
            {{ w.text }}
          </span>
        </div>
      </div>

      <!-- 出货箱入口 -->
      <div
        class="mt-3 flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
        @click="showShippingBox = true"
      >
        <div class="flex items-center space-x-1.5">
          <Package :size="14" class="text-accent" />
          <span class="text-sm text-accent">Thùng xuất hàng</span>
          <span v-if="shopStore.shippingBox.length > 0" class="text-xs text-muted">{{ shopStore.shippingBox.length }}loại</span>
        </div>
        <span v-if="shippingBoxTotal > 0" class="text-xs text-accent">≈{{ shippingBoxTotal }}văn</span>
        <span v-else class="text-xs text-muted">Trống</span>
      </div>

      <!-- 出货箱弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="showShippingBox"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="showShippingBox = false"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showShippingBox = false">
              <X :size="14" />
            </button>
            <div class="flex items-center space-x-1.5 text-sm text-accent mb-1">
              <Package :size="14" />
              <span>Thùng xuất hàng</span>
            </div>
            <p class="text-xs text-muted mb-2">đặt vào của Vật phẩmsẽđanglầnngàykếttính。</p>
            <p v-if="inventoryStore.getRingEffectValue('sell_price_bonus') > 0" class="text-success text-xs mb-2">
              Hiệu ứng nhẫn: giá bán +{{ Math.round(inventoryStore.getRingEffectValue('sell_price_bonus') * 100) }}%
            </p>

            <!-- 已放入的物品 -->
            <div v-if="shopStore.shippingBox.length > 0" class="border border-accent/10 rounded-xs p-2 mb-2">
              <p class="text-xs text-muted mb-1">đã đặt vào</p>
              <div class="flex flex-col space-y-1 max-h-36 overflow-y-auto">
                <div
                  v-for="(entry, idx) in shopStore.shippingBox"
                  :key="idx"
                  class="flex items-center justify-between border border-accent/20 rounded-xs px-2 py-1 cursor-pointer hover:bg-accent/5"
                  @click="handleRemoveFromBox(entry.itemId, entry.quantity, entry.quality)"
                >
                  <div class="min-w-0">
                    <span
                      class="text-xs"
                      :class="{
                        'text-quality-fine': entry.quality === 'fine',
                        'text-quality-excellent': entry.quality === 'excellent',
                        'text-quality-supreme': entry.quality === 'supreme'
                      }"
                    >
                      {{ getItemName(entry.itemId) }}
                    </span>
                    <span class="text-muted text-xs ml-1">×{{ entry.quantity }}</span>
                  </div>
                  <span class="text-xs text-accent whitespace-nowrap ml-2">
                    ≈{{ shopStore.calculateSellPrice(entry.itemId, entry.quantity, entry.quality) }}văn
                  </span>
                </div>
              </div>
              <p class="text-xs text-accent mt-1.5">Thu nhập dự kiến：{{ shippingBoxTotal }}văn</p>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
              <Package :size="32" class="text-muted/30" />
              <p class="text-xs mt-2">Thùng xuất hànglàlép của </p>
            </div>

            <!-- 可放入的背包物品 -->
            <div v-if="shippableItems.length > 0" class="border border-accent/10 rounded-xs p-2">
              <p class="text-xs text-muted mb-1">Túi đồVật phẩm</p>
              <div class="flex flex-col space-y-1 overflow-auto max-h-48">
                <div
                  v-for="item in shippableItems"
                  :key="item.itemId + item.quality"
                  class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1 mr-1"
                >
                  <div class="min-w-0 flex items-center space-x-1">
                    <span
                      class="text-xs"
                      :class="{
                        'text-quality-fine': item.quality === 'fine',
                        'text-quality-excellent': item.quality === 'excellent',
                        'text-quality-supreme': item.quality === 'supreme'
                      }"
                    >
                      {{ item.def?.name }}
                    </span>
                    <span class="text-muted text-xs">×{{ item.quantity }}</span>
                    <span v-if="shopStore.shippedItems.includes(item.itemId)" class="text-[10px] text-success/60">[Đã xuất hàng]</span>
                  </div>
                  <div class="flex space-x-1">
                    <Button @click="handleAddToBox(item.itemId, 1, item.quality)">đặt vào1</Button>
                    <Button v-if="item.quantity > 1" @click="handleAddToBox(item.itemId, item.quantity, item.quality)">Tất cả</Button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center py-3 text-muted">
              <Wheat :size="32" class="text-muted/30" />
              <p class="text-xs mt-2">Trong túi không có vật phẩm để xuất hàng</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 温室入口 -->
      <div
        v-if="showGreenhouse"
        class="mt-3 flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
        @click="showGreenhouseModal = true"
      >
        <div class="flex items-center space-x-1.5">
          <Warehouse :size="14" class="text-accent" />
          <span class="text-sm text-accent">Nhà kính</span>
          <span v-if="ghHarvestableCount > 0" class="text-xs text-accent">{{ ghHarvestableCount }}ôcó thể thu hoạch</span>
        </div>
        <span class="text-xs text-muted">{{ farmStore.greenhousePlots.length }}ôđất</span>
      </div>
    </div>

    <!-- 林木标签 -->
    <div v-if="farmTab === 'tree'">
      <!-- 果树区 -->
      <div class="border border-accent/20 rounded-xs p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-1.5 text-sm text-accent">
            <TreeDeciduous :size="14" />
            <span>quảcây</span>
          </div>
          <span class="text-xs text-muted">{{ farmStore.fruitTrees.length }}/{{ MAX_FRUIT_TREES }}</span>
        </div>
        <div v-if="farmStore.fruitTrees.length > 0" class="flex flex-col space-y-1.5 mb-2">
          <div v-for="(tree, treeIdx) in farmStore.fruitTrees" :key="tree.id" class="border border-accent/10 rounded-xs px-3 py-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold" :class="tree.mature ? 'text-accent' : 'text-muted'">{{ getTreeName(tree.type) }}</span>
              <div class="flex items-center space-x-1.5">
                <span v-if="tree.mature" class="text-[10px] text-muted">{{ tree.yearAge }}năm</span>
                <!-- 自己调整果园的排布顺序 -->
                <button
                  class="text-muted hover:text-accent disabled:opacity-30"
                  title="Di chuyển lên"
                  :disabled="treeIdx === 0"
                  @click.stop="farmStore.moveFruitTree(tree.id, -1)"
                >
                  <ChevronUp :size="12" />
                </button>
                <button
                  class="text-muted hover:text-accent disabled:opacity-30"
                  title="Di chuyển xuống"
                  :disabled="treeIdx === farmStore.fruitTrees.length - 1"
                  @click.stop="farmStore.moveFruitTree(tree.id, 1)"
                >
                  <ChevronDown :size="12" />
                </button>
              </div>
            </div>
            <template v-if="!tree.mature">
              <div class="flex items-center space-x-2 mb-1.5">
                <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs bg-success transition-all"
                    :style="{
                      width: Math.min(100, Math.floor((tree.growthDays / 28) * 100)) + '%'
                    }"
                  />
                </div>
                <span class="text-[10px] text-muted whitespace-nowrap">{{ tree.growthDays }}/28ngày</span>
              </div>
              <div class="flex justify-end">
                <Button :icon-size="12" :icon="Axe" @click.stop="chopFruitTreeTarget = { id: tree.id, type: tree.type }">Đốn cây</Button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between">
                <span v-if="tree.todayFruit" class="text-[10px] text-accent">hôm nayngàyđã kếtquả</span>
                <span v-else class="text-[10px] text-success">{{ getTreeFruitSeason(tree.type) }}sảnquả</span>
                <Button :icon-size="12" :icon="Axe" @click.stop="chopFruitTreeTarget = { id: tree.id, type: tree.type }">Đốn cây</Button>
              </div>
            </template>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
          <TreeDeciduous :size="32" class="text-muted/30" />
          <p class="text-xs mt-2">tạmkhông quảcây</p>
          <p class="text-[10px] text-muted/60 mt-0.5">có thể đangcửa hàngMuacâycây giốngtrồng</p>
        </div>
        <div v-if="plantableSaplings.length > 0 && farmStore.fruitTrees.length < MAX_FRUIT_TREES" class="flex space-x-1.5 flex-wrap">
          <Button v-for="s in plantableSaplings" :key="s.saplingId" :icon-size="12" :icon="TreePine" @click="handlePlantTree(s.type)">
            giống{{ s.name }} (×{{ s.count }})
          </Button>
        </div>
      </div>

      <!-- 砍伐果树确认弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="chopFruitTreeTarget"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="chopFruitTreeTarget = null"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="chopFruitTreeTarget = null">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">Đốn câyquảcây</p>
            <p class="text-xs text-text mb-3">
              xácđịnhmuốnđốnrơi
              <span class="text-accent">{{ getTreeName(chopFruitTreeTarget.type) }}</span>
              Bạn chắc chắn muốn chặt? Sau khi chặt sẽ không thể hoàn tác.
            </p>
            <div class="flex space-x-2">
              <Button class="flex-1" @click="chopFruitTreeTarget = null">Hủy</Button>
              <Button class="flex-1 !bg-danger !text-text" :icon-size="12" :icon="Axe" @click="confirmChopFruitTree">xác nhận Đốn cây</Button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 野树伐木确认弹窗 -->
      <Transition name="panel-fade">
        <div
          v-if="chopWildTreeTarget"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          @click.self="chopWildTreeTarget = null"
        >
          <div class="game-panel max-w-xs w-full relative">
            <button class="absolute top-2 right-2 text-muted hover:text-text" @click="chopWildTreeTarget = null">
              <X :size="14" />
            </button>
            <p class="text-accent text-sm mb-2">Đốn gỗ</p>
            <p class="text-xs text-text mb-2">
              xácđịnhmuốnđúng
              <span class="text-accent">{{ getWildTreeName(chopWildTreeTarget.type) }}</span>
              đốngỗsao？
            </p>
            <p class="text-xs text-danger mb-3">
              đãđốngỗ {{ chopWildTreeTarget.chopCount }}/3 lần，lạiđốn {{ 3 - chopWildTreeTarget.chopCount }} lầnsaucâysẽtiêumất。
            </p>
            <div class="flex space-x-2">
              <Button class="flex-1" @click="chopWildTreeTarget = null">Hủy</Button>
              <Button
                class="flex-1"
                :class="chopWildTreeTarget.chopCount >= 2 ? '!bg-danger !text-text' : '!bg-accent !text-bg'"
                :icon-size="12"
                :icon="Axe"
                @click="confirmChopWildTree"
              >
                {{ chopWildTreeTarget.chopCount >= 2 ? 'Xác nhận' : 'Xác nhận chặt cây' }}
              </Button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 野树区 -->
      <div class="mt-3 border border-accent/20 rounded-xs p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-1.5 text-sm text-accent">
            <TreePine :size="14" />
            <span>Cây hoang</span>
          </div>
          <span class="text-xs text-muted">{{ farmStore.wildTrees.length }}/{{ MAX_WILD_TREES }}</span>
        </div>
        <div v-if="farmStore.wildTrees.length > 0" class="flex flex-col space-y-1.5 mb-2">
          <div v-for="tree in farmStore.wildTrees" :key="tree.id" class="border border-accent/10 rounded-xs px-3 py-2">
            <!-- thứ一行：树名 + 状态标签 -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-bold" :class="tree.mature ? 'text-accent' : 'text-muted'">{{ getWildTreeName(tree.type) }}</span>
                <span v-if="tree.chopCount > 0" class="text-[10px] text-danger">đốn{{ tree.chopCount }}/3</span>
              </div>
              <span v-if="!tree.mature" class="text-[10px] text-muted">Sinh trưởngtrong</span>
              <span v-else-if="tree.hasTapper && tree.tapReady" class="text-[10px] text-accent">có thể thu</span>
              <span v-else-if="tree.hasTapper" class="text-[10px] text-muted">Đang lấy nhựa</span>
              <span v-else class="text-[10px] text-success">Đã chín</span>
            </div>
            <!-- thứ二行：进度/详情 + 操作按钮 -->
            <template v-if="!tree.mature">
              <div class="flex items-center space-x-2 mb-1.5">
                <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs bg-success transition-all"
                    :style="{
                      width: Math.min(100, Math.floor((tree.growthDays / (getWildTreeDef(tree.type)?.growthDays ?? 28)) * 100)) + '%'
                    }"
                  />
                </div>
                <span class="text-[10px] text-muted whitespace-nowrap">
                  {{ tree.growthDays }}/{{ getWildTreeDef(tree.type)?.growthDays ?? '?' }}ngày
                </span>
              </div>
            </template>
            <template v-else-if="tree.hasTapper">
              <div class="flex items-center space-x-2 mb-1.5">
                <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs transition-all"
                    :class="tree.tapReady ? 'bg-accent' : 'bg-success'"
                    :style="{
                      width: tree.tapReady
                        ? '100%'
                        : Math.floor((tree.tapDaysElapsed / (getWildTreeDef(tree.type)?.tapCycleDays ?? 7)) * 100) + '%'
                    }"
                  />
                </div>
                <span class="text-[10px] text-muted whitespace-nowrap">
                  {{ tree.tapReady ? 'Đã hoàn thành' : `${tree.tapDaysElapsed}/${getWildTreeDef(tree.type)?.tapCycleDays ?? '?'}ngày` }}
                </span>
              </div>
            </template>
            <div class="flex items-center justify-end space-x-1.5">
              <Button
                v-if="tree.mature && tree.hasTapper && tree.tapReady"
                class="!bg-accent !text-bg"
                :icon-size="12"
                :icon="Gift"
                @click.stop="handleCollectTapProduct(tree.id)"
              >
                Thu thập
              </Button>
              <Button
                v-if="tree.mature && !tree.hasTapper && hasTapper"
                :icon-size="12"
                :icon="Wrench"
                @click.stop="handleAttachTapper(tree.id)"
              >
                trang bịthu háinhựadụng cụ
              </Button>
              <span v-if="tree.mature && !tree.hasTapper && !hasTapper" class="text-[10px] text-muted">cần Chế tạothu háinhựadụng cụ</span>
              <Button v-if="tree.mature" :icon-size="12" :icon="Axe" @click.stop="handleChopTree(tree.id)">Đốn gỗ</Button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-4 text-muted mb-2">
          <TreePine :size="32" class="text-muted/30" />
          <p class="text-xs mt-2">tạmkhông Cây hoang</p>
          <p class="text-[10px] text-muted/60 mt-0.5">có thể Sử dụngCây hoangHạt giốngtrồng</p>
        </div>
        <div v-if="plantableWildSeeds.length > 0 && farmStore.wildTrees.length < MAX_WILD_TREES" class="flex space-x-1.5 flex-wrap">
          <Button v-for="s in plantableWildSeeds" :key="s.type" :icon-size="12" :icon="TreePine" @click="handlePlantWildTree(s.type)">
            giống{{ s.name }} (×{{ s.count }})
          </Button>
        </div>
      </div>
    </div>

    <!-- 温室弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showGreenhouseModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showGreenhouseModal = false"
      >
        <div class="game-panel max-w-sm w-full relative max-h-[85vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showGreenhouseModal = false">
            <X :size="14" />
          </button>
          <div class="flex items-center space-x-1.5 text-sm text-accent mb-1">
            <Warehouse :size="14" />
            <span>Nhà kính</span>
          </div>
          <p class="text-xs text-muted mb-3">không mùalễgiới hạnchế · tự độngtưới nước · {{ farmStore.greenhousePlots.length }}ôđất</p>

          <!-- 操作按钮 -->
          <div class="flex space-x-2 mb-3">
            <Button
              class="flex-1 justify-center"
              :class="{ '!bg-accent !text-bg': ghHarvestableCount > 0 }"
              :disabled="ghHarvestableCount === 0"
              :icon-size="12"
              :icon="Wheat"
              @click="doGhBatchHarvest"
            >
              mộtphímthunhận{{ ghHarvestableCount > 0 ? ` (${ghHarvestableCount} ô)` : '' }}
            </Button>
            <Button
              class="flex-1 justify-center"
              :disabled="ghTilledEmptyCount === 0 || allSeeds.length === 0"
              :icon-size="12"
              :icon="Sprout"
              @click="showGhBatchPlant = true"
            >
              mộtphímgiốngtrồng{{ ghTilledEmptyCount > 0 ? ` (${ghTilledEmptyCount} ô)` : '' }}
            </Button>
            <Button v-if="nextGhUpgrade" class="flex-1 justify-center" :icon-size="12" :icon="ArrowUp" @click="showGhUpgradeModal = true">
              tăngcấpấmphòng
            </Button>
          </div>

          <!-- 温室地块网格 -->
          <div
            class="grid gap-1 max-w-full"
            :style="{
              gridTemplateColumns: `repeat(${ghGridCols}, minmax(0, 1fr))`
            }"
          >
            <button
              v-for="plot in farmStore.greenhousePlots"
              :key="plot.id"
              class="aspect-square border border-accent/20 rounded-xs flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-accent/60 hover:bg-panel/80 leading-tight"
              :class="getPlotDisplay(plot).color"
              :title="getPlotTooltip(plot)"
              @click="activeGhPlotId = plot.id"
            >
              <component :is="getPlotDisplay(plot).icon" :size="14" />
              <span v-if="plot.cropId" class="text-[10px] opacity-70 truncate max-w-full px-0.5">{{ getCropName(plot.cropId) }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 温室升级确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showGhUpgradeModal && nextGhUpgrade"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showGhUpgradeModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showGhUpgradeModal = false">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-2">{{ nextGhUpgrade.name }}</p>
          <p class="text-xs text-muted mb-3">{{ nextGhUpgrade.description }}</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-3">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-muted">Chi phí</span>
              <span :class="playerStore.money >= nextGhUpgrade.cost ? 'text-success' : 'text-danger'">{{ nextGhUpgrade.cost }}văn</span>
            </div>
            <div v-for="mat in nextGhUpgrade.materialCost" :key="mat.itemId" class="flex items-center justify-between text-xs">
              <span class="text-muted">{{ getItemName(mat.itemId) }}</span>
              <span :class="inventoryStore.getItemCount(mat.itemId) >= mat.quantity ? 'text-success' : 'text-danger'">
                {{ inventoryStore.getItemCount(mat.itemId) }}/{{ mat.quantity }}
              </span>
            </div>
          </div>

          <div class="flex space-x-2">
            <Button class="flex-1" @click="showGhUpgradeModal = false">Hủy</Button>
            <Button class="flex-1 !bg-accent !text-bg" :icon-size="12" :icon="ArrowUp" @click="handleGhUpgrade">xác nhận Nâng cấp</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 温室一键种植弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showGhBatchPlant"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showGhBatchPlant = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showGhBatchPlant = false">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-2">Nhà kínhmộtphímtrồng</p>
          <p class="text-xs text-muted mb-2">lépcanh tácđất {{ ghTilledEmptyCount }} ô，chọn muốn trồng của Hạt giống：</p>
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <button
              v-for="seed in allSeeds"
              :key="seed.cropId"
              class="btn text-xs justify-between mr-1 shrink-0"
              @click="doGhBatchPlant(seed.cropId)"
            >
              <span>
                {{ seed.name }}
                <span v-if="seed.regrowth" class="text-success ml-1">[Nhiều vụ]</span>
              </span>
              <span class="text-muted">×{{ seed.count }}</span>
            </button>
          </div>
          <div v-if="allSeeds.length === 0" class="flex flex-col items-center py-4">
            <Sprout :size="32" class="text-muted/30" />
            <p class="text-xs text-muted mt-2">không cócó thể trồng của Hạt giống</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 温室地块操作弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="activeGhPlot"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="activeGhPlotId = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="activeGhPlotId = null">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-2">Nhà kínhđấtô #{{ activeGhPlot.id + 1 }}</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex flex-col space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Trạng thái</span>
                <span class="text-xs">{{ ghPlotStateLabel }}</span>
              </div>
              <div v-if="activeGhPlot.cropId" class="flex items-center justify-between">
                <span class="text-xs text-muted">Nông sản</span>
                <span class="text-xs">
                  {{ getCropName(activeGhPlot.cropId) }}
                  <span v-if="ghPlotCropRegrowth" class="text-success ml-1">
                    [nhiềuvụ {{ activeGhPlot.harvestCount }}/{{ ghPlotCropMaxHarvests }}]
                  </span>
                </span>
              </div>
              <div v-if="activeGhPlot.cropId && activeGhPlot.state !== 'harvestable'" class="flex items-center space-x-2">
                <span class="text-xs text-muted shrink-0">Sinh trưởng</span>
                <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs bg-success transition-all"
                    :style="{
                      width: Math.min(100, Math.floor((activeGhPlot.growthDays / (Number(ghPlotCropGrowthDays) || 1)) * 100)) + '%'
                    }"
                  />
                </div>
                <span class="text-xs text-muted whitespace-nowrap">{{ activeGhPlot.growthDays }}/{{ ghPlotCropGrowthDays }}ngày</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">đặctính</span>
                <span class="text-xs text-water">Tưới tự động · Không giới hạn mùa</span>
              </div>
              <div v-if="activeGhPlot.seedGenetics" class="flex items-center justify-between">
                <span class="text-xs text-muted">Nhân giống</span>
                <span class="text-xs text-accent">
                  G{{ activeGhPlot.seedGenetics.generation }} ngọt{{ activeGhPlot.seedGenetics.sweetness }} sản{{
                    activeGhPlot.seedGenetics.yield
                  }}
                  kháng{{ activeGhPlot.seedGenetics.resistance }}
                </span>
              </div>
            </div>
          </div>

          <!-- 操作区：与农田地块弹窗同款可滚动列表，种子多了也翻得动 -->
          <div class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            <!-- 可收获 → 收获 -->
            <Button
              v-if="activeGhPlot.state === 'harvestable'"
              class="w-full justify-center shrink-0 !bg-accent !text-bg"
              :icon-size="12"
              :icon="Wheat"
              @click="doGhHarvest"
            >
              Thu hoạch
            </Button>
            <!-- 已耕 → 种植（温室不限季节，所有种子都能种） -->
            <template v-if="activeGhPlot.state === 'tilled' && allSeeds.length > 0">
              <Divider label="Gieo trồng" />
              <button
                v-for="seed in allSeeds"
                :key="seed.cropId"
                class="btn text-xs justify-between mr-1 shrink-0"
                @click="doGhPlant(seed.cropId)"
              >
                <span>
                  {{ seed.name }}
                  <span v-if="seed.regrowth" class="text-success ml-1">[Nhiều vụ]</span>
                </span>
                <span class="text-muted">×{{ seed.count }}</span>
              </button>
            </template>
            <!-- 已耕 → 育种种子种植 -->
            <template v-if="activeGhPlot.state === 'tilled' && ghPlantableBreedingSeeds.length > 0">
              <Divider label="Hạt giống lai tạo" class="!my-2" />
              <button
                v-for="seed in ghPlantableBreedingSeeds"
                :key="seed.genetics.id"
                class="btn text-xs justify-between mr-1 shrink-0"
                @click="doGhPlantGeneticSeed(seed.genetics.id)"
              >
                <span>{{ getCropName(seed.genetics.cropId) }} G{{ seed.genetics.generation }}</span>
                <span class="text-muted flex items-center space-x-px">
                  <Star v-for="n in getStarRating(seed.genetics)" :key="n" :size="10" />
                </span>
              </button>
            </template>
            <!-- 已耕无种子空状态 -->
            <div
              v-if="activeGhPlot.state === 'tilled' && allSeeds.length === 0 && ghPlantableBreedingSeeds.length === 0"
              class="flex flex-col items-center py-4"
            >
              <Sprout :size="32" class="text-muted/30" />
              <p class="text-xs text-muted mt-2">Trong túi không có hạt giống</p>
              <Button v-if="isWanwupuOpen" class="mt-2" :icon-size="12" :icon="Store" @click="goToShop">Đến cửa hàng mua</Button>
              <p v-else class="text-[10px] text-muted/60 mt-1">
                {{ wanwupuClosedReason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import VillagerPresence from '@/components/game/VillagerPresence.vue'
  import { ref, computed, type Component } from 'vue'
  import {
    Droplets,
    Droplet,
    TreePine,
    TreeDeciduous,
    ArrowUp,
    Wrench,
    Gift,
    CirclePlus,
    X,
    Shovel,
    Wheat,
    Sprout,
    Package,
    Warehouse,
    Store,
    Axe,
    Trash2,
    Bug,
    Leaf,
    Star,
    Bird,
    Zap,
    Square,
    Flower2,
    ChevronUp,
    ChevronDown
  } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import { useBreedingStore } from '@/stores/useBreedingStore'
  import { useCookingStore } from '@/stores/useCookingStore'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useHomeStore } from '@/stores/useHomeStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useShopStore } from '@/stores/useShopStore'
  import { useSkillStore } from '@/stores/useSkillStore'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { useWalletStore } from '@/stores/useWalletStore'
  import { getCropById, getCropsBySeason, getItemById } from '@/data'
  import { getStarRating, shouldReturnBreedingSeed, generateGeneticsId } from '@/data/breeding'
  import { FRUIT_TREE_DEFS, MAX_FRUIT_TREES } from '@/data/fruitTrees'
  import { GREENHOUSE_UPGRADES } from '@/data/buildings'
  import { WILD_TREE_DEFS, MAX_WILD_TREES, getWildTreeDef } from '@/data/wildTrees'
  import { CROPS } from '@/data/crops'
  import { FERTILIZERS, getFertilizerById } from '@/data/processing'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import { addLog, showFloat } from '@/composables/useGameLog'
  import { navigateToPanel } from '@/composables/useNavigation'
  import { handleEndDay } from '@/composables/useEndDay'
  import { getShopById, isShopAvailable, getShopClosedReason } from '@/data/shops'
  import {
    handlePlotClick,
    useFarmActions,
    handleBatchWater,
    handleBatchTill,
    handleBatchHarvest,
    handleBatchPlant,
    handleBatchFertilize,
    handleRemoveCrop,
    handleCurePest,
    handleBatchCurePest,
    handleClearWeed,
    handleBatchClearWeed,
    QUALITY_NAMES,
    applyCropBlessing
  } from '@/composables/useFarmActions'
  import type { SprinklerType, FertilizerType, FruitTreeType, WildTreeType, Quality } from '@/types'
  import type { SeedGenetics } from '@/types/breeding'
  import { sfxHarvest, sfxPlant } from '@/composables/useAudio'

  const { selectedSeed } = useFarmActions()

  const farmTab = ref<'field' | 'tree'>('field')

  const farmStore = useFarmStore()
  const inventoryStore = useInventoryStore()
  const gameStore = useGameStore()
  const homeStore = useHomeStore()
  const playerStore = usePlayerStore()
  const shopStore = useShopStore()
  const breedingStore = useBreedingStore()

  // === ruộngtrangđặcđặc biệtcôngnăng ===

  const tutorialStore = useTutorialStore()
  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    if (farmStore.plots.every(p => p.state === 'wasteland')) return 'Nhấn 「Thao tác một chạm」→「Khai hoang một chạm」 bên dưới để khai hoang, hoặc bấm từng ô đất để thao tác.'
    const hasPlanted = farmStore.plots.some(p => p.state === 'planted' || p.state === 'growing' || p.state === 'harvestable')
    if (!hasPlanted && farmStore.plots.some(p => p.state === 'tilled'))
      return 'Đất đã khai hoang có thể trồng cây. Dùng 「Trồng một chạm」 để gieo hàng loạt hạt giống trong túi.'
    if (farmStore.plots.some(p => (p.state === 'planted' || p.state === 'growing') && !p.watered) && !gameStore.isRainy)
      return 'Cây trồng cần được tưới mỗi ngày để sinh trưởng. 「Tưới một chạm」 có thể tưới toàn bộ cây cùng lúc.'
    if (farmStore.plots.some(p => p.state === 'harvestable')) return 'Ô đất được tô vàng nghĩa là cây đã chín, nhấn 「Thu hoạch một chạm」 để thu hoạch hàng loạt.'
    return null
  })

  const surfaceOreName = computed(() => {
    const patch = gameStore.surfaceOrePatch
    if (!patch) return ''
    return getItemById(patch.oreId)?.name ?? 'Quặng'
  })

  const handleCollectCreekCatch = () => {
    const catches = gameStore.creekCatch
    if (catches.length === 0) return
    const names: string[] = []
    const failed: typeof catches = []
    for (const c of catches) {
      const added = inventoryStore.addItem(c.fishId, 1, c.quality)
      if (added) {
        const fishDef = getItemById(c.fishId)
        if (fishDef) names.push(fishDef.name)
      } else {
        failed.push(c)
      }
    }
    gameStore.creekCatch = failed
    if (names.length > 0) {
      addLog(`Đã thu cá từ suối: ${names.join(', ')}.`)
    }
    if (failed.length > 0) {
      addLog('Túi đã đầy, một phần cá không thể thu.')
    }
  }

  const handleMineSurfaceOre = () => {
    const patch = gameStore.surfaceOrePatch
    if (!patch) return
    if (!playerStore.consumeStamina(5)) {
      addLog('Không đủ thể lực để khai thác.')
      return
    }
    const added = inventoryStore.addItem(patch.oreId, patch.quantity)
    if (!added) {
      playerStore.restoreStamina(5)
      addLog('Túi đã đầy, không thể khai thác.')
      return
    }
    const oreName = getItemById(patch.oreId)?.name ?? 'Quặng'
    const skillStore = useSkillStore()
    skillStore.addExp('mining', 8)
    gameStore.surfaceOrePatch = null
    addLog(`Khai thác mạch quặng trên mặt đất, nhận ${patch.quantity} ${oreName}. (+8 kinh nghiệm khai mỏ)`)
    const tr = gameStore.advanceTime(1)
    if (tr.message) addLog(tr.message)
    if (tr.passedOut) handleEndDay()
  }

  // === rahàngrương ===

  const showShippingBox = ref(false)
  const showBatchPlant = ref(false)
  const showBatchFertilize = ref(false)
  const showBatchActions = ref(false)
  const showGreenhouseModal = ref(false)
  const showGhUpgradeModal = ref(false)
  const showGhBatchPlant = ref(false)
  const chopFruitTreeTarget = ref<{ id: number; type: string } | null>(null)
  const chopWildTreeTarget = ref<{
    id: number
    type: string
    chopCount: number
  } | null>(null)

  const goToShop = () => {
    if (!isWanwupuOpen.value) {
      showFloat(wanwupuClosedReason.value, 'danger')
      return
    }
    activePlotId.value = null
    activeGhPlotId.value = null
    showBatchPlant.value = false
    showBatchFertilize.value = false
    showBatchActions.value = false
    showGreenhouseModal.value = false
    navigateToPanel('shop')
  }

  const wanwupu = getShopById('wanwupu')!

  const isWanwupuOpen = computed(() => {
    return isShopAvailable(wanwupu, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  })

  const wanwupuClosedReason = computed(() => {
    return 'Tiệm Vạn Vật' + getShopClosedReason(wanwupu, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  })

  const getItemName = (itemId: string): string => getItemById(itemId)?.name ?? itemId

  const shippableItems = computed(() => {
    return inventoryStore.items
      .map(inv => ({ ...inv, def: getItemById(inv.itemId) }))
      .filter(
        item =>
          item.def &&
          !item.def.protected &&
          item.def.category !== 'seed' &&
          item.def.category !== 'machine' &&
          item.def.category !== 'sprinkler'
      )
  })

  const shippingBoxTotal = computed(() => {
    return shopStore.shippingBox.reduce((sum, entry) => sum + shopStore.calculateSellPrice(entry.itemId, entry.quantity, entry.quality), 0)
  })

  const handleAddToBox = (itemId: string, quantity: number, quality: Quality) => {
    if (shopStore.addToShippingBox(itemId, quantity, quality)) {
      const name = getItemName(itemId)
      addLog(`Đã đặt ${name}×${quantity} vào thùng hàng.`)
    }
  }

  const handleRemoveFromBox = (itemId: string, quantity: number, quality: Quality) => {
    if (shopStore.removeFromShippingBox(itemId, quantity, quality)) {
      const name = getItemName(itemId)
      addLog(`Đã lấy ${name}×${quantity} khỏi thùng hàng.`)
    }
  }

  // === đấtôđạncửa sổtrạng tháitrạng thái ===

  const activePlotId = ref<number | null>(null)
  const activePlot = computed(() => (activePlotId.value !== null ? (farmStore.plots.find(p => p.id === activePlotId.value) ?? null) : null))

  const activeGhPlotId = ref<number | null>(null)
  const activeGhPlot = computed(() => (activeGhPlotId.value !== null ? (farmStore.greenhousePlots[activeGhPlotId.value] ?? null) : null))

  // === đạncửa sổhiểnhiển thịhỗ trợgiúp ===

  const STATE_LABELS: Record<string, string> = {
    wasteland: 'Đất hoang',
    tilled: 'Đã cày',
    planted: 'Đã gieo',
    growing: 'Đang sinh trưởng',
    harvestable: 'Có thể thu hoạch'
  }

  const plotStateLabel = computed(() => (activePlot.value ? (STATE_LABELS[activePlot.value.state] ?? '?') : ''))
  const ghPlotStateLabel = computed(() => (activeGhPlot.value ? (STATE_LABELS[activeGhPlot.value.state] ?? '?') : ''))

  const plotCropGrowthDays = computed(() => {
    if (!activePlot.value?.cropId) return '?'
    const baseDays = getCropById(activePlot.value.cropId)?.growthDays
    if (!baseDays) return '?'
    const fertDef = activePlot.value.fertilizer ? getFertilizerById(activePlot.value.fertilizer) : null
    const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
    return speedup > 0 ? Math.max(1, Math.floor(baseDays * (1 - speedup))) : baseDays
  })

  const plotCropRegrowth = computed(() => {
    if (!activePlot.value?.cropId) return false
    return getCropById(activePlot.value.cropId)?.regrowth ?? false
  })

  const plotCropMaxHarvests = computed(() => {
    if (!activePlot.value?.cropId) return 0
    return getCropById(activePlot.value.cropId)?.maxHarvests ?? 0
  })

  const ghPlotCropGrowthDays = computed(() => {
    if (!activeGhPlot.value?.cropId) return '?'
    const baseDays = getCropById(activeGhPlot.value.cropId)?.growthDays
    if (!baseDays) return '?'
    const fertDef = activeGhPlot.value.fertilizer ? getFertilizerById(activeGhPlot.value.fertilizer) : null
    const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
    return speedup > 0 ? Math.max(1, Math.floor(baseDays * (1 - speedup))) : baseDays
  })

  const ghPlotCropRegrowth = computed(() => {
    if (!activeGhPlot.value?.cropId) return false
    return getCropById(activeGhPlot.value.cropId)?.regrowth ?? false
  })

  const ghPlotCropMaxHarvests = computed(() => {
    if (!activeGhPlot.value?.cropId) return 0
    return getCropById(activeGhPlot.value.cropId)?.maxHarvests ?? 0
  })

  const plotFertName = computed(() => {
    if (!activePlot.value?.fertilizer) return ''
    return getFertilizerById(activePlot.value.fertilizer)?.name ?? activePlot.value.fertilizer
  })

  const canWater = computed(() => {
    if (!activePlot.value) return false
    return (activePlot.value.state === 'planted' || activePlot.value.state === 'growing') && !activePlot.value.watered
  })

  const canFertilize = computed(() => {
    if (!activePlot.value) return false
    return activePlot.value.state !== 'wasteland' && !activePlot.value.fertilizer
  })

  // === lưnggóivậtphẩmdanh sáchbảng ===

  const sprinklerItems = computed(() => {
    const types: {
      type: SprinklerType
      itemId: string
      name: string
      colorClass: string
    }[] = [
      {
        type: 'bamboo_sprinkler',
        itemId: 'bamboo_sprinkler',
        name: 'Vòi Phun Nước Ống Tre',
        colorClass: ''
      },
      {
        type: 'copper_sprinkler',
        itemId: 'copper_sprinkler',
        name: 'Vòi Phun Nước Ống Đồng',
        colorClass: 'text-quality-fine'
      },
      {
        type: 'gold_sprinkler',
        itemId: 'gold_sprinkler',
        name: 'Vòi Phun Nước Ống Vàng',
        colorClass: 'text-quality-supreme'
      }
    ]
    return types.map(s => ({ ...s, count: inventoryStore.getItemCount(s.itemId) })).filter(s => s.count > 0)
  })

  const fertilizerItems = computed(() => {
    return FERTILIZERS.map(f => ({
      type: f.id as FertilizerType,
      itemId: f.id,
      name: f.name,
      count: inventoryStore.getItemCount(f.id),
      colorClass: itemValueColor(f.shopPrice ?? 0)
    })).filter(f => f.count > 0)
  })

  const QUALITY_ORDER: Quality[] = ['normal', 'fine', 'excellent', 'supreme']

  const plantableSeeds = computed(() => {
    const result: {
      cropId: string
      seedId: string
      name: string
      quality: Quality
      count: number
      colorClass: string
      regrowth: boolean
      regrowthDays?: number
    }[] = []
    for (const crop of getCropsBySeason(gameStore.season)) {
      for (const q of QUALITY_ORDER) {
        const count = inventoryStore.getItemCount(crop.seedId, q)
        if (count > 0) {
          result.push({
            cropId: crop.id,
            seedId: crop.seedId,
            name: crop.name,
            quality: q,
            count,
            colorClass: cropValueColor(crop.sellPrice),
            regrowth: crop.regrowth ?? false,
            regrowthDays: crop.regrowthDays
          })
        }
      }
    }
    return result
  })

  /** khimùa可giống的nuôigiốnggiốngcon */
  const plantableBreedingSeeds = computed(() => {
    const season = gameStore.season
    return breedingStore.breedingBox.filter(seed => {
      const crop = getCropById(seed.genetics.cropId)
      if (!crop) return false
      return crop.season.includes(season)
    })
  })

  /** căntheolàmvậtbángiátrả lạivềphẩmchấtmàu sắcmàu */
  const cropValueColor = (sellPrice: number): string => {
    if (sellPrice >= 180) return 'text-quality-supreme'
    if (sellPrice >= 100) return 'text-quality-excellent'
    if (sellPrice >= 60) return 'text-quality-fine'
    return ''
  }

  /** căntheođạocông cụgiáôtrả lạivềphẩmchấtmàu sắcmàu */
  const itemValueColor = (price: number): string => {
    if (price >= 100) return 'text-quality-supreme'
    if (price >= 75) return 'text-quality-excellent'
    if (price >= 40) return 'text-quality-fine'
    return ''
  }

  // === đấtôhiểnhiển thị ===

  const getCropName = (cropId: string): string => {
    const crop = getCropById(cropId)
    return crop?.name ?? cropId
  }

  const hasSprinkler = (plotId: number): boolean => {
    return farmStore.sprinklers.some(s => s.plotId === plotId)
  }

  /** tướinướcdụng cụphủnắpphạm vivùng（bao gồmđặtđặttướinướcdụng cụ的đấtôtựthân） */
  const sprinklerCoverage = computed(() => farmStore.getAllWateredBySprinklers())

  const isSprinklerCovered = (plotId: number): boolean => sprinklerCoverage.value.has(plotId)

  const needsWater = (plot: (typeof farmStore.plots)[number]): boolean => {
    return (plot.state === 'planted' || plot.state === 'growing') && !plot.watered && !sprinklerCoverage.value.has(plot.id)
  }

  const unwateredCount = computed(() => farmStore.plots.filter(needsWater).length)
  const wastelandCount = computed(() => farmStore.plots.filter(p => p.state === 'wasteland').length)
  const harvestableCount = computed(() => farmStore.plots.filter(p => p.state === 'harvestable').length)
  const tilledEmptyCount = computed(() => farmStore.plots.filter(p => p.state === 'tilled').length)
  const fertilizableCount = computed(() => farmStore.plots.filter(p => p.state !== 'wasteland' && !p.fertilizer).length)
  const infestedCount = computed(() => farmStore.plots.filter(p => p.infested).length)
  const weedyCount = computed(() => farmStore.plots.filter(p => p.weedy).length)

  const PLOT_LEGENDS: { icon: Component; color: string; label: string }[] = [
    { icon: Shovel, color: 'text-muted', label: 'Đất hoang' },
    { icon: Square, color: 'text-earth', label: 'Đã cày' },
    { icon: Sprout, color: 'text-success/60', label: 'Đã gieo' },
    { icon: Flower2, color: 'text-success', label: 'Đang sinh trưởng' },
    { icon: Droplets, color: 'text-water', label: 'Đã tưới nước' },
    { icon: Wheat, color: 'text-accent', label: 'Có thể thu hoạch' },
    { icon: Star, color: 'text-accent', label: 'Khổng lồ' },
    { icon: Droplet, color: 'text-water', label: 'Vòi phun nước' },
    { icon: CirclePlus, color: 'text-success', label: 'Phân bón' },
    { icon: Droplets, color: 'text-danger', label: 'Cần tưới nước' },
    { icon: Bug, color: 'text-danger', label: 'Sâu bệnh' },
    { icon: Leaf, color: 'text-success', label: 'Cỏ dại' }
  ]

  const plotWarnings = computed(() => {
    const list: { color: string; text: string }[] = []
    if (unwateredCount.value > 0)
      list.push({
        color: 'text-danger',
        text: `Còn ${unwateredCount.value} ô cần tưới`
      })
    if (infestedCount.value > 0) list.push({ color: 'text-danger', text: `Có ${infestedCount.value} ô bị sâu bệnh` })
    if (weedyCount.value > 0) list.push({ color: 'text-success', text: `Có ${weedyCount.value} ô có cỏ dại` })
    return list
  })

  const doBatchAction = (action: 'water' | 'till' | 'harvest' | 'plant' | 'fertilize' | 'curePest' | 'clearWeed') => {
    showBatchActions.value = false
    if (action === 'water') handleBatchWater()
    else if (action === 'till') handleBatchTill()
    else if (action === 'harvest') handleBatchHarvest()
    else if (action === 'plant') showBatchPlant.value = true
    else if (action === 'fertilize') showBatchFertilize.value = true
    else if (action === 'curePest') handleBatchCurePest()
    else if (action === 'clearWeed') handleBatchClearWeed()
  }
  /** nhấncropIdđiểmnhóm的khimùanuôigiốnggiốngcon（dùngtạimộtphímgiốngtrồngđạncửa sổ） */
  const batchBreedingSeedGroups = computed(() => {
    const groups: Record<
      string,
      {
        cropId: string
        name: string
        count: number
        minGen: number
        maxGen: number
      }
    > = {}
    for (const seed of plantableBreedingSeeds.value) {
      const cid = seed.genetics.cropId
      if (!groups[cid]) {
        groups[cid] = {
          cropId: cid,
          name: getCropName(cid),
          count: 0,
          minGen: seed.genetics.generation,
          maxGen: seed.genetics.generation
        }
      }
      groups[cid]!.count++
      if (seed.genetics.generation < groups[cid]!.minGen) groups[cid]!.minGen = seed.genetics.generation
      if (seed.genetics.generation > groups[cid]!.maxGen) groups[cid]!.maxGen = seed.genetics.generation
    }
    return Object.values(groups)
  })

  const doBatchPlant = (cropId: string) => {
    handleBatchPlant(cropId)
    showBatchPlant.value = false
  }

  const doBatchPlantBreeding = (cropId: string) => {
    const skillStore = useSkillStore()
    const cookingStore = useCookingStore()
    const targets = farmStore.plots.filter(p => p.state === 'tilled')
    if (targets.length === 0) {
      addLog('Không có ô đất trống để gieo trồng.')
      showBatchPlant.value = false
      return
    }
    const seeds = plantableBreedingSeeds.value.filter(s => s.genetics.cropId === cropId)
    let planted = 0
    const plantRingFarmReduction = inventoryStore.getRingEffectValue('farming_stamina')
    const plantRingGlobalReduction = inventoryStore.getRingEffectValue('stamina_reduction')
    for (const plot of targets) {
      if (seeds.length === 0) break
      const seed = seeds.shift()!
      const farmingBuff = cookingStore.activeBuff?.type === 'farming' ? cookingStore.activeBuff.value / 100 : 0
      const cost = Math.max(
        1,
        Math.floor(
          3 *
            inventoryStore.getToolStaminaMultiplier('hoe') *
            (1 - skillStore.getStaminaReduction('farming')) *
            (1 - farmingBuff) *
            (1 - plantRingFarmReduction) *
            (1 - plantRingGlobalReduction)
        )
      )
      if (!playerStore.consumeStamina(cost)) break
      if (farmStore.plantGeneticSeed(plot.id, seed.genetics)) {
        breedingStore.removeFromBox(seed.genetics.id)
        planted++
      }
    }
    if (planted > 0) {
      addLog(`Đã trồng một chạm ${planted} hạt giống lai tạo (${getCropName(cropId)}). (-${planted} thể lực)`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant * planted)
      if (tr.message) addLog(tr.message)
    } else {
      addLog('Không đủ thể lực để trồng.')
    }
    showBatchPlant.value = false
  }
  const doBatchFertilize = (type: FertilizerType) => {
    handleBatchFertilize(type)
    showBatchFertilize.value = false
  }

  const doRemoveCrop = () => {
    if (activePlotId.value === null) return
    handleRemoveCrop(activePlotId.value)
    activePlotId.value = null
  }

  const doCurePest = () => {
    if (activePlotId.value === null) return
    handleCurePest(activePlotId.value)
    activePlotId.value = null
  }

  const doClearWeed = () => {
    if (activePlotId.value === null) return
    handleClearWeed(activePlotId.value)
    activePlotId.value = null
  }

  const getPlotDisplay = (plot: (typeof farmStore.plots)[number]): { icon: Component; color: string; bg: string } => {
    // khổng lồloạilàmvậtđặcđặc biệthiểnhiển thị（chỉđangđã成chínthờimớihiểnhiển thịkhổng lồloạibộ sưu tậpnhãn）
    if (plot.giantCropGroup !== null && plot.state === 'harvestable') {
      return { icon: Star, color: 'text-accent', bg: 'bg-accent/10' }
    }
    // sâuhạihiểnhiển thị
    if (plot.infested) {
      return { icon: Bug, color: 'text-danger', bg: 'bg-danger/10' }
    }
    // tạpcỏhiểnhiển thị
    if (plot.weedy) {
      return { icon: Leaf, color: 'text-success/70', bg: 'bg-success/10' }
    }
    switch (plot.state) {
      case 'wasteland':
        return { icon: Shovel, color: 'text-muted', bg: 'bg-panel/40' }
      case 'tilled':
        return { icon: Square, color: 'text-earth', bg: 'bg-earth/8' }
      case 'planted':
        return {
          icon: plot.watered ? Droplets : Sprout,
          color: plot.watered ? 'text-water' : 'text-success/60',
          bg: plot.watered ? 'bg-water/8' : 'bg-success/5'
        }
      case 'growing': {
        const crop = getCropById(plot.cropId!)
        const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
        const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
        const effectiveDays = crop ? (speedup > 0 ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : crop.growthDays) : 1
        const progress = crop ? Math.floor((plot.growthDays / effectiveDays) * 100) : 0
        return {
          icon: plot.watered ? Droplets : Leaf,
          color: plot.watered ? 'text-water' : progress > 60 ? 'text-success' : 'text-success/80',
          bg: plot.watered ? 'bg-water/8' : 'bg-success/8'
        }
      }
      case 'harvestable':
        return { icon: Wheat, color: 'text-accent', bg: 'bg-accent/15' }
      default:
        return { icon: Square, color: 'text-muted', bg: 'bg-panel/40' }
    }
  }

  const getPlotTooltip = (plot: (typeof farmStore.plots)[number]): string => {
    let tip = ''
    if (plot.state === 'wasteland') tip = 'Đất hoang (nhấn để khai hoang)'
    else if (plot.state === 'tilled') tip = 'Đất đã cày (nhấn để gieo)'
    else if (plot.state === 'harvestable') {
      const crop = getCropById(plot.cropId!)
      tip = `${crop?.name ?? ''} đã chín (nhấn để thu hoạch)`
    } else if (plot.state === 'planted' || plot.state === 'growing') {
      const crop = getCropById(plot.cropId!)
      const fertDef = plot.fertilizer ? getFertilizerById(plot.fertilizer) : null
      const speedup = (fertDef?.growthSpeedup ?? 0) + useWalletStore().getCropGrowthBonus()
      const effectiveDays = crop ? (speedup > 0 ? Math.max(1, Math.floor(crop.growthDays * (1 - speedup))) : crop.growthDays) : '?'
      tip = `${crop?.name ?? ''} ${plot.growthDays}/${effectiveDays} ngày ${plot.watered ? 'Đã tưới' : 'Cần tưới'}`
    }
    if (hasSprinkler(plot.id)) tip += ' [Vòi phun]'
    if (plot.fertilizer) {
      const fertDef = getFertilizerById(plot.fertilizer)
      tip += ` [${fertDef?.name ?? plot.fertilizer}]`
    }
    if (plot.infested) tip += ` [Sâu bệnh ${plot.infestedDays} ngày]`
    if (plot.weedy) tip += ` [Cỏ dại ${plot.weedyDays} ngày]`
    return tip
  }

  // === đạncửa sổthao táclàm：nôngtrận ===

  const doTill = () => {
    if (activePlotId.value === null) return
    selectedSeed.value = null
    handlePlotClick(activePlotId.value)
    activePlotId.value = null
  }

  const doPlant = (cropId: string, quality?: Quality) => {
    if (activePlotId.value === null) return
    selectedSeed.value = { cropId, quality }
    handlePlotClick(activePlotId.value)
    selectedSeed.value = null
    activePlotId.value = null
  }

  const doPlantGeneticSeed = (seedId: string) => {
    if (activePlotId.value === null) return
    const seed = breedingStore.breedingBox.find(s => s.genetics.id === seedId)
    if (!seed) return
    if (farmStore.plantGeneticSeed(activePlotId.value, seed.genetics)) {
      breedingStore.removeFromBox(seedId)
      addLog(`Đã gieo hạt giống lai tạo: ${getCropName(seed.genetics.cropId)} G${seed.genetics.generation}.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plant)
      if (tr.message) addLog(tr.message)
    }
    activePlotId.value = null
  }

  const doWater = () => {
    if (activePlotId.value === null) return
    selectedSeed.value = null
    handlePlotClick(activePlotId.value)
    activePlotId.value = null
  }

  const doHarvest = () => {
    if (activePlotId.value === null) return
    const plot = farmStore.plots.find(p => p.id === activePlotId.value)
    if (plot && plot.giantCropGroup !== null) {
      const result = farmStore.harvestGiantCrop(activePlotId.value)
      if (result) {
        inventoryStore.addItem(result.cropId, result.quantity)
        const cropName = getCropName(result.cropId)
        addLog(`Thu hoạch ${cropName} khổng lồ! Nhận ${result.quantity} ${cropName}!`)
        showFloat(`${cropName} khổng lồ ×${result.quantity}`, 'accent')
        sfxHarvest()
      }
      activePlotId.value = null
      return
    }
    selectedSeed.value = null
    handlePlotClick(activePlotId.value)
    activePlotId.value = null
  }

  const doFertilize = (type: FertilizerType) => {
    if (activePlotId.value === null) return
    if (!inventoryStore.removeItem(type)) {
      addLog('Không còn loại phân này.')
      return
    }
    if (farmStore.applyFertilizer(activePlotId.value, type)) {
      const fertDef = getFertilizerById(type)
      addLog(`Đã bón ${fertDef?.name ?? 'phân bón'}.`)
    } else {
      inventoryStore.addItem(type)
      addLog('Không thể bón phân tại đây (cần ô đất đã khai hoang và chưa bón).')
    }
    activePlotId.value = null
  }

  const doPlaceSprinkler = (type: SprinklerType) => {
    if (activePlotId.value === null) return
    if (!inventoryStore.removeItem(type)) {
      addLog('Không còn vòi phun này.')
      return
    }
    if (farmStore.placeSprinkler(activePlotId.value, type)) {
      addLog('Đã đặt vòi phun, các ô xung quanh sẽ tự động được tưới.')
    } else {
      inventoryStore.addItem(type)
      addLog('Không thể đặt vòi phun tại đây.')
    }
    activePlotId.value = null
  }

  const doRemoveSprinkler = () => {
    if (activePlotId.value === null) return
    const plotId = activePlotId.value
    const type = farmStore.removeSprinkler(plotId)
    if (type) {
      if (inventoryStore.addItem(type)) {
        addLog('Đã tháo vòi phun và thu hồi vào túi.')
      } else {
        // lưnggóiđầy，đặtvềnguyênnơi
        farmStore.placeSprinkler(plotId, type)
        addLog('Túi đã đầy, không thể thu hồi vòi phun.')
      }
    }
    activePlotId.value = null
  }

  // === quảcây ===

  const getTreeName = (type: string): string => {
    return FRUIT_TREE_DEFS.find(d => d.type === type)?.name ?? type
  }

  const getTreeFruitSeason = (type: string): string => {
    const def = FRUIT_TREE_DEFS.find(d => d.type === type)
    if (!def) return '?'
    return SEASON_NAMES[def.fruitSeason as keyof typeof SEASON_NAMES]
  }

  const plantableSaplings = computed(() => {
    return FRUIT_TREE_DEFS.filter(d => inventoryStore.hasItem(d.saplingId)).map(d => ({
      type: d.type as FruitTreeType,
      saplingId: d.saplingId,
      name: d.name,
      count: inventoryStore.getItemCount(d.saplingId)
    }))
  })

  const plantableWildSeeds = computed(() => {
    return WILD_TREE_DEFS.filter(d => inventoryStore.hasItem(d.seedItemId)).map(d => ({
      type: d.type as WildTreeType,
      seedItemId: d.seedItemId,
      name: d.name,
      count: inventoryStore.getItemCount(d.seedItemId)
    }))
  })

  const hasTapper = computed(() => inventoryStore.getItemCount('tapper') > 0)

  const handlePlantTree = (treeType: FruitTreeType) => {
    const def = FRUIT_TREE_DEFS.find(d => d.type === treeType)
    if (!def) return
    if (!inventoryStore.removeItem(def.saplingId)) {
      addLog('Túi không có cây giống này.')
      return
    }
    if (farmStore.plantFruitTree(treeType)) {
      addLog(`Đã trồng cây giống ${def.name}, cần 28 ngày để trưởng thành.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plantTree)
      if (tr.message) addLog(tr.message)
    } else {
      inventoryStore.addItem(def.saplingId)
      addLog(`Đã đủ chỗ cây ăn quả (tối đa ${MAX_FRUIT_TREES} cây).`)
    }
  }

  const confirmChopFruitTree = () => {
    const target = chopFruitTreeTarget.value
    if (!target) return
    chopFruitTreeTarget.value = null
    if (gameStore.isPastBedtime) {
      addLog('Muộn quá, không thể chặt cây.')
      return
    }
    if (!inventoryStore.isToolAvailable('axe')) {
      addLog('Rìu đang được nâng cấp, không thể chặt cây.')
      return
    }
    const skillStore = useSkillStore()
    const cost = Math.max(
      1,
      Math.floor(5 * inventoryStore.getToolStaminaMultiplier('axe') * (1 - skillStore.getStaminaReduction('foraging')))
    )
    if (!playerStore.consumeStamina(cost)) {
      addLog('Không đủ thể lực để chặt cây.')
      return
    }
    const treeName = getTreeName(target.type)
    const woodQty = farmStore.removeFruitTree(target.id)
    if (woodQty > 0) {
      inventoryStore.addItem('wood', woodQty)
      addLog(`Đã chặt ${treeName}, nhận ${woodQty} gỗ. (thể lực -${cost})`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.chopTree)
      if (tr.message) addLog(tr.message)
    }
  }

  // === hoang dãcây ===

  const getWildTreeName = (type: string): string => {
    return getWildTreeDef(type)?.name ?? type
  }

  const handlePlantWildTree = (treeType: WildTreeType) => {
    const def = WILD_TREE_DEFS.find(d => d.type === treeType)
    if (!def) return
    if (!inventoryStore.removeItem(def.seedItemId)) {
      addLog('Túi không có hạt giống này.')
      return
    }
    if (farmStore.plantWildTree(treeType)) {
      addLog(`Đã trồng ${def.name}, cần ${def.growthDays} ngày để trưởng thành.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.plantTree)
      if (tr.message) addLog(tr.message)
    } else {
      inventoryStore.addItem(def.seedItemId)
      addLog(`Đã đủ chỗ cây hoang (tối đa ${MAX_WILD_TREES} cây).`)
    }
  }

  const handleAttachTapper = (treeId: number) => {
    if (!inventoryStore.removeItem('tapper')) {
      addLog('Túi không có dụng cụ lấy nhựa.')
      return
    }
    if (farmStore.attachTapper(treeId)) {
      addLog('Đã lắp dụng cụ lấy nhựa, cây sẽ định kỳ cho nhựa.')
    } else {
      inventoryStore.addItem('tapper')
      addLog('Không thể lắp dụng cụ lấy nhựa (cần cây hoang đã trưởng thành và chưa lắp).')
    }
  }

  const handleCollectTapProduct = (treeId: number) => {
    const productId = farmStore.collectTapProduct(treeId)
    if (productId) {
      inventoryStore.addItem(productId)
      const def = WILD_TREE_DEFS.find(d => d.tapProduct === productId)
      addLog(`Đã thu ${def?.tapProductName ?? productId}!`)
    }
  }

  const handleChopTree = (treeId: number) => {
    const tree = farmStore.wildTrees.find(t => t.id === treeId)
    if (!tree) return
    chopWildTreeTarget.value = {
      id: tree.id,
      type: tree.type,
      chopCount: tree.chopCount
    }
  }

  const confirmChopWildTree = () => {
    const target = chopWildTreeTarget.value
    if (!target) return
    chopWildTreeTarget.value = null
    if (gameStore.isPastBedtime) {
      addLog('Muộn quá, không thể đốn gỗ.')
      return
    }
    if (!inventoryStore.isToolAvailable('axe')) {
      addLog('Rìu đang được nâng cấp, không thể đốn gỗ.')
      return
    }
    const skillStore = useSkillStore()
    const cost = Math.max(
      1,
      Math.floor(5 * inventoryStore.getToolStaminaMultiplier('axe') * (1 - skillStore.getStaminaReduction('foraging')))
    )
    if (!playerStore.consumeStamina(cost)) {
      addLog('Không đủ thể lực để đốn gỗ.')
      return
    }
    const baseQty = 2
    const hasLumberjack = skillStore.getSkill('foraging').perk5 === 'lumberjack' || skillStore.getSkill('foraging').perk10 === 'forester'
    const qty = baseQty + (hasLumberjack ? 2 : Math.random() < 0.5 ? 1 : 0)
    inventoryStore.addItem('wood', qty)
    const { removed } = farmStore.chopWildTree(target.id)
    const treeName = getWildTreeName(target.type)
    if (removed) {
      addLog(`Đốn cây nhận ${qty} gỗ, ${treeName} đã bị chặt hạ. (thể lực -${cost})`)
    } else {
      addLog(`Đốn cây nhận ${qty} gỗ. (thể lực -${cost})`)
    }
    const tr = gameStore.advanceTime(ACTION_TIME_COSTS.chopTree)
    if (tr.message) addLog(tr.message)
  }

  // === 温室 ===

  const showGreenhouse = computed(() => homeStore.greenhouseUnlocked)

  const ghHarvestableCount = computed(() => farmStore.greenhousePlots.filter(p => p.state === 'harvestable').length)

  const ghTilledEmptyCount = computed(() => farmStore.greenhousePlots.filter(p => p.state === 'tilled').length)

  const ghGridCols = computed(() => {
    const upgradeDef = GREENHOUSE_UPGRADES[farmStore.greenhouseLevel - 1]
    return upgradeDef?.gridCols ?? 4
  })

  const nextGhUpgrade = computed(() => GREENHOUSE_UPGRADES[farmStore.greenhouseLevel] ?? null)

  const allSeeds = computed(() => {
    return CROPS.filter(crop => inventoryStore.hasItem(crop.seedId)).map(crop => ({
      cropId: crop.id,
      seedId: crop.seedId,
      name: crop.name,
      count: inventoryStore.getItemCount(crop.seedId),
      regrowth: crop.regrowth ?? false
    }))
  })

  // === đạncửa sổthao táclàm：ấmphòng ===

  const doGhPlant = (cropId: string) => {
    if (activeGhPlotId.value === null) return
    const crop = getCropById(cropId)
    if (!crop) return
    if (!inventoryStore.removeItem(crop.seedId)) {
      addLog('Túi không còn hạt giống này.')
      return
    }
    if (farmStore.greenhousePlantCrop(activeGhPlotId.value, cropId)) {
      addLog(`Đã gieo ${crop.name} trong nhà kính.`)
    } else {
      inventoryStore.addItem(crop.seedId)
    }
    activeGhPlotId.value = null
  }

  const doGhHarvest = () => {
    if (activeGhPlotId.value === null) return
    if (!playerStore.consumeStamina(1)) {
      addLog('Không đủ thể lực để thu hoạch.')
      return
    }
    const result = farmStore.greenhouseHarvestPlot(activeGhPlotId.value)
    if (result.cropId) {
      const cropId = result.cropId
      const genetics = result.genetics
      const cropDef = getCropById(cropId)
      const skillStore = useSkillStore()
      let quality = skillStore.rollCropQualityWithBonus(0)
      quality = applyCropBlessing(quality)
      // nuôigiốngsảnlượngthêm成
      const yieldDouble = genetics && Math.random() < (genetics.yield / 100) * 0.3
      const harvestQty = yieldDouble ? 2 : 1
      inventoryStore.addItem(cropId, harvestQty, quality)
      const qualityLabel = quality !== 'normal' ? `(${QUALITY_NAMES[quality]})` : ''
      const qtyLabel = yieldDouble ? '×2' : ''
      sfxHarvest()
      showFloat(`+${cropDef?.name ?? cropId}${qtyLabel}${qualityLabel}`, 'success')
      let msg = `Thu hoạch ${cropDef?.name ?? cropId}${qtyLabel}${qualityLabel} trong nhà kính! (-1 thể lực)`
      if (yieldDouble) msg += ' Thưởng sản lượng lai tạo!'
      // 育种甜度加成
      if (genetics && genetics.sweetness > 0 && cropDef) {
        const bonusMoney = Math.floor((cropDef.sellPrice * harvestQty * genetics.sweetness) / 200)
        if (bonusMoney > 0) {
          playerStore.earnMoney(bonusMoney)
          msg += ` Thưởng độ ngọt +${bonusMoney} văn`
        }
      }
      // tạpgiaogiốngghilục
      if (genetics?.isHybrid && genetics.hybridId) {
        breedingStore.recordHybridGrown(genetics.hybridId)
      }
      // nuôigiốnggiốngconvềthu
      if (genetics && shouldReturnBreedingSeed(quality)) {
        const returned: SeedGenetics = { ...genetics, id: generateGeneticsId() }
        if (breedingStore.addToBox(returned)) {
          msg += ' Đã thu hồi hạt giống lai tạo.'
        } else {
          msg += ' Hộp hạt giống đã đầy, hạt giống lai tạo bị mất!'
        }
      }
      addLog(msg)
    }
    activeGhPlotId.value = null
  }

  const doGhBatchHarvest = () => {
    const skillStore = useSkillStore()
    const results = farmStore.greenhouseBatchHarvest()
    if (results.length === 0) return
    let harvested = 0
    let seedsReturned = 0
    let totalBonusMoney = 0
    for (const { cropId, genetics } of results) {
      if (!playerStore.consumeStamina(1)) break
      harvested++
      let quality = skillStore.rollCropQualityWithBonus(0)
      quality = applyCropBlessing(quality)
      const yieldDouble = genetics && Math.random() < (genetics.yield / 100) * 0.3
      const harvestQty = yieldDouble ? 2 : 1
      inventoryStore.addItem(cropId, harvestQty, quality)
      // 育种甜度加成
      if (genetics && genetics.sweetness > 0) {
        const cropDef = getCropById(cropId)
        if (cropDef) {
          const bonusMoney = Math.floor((cropDef.sellPrice * harvestQty * genetics.sweetness) / 200)
          if (bonusMoney > 0) {
            playerStore.earnMoney(bonusMoney)
            totalBonusMoney += bonusMoney
          }
        }
      }
      // tạpgiaogiốngghilục
      if (genetics?.isHybrid && genetics.hybridId) {
        breedingStore.recordHybridGrown(genetics.hybridId)
      }
      // nuôigiốnggiốngconvềthu
      if (genetics && shouldReturnBreedingSeed(quality)) {
        const returned: SeedGenetics = { ...genetics, id: generateGeneticsId() }
        if (breedingStore.addToBox(returned)) seedsReturned++
      }
    }
    if (harvested > 0) {
      sfxHarvest()
      showFloat(`Thu hoạch nhà kính ×${harvested}`, 'success')
      let msg = `Đã thu hoạch một chạm ${harvested} cây trong nhà kính. (-${harvested} thể lực)`
      if (totalBonusMoney > 0) msg += ` Thưởng độ ngọt +${totalBonusMoney} văn`
      addLog(msg)
    }
    if (seedsReturned > 0) {
      addLog(`Đã thu hồi ${seedsReturned} hạt giống lai tạo vào hộp hạt giống.`)
    }
  }

  /** ấmphòng可giốngnuôigiốnggiốngcon（ấmphòngkhôngmùalễgiới hạnchế，điềucónuôigiốnggiốngconđều可giống） */
  const ghPlantableBreedingSeeds = computed(() => {
    return breedingStore.breedingBox.filter(seed => {
      const crop = getCropById(seed.genetics.cropId)
      return !!crop
    })
  })

  const doGhPlantGeneticSeed = (seedId: string) => {
    if (activeGhPlotId.value === null) return
    const seed = breedingStore.breedingBox.find(s => s.genetics.id === seedId)
    if (!seed) return
    if (farmStore.greenhousePlantGeneticSeed(activeGhPlotId.value, seed.genetics)) {
      breedingStore.removeFromBox(seedId)
      addLog(`Đã gieo hạt giống lai tạo trong nhà kính: ${getCropName(seed.genetics.cropId)} G${seed.genetics.generation}.`)
    }
    activeGhPlotId.value = null
  }

  const doGhBatchPlant = (cropId: string) => {
    const crop = getCropById(cropId)
    if (!crop) return
    const targets = farmStore.greenhousePlots.filter(p => p.state === 'tilled')
    if (targets.length === 0) return
    let planted = 0
    for (const plot of targets) {
      if (!inventoryStore.hasItem(crop.seedId)) break
      if (!playerStore.consumeStamina(1)) break
      inventoryStore.removeItem(crop.seedId)
      farmStore.greenhousePlantCrop(plot.id, cropId)
      planted++
    }
    if (planted > 0) {
      sfxPlant()
      showFloat(`Trồng trong nhà kính ${crop.name} ×${planted}`, 'success')
      addLog(`Đã trồng một chạm ${planted} cây ${crop.name} trong nhà kính. (-${planted} thể lực)`)
    } else {
      addLog('Không đủ thể lực hoặc hạt giống, không thể gieo trồng.')
    }
    showGhBatchPlant.value = false
  }

  const handleGhUpgrade = () => {
    const upgrade = nextGhUpgrade.value
    if (!upgrade) return
    for (const mat of upgrade.materialCost) {
      if (inventoryStore.getItemCount(mat.itemId) < mat.quantity) {
        addLog('Thiếu nguyên liệu, không thể nâng cấp nhà kính.')
        return
      }
    }
    if (!playerStore.spendMoney(upgrade.cost)) {
      addLog('Không đủ tiền, không thể nâng cấp nhà kính.')
      return
    }
    for (const mat of upgrade.materialCost) {
      inventoryStore.removeItem(mat.itemId, mat.quantity)
    }
    farmStore.upgradeGreenhouse(upgrade.plotCount)
    addLog(`Nhà kính đã nâng cấp lên ${upgrade.name}! (${upgrade.plotCount} ô đất)`)
    showGhUpgradeModal.value = false
  }
</script>

<style scoped>
  .farm-plot {
    height: 0;
    padding-bottom: 100%;
  }
</style>
