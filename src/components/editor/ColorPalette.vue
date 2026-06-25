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

// 当前调色盘的所有颜色
const allBeads = computed<BeadColor[]>(() => {
  if (store.palette === 'none') {
    // 纯色模式：从编辑器像素中收集颜色
    const colorMap = new Map<string, BeadColor>()
    for (const [, hex] of store.editorPixels) {
      const key = hex.toUpperCase()
      if (!colorMap.has(key)) {
        colorMap.set(key, { code: '', name: hex, hex, brand: 'none' })
      }
    }
    return Array.from(colorMap.values())
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

// 按色系过滤
const filteredBeads = computed(() => {
  if (activeCategory.value === '全部') return allBeads.value

  return allBeads.value.filter(bead => {
    const hex = bead.hex.toUpperCase()
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const sat = max === 0 ? 0 : (max - min) / max
    const light = (max + min) / 2 / 255

    switch (activeCategory.value) {
      case '肤': return hex.startsWith('#FF') && g > 150 && b > 150 && r > 200 && sat < 0.3
      case '红': return r > 180 && g < 100 && b < 100
      case '橙': return r > 200 && g > 80 && g < 180 && b < 100
      case '黄': return r > 200 && g > 200 && b < 120
      case '绿': return g > 120 && r < 120 && b < 120
      case '蓝': return b > 120 && r < 100 && g < 180
      case '紫': return r > 80 && b > 120 && g < 100
      case '棕': return r > 80 && g > 40 && b < 80 && light < 0.4 && sat > 0.3
      case '灰': return sat < 0.1
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

.category-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: $spacing-sm;
  overflow-x: auto;
  flex-shrink: 0;
  padding-bottom: 2px;

  &::-webkit-scrollbar { height: 0; }
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
