<template>
  <div class="bead-tray">
    <div class="tray-header">
      <h3 class="tray-title">🫘 豆豆盘</h3>
      <div class="shape-toggle">
        <button
          class="shape-btn"
          :class="{ active: store.beadShape === 'round' }"
          title="圆形豆"
          @click="store.beadShape = 'round'"
        >⚪</button>
        <button
          class="shape-btn"
          :class="{ active: store.beadShape === 'square' }"
          title="方形豆"
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

    <!-- 豆豆列表 -->
    <div class="bead-grid">
      <button
        v-for="bead in beadList"
        :key="bead.hex"
        class="bead-cell"
        :class="{
          active: selectedColor === bead.hex,
          highlighted: highlightColor === bead.hex
        }"
        :title="`${bead.code} - ${bead.name}`"
        @click="$emit('selectColor', bead.hex)"
      >
        <div class="bead-shape" :class="store.beadShape" :style="{ background: bead.hex }" />
        <span class="bead-count">{{ bead.count }}</span>
      </button>
    </div>

    <!-- 自定义颜色 -->
    <div class="custom-bead">
      <label class="custom-label">自定义颜色</label>
      <div class="custom-input">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'

const props = defineProps<{
  selectedColor: string
  highlightColor: string | null
}>()

defineEmits<{
  (e: 'selectColor', color: string): void
}>()

const store = useProjectStore()

/** 统计每个颜色的使用数量 */
const beadList = computed(() => {
  const countMap = new Map<string, number>()
  for (const [, color] of store.editorPixels) {
    const hex = color.toUpperCase()
    countMap.set(hex, (countMap.get(hex) || 0) + 1)
  }

  // 如果有转换结果，用结果的颜色列表（保持顺序）
  if (store.result) {
    return store.result.beadColors.map(bc => ({
      ...bc,
      count: countMap.get(bc.hex.toUpperCase()) || 0,
    })).filter(b => b.count > 0)
  }

  // 否则按数量排序
  return Array.from(countMap.entries())
    .map(([hex, count]) => ({ hex, code: '', name: hex, brand: store.palette, count }))
    .sort((a, b) => b.count - a.count)
})

const currentCount = computed(() => {
  return store.editorPixels.size > 0
    ? Array.from(store.editorPixels.values()).filter(c => c.toUpperCase() === props.selectedColor.toUpperCase()).length
    : 0
})

function handleHexInput(e: Event) {
  const input = e.target as HTMLInputElement
  let hex = input.value.trim()
  if (!hex.startsWith('#')) hex = '#' + hex
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    // emit handled by parent
  }
}
</script>

<style lang="scss" scoped>
.bead-tray {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
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
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  background: $color-bg;
  border-radius: $radius-md;

  .current-swatch {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 2px solid $color-border;

    &.round { border-radius: 50%; }
    &.square { border-radius: 4px; }
  }

  .current-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .current-hex {
      font-size: $font-size-sm;
      font-family: monospace;
      color: $color-text;
      font-weight: 500;
    }

    .current-count {
      font-size: $font-size-xs;
      color: $color-text-muted;
    }
  }
}

.bead-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: $spacing-md;
}

.bead-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 2px;
  border: 2px solid transparent;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  transition: all $transition-fast;

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
    width: 30px;
    height: 30px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;

    &.round {
      border-radius: 50%;
      // 高光效果
      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 4px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
      }
    }

    &.square {
      border-radius: 3px;
    }
  }

  .bead-count {
    font-size: 9px;
    color: $color-text-muted;
    font-weight: 500;
    line-height: 1;
  }
}

.custom-bead {
  .custom-label {
    display: block;
    font-size: $font-size-xs;
    color: $color-text-muted;
    margin-bottom: $spacing-xs;
  }

  .custom-input {
    display: flex;
    gap: $spacing-xs;
  }

  .color-picker {
    width: 36px;
    height: 32px;
    padding: 0;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    cursor: pointer;
  }

  .hex-input {
    flex: 1;
    height: 32px;
    padding: 0 $spacing-sm;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-family: monospace;
    font-size: $font-size-sm;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }
}
</style>
