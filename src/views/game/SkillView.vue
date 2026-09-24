<template>
  <div>
    <h3 class="text-accent text-sm mb-3">
      <Star :size="14" class="inline" />
      kỹ thuậtnăng
    </h3>
    <div class="space-y-3">
      <div v-for="skill in skillStore.skills" :key="skill.type" class="game-panel">
        <!-- 标题行：图标 + 名称等级 + 经验 -->
        <div class="flex justify-between items-center mb-1.5">
          <div class="flex items-center space-x-1.5">
            <component :is="SKILL_ICONS[skill.type]" :size="14" class="text-accent" />
            <span class="text-sm">{{ SKILL_NAMES[skill.type] }}</span>
            <span class="text-xs text-accent">Lv.{{ skill.level }}</span>
          </div>
          <p v-if="expInfo(skill.type)" class="text-[10px] text-muted">
            {{ expInfo(skill.type)!.current }}/{{ expInfo(skill.type)!.required }}
          </p>
          <span v-else class="text-[10px] text-accent border border-accent/30 rounded-xs px-1">MAX</span>
        </div>

        <!-- 经验条 -->
        <div class="bg-bg rounded-xs h-1.5 mb-2">
          <div class="h-full bg-accent rounded-xs transition-all" :style="{ width: expPercent(skill.type) + '%' }" />
        </div>

        <!-- 介绍 + 每级加成 -->
        <div class="border border-accent/20 rounded-xs px-2 py-1.5 mb-2">
          <p class="text-[10px] text-muted leading-relaxed">
            {{ SKILL_DESCS[skill.type] }}
          </p>
          <p class="text-[10px] text-muted mt-0.5">mỗicấp：thể lựctiêuhao-1%，{{ SKILL_LEVEL_BONUS[skill.type] }}</p>
        </div>

        <!-- 天赋 -->
        <div v-if="skill.perk5 || skill.perk10" class="flex flex-col space-y-1">
          <div v-if="skill.perk5" class="flex items-center space-x-1.5 border border-water rounded-xs px-2 py-1">
            <span class="text-[10px] text-water shrink-0">Lv5</span>
            <span class="text-xs text-water shrink-0">{{ PERK_NAMES[skill.perk5] }}</span>
            <span class="text-[10px] text-muted">{{ PERK_DESCS[skill.perk5] }}</span>
          </div>
          <div v-if="skill.perk10" class="flex items-center space-x-1.5 border border-water rounded-xs px-2 py-1">
            <span class="text-[10px] text-water shrink-0">Lv10</span>
            <span class="text-xs text-water shrink-0">{{ PERK_NAMES[skill.perk10] }}</span>
            <span class="text-[10px] text-muted">{{ PERK_DESCS[skill.perk10] }}</span>
          </div>
        </div>
        <p v-else-if="skill.level < 5" class="text-[10px] text-muted">Lv5 / Lv10 thờicó thể chọn chuyên mônngàythiên phú</p>
        <p v-else class="text-[10px] text-muted">Nâng cấpđến Lv{{ !skill.perk5 ? 5 : 10 }} saucó thể chọn ngàythiên phú</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type Component } from 'vue'
  import { Star, Wheat, TreePine, Fish, Pickaxe, Sword } from 'lucide-vue-next'
  import { useSkillStore } from '@/stores/useSkillStore'
  import type { SkillType, SkillPerk5, SkillPerk10 } from '@/types'

  const skillStore = useSkillStore()

  const SKILL_ICONS: Record<SkillType, Component> = {
    farming: Wheat,
    foraging: TreePine,
    fishing: Fish,
    mining: Pickaxe,
    combat: Sword
  }

  const SKILL_NAMES: Record<SkillType, string> = {
    farming: 'Nông nghiệp',
    foraging: 'Thu thập',
    fishing: 'Câu cá',
    mining: 'Khai khoáng',
    combat: 'Chiến đấu'
  }

  const SKILL_DESCS: Record<SkillType, string> = {
    farming: 'Trồng cây và thu hoạch nông sản. Cấp càng cao, chất lượng cây càng tốt.',
    foraging: 'Thu thập tài nguyên hoang dã và đốn gỗ. Cấp càng cao, chất lượng thu thập càng tốt.',
    fishing: 'Câu cá ở các vùng nước. Cấp càng cao, tỷ lệ câu thành công càng cao.',
    mining: 'Khai mỏ và chiến đấu trong hầm. Cấp càng cao, quặng thu được càng nhiều.',
    combat: 'Chiến đấu với quái vật trong hầm. Cấp càng cao, giới hạn sinh lực càng cao.'
  }

  const SKILL_LEVEL_BONUS: Record<SkillType, string> = {
    farming: 'Tăng xác suất chất lượng cây trồng',
    foraging: 'Tăng xác suất chất lượng thu thập',
    fishing: 'Tăng tỷ lệ câu cá thành công',
    mining: 'Tăng sản lượng quặng',
    combat: 'Giới hạn sinh lực +5'
  }

  const PERK_DESCS: Record<SkillPerk5 | SkillPerk10, string> = {
    harvester: '+10% giá bán nông sản',
    rancher: 'Giá bán sản phẩm chăn nuôi +20%',
    lumberjack: '25% xác suất nhận thêm gỗ khi thu thập',
    herbalist: 'Tỷ lệ phát hiện vật thu thập +20%',
    fisher: 'Giá bán cá +25%',
    trapper: 'Tỷ lệ đấu cá thành công +15%',
    miner: '50% xác suất Quặng +1',
    geologist: 'Tăng mạnh xác suất ra quặng hiếm',
    fighter: 'Giảm sát thương 15%, giới hạn sinh lực +25',
    defender: 'Khi phòng thủ hồi 5 sinh lực',
    intensive: '20% cơ hội thu hoạch gấp đôi',
    artisan: '+25% giá bán sản phẩm gia công',
    coopmaster: '+50% độ thân thiết với động vật',
    shepherd: 'Tăng một cấp chất lượng sản phẩm chăn nuôi',
    forester: 'Khi thu thập chắc chắn nhận thêm gỗ',
    tracker: 'Mỗi lần thu thập thêm +1 vật phẩm',
    botanist: 'Vật phẩm thu thập chắc chắn là tinh phẩm',
    alchemist: 'Hiệu quả hồi phục của thức ăn +50%',
    angler: 'Tăng mạnh xác suất cá huyền thoại xuất hiện',
    aquaculture: 'Giá bán cá +50%',
    mariner: 'Cá câu được ít nhất là chất lượng tốt',
    luremaster: 'Nhân đôi hiệu quả mồi câu',
    prospector: '15% cơ hội quặng tăng gấp đôi',
    blacksmith: '+50% giá bán quặng kim loại',
    excavator: '30% xác suất không tiêu hao khi dùng bom',
    mineralogist: 'Rơi thêm quặng khi đánh bại quái vật',
    warrior: 'Giới hạn sinh lực +40',
    brute: '+25% sát thương tấn công',
    acrobat: '25% cơ hội né và phản công',
    tank: 'Khi phòng thủ giảm 70% sát thương'
  }

  const PERK_NAMES: Record<SkillPerk5 | SkillPerk10, string> = {
    harvester: 'Người Thu Hoạch',
    rancher: 'Mục Đồng',
    lumberjack: 'Tiều Phu',
    herbalist: 'Gái Lá',
    fisher: 'Ngư Dân',
    trapper: 'Thợ Săn',
    miner: 'Thợ Mỏ',
    geologist: 'Nhà Địa Chất',
    fighter: 'Đấu Sĩ',
    defender: 'Vệ Binh',
    intensive: 'Canh Tác Sâu',
    artisan: 'Nghệ Nhân',
    coopmaster: 'Chủ Trang Trại',
    shepherd: 'Người Chăn Cừu',
    botanist: 'Nhà Thực Vật',
    alchemist: 'Giả Kim Thuật',
    forester: 'Thợ Đốn Gỗ',
    tracker: 'Kẻ Theo Dấu',
    angler: 'Kiện Tướng Câu Cá',
    aquaculture: 'Thương Nhân Thủy Sản',
    mariner: 'Thủy Thủ',
    luremaster: 'Bậc Thầy Mồi Câu',
    prospector: 'Người Thăm Dò',
    blacksmith: 'Thợ rèn',
    excavator: 'Máy Xúc',
    mineralogist: 'Nhà Ngọc Học',
    warrior: 'Võ Giả',
    brute: 'Kẻ Cục Súc',
    acrobat: 'Diễn Viên Xiếc',
    tank: 'Kỵ Sĩ Giáp Nặng'
  }

  const expInfo = (type: SkillType) => {
    return skillStore.getExpToNextLevel(type)
  }

  const expPercent = (type: SkillType): number => {
    const info = skillStore.getExpToNextLevel(type)
    if (!info) return 100
    return Math.round((info.current / info.required) * 100)
  }
</script>
