<template>
  <div>
    <VillagerPresence spot="shop" />
    <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">
      {{ tutorialHint }}
    </p>

    <!-- 返回按钮（在子商铺时显示） -->
    <Button v-if="shopStore.currentShopId" class="mb-3 w-full md:w-auto" :icon="ChevronLeft" @click="shopStore.currentShopId = null">
      Trở lại khu thương mại
    </Button>

    <!-- 移动端：购买/出售切换 -->
    <div class="flex space-x-1.5 mb-3 md:hidden">
      <Button
        class="flex-1 justify-center"
        :class="{ '!bg-accent !text-bg': mobileTab === 'buy' }"
        :icon="ShoppingCart"
        @click="mobileTab = 'buy'"
      >
        Mua
      </Button>
      <Button
        class="flex-1 justify-center"
        :class="{ '!bg-accent !text-bg': mobileTab === 'sell' }"
        :icon="Coins"
        @click="mobileTab = 'sell'"
      >
        Bán
      </Button>
    </div>

    <div class="flex flex-col md:flex-row space-x-0 md:space-x-4 md:space-y-6">
      <!-- 左侧：购买区 -->
      <div class="flex-1" :class="{ 'hidden md:block': mobileTab === 'sell' }">
        <!-- 折扣提示 -->
        <p v-if="hasDiscount" class="text-success text-xs mb-3">Đang giảm giá: giá mua mọi vật phẩm -{{ discountPercent }}%</p>

        <!-- ====== 商圈总览 ====== -->
        <template v-if="!shopStore.currentShopId">
          <h3 class="text-accent text-sm mb-3">
            <Store :size="14" class="inline" />
            Khu thương mại Đào Nguyên
          </h3>
          <p class="text-muted text-xs mb-3">Chạm vào cửa hàng để mua sắm.</p>

          <!-- 旅行商人（仅周五/日） -->
          <div v-if="shopStore.isMerchantHere" class="mb-4">
            <h4 class="text-accent text-sm mb-2">
              <MapPin :size="14" class="inline" />
              Thương nhân Lữ Hành · Bán giới hạn
            </h4>
            <p class="text-muted text-xs mb-2">Hôm nay Thương nhân Lữ Hành bày hàng ở Làng Đào Nguyên, mang theo những món hiếm!</p>
            <div class="flex flex-col space-y-2">
              <div
                v-for="item in shopStore.travelingStock"
                :key="item.itemId"
                class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2"
                :class="item.quantity > 0 ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
                @click="
                  item.quantity > 0 &&
                  openBatchBuyModal(
                    item.name,
                    getTravelerItemDesc(item.itemId, item.quantity),
                    discounted(item.price),
                    () => handleBuyFromTraveler(item.itemId, item.name, item.price),
                    () => item.quantity > 0 && playerStore.money >= discounted(item.price),
                    count => handleBatchBuyFromTraveler(item.itemId, item.name, item.price, count),
                    () => getMaxBuyable(discounted(item.price), item.quantity),
                    item.itemId
                  )
                "
              >
                <div>
                  <p class="text-sm">{{ item.name }}</p>
                  <p class="text-muted text-xs">
                    {{ getTravelerItemDesc(item.itemId, item.quantity) }}
                  </p>
                </div>
                <span class="text-xs text-accent whitespace-nowrap">{{ discounted(item.price) }}văn</span>
              </div>
            </div>
          </div>

          <!-- 六大商铺卡片 -->
          <div class="flex flex-col space-y-2">
            <div
              v-for="shop in SHOPS"
              :key="shop.id"
              class="flex items-center justify-between border rounded-xs px-3 py-2"
              :class="isOpen(shop) ? 'border-accent/30 cursor-pointer hover:bg-accent/5' : 'border-accent/10 opacity-50'"
              @click="isOpen(shop) && enterShop(shop.id)"
            >
              <div>
                <span class="text-sm">{{ shop.name }}</span>
                <span class="text-muted text-xs ml-2">{{ shop.npcName }}</span>
                <span v-if="!isOpen(shop)" class="text-danger text-xs ml-2">{{ closedReason(shop) }}</span>
              </div>
              <ChevronRight v-if="isOpen(shop)" :size="14" class="text-muted" />
            </div>
          </div>
        </template>

        <!-- ====== 万物铺 ====== -->
        <template v-else-if="shopStore.currentShopId === 'wanwupu'">
          <ShopHeader name="Tiệm Vạn Vật" npc="Bác Trần" />

          <!-- 当季种子 -->
          <h4 class="text-accent text-sm mb-2 mt-3">
            <Sprout :size="14" class="inline" />
            Hạt giống theo mùa
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="seed in shopStore.availableSeeds"
              :key="seed.seedId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  'Hạt giống ' + seed.cropName,
                  `${seed.season.map(s => SEASON_NAMES[s]).join('/')} · ${seed.growthDays} ngày trưởng thành → bán ${seed.sellPrice} văn`,
                  discounted(seed.price),
                  () => handleBuySeed(seed.seedId),
                  () => playerStore.money >= discounted(seed.price),
                  count => handleBatchBuySeed(seed.seedId, count),
                  () => getMaxBuyable(discounted(seed.price)),
                  seed.seedId
                )
              "
            >
              <div>
                <p class="text-sm">
                  Hạt giống {{ seed.cropName }}
                  <span v-if="seed.regrowth" class="text-success text-xs ml-1">[Nhiều vụ]</span>
                </p>
                <p class="text-muted text-xs">
                  {{ seed.season.map(s => SEASON_NAMES[s]).join('/') }} · {{ seed.growthDays }} ngày{{
                    seed.regrowth ? ` · mỗithu lại sau mỗi ${seed.regrowthDays} ngày` : ''
                  }}
                  → bán {{ seed.sellPrice }} văn
                </p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(seed.price) }}văn</span>
            </div>
            <div v-if="shopStore.availableSeeds.length === 0" class="flex flex-col items-center justify-center py-4 text-muted">
              <Sprout :size="24" class="text-muted/30 mb-2" />
              <p class="text-xs">Mùa này không có hạt giống để bán</p>
            </div>
          </div>

          <!-- 杂货 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Package :size="14" class="inline" />
            Tạp hóa
          </h4>
          <div class="flex flex-col space-y-2">
            <!-- 背包扩容 -->
            <div
              v-if="inventoryStore.capacity < 60"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBuyModal(
                  'Mở rộng túi',
                  `Hiện tại ${inventoryStore.capacity} ô → ${inventoryStore.capacity + 4} ô`,
                  discounted(bagPrice),
                  handleBuyBag,
                  () => playerStore.money >= discounted(bagPrice)
                )
              "
            >
              <div>
                <p class="text-sm">Mở rộng balo</p>
                <p class="text-muted text-xs">hiện tại {{ inventoryStore.capacity }}ô → {{ inventoryStore.capacity + 4 }}ô</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(bagPrice) }}văn</span>
            </div>

            <div
              v-if="warehouseStore.unlocked && warehouseStore.maxChests < warehouseStore.MAX_CHESTS_CAP"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBuyModal(
                  'Mở rộng kho',
                  `Ô rương ${warehouseStore.maxChests} → ${warehouseStore.maxChests + 1} ô`,
                  discounted(warehouseExpandPrice),
                  handleBuyWarehouseExpand,
                  () => playerStore.money >= discounted(warehouseExpandPrice)
                )
              "
            >
              <div>
                <p class="text-sm">khoMở rộng</p>
                <p class="text-muted text-xs">
                  rươngconôvị trí {{ warehouseStore.maxChests }} →
                  {{ warehouseStore.maxChests + 1 }}
                </p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(warehouseExpandPrice) }}văn</span>
            </div>

            <!-- 农场扩建 -->
            <div
              v-if="farmExpandInfo"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBuyModal(
                  'Mở rộng nông trại',
                  `${farmStore.farmSize}×${farmStore.farmSize} → ${farmExpandInfo.newSize}×${farmExpandInfo.newSize}`,
                  discounted(farmExpandInfo.price),
                  handleBuyFarmExpand,
                  () => playerStore.money >= discounted(farmExpandInfo!.price)
                )
              "
            >
              <div>
                <p class="text-sm">Nông trạiMở rộng</p>
                <p class="text-muted text-xs">
                  {{ farmStore.farmSize }}×{{ farmStore.farmSize }} → {{ farmExpandInfo.newSize }}×{{ farmExpandInfo.newSize }}
                </p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(farmExpandInfo.price) }}văn</span>
            </div>

            <!-- 树苗 -->
            <div
              v-for="tree in FRUIT_TREE_DEFS"
              :key="tree.saplingId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  tree.name + ' cây giống',
                  `28 ngày trưởng thành · mùa ${seasonName(tree.fruitSeason)} cho ${tree.fruitName}`,
                  discounted(tree.saplingPrice),
                  () => handleBuySapling(tree.saplingId, tree.saplingPrice, tree.name),
                  () => playerStore.money >= discounted(tree.saplingPrice),
                  count => handleBatchBuySapling(tree.saplingId, tree.saplingPrice, tree.name, count),
                  () => getMaxBuyable(discounted(tree.saplingPrice)),
                  tree.saplingId
                )
              "
            >
              <div>
                <p class="text-sm">{{ tree.name }}cây giống</p>
                <p class="text-muted text-xs">28 ngày trưởng thành · mùa {{ seasonName(tree.fruitSeason) }} cho {{ tree.fruitName }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(tree.saplingPrice) }}văn</span>
            </div>

            <!-- 干草 -->
            <div
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  'Cỏ khô',
                  'Dùng để cho gia súc ăn',
                  discounted(HAY_PRICE),
                  handleBuyHay,
                  () => playerStore.money >= discounted(HAY_PRICE),
                  count => handleBatchBuyItem('hay', HAY_PRICE, 'Cỏ khô', count),
                  () => getMaxBuyable(discounted(HAY_PRICE)),
                  'hay'
                )
              "
            >
              <div>
                <p class="text-sm">Cỏ khô</p>
                <p class="text-muted text-xs">Dùng để cho gia súc ăn</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(HAY_PRICE) }}văn</span>
            </div>

            <!-- 木材 -->
            <div
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  'Gỗ',
                  'Nguyên liệu cơ bản cho xây dựng và chế biến',
                  discounted(WOOD_PRICE),
                  () => handleBuyItem('wood', WOOD_PRICE, 'Gỗ'),
                  () => playerStore.money >= discounted(WOOD_PRICE),
                  count => handleBatchBuyItem('wood', WOOD_PRICE, 'Gỗ', count),
                  () => getMaxBuyable(discounted(WOOD_PRICE)),
                  'wood'
                )
              "
            >
              <div>
                <p class="text-sm">gỗnguyên liệu</p>
                <p class="text-muted text-xs">xâyxây dựng và gia công của cơ bảnnền tảngnguyên liệu</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(WOOD_PRICE) }}văn</span>
            </div>

            <!-- 天气图腾：花大钱买一个确定的明天 -->
            <div
              v-for="totem in WEATHER_TOTEMS"
              :key="totem.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  totem.name,
                  totem.description,
                  discounted(totem.price),
                  () => handleBuyItem(totem.id, totem.price, totem.name),
                  () => playerStore.money >= discounted(totem.price),
                  count => handleBatchBuyItem(totem.id, totem.price, totem.name, count),
                  () => getMaxBuyable(discounted(totem.price)),
                  totem.id
                )
              "
            >
              <div>
                <p class="text-sm">{{ totem.name }}</p>
                <p class="text-muted text-xs">{{ totem.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(totem.price) }}văn</span>
            </div>
          </div>
        </template>

        <!-- ====== 铁匠铺 ====== -->
        <template v-else-if="shopStore.currentShopId === 'tiejiangpu'">
          <ShopHeader name="Tiệm Rèn" npc="Thợ rèn Tôn" />

          <div class="flex flex-col space-y-2">
            <div
              v-for="item in shopStore.blacksmithItems"
              :key="item.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  item.name,
                  item.description,
                  discounted(item.price),
                  () => handleBuyItem(item.itemId, item.price, item.name),
                  () => playerStore.money >= discounted(item.price),
                  count => handleBatchBuyItem(item.itemId, item.price, item.name, count),
                  () => getMaxBuyable(discounted(item.price)),
                  item.itemId
                )
              "
            >
              <div>
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-muted text-xs">{{ item.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(item.price) }}văn</span>
            </div>
          </div>

          <!-- 戒指合成 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <CircleDot :size="14" class="inline" />
            Hợp thành nhẫn
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="ring in craftableRings"
              :key="ring.id"
              class="flex items-center justify-between border rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              :class="canCraftRing(ring) ? 'border-success/50 bg-success/5' : 'border-accent/20'"
              @click="openRingModal(ring)"
            >
              <div>
                <p class="text-sm">
                  {{ ring.name }}
                  <span v-if="inventoryStore.hasRing(ring.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ ring.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ ring.recipeMoney }}văn</span>
            </div>
            <div v-if="craftableRings.length === 0" class="flex flex-col items-center justify-center py-4 text-muted">
              <CircleDot :size="24" class="text-muted/30 mb-2" />
              <p class="text-xs">Không thể hợp thành nhẫn</p>
            </div>
          </div>

          <!-- 帽子合成 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Crown :size="14" class="inline" />
            Hợp thành mũ
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="hat in CRAFTABLE_HATS"
              :key="hat.id"
              class="flex items-center justify-between border rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              :class="canCraftHat(hat) ? 'border-success/50 bg-success/5' : 'border-accent/20'"
              @click="openHatCraftModal(hat)"
            >
              <div>
                <p class="text-sm">
                  {{ hat.name }}
                  <span v-if="inventoryStore.hasHat(hat.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ hat.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ hat.recipeMoney }}văn</span>
            </div>
          </div>

          <!-- 鞋子合成 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Footprints :size="14" class="inline" />
            Hợp thành giày
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="shoe in CRAFTABLE_SHOES"
              :key="shoe.id"
              class="flex items-center justify-between border rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              :class="canCraftShoe(shoe) ? 'border-success/50 bg-success/5' : 'border-accent/20'"
              @click="openShoeCraftModal(shoe)"
            >
              <div>
                <p class="text-sm">
                  {{ shoe.name }}
                  <span v-if="inventoryStore.hasShoe(shoe.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ shoe.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ shoe.recipeMoney }}văn</span>
            </div>
          </div>
        </template>

        <!-- ====== 镖局 ====== -->
        <template v-else-if="shopStore.currentShopId === 'biaoju'">
          <ShopHeader name="Tiêu Cục" npc="Vân Phi" />

          <!-- 武器 -->
          <h4 class="text-accent text-sm mb-2">
            <Sword :size="14" class="inline" />
            Vũ khí
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="w in SHOP_WEAPONS"
              :key="w.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="openWeaponModal(w)"
            >
              <div>
                <p class="text-sm">
                  {{ w.name }}
                  <span v-if="inventoryStore.hasWeapon(w.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ WEAPON_TYPE_NAMES[w.type] }} · Tấn công{{ w.attack }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(w.shopPrice!) }}văn</span>
            </div>
          </div>
        </template>

        <!-- ====== 渔具铺 ====== -->
        <template v-else-if="shopStore.currentShopId === 'yugupu'">
          <ShopHeader name="Tiệm Đồ Câu" npc="Thu Nguyệt" />

          <!-- 鱼饵 -->
          <h4 class="text-accent text-sm mb-2">
            <Fish :size="14" class="inline" />
            Mồi câu
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="b in shopStore.shopBaits"
              :key="b.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  b.name,
                  b.description,
                  discounted(b.price),
                  () => handleBuyItem(b.id, b.price, b.name),
                  () => playerStore.money >= discounted(b.price),
                  count => handleBatchBuyItem(b.id, b.price, b.name, count),
                  () => getMaxBuyable(discounted(b.price)),
                  b.id
                )
              "
            >
              <div>
                <p class="text-sm">{{ b.name }}</p>
                <p class="text-muted text-xs">{{ b.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(b.price) }}văn</span>
            </div>
          </div>

          <!-- 浮漂 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Fish :size="14" class="inline" />
            nổiphao
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="t in shopStore.shopTackles"
              :key="t.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  t.name,
                  t.description,
                  discounted(t.price),
                  () => handleBuyItem(t.id, t.price, t.name),
                  () => playerStore.money >= discounted(t.price),
                  count => handleBatchBuyItem(t.id, t.price, t.name, count),
                  () => getMaxBuyable(discounted(t.price)),
                  t.id
                )
              "
            >
              <div>
                <p class="text-sm">{{ t.name }}</p>
                <p class="text-muted text-xs">{{ t.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(t.price) }}văn</span>
            </div>
          </div>

          <!-- 其他 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Fish :size="14" class="inline" />
            đóanh ấy
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="item in shopStore.fishingShopItems"
              :key="item.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  item.name,
                  item.description,
                  discounted(item.price),
                  () => handleBuyItem(item.itemId, item.price, item.name),
                  () => playerStore.money >= discounted(item.price),
                  count => handleBatchBuyItem(item.itemId, item.price, item.name, count),
                  () => getMaxBuyable(discounted(item.price)),
                  item.itemId
                )
              "
            >
              <div>
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-muted text-xs">{{ item.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(item.price) }}văn</span>
            </div>
          </div>
        </template>

        <!-- ====== 药铺 ====== -->
        <template v-else-if="shopStore.currentShopId === 'yaopu'">
          <ShopHeader name="Tiệm Thuốc" npc="Lâm Lão" />

          <!-- 肥料 -->
          <h4 class="text-accent text-sm mb-2">
            <Leaf :size="14" class="inline" />
            Phân bón
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="f in shopStore.shopFertilizers"
              :key="f.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  f.name,
                  f.description,
                  discounted(f.price),
                  () => handleBuyItem(f.id, f.price, f.name),
                  () => playerStore.money >= discounted(f.price),
                  count => handleBatchBuyItem(f.id, f.price, f.name, count),
                  () => getMaxBuyable(discounted(f.price)),
                  f.id
                )
              "
            >
              <div>
                <p class="text-sm">{{ f.name }}</p>
                <p class="text-muted text-xs">{{ f.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(f.price) }}văn</span>
            </div>
          </div>

          <!-- 草药 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Sprout :size="14" class="inline" />
            cỏthuốc
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="item in shopStore.apothecaryItems"
              :key="item.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  item.name,
                  item.description,
                  discounted(item.price),
                  () => handleBuyItem(item.itemId, item.price, item.name),
                  () => playerStore.money >= discounted(item.price),
                  count => handleBatchBuyItem(item.itemId, item.price, item.name, count),
                  () => getMaxBuyable(discounted(item.price)),
                  item.itemId
                )
              "
            >
              <div>
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-muted text-xs">{{ item.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(item.price) }}văn</span>
            </div>
          </div>
        </template>

        <!-- ====== 绸缎庄 ====== -->
        <template v-else-if="shopStore.currentShopId === 'chouduanzhuang'">
          <ShopHeader name="Trang Viên Tơ Lụa" npc="Tố Tố" />

          <div class="flex flex-col space-y-2">
            <div
              v-for="item in shopStore.textileItems"
              :key="item.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="
                openBatchBuyModal(
                  item.name,
                  item.description,
                  discounted(item.price),
                  () => handleBuyItem(item.itemId, item.price, item.name),
                  () => playerStore.money >= discounted(item.price),
                  count => handleBatchBuyItem(item.itemId, item.price, item.name, count),
                  () => getMaxBuyable(discounted(item.price)),
                  item.itemId
                )
              "
            >
              <div>
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-muted text-xs">{{ item.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(item.price) }}văn</span>
            </div>
          </div>

          <!-- 帽子 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Crown :size="14" class="inline" />
            Mũ
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="hat in SHOP_HATS"
              :key="hat.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="openHatShopModal(hat)"
            >
              <div>
                <p class="text-sm">
                  {{ hat.name }}
                  <span v-if="inventoryStore.hasHat(hat.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ hat.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(hat.shopPrice!) }}văn</span>
            </div>
          </div>

          <!-- 鞋子 -->
          <h4 class="text-accent text-sm mb-2 mt-4">
            <Footprints :size="14" class="inline" />
            Giày
          </h4>
          <div class="flex flex-col space-y-2">
            <div
              v-for="shoe in SHOP_SHOES"
              :key="shoe.id"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
              @click="openShoeShopModal(shoe)"
            >
              <div>
                <p class="text-sm">
                  {{ shoe.name }}
                  <span v-if="inventoryStore.hasShoe(shoe.id)" class="text-success text-xs ml-1">Đang có</span>
                </p>
                <p class="text-muted text-xs">{{ shoe.description }}</p>
              </div>
              <span class="text-xs text-accent whitespace-nowrap">{{ discounted(shoe.shopPrice!) }}văn</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 右侧：出售区 -->
      <div class="flex-1" :class="{ 'hidden md:block': mobileTab === 'buy' }">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-accent text-sm">
            <TrendingUp :size="14" class="inline" />
            rabánvậtphẩm
          </h3>
          <div class="flex space-x-1.5">
            <Button
              class="py-0 px-1.5"
              :class="{ '!bg-accent !text-bg': isSellFilterActive }"
              :icon="Filter"
              :icon-size="12"
              @click="openSellFilterModal"
            >
              Lọc
            </Button>
            <Button v-if="sellableItems.length > 0" class="btn-danger" :icon="Coins" @click="showSellAllConfirm = true">
              mộtphímTất cảrabán
            </Button>
          </div>
        </div>
        <!-- 售价加成提示 -->
        <p v-if="hasSellBonus" class="text-success text-xs mb-2">Hiệu ứng nhẫn: giá bán mọi vật phẩm +{{ sellBonusPercent }}%</p>

        <!-- 今日行情 -->
        <div class="border border-accent/30 rounded-xs p-2 mb-3">
          <p class="text-[10px] text-muted mb-1">hôm nayngàyhànhhình</p>
          <div class="grid grid-cols-4">
            <span v-for="m in todayMarket" :key="m.category" class="text-[10px] whitespace-nowrap mt-2">
              <span class="text-muted">{{ MARKET_CATEGORY_NAMES[m.category] }}</span>
              <span v-if="m.trend === 'stable'" class="text-muted/40 ml-0.5">—</span>
              <span v-else class="ml-0.5" :class="trendColor(m.trend)">
                {{ m.multiplier >= 1 ? '↑' : '↓' }}{{ Math.round(Math.abs(m.multiplier - 1) * 100) }}%
              </span>
            </span>
          </div>
        </div>
        <div class="flex flex-col space-y-2">
          <div
            v-for="item in sellableItems"
            :key="item.originalIndex"
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-2 cursor-pointer hover:bg-accent/5"
            @click="openSellModal(item.itemId, item.quality, item.originalIndex)"
          >
            <div>
              <span class="text-sm" :class="qualityTextClass(item.quality)">{{ item.def?.name }}</span>
              <span class="text-muted text-xs ml-1">×{{ item.quantity }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="text-xs text-accent whitespace-nowrap">{{ shopStore.calculateSellPrice(item.itemId, 1, item.quality) }}văn</span>
              <span v-if="getItemTrend(item.itemId) === 'rising' || getItemTrend(item.itemId) === 'boom'" class="text-[10px] text-success">
                ↑{{ Math.round((getItemMultiplier(item.itemId) - 1) * 100) }}%
              </span>
              <span
                v-else-if="getItemTrend(item.itemId) === 'falling' || getItemTrend(item.itemId) === 'crash'"
                class="text-[10px]"
                :class="getItemTrend(item.itemId) === 'crash' ? 'text-danger' : 'text-warning'"
              >
                ↓{{ Math.round((1 - getItemMultiplier(item.itemId)) * 100) }}%
              </span>
            </div>
          </div>
          <div v-if="sellableItems.length === 0" class="flex flex-col items-center justify-center py-4 text-muted">
            <Package :size="100" class="text-muted/30 my-4" />
            <p class="text-xs">Túi đồtrongkhông cócó thể bán của Vật phẩm</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 出售筛选弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showSellFilterModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showSellFilterModal = false"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="showSellFilterModal = false">
            <X :size="14" />
          </button>
          <p class="text-sm text-accent mb-2">bánlọcchọn</p>
          <p class="text-[10px] text-muted mb-2">Chọn loại muốn hiển thị, bỏ chọn để hiển thị tất cả</p>
          <div class="grid grid-cols-3 gap-1.5 mb-3">
            <div
              v-for="cat in SELL_FILTER_CATEGORIES"
              :key="cat"
              class="border rounded-xs px-1.5 py-1 text-center text-xs cursor-pointer transition-colors"
              :class="
                tempSellFilter.has(cat) ? 'border-accent/50 bg-accent/10 text-accent' : 'border-accent/20 text-muted hover:bg-accent/5'
              "
              @click="toggleSellCategory(cat)"
            >
              {{ SELL_CATEGORY_NAMES[cat] }}
            </div>
          </div>
          <div class="flex space-x-1.5">
            <Button class="flex-1 justify-center" @click="handleClearSellFilter">Hiển thị tất cả</Button>
            <Button class="flex-1 justify-center !bg-accent !text-bg" @click="handleSaveSellFilter">Lưu</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 一键出售确认弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="showSellAllConfirm"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showSellAllConfirm = false"
      >
        <div class="game-panel max-w-xs w-full">
          <p class="text-sm text-accent mb-2">xác nhận mộtphímbán</p>
          <p class="text-xs text-muted mb-3">Bán tất cả vật phẩm không khóa trong Túi đồ, không tính Hạt giống (tổng {{ sellableItems.length }} loại), tiếp tục?</p>
          <div class="flex space-x-1.5">
            <Button class="flex-1 justify-center" @click="showSellAllConfirm = false">Hủy</Button>
            <Button class="flex-1 justify-center btn-danger" :icon="Coins" @click="confirmSellAll">xác nhận bán</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 商品详情弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="buyModalData || (sellModalData && sellModalItem)"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4"
        @click.self="shopModal = null"
      >
        <!-- 购买弹窗 -->
        <div v-if="buyModalData" class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="shopModal = null">
            <X :size="14" />
          </button>
          <p class="text-sm text-accent mb-2 pr-6">{{ buyModalData.name }}</p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">{{ buyModalData.description }}</p>
            <p v-for="(line, i) in buyModalData.extraLines" :key="i" class="text-xs text-muted mt-0.5">
              {{ line }}
            </p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">{{ buyModalData.batchBuy ? 'Đơn giá' : 'Giá' }}</span>
              <span class="text-xs text-accent">{{ buyModalData.price }}văn</span>
            </div>
            <div v-if="buyModalData.itemId" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sở hữu</span>
              <span class="text-xs">{{ inventoryStore.getItemCount(buyModalData.itemId) }}</span>
            </div>
          </div>

          <!-- 批量购买数量选择器 -->
          <div v-if="buyModalData.batchBuy" class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">Số lượng</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="buyQuantity <= 1" @click="addBuyQuantity(-1)">-</Button>
                <input
                  type="number"
                  :value="buyQuantity"
                  min="1"
                  :max="maxBuyQuantity"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none focus:border-accent transition-colors"
                  @input="onBuyQuantityInput"
                />
                <Button
                  class="h-6 px-1.5 py-0.5 text-xs justify-center"
                  :disabled="buyQuantity >= maxBuyQuantity"
                  @click="addBuyQuantity(1)"
                >
                  +
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="buyQuantity <= 1" @click="setBuyQuantity(1)">Ít nhất</Button>
              <Button class="flex-1 justify-center" :disabled="buyQuantity >= maxBuyQuantity" @click="setBuyQuantity(maxBuyQuantity)">
                nhấtnhiều
              </Button>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-xs text-muted">tổng giá</span>
              <span class="text-xs text-accent">{{ buyTotalPrice }}văn</span>
            </div>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Button
              v-if="buyModalData.batchBuy"
              class="w-full justify-center"
              :class="{ '!bg-accent !text-bg': buyModalData.canBuy() }"
              :disabled="!buyModalData.canBuy()"
              :icon="ShoppingCart"
              @click="buyModalData.batchBuy!.onBuy(buyQuantity)"
            >
              muamua ×{{ buyQuantity }}
            </Button>
            <Button
              v-else
              class="w-full justify-center"
              :class="{ '!bg-accent !text-bg': buyModalData.canBuy() }"
              :disabled="!buyModalData.canBuy()"
              :icon="buyModalData.buttonText ? Hammer : ShoppingCart"
              @click="buyModalData.onBuy()"
            >
              {{ buyModalData.buttonText ?? 'Mua' }}
            </Button>
          </div>
        </div>

        <!-- 出售弹窗 -->
        <div v-else-if="sellModalData && sellModalItem && sellModalDef" class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="shopModal = null">
            <X :size="14" />
          </button>
          <p class="text-sm mb-2 pr-6" :class="qualityTextClass(sellModalItem.quality, 'text-accent')">
            {{ sellModalDef.name }}
          </p>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <p class="text-xs text-muted">{{ sellModalDef.description }}</p>
          </div>

          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Số lượng</span>
              <span class="text-xs">×{{ sellModalItem.quantity }}</span>
            </div>
            <div v-if="sellModalItem.quality !== 'normal'" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Chất lượng</span>
              <span class="text-xs" :class="qualityTextClass(sellModalItem.quality)">{{ QUALITY_NAMES[sellModalItem.quality] }}</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Giá bán</span>
              <span class="text-xs flex items-center space-x-1">
                <span
                  v-if="getItemTrend(sellModalData!.itemId) && getItemTrend(sellModalData!.itemId) !== 'stable'"
                  class="line-through text-muted/40"
                >
                  {{ shopStore.calculateBaseSellPrice(sellModalData!.itemId, 1, sellModalData!.quality) }}văn
                </span>
                <span class="text-accent">{{ shopStore.calculateSellPrice(sellModalData!.itemId, 1, sellModalData!.quality) }}văn</span>
              </span>
            </div>
            <div
              v-if="getItemTrend(sellModalData!.itemId) && getItemTrend(sellModalData!.itemId) !== 'stable'"
              class="flex items-center justify-between mt-0.5"
            >
              <span class="text-xs text-muted">hànhhình</span>
              <span class="text-xs" :class="trendColor(getItemTrend(sellModalData!.itemId)!)">
                {{ TREND_NAMES[getItemTrend(sellModalData!.itemId)!] }} ×{{ getItemMultiplier(sellModalData!.itemId) }}
              </span>
            </div>
            <div v-if="hasSellBonus" class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Hiệu ứng nhẫn</span>
              <span class="text-xs text-success">+{{ sellBonusPercent }}%</span>
            </div>
          </div>

          <!-- 数量选择器（物品数量>1thờihiểnhiển thị） -->
          <div v-if="sellModalItem.quantity > 1" class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-muted">bánSố lượng</span>
              <div class="flex items-center space-x-1">
                <Button class="h-6 px-1.5 py-0.5 text-xs justify-center" :disabled="sellQuantity <= 1" @click="addSellQuantity(-1)">
                  -
                </Button>
                <input
                  type="number"
                  :value="sellQuantity"
                  min="1"
                  :max="maxSellQuantity"
                  class="w-24 h-6 px-2 py-0.5 bg-bg border border-accent/30 rounded-xs text-xs text-center text-accent outline-none focus:border-accent transition-colors"
                  @input="onSellQuantityInput"
                />
                <Button
                  class="h-6 px-1.5 py-0.5 text-xs justify-center"
                  :disabled="sellQuantity >= maxSellQuantity"
                  @click="addSellQuantity(1)"
                >
                  +
                </Button>
              </div>
            </div>
            <div class="flex space-x-1">
              <Button class="flex-1 justify-center" :disabled="sellQuantity <= 1" @click="setSellQuantity(1)">Ít nhất</Button>
              <Button class="flex-1 justify-center" :disabled="sellQuantity >= maxSellQuantity" @click="setSellQuantity(maxSellQuantity)">
                nhấtnhiều
              </Button>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-xs text-muted">tổng giá</span>
              <span class="text-xs text-accent">{{ sellTotalPrice }}văn</span>
            </div>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Button class="w-full justify-center" :icon="Coins" @click="handleModalSell(sellQuantity)">bán ×{{ sellQuantity }}</Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import VillagerPresence from '@/components/game/VillagerPresence.vue'
  import { ref, computed } from 'vue'
  import {
    ShoppingCart,
    Coins,
    Sprout,
    Package,
    TrendingUp,
    Fish,
    Leaf,
    Sword,
    MapPin,
    ChevronRight,
    ChevronLeft,
    Store,
    CircleDot,
    Hammer,
    X,
    Crown,
    Footprints,
    Filter
  } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import { useFarmStore } from '@/stores/useFarmStore'
  import { useGameStore, SEASON_NAMES } from '@/stores/useGameStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { useShopStore } from '@/stores/useShopStore'
  import { useWalletStore } from '@/stores/useWalletStore'
  import { useWarehouseStore } from '@/stores/useWarehouseStore'
  import { getItemById } from '@/data'
  import { getCropBySeedId } from '@/data/crops'
  import { SHOPS, isShopAvailable, getShopClosedReason } from '@/data/shops'
  import type { ShopDef } from '@/data/shops'
  import { SHOP_WEAPONS, WEAPON_TYPE_NAMES } from '@/data/weapons'
  import type { WeaponDef, RingDef, RingEffectType, Season, Quality, HatDef, ShoeDef, ItemCategory } from '@/types'
  import { FRUIT_TREE_DEFS } from '@/data/fruitTrees'
  import { CRAFTABLE_RINGS } from '@/data/rings'
  import { SHOP_HATS, CRAFTABLE_HATS } from '@/data/hats'
  import { SHOP_SHOES, CRAFTABLE_SHOES } from '@/data/shoes'
  import { HAY_PRICE } from '@/data/animals'
  import { addLog } from '@/composables/useGameLog'
  import { sfxBuy } from '@/composables/useAudio'
  import { showFloat } from '@/composables/useGameLog'
  import { handleBuySeed, handleSellItem, handleSellItemAll, handleSellAll, QUALITY_NAMES } from '@/composables/useFarmActions'
  import { getDailyMarketInfo, MARKET_CATEGORY_NAMES, TREND_NAMES } from '@/data/market'
  import type { MarketTrend } from '@/data/market'
  import { useTutorialStore } from '@/stores/useTutorialStore'
  import { useAchievementStore } from '@/stores/useAchievementStore'
  import { WEATHER_TOTEMS } from '@/data/totems'

  const WOOD_PRICE = 50

  const shopStore = useShopStore()
  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const farmStore = useFarmStore()
  const warehouseStore = useWarehouseStore()
  const walletStore = useWalletStore()
  const gameStore = useGameStore()
  const tutorialStore = useTutorialStore()
  const achievementStore = useAchievementStore()

  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    if (achievementStore.stats.totalCropsHarvested === 0) return 'Tiệm Vạn Vật bán nhiều loại hạt giống, mua xong hãy tới nông trại trồng. Có thể chuyển 「Mua」 và 「Bán」 ở phía trên.'
    return null
  })

  // === hànhhìnhhệhệ thống ===

  const todayMarket = computed(() =>
    getDailyMarketInfo(gameStore.year, gameStore.seasonIndex, gameStore.day, shopStore.getRecentShipping())
  )

  const getItemTrend = (itemId: string): MarketTrend | null => {
    const def = getItemById(itemId)
    if (!def) return null
    const info = todayMarket.value.find(m => m.category === def.category)
    return info?.trend ?? null
  }

  const getItemMultiplier = (itemId: string): number => {
    const def = getItemById(itemId)
    if (!def) return 1
    return todayMarket.value.find(m => m.category === def.category)?.multiplier ?? 1
  }

  const trendColor = (trend: MarketTrend): string => {
    if (trend === 'boom') return 'text-danger'
    if (trend === 'rising') return 'text-success'
    if (trend === 'falling') return 'text-warning'
    if (trend === 'crash') return 'text-danger'
    return 'text-muted/40'
  }

  // mỗilầntiếnvàothương mạivòngtrangmặt，lạiđặtđếnthương mạivòngtổngxem（tránhmiễnnhảyquakinh doanhnghiệpthờigiankiểm trakiểm tra）
  shopStore.currentShopId = null

  // === chuyểntácđầuchuyểnđổi ===

  const mobileTab = ref<'buy' | 'sell'>('buy')

  // === mộtphímrabánxácxác nhận ===

  const showSellAllConfirm = ref(false)

  const confirmSellAll = () => {
    showSellAllConfirm.value = false
    handleSellAll(sellFilter.value)
  }

  // === đạncửa sổhệhệ thống ===

  type BuyModalState = {
    type: 'buy'
    name: string
    description: string
    price: number
    onBuy: () => void
    canBuy: () => boolean
    extraLines?: string[]
    buttonText?: string
    itemId?: string
    batchBuy?: {
      onBuy: (count: number) => void
      maxCount: () => number
    }
  }

  type SellModalState = {
    type: 'sell'
    itemId: string
    quality: Quality
    inventoryIndex: number
  }

  const shopModal = ref<BuyModalState | SellModalState | null>(null)

  const buyModalData = computed(() => {
    if (!shopModal.value || shopModal.value.type !== 'buy') return null
    return shopModal.value
  })

  const sellModalData = computed(() => {
    if (!shopModal.value || shopModal.value.type !== 'sell') return null
    return shopModal.value
  })

  const sellModalItem = computed(() => {
    const data = sellModalData.value
    if (!data) return null
    const item = inventoryStore.items[data.inventoryIndex]
    if (item && item.itemId === data.itemId && item.quality === data.quality) return item
    return inventoryStore.items.find(i => i.itemId === data.itemId && i.quality === data.quality) ?? null
  })

  const sellModalDef = computed(() => {
    const data = sellModalData.value
    if (!data) return null
    return getItemById(data.itemId) ?? null
  })

  const buyQuantity = ref(1)

  const buyTotalPrice = computed(() => {
    if (!buyModalData.value) return 0
    return buyModalData.value.price * buyQuantity.value
  })

  const maxBuyQuantity = computed(() => {
    if (!buyModalData.value?.batchBuy) return 1
    return Math.max(1, buyModalData.value.batchBuy.maxCount())
  })

  const setBuyQuantity = (val: number) => {
    buyQuantity.value = Math.max(1, Math.min(val, maxBuyQuantity.value))
  }

  const addBuyQuantity = (delta: number) => {
    setBuyQuantity(buyQuantity.value + delta)
  }

  const onBuyQuantityInput = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10)
    if (!isNaN(val)) setBuyQuantity(val)
  }

  const getMaxBuyable = (unitPrice: number, stockLimit?: number): number => {
    const affordable = unitPrice > 0 ? Math.floor(playerStore.money / unitPrice) : 0
    let max = Math.max(1, affordable)
    if (stockLimit !== undefined) max = Math.min(max, stockLimit)
    return Math.min(max, 999)
  }

  const openBuyModal = (
    name: string,
    description: string,
    price: number,
    onBuy: () => void,
    canBuy: () => boolean,
    extraLines?: string[],
    buttonText?: string,
    itemId?: string
  ) => {
    shopModal.value = {
      type: 'buy',
      name,
      description,
      price,
      onBuy,
      canBuy,
      extraLines,
      buttonText,
      itemId
    }
  }

  const openBatchBuyModal = (
    name: string,
    description: string,
    unitPrice: number,
    onBuySingle: () => void,
    canBuy: () => boolean,
    batchOnBuy: (count: number) => void,
    batchMaxCount: () => number,
    itemId?: string
  ) => {
    buyQuantity.value = 1
    shopModal.value = {
      type: 'buy',
      name,
      description,
      price: unitPrice,
      onBuy: onBuySingle,
      canBuy,
      batchBuy: { onBuy: batchOnBuy, maxCount: batchMaxCount },
      itemId
    }
  }

  const sellQuantity = ref(1)

  const sellUnitPrice = computed(() => {
    const data = sellModalData.value
    if (!data) return 0
    return shopStore.calculateSellPrice(data.itemId, 1, data.quality)
  })

  const sellTotalPrice = computed(() => {
    return sellUnitPrice.value * sellQuantity.value
  })

  const maxSellQuantity = computed(() => {
    const item = sellModalItem.value
    if (!item) return 1
    return item.quantity
  })

  const setSellQuantity = (val: number) => {
    sellQuantity.value = Math.max(1, Math.min(val, maxSellQuantity.value))
  }

  const addSellQuantity = (delta: number) => {
    setSellQuantity(sellQuantity.value + delta)
  }

  const onSellQuantityInput = (e: Event) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10)
    if (!isNaN(val)) setSellQuantity(val)
  }

  const openSellModal = (itemId: string, quality: Quality, inventoryIndex: number) => {
    sellQuantity.value = 1
    shopModal.value = { type: 'sell', itemId, quality, inventoryIndex }
  }

  const openWeaponModal = (w: WeaponDef) => {
    const lines = [`${WEAPON_TYPE_NAMES[w.type]} · Tấn công ${w.attack} · Chí mạng ${Math.round(w.critRate * 100)}%`]
    if (w.shopMaterials.length > 0) {
      lines.push('Cần nguyên liệu:' + w.shopMaterials.map(m => `${getItemById(m.itemId)?.name ?? m.itemId}×${m.quantity}`).join('、'))
    }
    openBuyModal(
      w.name,
      w.description,
      discounted(w.shopPrice!),
      () => handleBuyWeapon(w),
      () => !inventoryStore.hasWeapon(w.id) && playerStore.money >= discounted(w.shopPrice!) && hasWeaponMaterials(w),
      lines
    )
  }

  const openRingModal = (ring: RingDef) => {
    const lines = [
      'Hiệu ứng:' +
        ring.effects
          .map(eff => RING_EFFECT_LABELS[eff.type] + (eff.value > 0 && eff.value < 1 ? Math.round(eff.value * 100) + '%' : '+' + eff.value))
          .join('、'),
      'Nguyên liệu:' +
        (ring.recipe?.map(m => `${getItemById(m.itemId)?.name ?? m.itemId}×${m.quantity}`).join('、') ?? '') +
        ` + ${ring.recipeMoney} văn`
    ]
    openBuyModal(
      ring.name,
      ring.description,
      ring.recipeMoney,
      () => handleCraftRing(ring.id),
      () => canCraftRing(ring),
      lines,
      'Chế tạo'
    )
  }

  const handleModalSell = (count: number) => {
    const modal = shopModal.value
    if (!modal || modal.type !== 'sell') return
    if (count === 1) {
      handleSellItem(modal.itemId, modal.quality)
    } else {
      handleSellItemAll(modal.itemId, count, modal.quality)
    }
    // vậtphẩmtiêuhaohoànthìquan hệđóngđạncửa sổ，khôngthìsửađúngrabánsốlượng
    const remaining = inventoryStore.items.find(i => i.itemId === modal.itemId && i.quality === modal.quality)
    if (!remaining) {
      shopModal.value = null
    } else if (sellQuantity.value > remaining.quantity) {
      sellQuantity.value = remaining.quantity
    }
  }

  // === giảmgiảmhệhệ thống ===

  const hasDiscount = computed(() => walletStore.getShopDiscount() > 0 || inventoryStore.getRingEffectValue('shop_discount') > 0)
  const discountPercent = computed(() => {
    const w = walletStore.getShopDiscount()
    const r = inventoryStore.getRingEffectValue('shop_discount')
    return Math.round((1 - (1 - w) * (1 - r)) * 100)
  })

  const discounted = (price: number): number => {
    const walletDiscount = walletStore.getShopDiscount()
    const ringDiscount = inventoryStore.getRingEffectValue('shop_discount')
    return Math.floor(price * (1 - walletDiscount) * (1 - ringDiscount))
  }

  // === bángiáthêm成 ===

  const hasSellBonus = computed(() => inventoryStore.getRingEffectValue('sell_price_bonus') > 0)
  const sellBonusPercent = computed(() => Math.round(inventoryStore.getRingEffectValue('sell_price_bonus') * 100))

  // === thương mạiquánmởđặttrạng tháitrạng thái ===

  const isOpen = (shop: ShopDef): boolean => {
    return isShopAvailable(shop, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  }

  const closedReason = (shop: ShopDef): string => {
    return getShopClosedReason(shop, gameStore.day, gameStore.hour, gameStore.weather, gameStore.season)
  }

  const enterShop = (shopId: string) => {
    shopStore.currentShopId = shopId
  }

  // === du lịchhànhthương mạingười ===

  if (shopStore.isMerchantHere) {
    shopStore.refreshMerchantStock()
  }

  const handleBuyFromTraveler = (itemId: string, name: string, originalPrice: number) => {
    const actualPrice = discounted(originalPrice)
    if (shopStore.buyFromTraveler(itemId)) {
      sfxBuy()
      showFloat(`-${actualPrice} văn`, 'danger')
      addLog(`Đã mua ${name} từ thương nhân du hành. (-${actualPrice} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  // === 万vậtquán ===

  const bagPrice = computed(() => {
    const level = (inventoryStore.capacity - 24) / 4
    return 500 + level * 500
  })

  const farmExpandInfo = computed(() => {
    const prices: Record<number, { newSize: number; price: number }> = {
      4: { newSize: 6, price: 2000 },
      6: { newSize: 8, price: 5000 }
    }
    if (gameStore.farmMapType === 'standard') {
      prices[8] = { newSize: 10, price: 10000 }
    }
    return prices[farmStore.farmSize] ?? null
  })

  const handleBuyBag = () => {
    const actualPrice = discounted(bagPrice.value)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    if (inventoryStore.expandCapacity()) {
      addLog(`Túi mở rộng lên ${inventoryStore.capacity} ô! (-${actualPrice} văn)`)
    } else {
      playerStore.earnMoney(actualPrice)
      addLog('Túi đã đạt cấp tối đa.')
    }
  }

  const warehouseExpandPrice = computed(() => {
    const level = warehouseStore.maxChests - 3
    return 2000 + level * 2000
  })

  const handleBuyWarehouseExpand = () => {
    const actualPrice = discounted(warehouseExpandPrice.value)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    if (warehouseStore.expandMaxChests()) {
      addLog(`Kho mở rộng lên ${warehouseStore.maxChests} ô rương! (-${actualPrice} văn)`)
    } else {
      playerStore.earnMoney(actualPrice)
      addLog('Kho đã đạt cấp tối đa.')
    }
  }

  const handleBuyFarmExpand = () => {
    const info = farmExpandInfo.value
    if (!info) return
    const actualPrice = discounted(info.price)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    const newSize = farmStore.expandFarm()
    if (newSize) {
      addLog(`Nông trại mở rộng lên ${newSize}×${newSize}! (-${actualPrice} văn)`)
    } else {
      playerStore.earnMoney(actualPrice)
      addLog('Nông trại đã đạt cấp tối đa.')
    }
  }

  const seasonName = (season: Season): string => {
    return SEASON_NAMES[season] ?? season
  }

  const getTravelerItemDesc = (itemId: string, quantity: number): string => {
    const crop = getCropBySeedId(itemId)
    if (crop) {
      return `Mùa ${crop.season.map(s => SEASON_NAMES[s]).join('/')} · chín sau ${crop.growthDays} ngày · còn ${quantity} cái`
    }
    return `Còn ${quantity} cái`
  }

  const handleBuySapling = (saplingId: string, price: number, treeName: string) => {
    const actualPrice = discounted(price)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    if (!inventoryStore.addItem(saplingId)) {
      playerStore.earnMoney(actualPrice)
      addLog('Balo đã đầy, không thể mua.')
      return
    }
    addLog(`Đã mua cây giống ${treeName}. (-${actualPrice} văn)`)
  }

  const handleBuyHay = () => {
    const actualPrice = discounted(HAY_PRICE)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    if (!inventoryStore.addItem('hay')) {
      playerStore.earnMoney(actualPrice)
      addLog('Balo đã đầy, không thể mua.')
      return
    }
    addLog(`Đã mua cỏ khô. (-${actualPrice} văn)`)
  }

  // === lôlượngmuamuanơiquản lý ===

  const handleBatchBuySeed = (seedId: string, count: number) => {
    const seed = shopStore.availableSeeds.find(s => s.seedId === seedId)
    if (!seed) return
    const unitPrice = discounted(seed.price)
    if (shopStore.buySeed(seedId, count)) {
      sfxBuy()
      showFloat(`-${unitPrice * count} văn`, 'danger')
      addLog(`Đã mua ${count} hạt giống ${seed.cropName}. (-${unitPrice * count} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  const handleBatchBuyItem = (itemId: string, price: number, name: string, count: number) => {
    const unitPrice = discounted(price)
    if (shopStore.buyItem(itemId, price, count)) {
      sfxBuy()
      showFloat(`-${unitPrice * count} văn`, 'danger')
      addLog(`Đã mua ${count} ${name}. (-${unitPrice * count} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  const handleBatchBuySapling = (saplingId: string, price: number, treeName: string, count: number) => {
    const unitPrice = discounted(price)
    let bought = 0
    for (let i = 0; i < count; i++) {
      if (!playerStore.spendMoney(unitPrice)) break
      if (!inventoryStore.addItem(saplingId)) {
        playerStore.earnMoney(unitPrice)
        break
      }
      bought++
    }
    if (bought > 0) {
      sfxBuy()
      showFloat(`-${unitPrice * bought} văn`, 'danger')
      addLog(`Đã mua ${bought} cây giống ${treeName}. (-${unitPrice * bought} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  const handleBatchBuyFromTraveler = (itemId: string, name: string, originalPrice: number, count: number) => {
    const unitPrice = discounted(originalPrice)
    let bought = 0
    for (let i = 0; i < count; i++) {
      if (!shopStore.buyFromTraveler(itemId)) break
      bought++
    }
    if (bought > 0) {
      sfxBuy()
      showFloat(`-${unitPrice * bought} văn`, 'danger')
      addLog(`Đã mua ${bought} ${name} từ thương nhân du hành. (-${unitPrice * bought} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  // === phi tiêuván ===

  const hasWeaponMaterials = (w: WeaponDef): boolean => {
    for (const mat of w.shopMaterials) {
      if (inventoryStore.getItemCount(mat.itemId) < mat.quantity) return false
    }
    return true
  }

  const handleBuyWeapon = (w: WeaponDef) => {
    if (inventoryStore.hasWeapon(w.id)) {
      addLog('Bạn đã sở hữu vũ khí này.')
      return
    }
    if (w.shopPrice === null) return
    const actualPrice = discounted(w.shopPrice)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    for (const mat of w.shopMaterials) {
      if (!inventoryStore.removeItem(mat.itemId, mat.quantity)) {
        playerStore.earnMoney(actualPrice)
        addLog('Không đủ nguyên liệu.')
        return
      }
    }
    inventoryStore.addWeapon(w.id)
    const matStr =
      w.shopMaterials.length > 0 ? ' + ' + w.shopMaterials.map(m => `${getItemById(m.itemId)?.name}×${m.quantity}`).join(' + ') : ''
    addLog(`Đã mua ${w.name}. (-${actualPrice} văn${matStr})`)
  }

  // === Hợp thành nhẫn ===

  const RING_EFFECT_LABELS: Record<RingEffectType, string> = {
    attack_bonus: 'Tấn công',
    crit_rate_bonus: 'Chí mạng',
    defense_bonus: 'Giảm sát thương',
    vampiric: 'Hút Máu',
    max_hp_bonus: 'Sinh lực',
    stamina_reduction: 'Giảm thể lực toàn cục',
    mining_stamina: 'Giảm thể lực khai mỏ',
    farming_stamina: 'Giảm thể lực làm ruộng',
    fishing_stamina: 'Giảm thể lực câu cá',
    crop_quality_bonus: 'Phẩm chất nông sản',
    crop_growth_bonus: 'Tăng tốc sinh trưởng',
    fish_quality_bonus: 'Chất lượng cá',
    fishing_calm: 'Giảm tốc độ cá',
    sell_price_bonus: 'Tăng giá bán',
    shop_discount: 'Giảm giá cửa hàng',
    gift_friendship: 'Hảo cảm khi tặng quà',
    monster_drop_bonus: 'Rơi đồ quái vật',
    exp_bonus: 'Cộng thêm kinh nghiệm',
    treasure_find: 'Tỷ lệ rương báu',
    ore_bonus: 'Quặng thêm',
    luck: 'May Mắn',
    travel_speed: 'Tăng tốc hành trình'
  }

  const craftableRings = computed(() => CRAFTABLE_RINGS)

  const canCraftRing = (ring: RingDef): boolean => {
    if (!ring.recipe) return false
    if (playerStore.money < ring.recipeMoney) return false
    for (const mat of ring.recipe) {
      if (inventoryStore.getItemCount(mat.itemId) < mat.quantity) return false
    }
    return true
  }

  const handleCraftRing = (defId: string) => {
    const result = inventoryStore.craftRing(defId)
    if (result.success) {
      sfxBuy()
      showFloat(result.message, 'success')
      addLog(result.message)
    } else {
      addLog(result.message)
    }
  }

  // === mũcon/giàyconthương mạicửa hàng ===

  const formatEffectLabel = (eff: { type: RingEffectType; value: number }): string => {
    const label = RING_EFFECT_LABELS[eff.type]
    return label + (eff.value > 0 && eff.value < 1 ? Math.round(eff.value * 100) + '%' : '+' + eff.value)
  }

  const openHatShopModal = (hat: HatDef) => {
    const lines = ['Hiệu ứng:' + hat.effects.map(formatEffectLabel).join('、')]
    openBuyModal(
      hat.name,
      hat.description,
      discounted(hat.shopPrice!),
      () => handleBuyHat(hat),
      () => !inventoryStore.hasHat(hat.id) && playerStore.money >= discounted(hat.shopPrice!),
      lines
    )
  }

  const openShoeShopModal = (shoe: ShoeDef) => {
    const lines = ['Hiệu ứng:' + shoe.effects.map(formatEffectLabel).join('、')]
    openBuyModal(
      shoe.name,
      shoe.description,
      discounted(shoe.shopPrice!),
      () => handleBuyShoe(shoe),
      () => !inventoryStore.hasShoe(shoe.id) && playerStore.money >= discounted(shoe.shopPrice!),
      lines
    )
  }

  const openHatCraftModal = (hat: HatDef) => {
    const lines = [
      'Hiệu ứng:' + hat.effects.map(formatEffectLabel).join('、'),
      'Nguyên liệu:' +
        (hat.recipe?.map(m => `${getItemById(m.itemId)?.name ?? m.itemId}×${m.quantity}`).join('、') ?? '') +
        ` + ${hat.recipeMoney} văn`
    ]
    openBuyModal(
      hat.name,
      hat.description,
      hat.recipeMoney,
      () => handleCraftHat(hat.id),
      () => canCraftHat(hat),
      lines,
      'Chế tạo'
    )
  }

  const openShoeCraftModal = (shoe: ShoeDef) => {
    const lines = [
      'Hiệu ứng:' + shoe.effects.map(formatEffectLabel).join('、'),
      'Nguyên liệu:' +
        (shoe.recipe?.map(m => `${getItemById(m.itemId)?.name ?? m.itemId}×${m.quantity}`).join('、') ?? '') +
        ` + ${shoe.recipeMoney} văn`
    ]
    openBuyModal(
      shoe.name,
      shoe.description,
      shoe.recipeMoney,
      () => handleCraftShoe(shoe.id),
      () => canCraftShoe(shoe),
      lines,
      'Chế tạo'
    )
  }

  const handleBuyHat = (hat: HatDef) => {
    if (inventoryStore.hasHat(hat.id)) {
      addLog('Bạn đã sở hữu chiếc mũ này.')
      return
    }
    if (hat.shopPrice === null) return
    const actualPrice = discounted(hat.shopPrice)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    inventoryStore.addHat(hat.id)
    sfxBuy()
    showFloat(`-${actualPrice} văn`, 'danger')
    addLog(`Đã mua ${hat.name}. (-${actualPrice} văn)`)
  }

  const handleBuyShoe = (shoe: ShoeDef) => {
    if (inventoryStore.hasShoe(shoe.id)) {
      addLog('Bạn đã sở hữu đôi giày này.')
      return
    }
    if (shoe.shopPrice === null) return
    const actualPrice = discounted(shoe.shopPrice)
    if (!playerStore.spendMoney(actualPrice)) {
      addLog('Không đủ tiền.')
      return
    }
    inventoryStore.addShoe(shoe.id)
    sfxBuy()
    showFloat(`-${actualPrice} văn`, 'danger')
    addLog(`Đã mua ${shoe.name}. (-${actualPrice} văn)`)
  }

  const canCraftHat = (hat: HatDef): boolean => {
    if (!hat.recipe) return false
    if (playerStore.money < hat.recipeMoney) return false
    for (const mat of hat.recipe) {
      if (inventoryStore.getItemCount(mat.itemId) < mat.quantity) return false
    }
    return true
  }

  const canCraftShoe = (shoe: ShoeDef): boolean => {
    if (!shoe.recipe) return false
    if (playerStore.money < shoe.recipeMoney) return false
    for (const mat of shoe.recipe) {
      if (inventoryStore.getItemCount(mat.itemId) < mat.quantity) return false
    }
    return true
  }

  const handleCraftHat = (defId: string) => {
    const result = inventoryStore.craftHat(defId)
    if (result.success) {
      sfxBuy()
      showFloat(result.message, 'success')
      addLog(result.message)
    } else {
      addLog(result.message)
    }
  }

  const handleCraftShoe = (defId: string) => {
    const result = inventoryStore.craftShoe(defId)
    if (result.success) {
      sfxBuy()
      showFloat(result.message, 'success')
      addLog(result.message)
    } else {
      addLog(result.message)
    }
  }

  // === giaodùng ===

  const handleBuyItem = (itemId: string, price: number, name: string) => {
    const actualPrice = discounted(price)
    if (shopStore.buyItem(itemId, price)) {
      addLog(`Đã mua ${name}. (-${actualPrice} văn)`)
    } else {
      addLog('Không đủ tiền hoặc túi đồ đã đầy.')
    }
  }

  const qualityTextClass = (q: Quality, fallback = ''): string => {
    if (q === 'fine') return 'text-quality-fine'
    if (q === 'excellent') return 'text-quality-excellent'
    if (q === 'supreme') return 'text-quality-supreme'
    return fallback
  }

  // === rabánlọcchọn ===

  const SELL_FILTER_CATEGORIES: ItemCategory[] = [
    'crop',
    'fruit',
    'fish',
    'animal_product',
    'processed',
    'food',
    'ore',
    'gem',
    'material',
    'gift',
    'fossil',
    'artifact',
    'misc'
  ]

  const SELL_CATEGORY_NAMES: Partial<Record<ItemCategory, string>> = {
    crop: 'Nông sản',
    fruit: 'Trái cây',
    fish: 'Cá',
    animal_product: 'Chăn nuôi',
    processed: 'Đồ chế biến',
    food: 'Món ăn',
    ore: 'Quặng',
    gem: 'Đá quý',
    material: 'Nguyên liệu',
    gift: 'Quà tặng',
    fossil: 'Hóa thạch',
    artifact: 'Cổ vật',
    misc: 'Tạp hóa'
  }

  const showSellFilterModal = ref(false)
  const sellFilter = ref<ItemCategory[]>([])
  const tempSellFilter = ref<Set<ItemCategory>>(new Set())

  const isSellFilterActive = computed(() => sellFilter.value.length > 0)

  const openSellFilterModal = () => {
    tempSellFilter.value = new Set(sellFilter.value)
    showSellFilterModal.value = true
  }

  const toggleSellCategory = (cat: ItemCategory) => {
    if (tempSellFilter.value.has(cat)) {
      tempSellFilter.value.delete(cat)
    } else {
      tempSellFilter.value.add(cat)
    }
  }

  const handleSaveSellFilter = () => {
    sellFilter.value = [...tempSellFilter.value]
    showSellFilterModal.value = false
  }

  const handleClearSellFilter = () => {
    tempSellFilter.value = new Set()
  }

  const sellableItems = computed(() => {
    const allowed = sellFilter.value.length > 0 ? new Set(sellFilter.value) : null
    return inventoryStore.items
      .map((inv, index) => {
        const def = getItemById(inv.itemId)
        return { ...inv, def, originalIndex: index }
      })
      .filter(item => item.def && !item.def.protected && !item.locked && (!allowed || allowed.has(item.def!.category)))
  })
</script>

<!-- ShopHeader 内联子组件 -->
<script lang="ts">
  import { defineComponent, h } from 'vue'

  const ShopHeader = defineComponent({
    name: 'ShopHeader',
    props: {
      name: { type: String, required: true },
      npc: { type: String, required: true }
    },
    setup(props) {
      return () =>
        h('div', { class: 'flex items-center space-x-2 mb-3' }, [
          h('h3', { class: 'text-accent text-sm' }, [`${props.name} · ${props.npc}`])
        ])
    }
  })

  export default { components: { ShopHeader } }
</script>
