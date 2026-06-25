<template>
  <div class="bead-tray">
    <div class="tray-header">
      <h3 class="tray-title">🫘 豆豆盘</h3>
      <div class="shape-toggle">
        <button
          class="shape-btn" :class="{ active: store.beadShape === 'round' }" title="圆形豆"
          @click="store.beadShape = 'round'"
        >⚪</button>
        <button
          class="shape-btn" :class="{ active: store.beadShape === 'square' }" title="方形豆"
          @click="store.beadShape = 'square'"
        >⬛</button>
      </div>
    </div>

    <!-- 当前选中 -->
    <div class="current-bead">
      <div class="current-swatch" :class="store.beadShape" :style="{ background: selectedColor }" />
      <div class="current-info">
        <span class="current-hex">{{ selectedColor }}</span>
        <span class="current-count">已用 {{ currentCount }} 颗</span>
      </div>
    </div>

    <!-- 颜色数量选择 -->
    <div class="count-selector">
      <label class="count-label">色数</label>
      <div class="count-options">
        <button
          v-for="n in colorCountOptions"
          :key="n"
          class="count-btn"
          :class="{ active: colorCount === n }"
          @click="colorCount = n"
        >{{ n }}</button>
      </div>
    </div>

    <!-- 色系分类标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="cat-tab"
        :class="{ active: activeCategory === cat.name }"
        @click="activeCategory = cat.name"
      >
        <span class="cat-dot" :style="{ background: cat.color }" />
        <span class="cat-label">{{ cat.name }}</span>
      </button>
    </div>

    <!-- 豆豆网格 -->
    <div class="bead-scroll">
      <div class="bead-grid">
        <button
          v-for="bead in filteredBeads"
          :key="bead.hex"
          class="bead-cell"
          :class="{
            active: selectedColor.toUpperCase() === bead.hex.toUpperCase(),
            highlighted: highlightColor?.toUpperCase() === bead.hex.toUpperCase()
          }"
          :title="`${bead.code} ${bead.name}`"
          @click="$emit('selectColor', bead.hex)"
        >
          <div class="bead-shape" :class="store.beadShape" :style="{ background: bead.hex }" />
          <span class="bead-count" v-if="beadCounts.get(bead.hex.toUpperCase())">
            {{ beadCounts.get(bead.hex.toUpperCase()) }}
          </span>
        </button>
      </div>
    </div>

    <!-- 自定义颜色 -->
    <div class="custom-bead">
      <input
        type="color"
        :value="selectedColor"
        class="color-picker"
        @input="$emit('selectColor', ($event.target as HTMLInputElement).value)"
      />
      <input
        type="text"
        :value="selectedColor"
        class="hex-input"
        maxlength="7"
        @change="handleHexInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { getPalette } from '@/core/palette'
import type { BeadColor } from '@/types'

const props = defineProps<{
  selectedColor: string
  highlightColor: string | null
}>()

defineEmits<{
  (e: 'selectColor', color: string): void
}>()

const store = useProjectStore()
const activeCategory = ref('全部')
const colorCount = ref(48)

const colorCountOptions = [24, 48, 72, 96, 120, 144, 168, 192, 216, 240]

// 生成 N 色均匀色板
function generatePalette(n: number): BeadColor[] {
  const usedHex = new Set<string>()
  const colors: BeadColor[] = []

  function add(hex: string) {
    const key = hex.toUpperCase()
    if (usedHex.has(key)) return
    usedHex.add(key)
    colors.push({ code: `C${colors.length + 1}`, name: hex, hex, brand: 'none' })
  }

  // 12 个色相方向，均匀覆盖色轮
  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

  // ===== 1. 灰阶 8 级 =====
  for (let i = 0; i <= 7; i++) {
    const v = Math.round(i * 255 / 7)
    add(`#${v.toString(16).padStart(2, '0').repeat(3)}`)
  }

  // ===== 2. 肤色系（15级，覆盖所有人种）=====
  // 暖黄底色，从白皙 → 小麦 → 深棕，都是黄橙调
  const skinTones = [
    { h: 20, s: 20, l: 92 },  // 极浅（白皙）
    { h: 18, s: 25, l: 87 },  // 浅白
    { h: 22, s: 30, l: 82 },  // 瓷白
    { h: 20, s: 35, l: 77 },  // 浅肤色
    { h: 22, s: 40, l: 72 },  // 暖肤色
    { h: 20, s: 45, l: 67 },  // 自然肤色
    { h: 18, s: 50, l: 62 },  // 小麦色
    { h: 20, s: 50, l: 55 },  // 蜜色
    { h: 18, s: 48, l: 48 },  // 橄榄色
    { h: 20, s: 45, l: 42 },  // 浅棕
    { h: 18, s: 50, l: 37 },  // 中棕
    { h: 20, s: 55, l: 32 },  // 深棕
    { h: 18, s: 50, l: 27 },  // 暗棕
    { h: 20, s: 45, l: 22 },  // 深黑棕
    { h: 18, s: 40, l: 17 },  // 极深
  ]
  for (const t of skinTones) {
    if (colors.length >= n) break
    add(hsvToHex(t.h, t.s, t.l))
  }

  // ===== 3. 按轮次生成，每轮覆盖所有色相 =====
  // 第 1 轮：高饱和高明度（鲜艳色）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 85, 65))
  }
  // 第 2 轮：高饱和中明度
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 80, 45))
  }
  // 第 3 轮：中饱和中高明度（柔和色）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 55, 70))
  }
  // 第 4 轮：低饱和高明度（淡彩/肤色区）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 30, 80))
  }
  // 第 5 轮：高饱和低明度（深色）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 70, 25))
  }
  // 第 6 轮：中饱和中明度（中间色）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 65, 55))
  }
  // 第 7 轮：低饱和中低明度（暗淡色/棕色区）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 40, 40))
  }
  // 第 8 轮：高饱和极高明度（亮色）
  for (const hue of hues) {
    if (colors.length >= n) break
    add(hsvToHex(hue, 75, 88))
  }

  return colors.slice(0, n)
}

function hsvToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c } else { r = c; b = x }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// 纯色模式默认色板
const DEFAULT_COLORS: BeadColor[] = [
  // 黑白灰
  { code: 'C01', name: '白色', hex: '#FFFFFF', brand: 'none' },
  { code: 'C02', name: '亮灰', hex: '#E0E0E0', brand: 'none' },
  { code: 'C03', name: '中灰', hex: '#808080', brand: 'none' },
  { code: 'C04', name: '深灰', hex: '#444444', brand: 'none' },
  { code: 'C05', name: '黑色', hex: '#1A1A1A', brand: 'none' },
  // 肤色
  { code: 'C06', name: '白皙', hex: '#FFF5EE', brand: 'none' },
  { code: 'C07', name: '浅肤', hex: '#FFE4C4', brand: 'none' },
  { code: 'C08', name: '肤色', hex: '#FFDAB9', brand: 'none' },
  { code: 'C09', name: '暖肤', hex: '#F5C6AA', brand: 'none' },
  { code: 'C10', name: '中肤', hex: '#DEB887', brand: 'none' },
  { code: 'C11', name: '深肤', hex: '#C49A6C', brand: 'none' },
  { code: 'C12', name: '棕肤', hex: '#A0785A', brand: 'none' },
  // 红
  { code: 'C13', name: '大红', hex: '#E4002B', brand: 'none' },
  { code: 'C14', name: '浅红', hex: '#FF6B6B', brand: 'none' },
  { code: 'C15', name: '粉红', hex: '#FFB3C1', brand: 'none' },
  { code: 'C16', name: '玫红', hex: '#FF1493', brand: 'none' },
  // 橙
  { code: 'C17', name: '橙色', hex: '#FF8C00', brand: 'none' },
  { code: 'C18', name: '浅橙', hex: '#FFB347', brand: 'none' },
  { code: 'C19', name: '珊瑚', hex: '#FF7F50', brand: 'none' },
  // 黄
  { code: 'C20', name: '明黄', hex: '#FFD700', brand: 'none' },
  { code: 'C21', name: '浅黄', hex: '#FFF44F', brand: 'none' },
  { code: 'C22', name: '土黄', hex: '#DAA520', brand: 'none' },
  // 绿
  { code: 'C23', name: '嫩绿', hex: '#7CFC00', brand: 'none' },
  { code: 'C24', name: '草绿', hex: '#32CD32', brand: 'none' },
  { code: 'C25', name: '翠绿', hex: '#00A86B', brand: 'none' },
  { code: 'C26', name: '深绿', hex: '#006400', brand: 'none' },
  // 蓝
  { code: 'C27', name: '天蓝', hex: '#87CEEB', brand: 'none' },
  { code: 'C28', name: '蓝色', hex: '#1E90FF', brand: 'none' },
  { code: 'C29', name: '深蓝', hex: '#003366', brand: 'none' },
  // 紫
  { code: 'C30', name: '薰衣草', hex: '#B57EDC', brand: 'none' },
  { code: 'C31', name: '紫色', hex: '#9B59B6', brand: 'none' },
  { code: 'C32', name: '深紫', hex: '#4A148C', brand: 'none' },
  // 棕
  { code: 'C33', name: '浅棕', hex: '#D2B48C', brand: 'none' },
  { code: 'C34', name: '棕色', hex: '#8B4513', brand: 'none' },
  { code: 'C35', name: '咖啡', hex: '#6F4E37', brand: 'none' },
  { code: 'C36', name: '深棕', hex: '#3E2723', brand: 'none' },
]

// 当前调色盘的所有颜色
const allBeads = computed<BeadColor[]>(() => {
  if (store.palette === 'none') {
    return generatePalette(colorCount.value)
  }
  return getPalette(store.palette)
})

// 当前选中颜色的使用数量
const currentCount = computed(() => {
  const key = props.selectedColor.toUpperCase()
  return Array.from(store.editorPixels.values()).filter(c => c.toUpperCase() === key).length
})

// 统计每个颜色的使用数量
const beadCounts = computed(() => {
  const map = new Map<string, number>()
  for (const [, hex] of store.editorPixels) {
    const key = hex.toUpperCase()
    map.set(key, (map.get(key) || 0) + 1)
  }
  return map
})

// 色系分类
const categories = computed(() => {
  const cats = [
    { name: '全部', color: '#888' },
    { name: '肤', color: '#FFDAB9' },
    { name: '红', color: '#E4002B' },
    { name: '橙', color: '#FF8C00' },
    { name: '黄', color: '#FFD700' },
    { name: '绿', color: '#00AA00' },
    { name: '蓝', color: '#1E90FF' },
    { name: '紫', color: '#9B59B6' },
    { name: '棕', color: '#8B4513' },
    { name: '灰', color: '#808080' },
  ]
  return cats
})

// hex → HSV 色相(0-360)、饱和度(0-1)、明度(0-1)
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

// 按色系过滤（基于色相）
const filteredBeads = computed(() => {
  if (activeCategory.value === '全部') return allBeads.value

  return allBeads.value.filter(bead => {
    const { h, s, l } = hexToHsl(bead.hex.toUpperCase())

    // 灰色：饱和度极低
    if (activeCategory.value === '灰') return s < 0.1
    // 肤色：暖色相(10-45°) + 饱和度(10-60%) + 亮度范围宽(15%-92%)，覆盖所有人种
    if (activeCategory.value === '肤') return h >= 10 && h <= 45 && s >= 0.1 && s <= 0.6 && l >= 0.15 && l <= 0.92

    // 有色系：饱和度 > 0.1 才算
    if (s < 0.1) return false

    // 按色相分组（色轮 0-360°）
    switch (activeCategory.value) {
      case '红': return (h < 15 || h >= 345) // 0°±15
      case '橙': return h >= 15 && h < 45      // 15-45
      case '黄': return h >= 45 && h < 75      // 45-75
      case '绿': return h >= 75 && h < 165     // 75-165
      case '蓝': return h >= 165 && h < 255    // 165-255
      case '紫': return h >= 255 && h < 305    // 255-305
      case '棕': return h >= 15 && h < 45 && l < 0.5 // 低明度橙色系=棕
      default: return true
    }
  })
})

function handleHexInput(e: Event) {
  const input = e.target as HTMLInputElement
  let hex = input.value.trim()
  if (!hex.startsWith('#')) hex = '#' + hex
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    // valid hex, parent handles
  }
}
</script>

<style lang="scss" scoped>
.bead-tray {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  max-height: 520px;
}

.tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
  flex-shrink: 0;
}

.tray-title {
  font-size: $font-size-sm;
  font-weight: 600;
}

.shape-toggle {
  display: flex;
  gap: 2px;
  background: $color-bg;
  border-radius: $radius-sm;
  padding: 2px;
}

.shape-btn {
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  &.active {
    background: $color-bg-white;
    box-shadow: $shadow-sm;
  }
}

.current-bead {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  padding: $spacing-sm;
  background: $color-bg;
  border-radius: $radius-md;
  flex-shrink: 0;

  .current-swatch {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: 2px solid $color-border;
    &.round { border-radius: 50%; }
    &.square { border-radius: 4px; }
  }

  .current-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    .current-hex {
      font-size: $font-size-sm;
      font-family: monospace;
      font-weight: 500;
    }
    .current-count {
      font-size: $font-size-xs;
      color: $color-text-muted;
    }
  }
}

.count-selector {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  flex-shrink: 0;

  .count-label {
    font-size: $font-size-xs;
    color: $color-text-muted;
    flex-shrink: 0;
  }

  .count-options {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .count-btn {
    padding: 2px 6px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: $color-bg-white;
    cursor: pointer;
    font-size: 10px;
    color: $color-text-secondary;
    transition: all $transition-fast;
    line-height: 1.4;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    &.active {
      background: $color-primary;
      border-color: $color-primary;
      color: white;
      font-weight: 500;
    }
  }
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: $spacing-sm;
  flex-shrink: 0;
}

.cat-tab {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
  transition: all $transition-fast;
  color: $color-text-secondary;

  &:hover { background: $color-bg; }
  &.active {
    background: $color-bg;
    border-color: $color-primary;
    color: $color-primary;
    font-weight: 500;
  }

  .cat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.bead-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  margin-bottom: $spacing-sm;
}

.bead-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
}

.bead-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 3px 2px;
  border: 2px solid transparent;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  transition: all $transition-fast;
  min-height: 42px;

  &:hover {
    border-color: $color-border;
    background: rgba(0, 0, 0, 0.02);
  }

  &.active {
    border-color: $color-primary;
    background: rgba($color-primary, 0.06);
  }

  &.highlighted {
    box-shadow: 0 0 0 2px $color-secondary;
  }

  .bead-shape {
    width: 26px;
    height: 26px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    position: relative;

    &.round {
      border-radius: 50%;
      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
      }
    }
    &.square { border-radius: 3px; }
  }

  .bead-count {
    font-size: 8px;
    color: $color-text-muted;
    font-weight: 600;
    line-height: 1;
  }
}

.custom-bead {
  display: flex;
  gap: $spacing-xs;
  flex-shrink: 0;

  .color-picker {
    width: 32px;
    height: 28px;
    padding: 0;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    cursor: pointer;
    flex-shrink: 0;
  }

  .hex-input {
    flex: 1;
    height: 28px;
    padding: 0 $spacing-xs;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-family: monospace;
    font-size: $font-size-xs;
    min-width: 0;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }
}
</style>
