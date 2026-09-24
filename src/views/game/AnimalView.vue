<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-accent text-sm">
        <Home :size="14" class="inline" />
        Mục trường
      </h3>
      <Button v-if="unpettedCount > 0" :icon="Hand" @click="handlePetAll">mộtphímvuốtve（{{ unpettedCount }}con）</Button>
    </div>

    <!-- 每日例行操作放在最上面，免得为了喂食放牧来回翻屏 -->
    <div v-if="animalStore.animals.length > 0" class="flex flex-wrap mb-3">
      <Button class="mr-1 mb-1" :icon="Wheat" :icon-size="12" :disabled="unfedCount === 0" @click="unfedCount > 0 && handleFeedAll()">
        {{ unfedCount > 0 ? `Cho tất cả ăn (${unfedCount} con)` : 'Đã cho ăn hết' }}
      </Button>
      <Button class="mr-1 mb-1" :icon="Sun" :icon-size="12" :disabled="!canGrazeOrFeed" @click="canGrazeOrFeed && handleGraze()">
        {{ grazeButtonLabel }}
      </Button>
    </div>

    <p v-if="tutorialHint" class="text-[10px] text-muted/50 mb-2">
      {{ tutorialHint }}
    </p>

    <!-- 宠物区域 -->
    <div class="mb-4 border border-accent/20 rounded-xs p-3">
      <p class="text-xs text-muted mb-2">Thú nuôi</p>
      <template v-if="animalStore.pet">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-1 min-w-0 mr-2">
            <template v-if="renamingId === 'pet'">
              <input
                v-model="renameInput"
                class="bg-bg border border-accent/30 rounded-xs px-1 py-0.5 text-xs text-text w-20 focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                maxlength="8"
                @keyup.enter="confirmRename"
                @keyup.escape="cancelRename"
              />
              <Button class="btn-compact" @click="confirmRename">Xác nhận</Button>
              <Button class="btn-compact" @click="cancelRename">Hủy</Button>
            </template>
            <template v-else>
              <span class="text-xs text-accent truncate">
                {{ animalStore.pet.type === 'cat' ? 'Mèo' : 'Chó' }} — {{ animalStore.pet.name }}
              </span>
              <button class="text-muted hover:text-accent shrink-0" @click="startRename('pet', animalStore.pet!.name)">
                <Pencil :size="10" />
              </button>
            </template>
          </div>
          <Button class="btn-compact" :icon="Hand" :icon-size="12" :disabled="animalStore.pet.wasPetted" @click="handlePetThePet">
            {{ animalStore.pet.wasPetted ? 'Đã vuốt ve' : 'Vuốt ve' }}
          </Button>
        </div>
        <div class="flex items-center space-x-1">
          <span class="text-[10px] text-muted w-6">Hảo cảm</span>
          <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs bg-danger transition-all"
              :style="{
                width: Math.floor(animalStore.pet.friendship / 10) + '%'
              }"
            />
          </div>
          <span class="text-[10px] text-muted">{{ animalStore.pet.friendship }}/1000</span>
        </div>
        <p v-if="animalStore.pet.friendship >= 800" class="text-xs text-success mt-1">hảo cảmđộrấtcao，mỗingàycómáyhộithavề thu háithậpvật！</p>
      </template>
      <div v-else class="flex flex-col items-center justify-center py-6 text-muted">
        <Home :size="32" class="mb-2" />
        <p class="text-xs">Chưa có thú nuôi</p>
        <p class="text-[10px] mt-1">Sau khi chuyển vào ở, sau 7 ngày sẽ có động vật nhỏ đến thăm.</p>
      </div>
    </div>

    <!-- 畜舍列表 (鸡舍和牲口棚) -->
    <div v-for="bDef in mainBuildings" :key="bDef.type" class="mb-4 border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-accent">{{ getBuildingDisplayName(bDef.type) }}</span>
        <div v-if="isBuildingBuilt(bDef.type)" class="flex items-center space-x-2">
          <span class="text-xs text-muted">{{ getAnimalsInBuilding(bDef.type).length }}/{{ getBuildingCapacity(bDef.type) }}</span>
          <Button v-if="getBuildingLevel(bDef.type) < 3" :icon="ArrowUp" @click="openUpgradeModal(bDef.type)">Nâng cấp</Button>
        </div>
        <Button v-else :icon="Hammer" @click="handleBuildBuilding(bDef.type)">xâyxây ({{ bDef.cost }}văn)</Button>
      </div>

      <template v-if="isBuildingBuilt(bDef.type)">
        <p v-if="animalStore.hasAutoPetter(bDef.type)" class="text-[10px] text-success mb-2">Máy vuốt ve tự động đang chạy — mỗi ngày tự động vuốt ve tất cả động vật</p>
        <!-- 鸡舍孵化器（鸡舍2级以上） -->
        <div v-if="bDef.type === 'coop' && getBuildingLevel('coop') >= 2" class="mb-3 p-2 border border-accent/10 rounded-xs">
          <p class="text-xs text-accent mb-1">
            <Egg :size="14" class="inline" />
            Máy ấp trứng
          </p>
          <div v-if="animalStore.incubating">
            <p class="text-xs text-muted">
              Đang ấp: {{ getAnimalName(animalStore.incubating.animalType) }}（còncòn{{ animalStore.incubating.daysLeft }}ngày）
            </p>
          </div>
          <div v-else-if="coopIncubatableEggs.length > 0" class="flex flex-col space-y-1">
            <div
              v-for="eggItem in coopIncubatableEggs"
              :key="eggItem.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleStartIncubation(eggItem.itemId)"
            >
              <span class="text-xs">{{ eggItem.name }}</span>
              <span class="text-xs text-muted">&times;{{ eggItem.count }}</span>
            </div>
          </div>
          <p v-else class="text-xs text-muted">Túi đồtrongkhông cócó thể ấphóa của trứng。</p>
        </div>

        <!-- 牲口棚孵化器（牲口棚2级以上） -->
        <div v-if="bDef.type === 'barn' && getBuildingLevel('barn') >= 2" class="mb-3 p-2 border border-accent/10 rounded-xs">
          <p class="text-xs text-accent mb-1">
            <Egg :size="14" class="inline" />
            Máy ấp trứng
          </p>
          <div v-if="animalStore.barnIncubating">
            <p class="text-xs text-muted">
              Đang ấp: {{ getAnimalName(animalStore.barnIncubating.animalType) }}（còncòn{{ animalStore.barnIncubating.daysLeft }}ngày）
            </p>
          </div>
          <div v-else-if="barnIncubatableEggs.length > 0" class="flex flex-col space-y-1">
            <div
              v-for="eggItem in barnIncubatableEggs"
              :key="eggItem.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleStartBarnIncubation(eggItem.itemId)"
            >
              <span class="text-xs">{{ eggItem.name }}</span>
              <span class="text-xs text-muted">&times;{{ eggItem.count }}</span>
            </div>
          </div>
          <p v-else class="text-xs text-muted">Trong Túi đồ không có trứng có thể ấp trong chuồng gia súc.</p>
        </div>

        <!-- 购买动物按钮 -->
        <Button class="w-full md:w-auto mb-3" :icon="ShoppingCart" @click="buyListBuilding = bDef.type">Mua động vật</Button>

        <!-- 动物列表 -->
        <div v-if="getAnimalsInBuilding(bDef.type).length > 0" class="flex flex-col space-y-1 max-h-60 overflow-y-auto">
          <div v-for="animal in getAnimalsInBuilding(bDef.type)" :key="animal.id" class="border border-accent/10 rounded-xs p-2 mr-1">
            <!-- 名字与按钮组允许换行：小屏放不下时按钮组整体落到thứ二行，不再把按钮挤成竖排 -->
            <div class="flex flex-wrap items-center justify-between mb-1 -mt-1">
              <div class="flex items-center space-x-1 min-w-0 mr-2 mt-1">
                <template v-if="renamingId === animal.id">
                  <input
                    v-model="renameInput"
                    class="bg-bg border border-accent/30 rounded-xs px-1 py-0.5 text-xs text-text w-20 focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                    maxlength="8"
                    @keyup.enter="confirmRename"
                    @keyup.escape="cancelRename"
                  />
                  <Button class="btn-compact" @click="confirmRename">Xác nhận</Button>
                  <Button class="btn-compact" @click="cancelRename">Hủy</Button>
                </template>
                <template v-else>
                  <span class="text-xs text-accent truncate">{{ animal.name }}</span>
                  <button class="text-muted hover:text-accent shrink-0" @click="startRename(animal.id, animal.name)">
                    <Pencil :size="10" />
                  </button>
                </template>
              </div>
              <div class="flex items-center space-x-1 shrink-0 ml-auto mt-1">
                <Button
                  class="btn-compact"
                  :icon="Apple"
                  :icon-size="12"
                  :disabled="animal.wasFed"
                  @click="handleFeedAnimal(animal.id, animal.name)"
                >
                  {{ animal.wasFed ? 'Đã cho ăn' : 'Cho ăn' }}
                </Button>
                <Button class="btn-compact" :icon="Hand" :icon-size="12" :disabled="animal.wasPetted" @click="handlePetAnimal(animal.id)">
                  {{ animal.wasPetted ? 'Đã vuốt ve' : 'Vuốt ve' }}
                </Button>
                <Button
                  class="btn-compact"
                  :icon="Coins"
                  :icon-size="12"
                  @click="
                    sellTarget = {
                      id: animal.id,
                      name: animal.name,
                      type: animal.type
                    }
                  "
                >
                  Bán
                </Button>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="flex items-center space-x-1">
                <span class="text-[10px] text-muted w-6">Hảo cảm</span>
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div class="h-full rounded-xs bg-danger transition-all" :style="{ width: Math.floor(animal.friendship / 10) + '%' }" />
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <span class="text-[10px] text-muted w-6">Tâm trạng</span>
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs transition-all"
                    :class="getMoodBarColor(animal.mood)"
                    :style="{
                      width: Math.floor((animal.mood / 255) * 100) + '%'
                    }"
                  />
                </div>
                <span class="text-[10px] text-muted w-6">{{ getMoodText(animal.mood) }}</span>
              </div>
              <div v-if="animal.hunger > 0" class="flex items-center space-x-1">
                <span class="text-[10px] text-muted w-6">Đói</span>
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs bg-danger transition-all"
                    :style="{
                      width: Math.floor((animal.hunger / 7) * 100) + '%'
                    }"
                  />
                </div>
                <span class="text-[10px] text-danger w-6">{{ animal.hunger }}ngày</span>
              </div>
            </div>
            <div v-if="animal.sick" class="flex items-center justify-between mt-0.5">
              <p class="text-[10px] text-danger">sinhBệnhtrong({{ animal.sickDays }}/5ngày)</p>
              <Button
                class="btn-compact"
                :icon="Syringe"
                :icon-size="12"
                :disabled="medicineCount <= 0"
                @click="handleHealAnimal(animal.id, animal.name)"
              >
                Điều trị
              </Button>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6">
          <Home :size="36" class="text-accent/20 mb-2" />
          <p class="text-xs text-muted">tạmkhông động vật</p>
          <p class="text-[10px] text-muted/50 mt-0.5">Hãy mua con non tại cửa hàng để nuôi.</p>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-muted">cầnmuốn：{{ bDef.materialCost.map(m => `${getItemName(m.itemId)}×${m.quantity}`).join('、') }}</p>
      </template>
    </div>

    <!-- 马厩 -->
    <div class="mb-4 border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-accent">Chuồng ngựa</span>
        <div v-if="animalStore.stableBuilt" class="flex items-center space-x-2">
          <span class="text-xs text-muted">{{ animalStore.getHorse ? '1/1' : '0/1' }}</span>
        </div>
        <Button v-else :icon="Hammer" @click="handleBuildBuilding('stable')">xâyxây ({{ stableDef?.cost ?? 10000 }}văn)</Button>
      </div>

      <template v-if="animalStore.stableBuilt">
        <div v-if="animalStore.getHorse" class="border border-accent/10 rounded-xs p-2">
          <div class="flex flex-wrap items-center justify-between mb-1 -mt-1">
            <div class="flex items-center space-x-1 min-w-0 mr-2 mt-1">
              <template v-if="renamingId === animalStore.getHorse.id">
                <input
                  v-model="renameInput"
                  class="bg-bg border border-accent/30 rounded-xs px-1 py-0.5 text-xs text-text w-20 focus:border-accent outline-none placeholder:text-muted/40 transition-colors"
                  maxlength="8"
                  @keyup.enter="confirmRename"
                  @keyup.escape="cancelRename"
                />
                <Button class="btn-compact" @click="confirmRename">Xác nhận</Button>
                <Button class="btn-compact" @click="cancelRename">Hủy</Button>
              </template>
              <template v-else>
                <span class="text-xs text-accent truncate">{{ animalStore.getHorse.name }}</span>
                <span class="text-[10px] text-muted whitespace-nowrap">{{ animalStore.horseBreedDef.name }}</span>
                <button
                  class="text-muted hover:text-accent shrink-0"
                  @click="startRename(animalStore.getHorse!.id, animalStore.getHorse!.name)"
                >
                  <Pencil :size="10" />
                </button>
              </template>
            </div>
            <div class="flex items-center space-x-1 shrink-0 ml-auto mt-1">
              <Button
                class="btn-compact"
                :icon="Apple"
                :icon-size="12"
                :disabled="animalStore.getHorse.wasFed"
                @click="handleFeedAnimal(animalStore.getHorse.id, animalStore.getHorse.name)"
              >
                {{ animalStore.getHorse.wasFed ? 'Đã cho ăn' : 'Cho ăn' }}
              </Button>
              <Button
                class="btn-compact"
                :icon="Hand"
                :icon-size="12"
                :disabled="animalStore.getHorse.wasPetted"
                @click="handlePetAnimal(animalStore.getHorse.id)"
              >
                {{ animalStore.getHorse.wasPetted ? 'Đã vuốt ve' : 'Vuốt ve' }}
              </Button>
              <Button
                class="btn-compact"
                :icon="Coins"
                :icon-size="12"
                @click="
                  sellTarget = {
                    id: animalStore.getHorse!.id,
                    name: animalStore.getHorse!.name,
                    type: animalStore.getHorse!.type
                  }
                "
              >
                Bán
              </Button>
            </div>
          </div>
          <div class="space-y-0.5">
            <!-- 把马的实际收益写明：品种和好感都会影响赶路与放牧 -->
            <p class="text-[10px] text-muted/70">
              {{ animalStore.horseBreedDef.description }}
            </p>
            <p class="text-[10px] text-accent/70">
              đuổiđườnghaothời ×{{ animalStore.getHorseTravelTimeMultiplier().toFixed(2) }} · thểlực ×{{
                animalStore.getHorseTravelStaminaMultiplier().toFixed(2)
              }}
              · đặtchăn thảhợp tácgiúp
              {{ Math.round(animalStore.getHorseGrazeBonusChance() * 100) }}%
            </p>
            <p class="text-[10px] text-muted/50">Cho ăn và vuốt ve để tăng hảo cảm; hảo cảm càng cao thì đi lại càng tiết kiệm sức và chăn thả càng mang về nhiều sản phẩm.</p>
            <div class="flex items-center space-x-1">
              <span class="text-[10px] text-muted w-6">Hảo cảm</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs bg-danger transition-all"
                  :style="{
                    width: Math.floor(animalStore.getHorse.friendship / 10) + '%'
                  }"
                />
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <span class="text-[10px] text-muted w-6">Tâm trạng</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs transition-all"
                  :class="getMoodBarColor(animalStore.getHorse.mood)"
                  :style="{
                    width: Math.floor((animalStore.getHorse.mood / 255) * 100) + '%'
                  }"
                />
              </div>
              <span class="text-[10px] text-muted w-6">{{ getMoodText(animalStore.getHorse.mood) }}</span>
            </div>
            <div v-if="animalStore.getHorse.hunger > 0" class="flex items-center space-x-1">
              <span class="text-[10px] text-muted w-6">Đói</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs bg-danger transition-all"
                  :style="{
                    width: Math.floor((animalStore.getHorse.hunger / 7) * 100) + '%'
                  }"
                />
              </div>
              <span class="text-[10px] text-danger w-6">{{ animalStore.getHorse.hunger }}ngày</span>
            </div>
          </div>
          <div v-if="animalStore.getHorse.sick" class="flex items-center justify-between mt-0.5">
            <p class="text-[10px] text-danger">sinhBệnhtrong({{ animalStore.getHorse.sickDays }}/5ngày)</p>
            <Button
              class="py-0 px-1"
              :icon="Syringe"
              :disabled="medicineCount <= 0"
              @click="handleHealAnimal(animalStore.getHorse!.id, animalStore.getHorse!.name)"
            >
              Điều trị
            </Button>
          </div>
          <p class="text-xs text-success mt-1">Cưỡi ngựa đi lại, giảm 30% thời gian di chuyển.</p>
        </div>
        <div v-else>
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
            @click="
              openBuyModal(
                {
                  type: 'horse' as AnimalType,
                  name: 'Ngựa',
                  building: 'stable' as AnimalBuildingType,
                  cost: 5000,
                  productId: '',
                  productName: 'Không có',
                  produceDays: 0,
                  friendship: { min: 0, max: 1000 }
                },
                'stable'
              )
            "
          >
            <span class="text-xs">Ngựa</span>
            <span class="text-xs text-accent whitespace-nowrap">5000văn</span>
          </div>
          <p class="text-xs text-muted mt-1">Có ngựa sẽ giảm 30% thời gian di chuyển.</p>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-muted">
          cầnmuốn：{{ stableDef?.materialCost.map(m => `${getItemName(m.itemId)}×${m.quantity}`).join('、') ?? '' }}
        </p>
        <p class="text-xs text-muted mt-1">Có ngựa sẽ giảm 30% thời gian di chuyển.</p>
      </template>
    </div>

    <!-- 饲养管理 -->
    <div class="border border-accent/20 rounded-xs p-3">
      <h3 class="text-accent text-sm mb-3">
        <Apple :size="14" class="inline" />
        thức ănnuôiquản lýquản lý
      </h3>

      <!-- 饲料选择 -->
      <div class="mb-3">
        <p class="text-xs text-muted mb-1">Chọn thức ăn</p>
        <div class="flex flex-col space-y-1">
          <div
            v-for="feed in feedCounts"
            :key="feed.id"
            class="flex items-center justify-between border rounded-xs px-3 py-1.5 cursor-pointer"
            :class="selectedFeed === feed.id ? 'border-accent bg-accent/10' : 'border-accent/20 hover:bg-accent/5'"
            @click="selectedFeed = feed.id"
          >
            <div class="flex items-center space-x-2">
              <span class="text-xs" :class="selectedFeed === feed.id ? 'text-accent' : ''">{{ feed.name }}</span>
              <span class="text-[10px] text-muted">{{ feed.description }}</span>
            </div>
            <span class="text-xs text-muted">{{ feed.count }}</span>
          </div>
        </div>
      </div>

      <!-- 喂食 -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted">Cho ăn</p>
          <span class="text-xs text-muted">{{ selectedFeedName }}kholưu：{{ selectedFeedCount }}</span>
        </div>
        <div class="flex flex-col space-y-1">
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
            :class="unfedCount > 0 ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
            @click="unfedCount > 0 && handleFeedAll()"
          >
            <span class="text-xs">Cho tất cả ăn</span>
            <span class="text-xs text-muted">Cần {{ selectedFeedName }} × {{ unfedCount }}</span>
          </div>
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
            :class="playerStore.money >= selectedFeedPrice ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
            @click="playerStore.money >= selectedFeedPrice && handleBuyFeed()"
          >
            <span class="text-xs">Mua {{ selectedFeedName }}</span>
            <span class="text-xs text-accent">{{ selectedFeedPrice }}văn</span>
          </div>
        </div>
      </div>

      <!-- 放牧 -->
      <div>
        <p class="text-xs text-muted mb-1">đặtchăn thả</p>
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
          :class="canGraze ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
          @click="canGraze && handleGraze()"
        >
          <span class="text-xs">Chăn thả tất cả động vật</span>
          <span v-if="grazeDisabledReason" class="text-xs text-muted">{{ grazeDisabledReason }}</span>
        </div>
      </div>

      <!-- Điều trị -->
      <div v-if="sickCount > 0" class="mt-3">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted">Điều trị</p>
          <span class="text-xs text-muted">Thuốc thú y trong kho: {{ medicineCount }}</span>
        </div>
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
          :class="medicineCount > 0 ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
          @click="medicineCount > 0 && handleHealAll()"
        >
          <span class="text-xs">Điều trịTất cảsinhBệnhđộng vật</span>
          <span class="text-xs text-muted">Cần thuốc thú y × {{ sickCount }}</span>
        </div>
      </div>
    </div>

    <!-- 购买动物列表弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="buyListBuilding"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="buyListBuilding = null"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">Mua động vật</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="buyListBuilding = null" />
          </div>
          <div class="flex flex-col space-y-1">
            <div
              v-for="aDef in getAnimalDefsForBuilding(buyListBuilding)"
              :key="aDef.type"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleSelectAnimalToBuy(aDef)"
            >
              <span class="text-xs">{{ aDef.name }}</span>
              <span class="text-xs text-accent whitespace-nowrap">{{ aDef.cost }}văn</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 购买动物详情弹窗 -->
    <Transition name="panel-fade">
      <div v-if="buyModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4" @click.self="buyModal = null">
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">{{ buyModal.name }}</p>
            <Button class="py-0 px-1" :icon="X" :icon-size="12" @click="buyModal = null" />
          </div>
          <div class="text-xs space-y-1 mb-3 border-b border-accent/20 pb-2">
            <p v-if="buyModal.productName && buyModal.productName !== 'Không có'" class="text-muted">
              sảnra：{{ buyModal.productName }}（mỗi{{ buyModal.produceDays }}ngày）
            </p>
            <p v-else class="text-muted">du lịchhànhThời giangiảmít30%</p>
            <p>giá：{{ buyModal.cost }}văn</p>
          </div>
          <Button class="w-full" :icon="ShoppingCart" :disabled="!buyModal.canBuy()" @click="handleBuyFromModal">Mua</Button>
        </div>
      </div>
    </Transition>

    <!-- 出售动物确认弹窗 -->
    <Transition name="panel-fade">
      <div v-if="sellTarget" class="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4" @click.self="sellTarget = null">
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="sellTarget = null">
            <X :size="14" />
          </button>
          <p class="text-accent text-sm mb-2">bánđộng vật</p>
          <p class="text-xs text-text mb-1">
            xácđịnhmuốnbánrơi
            <span class="text-accent">{{ sellTarget.name }}</span>
            sao？
          </p>
          <p class="text-xs text-muted mb-3">
            Sau khi bán không thể hoàn lại, bạn sẽ nhận được
            <span class="text-accent">{{ sellTargetRefund }}văn</span>
            （nguyêngiámộtmột nửa）。
          </p>
          <div class="flex space-x-2">
            <Button class="flex-1" @click="sellTarget = null">Hủy</Button>
            <Button class="flex-1 !bg-danger !text-text" :icon="Coins" :icon-size="12" @click="confirmSellAnimal">xác nhận bán</Button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 升级畜舍弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="upgradeModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="upgradeModal = null"
      >
        <div class="game-panel max-w-xs w-full relative">
          <button class="absolute top-2 right-2 text-muted hover:text-text" @click="upgradeModal = null">
            <X :size="14" />
          </button>

          <p class="text-sm text-accent mb-2">Nâng cấpgia súcchuồng</p>

          <!-- 当前等级信息 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Hiện tại</span>
              <span class="text-xs">{{ upgradeModal.currentName }}（Lv.{{ upgradeModal.currentLevel }}）</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sức chứa</span>
              <span class="text-xs">{{ upgradeModal.currentCapacity }}con</span>
            </div>
          </div>

          <!-- 升级目标 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Nâng cấp thành</span>
              <span class="text-xs text-accent">{{ upgradeModal.targetName }}（Lv.{{ upgradeModal.targetLevel }}）</span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs text-muted">Sức chứa</span>
              <span class="text-xs text-accent">{{ upgradeModal.targetCapacity }}con</span>
            </div>
          </div>

          <!-- 所需资源 -->
          <div class="border border-accent/10 rounded-xs p-2 mb-3">
            <p class="text-xs text-muted mb-1">Tài nguyên cần thiết</p>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs">Tiền</span>
              <span class="text-xs" :class="playerStore.money >= upgradeModal.cost ? 'text-success' : 'text-danger'">
                {{ playerStore.money }} / {{ upgradeModal.cost }}văn
              </span>
            </div>
            <div v-for="mat in upgradeModal.materials" :key="mat.itemId" class="flex items-center justify-between mt-0.5">
              <span class="text-xs">{{ mat.name }}</span>
              <span class="text-xs" :class="mat.have >= mat.need ? 'text-success' : 'text-danger'">{{ mat.have }} / {{ mat.need }}</span>
            </div>
          </div>

          <Button
            class="w-full justify-center"
            :class="canConfirmUpgrade ? '!bg-accent !text-bg' : 'opacity-50'"
            :icon="ArrowUp"
            :icon-size="12"
            :disabled="!canConfirmUpgrade"
            @click="confirmUpgradeBuilding"
          >
            xácxác nhậntăngcấp
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Hammer, ShoppingCart, Hand, Apple, Home, ArrowUp, Egg, X, Coins, Syringe, Pencil, Wheat, Sun } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import { useAnimalStore } from '@/stores/useAnimalStore'
  import { useGameStore } from '@/stores/useGameStore'
  import { useInventoryStore } from '@/stores/useInventoryStore'
  import { usePlayerStore } from '@/stores/usePlayerStore'
  import { ANIMAL_BUILDINGS, ANIMAL_DEFS, HAY_ITEM_ID, getItemById, getBuildingUpgrade, INCUBATION_MAP, FEED_DEFS } from '@/data'
  import { BUILDING_CAPACITY_PER_LEVEL } from '@/data/animals'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import type { AnimalBuildingType, AnimalType, AnimalDef } from '@/types'
  import { addLog } from '@/composables/useGameLog'
  import { handleEndDay } from '@/composables/useEndDay'
  import { useTutorialStore } from '@/stores/useTutorialStore'

  const animalStore = useAnimalStore()
  const inventoryStore = useInventoryStore()
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  const tutorialStore = useTutorialStore()

  const tutorialHint = computed(() => {
    if (!tutorialStore.enabled || gameStore.year > 1) return null
    const coopBuilt = animalStore.buildings.find(b => b.type === 'coop')?.built ?? false
    const barnBuilt = animalStore.buildings.find(b => b.type === 'barn')?.built ?? false
    if (!coopBuilt && !barnBuilt) return 'Trước tiên hãy tới tiệm Vạn Vật xây chuồng gà hoặc đồng cỏ, sau đó bạn có thể mua và nuôi động vật.'
    if (animalStore.animals.length > 0 && animalStore.animals.every(a => !a.wasPetted))
      return 'Vuốt ve động vật mỗi ngày giúp tăng độ thân thiện; 「Vuốt ve một chạm」 cho phép thao tác hàng loạt.'
    return null
  })

  // === muamuađạncửa sổ ===

  interface BuyAnimalModalData {
    name: string
    productName: string
    produceDays: number
    cost: number
    onBuy: () => void
    canBuy: () => boolean
  }

  const buyModal = ref<BuyAnimalModalData | null>(null)
  const buyListBuilding = ref<AnimalBuildingType | null>(null)

  const handleSelectAnimalToBuy = (aDef: AnimalDef) => {
    if (!buyListBuilding.value) return
    openBuyModal(aDef, buyListBuilding.value)
    buyListBuilding.value = null
  }

  const openBuyModal = (aDef: AnimalDef, buildingType: AnimalBuildingType) => {
    buyModal.value = {
      name: aDef.name,
      productName: aDef.productName,
      produceDays: aDef.produceDays,
      cost: aDef.cost,
      onBuy: () => handleBuyAnimal(aDef.type),
      canBuy: () => {
        if (buildingType === 'stable') return !animalStore.getHorse && playerStore.money >= aDef.cost
        return getAnimalsInBuilding(buildingType).length < getBuildingCapacity(buildingType) && playerStore.money >= aDef.cost
      }
    }
  }

  const handleBuyFromModal = () => {
    if (!buyModal.value) return
    buyModal.value.onBuy()
    buyModal.value = null
  }

  // === rabánxácxác nhậnđạncửa sổ ===

  const sellTarget = ref<{ id: string; name: string; type: AnimalType } | null>(null)

  const sellTargetRefund = computed(() => {
    if (!sellTarget.value) return 0
    const def = ANIMAL_DEFS.find(d => d.type === sellTarget.value!.type)
    return Math.floor((def?.cost ?? 0) / 2)
  })

  const confirmSellAnimal = () => {
    if (!sellTarget.value) return
    const result = animalStore.sellAnimal(sellTarget.value.id)
    sellTarget.value = null
    if (result.success) {
      addLog(`Đã bán ${result.name}, nhận ${result.refund} văn.`)
    }
  }

  // === sốtheotínhtính ===

  /** conhiểnhiển thịgàchuồngvàgia súcmiệngchuồng（ngựachuồngđơnđộc lậprendernhiễm） */
  const mainBuildings = computed(() => ANIMAL_BUILDINGS.filter(b => b.type !== 'stable'))

  /** ngựachuồngxâyxây dựngđịnhnghĩa */
  const stableDef = computed(() => ANIMAL_BUILDINGS.find(b => b.type === 'stable'))

  /** khitrướcchọnchọn的thức ănliệuloàiloại */
  const selectedFeed = ref<string>(HAY_ITEM_ID)

  /** mỗiloàithức ănliệukholưusốlượng */
  const feedCounts = computed(() =>
    FEED_DEFS.map(f => ({
      ...f,
      count: inventoryStore.getItemCount(f.id)
    }))
  )

  /** khitrướcchọntrongthức ănliệu的têngọi */
  const selectedFeedName = computed(() => FEED_DEFS.find(f => f.id === selectedFeed.value)?.name ?? 'Cỏ Khô')

  /** khitrướcchọntrongthức ănliệu的kholưu */
  const selectedFeedCount = computed(() => inventoryStore.getItemCount(selectedFeed.value))

  /** khitrướcchọntrongthức ănliệu的giáô */
  const selectedFeedPrice = computed(() => FEED_DEFS.find(f => f.id === selectedFeed.value)?.price ?? 50)

  /** chưacho ănăntácvậtsốlượng */
  const unfedCount = computed(() => animalStore.animals.filter(a => !a.wasFed).length)

  /** thúthuốckholưusốlượng */
  const medicineCount = computed(() => inventoryStore.getItemCount('animal_medicine'))

  /** sinhbệnhtácvậtsốlượng */
  const sickCount = computed(() => animalStore.animals.filter(a => a.sick).length)

  /** 可đanggàchuồngấphóa的trứngdanh sáchbảng */
  const coopIncubatableEggs = computed(() => {
    const result: { itemId: string; name: string; count: number }[] = []
    for (const [itemId, mapping] of Object.entries(INCUBATION_MAP)) {
      if (mapping.building !== 'coop') continue
      const count = inventoryStore.getItemCount(itemId)
      if (count > 0) {
        const itemDef = getItemById(itemId)
        result.push({ itemId, name: itemDef?.name ?? itemId, count })
      }
    }
    return result
  })

  /** 可đanggia súcmiệngchuồngấphóa的trứngdanh sáchbảng */
  const barnIncubatableEggs = computed(() => {
    const result: { itemId: string; name: string; count: number }[] = []
    for (const [itemId, mapping] of Object.entries(INCUBATION_MAP)) {
      if (mapping.building !== 'barn') continue
      const count = inventoryStore.getItemCount(itemId)
      if (count > 0) {
        const itemDef = getItemById(itemId)
        result.push({ itemId, name: itemDef?.name ?? itemId, count })
      }
    }
    return result
  })

  // === 工công cụthưsố ===

  const getAnimalName = (type: AnimalType): string => {
    return ANIMAL_DEFS.find(d => d.type === type)?.name ?? type
  }

  const getItemName = (itemId: string): string => {
    return getItemById(itemId)?.name ?? itemId
  }

  const isBuildingBuilt = (type: AnimalBuildingType): boolean => {
    return animalStore.buildings.find(b => b.type === type)?.built ?? false
  }

  const getAnimalsInBuilding = (type: AnimalBuildingType) => {
    return animalStore.animals.filter(a => {
      const def = ANIMAL_DEFS.find(d => d.type === a.type)
      return def?.building === type
    })
  }

  const getAnimalDefsForBuilding = (type: AnimalBuildingType) => {
    return ANIMAL_DEFS.filter(d => d.building === type)
  }

  const getBuildingLevel = (type: AnimalBuildingType): number => {
    return animalStore.buildings.find(b => b.type === type)?.level ?? 0
  }

  const getBuildingDisplayName = (type: AnimalBuildingType): string => {
    const level = getBuildingLevel(type)
    if (level >= 2) {
      const upgrade = getBuildingUpgrade(type, level)
      if (upgrade) return upgrade.name
    }
    return ANIMAL_BUILDINGS.find(b => b.type === type)?.name ?? type
  }

  const getBuildingCapacity = (type: AnimalBuildingType): number => {
    const level = getBuildingLevel(type)
    if (type === 'stable') return 1
    return level * BUILDING_CAPACITY_PER_LEVEL
  }

  const getMoodText = (mood: number): string => {
    if (mood > 200) return 'Vui vẻ'
    if (mood > 100) return 'Bình thường'
    return 'Buồn bã'
  }

  const getMoodBarColor = (mood: number): string => {
    if (mood > 200) return 'bg-success'
    if (mood > 100) return 'bg-accent'
    return 'bg-danger'
  }

  // === đặtchăn thả ===

  const canGraze = computed(() => {
    if (animalStore.grazedToday) return false
    if (gameStore.isRainy) return false
    if (gameStore.season === 'winter') {
      return animalStore.animals.some(a => a.wasFed && a.type === 'yak')
    }
    const hasGrazeableAnimals = animalStore.animals.some(a => a.wasFed && a.type !== 'horse')
    return hasGrazeableAnimals
  })

  const grazeDisabledReason = computed(() => {
    if (animalStore.animals.filter(a => a.type !== 'horse').length === 0) return 'Không có gia súc.'
    if (animalStore.grazedToday) return 'Hôm nay đã chăn thả'
    if (gameStore.isRainy) return 'Không thể chăn thả khi trời mưa'
    if (gameStore.season === 'winter') {
      const hasYak = animalStore.animals.some(a => a.wasFed && a.type === 'yak')
      return hasYak ? '' : 'Mùa đông chỉ có bò Tây Tạng được chăn thả'
    }
    if (!animalStore.animals.some(a => a.wasFed && a.type !== 'horse')) return 'Cho ăn trước rồi mới chăn thả'
    return ''
  })

  /**
   * đặtchăn thảnhấnnútlàkhông可điểm。
   * mộtsớmtiếnchăn thảtrậnthờigia súcgia súcđềucònkhôngcho ăn，nhấnnghiêmôquy tắcthìhộithẳngtiếpbiếnxám；nàytrongcho phépcho phép「chưacho ănănnhưngcóthức ănliệu」cũngnăngđiểm，
   * do handleGraze trướctựtáccho ănmộtlượtlạiđặtchăn thả，tiết kiệmrơiđếnvềhailầnthao táclàm。
   */
  const canGrazeOrFeed = computed(() => {
    if (canGraze.value) return true
    if (animalStore.grazedToday || gameStore.isRainy) return false
    if (unfedCount.value === 0) return false
    // đôngngàyconcóyakbònăngđặtchăn thả，khôngyakbòthìkháctựtáccho ănđã
    if (gameStore.season === 'winter' && !animalStore.animals.some(a => a.type === 'yak')) return false
    return selectedFeedCount.value > 0
  })

  const grazeButtonLabel = computed(() => {
    if (canGraze.value) return 'Cho tất cả ra đồng'
    if (canGrazeOrFeed.value) return 'Cho ăn và chăn thả'
    return grazeDisabledReason.value || 'Cho tất cả ra đồng'
  })

  // === tăngcấpđạncửa sổ ===

  interface UpgradeModalData {
    buildingType: AnimalBuildingType
    currentName: string
    currentLevel: number
    currentCapacity: number
    targetName: string
    targetLevel: number
    targetCapacity: number
    cost: number
    materials: { itemId: string; name: string; need: number; have: number }[]
  }

  const upgradeModal = ref<UpgradeModalData | null>(null)

  const openUpgradeModal = (type: AnimalBuildingType) => {
    const level = getBuildingLevel(type)
    const upgrade = getBuildingUpgrade(type, level + 1)
    if (!upgrade) return
    upgradeModal.value = {
      buildingType: type,
      currentName: getBuildingDisplayName(type),
      currentLevel: level,
      currentCapacity: level * BUILDING_CAPACITY_PER_LEVEL,
      targetName: upgrade.name,
      targetLevel: upgrade.level,
      targetCapacity: upgrade.capacity,
      cost: upgrade.cost,
      materials: upgrade.materialCost.map(m => ({
        itemId: m.itemId,
        name: getItemName(m.itemId),
        need: m.quantity,
        have: inventoryStore.getItemCount(m.itemId)
      }))
    }
  }

  const canConfirmUpgrade = computed(() => {
    if (!upgradeModal.value) return false
    if (playerStore.money < upgradeModal.value.cost) return false
    return upgradeModal.value.materials.every(m => inventoryStore.getItemCount(m.itemId) >= m.need)
  })

  const confirmUpgradeBuilding = () => {
    if (!upgradeModal.value) return
    const type = upgradeModal.value.buildingType
    const targetName = upgradeModal.value.targetName
    const targetCapacity = upgradeModal.value.targetCapacity
    upgradeModal.value = null
    const success = animalStore.upgradeBuilding(type)
    if (success) {
      addLog(`Nâng cấp thành công thành ${targetName}! Sức chứa tăng lên ${targetCapacity}.`)
      const tr = gameStore.advanceTime(2)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Nâng cấp thất bại, hãy kiểm tra tiền và nguyên liệu.')
    }
  }

  // === thao táclàmnơiquản lý ===

  const handleBuildBuilding = (type: AnimalBuildingType) => {
    const success = animalStore.buildBuilding(type)
    const bDef = ANIMAL_BUILDINGS.find(b => b.type === type)
    if (success) {
      addLog(`Xây thành công ${bDef?.name ?? 'chuồng'}!`)
      const tr = gameStore.advanceTime(2)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog(`Xây ${bDef?.name ?? 'chuồng'} thất bại, hãy kiểm tra tiền và nguyên liệu.`)
    }
  }

  const handleBuyAnimal = (type: AnimalType) => {
    const aDef = ANIMAL_DEFS.find(d => d.type === type)
    if (!aDef) return
    const count = animalStore.animals.filter(a => a.type === type).length
    const defaultName = `${aDef.name}${count + 1}`
    const success = animalStore.buyAnimal(type, defaultName)
    if (success) {
      addLog(`Đã mua một ${aDef.name}, đặt tên 「${defaultName}」.`)
    } else {
      addLog(`Mua ${aDef.name} thất bại, hãy kiểm tra tiền và sức chứa chuồng.`)
    }
  }

  const handlePetAnimal = (id: string) => {
    const success = animalStore.petAnimal(id)
    if (success) {
      const animal = animalStore.animals.find(a => a.id === id)
      addLog(`Đã vuốt ve ${animal?.name ?? 'động vật'}, độ thân thiện tăng.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.petAnimal)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Hôm nay đã vuốt ve rồi.')
    }
  }

  const handlePetThePet = () => {
    const success = animalStore.petThePet()
    if (success) {
      addLog(`Đã vuốt ve ${animalStore.pet?.name ?? 'thú cưng'}, hảo cảm +5.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.petAnimal)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Hôm nay đã vuốt ve rồi.')
    }
  }

  const unpettedCount = computed(() => {
    let count = animalStore.animals.filter(a => !a.wasPetted).length
    if (animalStore.pet && !animalStore.pet.wasPetted) count++
    return count
  })

  const handlePetAll = () => {
    const STAMINA_COST = 2
    if (!playerStore.consumeStamina(STAMINA_COST)) {
      addLog('Không đủ thể lực để vuốt ve một chạm.')
      return
    }
    const count = animalStore.petAllAnimals()
    if (count > 0) {
      addLog(`Đã vuốt ve ${count} động vật một lượt, tất cả đều rất vui!`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.batchPet)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('Hôm nay đã vuốt ve tất cả rồi.')
    }
  }

  const handleStartIncubation = (itemId: string) => {
    const result = animalStore.startIncubation(itemId)
    addLog(result.message)
  }

  const handleStartBarnIncubation = (itemId: string) => {
    const result = animalStore.startBarnIncubation(itemId)
    addLog(result.message)
  }

  const handleFeedAnimal = (animalId: string, animalName: string) => {
    const success = animalStore.feedAnimal(animalId, selectedFeed.value)
    if (success) {
      addLog(`Dùng ${selectedFeedName.value} cho ${animalName} ăn.`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.petAnimal)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog(`Không đủ ${selectedFeedName.value}, không thể cho ăn.`)
    }
  }

  const handleFeedAll = () => {
    const result = animalStore.feedAll(selectedFeed.value)
    const feedName = selectedFeedName.value
    if (result.fedCount > 0) {
      addLog(`Dùng ${feedName} cho ${result.fedCount} động vật ăn.`)
    }
    if (result.noFeedCount > 0) {
      addLog(`Không đủ ${feedName}, ${result.noFeedCount} động vật chưa được cho ăn.`)
    }
    if (result.fedCount === 0 && result.noFeedCount === 0) {
      addLog('Hôm nay tất cả động vật đã được cho ăn.')
    }
    if (result.fedCount > 0) {
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.feedAnimals)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    }
  }

  const handleBuyFeed = () => {
    const feed = FEED_DEFS.find(f => f.id === selectedFeed.value)
    if (!feed) return
    // kiểm trakiểm tralưnggóichínhkhulàkhôngcólépgian（đãcócùngloàikhohoặccólépvị trí），phòngdừngtrànrađếntạmthờilưnggóidẫnđếnkhôngphápkhiếndùng
    const hasStack = inventoryStore.items.some(s => s.itemId === feed.id && s.quality === 'normal' && s.quantity < 999)
    if (!hasStack && inventoryStore.isFull) {
      addLog('Balo đã đầy, không thể mua.')
      return
    }
    if (!playerStore.spendMoney(feed.price)) {
      addLog(`Không đủ tiền, không thể mua ${feed.name}.`)
      return
    }
    if (!inventoryStore.addItem(feed.id)) {
      // addItem 异常失败，退款
      playerStore.earnMoney(feed.price)
      addLog('Mua thất bại, đã hoàn tiền.')
      return
    }
    addLog(`Đã mua 1 phần ${feed.name}, tốn ${feed.price} văn.`)
  }

  const handleGraze = () => {
    // cònkhôngcho ănthìtrướccho ănmộtlượt：mộtsớmtiếnchăn thảtrậnthờinàyhaibướcbảnđếnthìlàliên tụcđanglàm的
    if (!canGraze.value && unfedCount.value > 0) {
      handleFeedAll()
      if (!canGraze.value) return
    }
    const result = animalStore.grazeAnimals()
    addLog(result.message)
    if (result.success) {
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.graze)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    }
  }

  const handleHealAnimal = (animalId: string, animalName: string) => {
    const success = animalStore.healAnimal(animalId)
    if (success) addLog(`Đã chữa ${animalName} bằng thuốc thú y.`)
    else addLog('Điều trị thất bại, hãy kiểm tra thuốc thú y.')
  }

  const handleHealAll = () => {
    const result = animalStore.healAllSick()
    if (result.healedCount > 0) addLog(`Đã điều trị ${result.healedCount} động vật bằng thuốc thú y.`)
    if (result.noMedicineCount > 0) addLog(`Không đủ thuốc thú y, ${result.noMedicineCount} động vật chưa được điều trị.`)
  }

  // === cảitên ===

  const renamingId = ref<string | null>(null)
  const renameInput = ref('')

  const startRename = (id: string, currentName: string) => {
    renamingId.value = id
    renameInput.value = currentName
  }

  const confirmRename = () => {
    if (!renamingId.value) return
    const success = animalStore.renameAnimal(renamingId.value, renameInput.value)
    if (success) {
      addLog(`Đã đổi tên thành 「${renameInput.value.trim()}」.`)
    } else {
      addLog('Đổi tên thất bại, tên cần 1-8 ký tự.')
    }
    renamingId.value = null
  }

  const cancelRename = () => {
    renamingId.value = null
  }
</script>
