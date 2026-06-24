<template>
  <div class="color-palette">
    <h3 class="palette-title">🎨 调色盘</h3>

    <!-- 当前选中颜色 -->
    <div class="current-color">
      <div class="current-swatch" :style="{ background: selectedColor }" />
      <span class="current-hex">{{ selectedColor }}</span>
    </div>

    <!-- 使用的颜色列表 -->
    <div class="color-grid">
      <button
        v-for="color in usedColors"
        :key="color.hex"
        class="color-cell"
        :class="{
          active: selectedColor === color.hex,
          highlighted: highlightColor === color.hex
        }"
        :title="`${color.code} - ${color.name}`"
        @click="$emit('selectColor', color.hex)"
      >
        <div class="cell-color" :style="{ background: color.hex }" />
        <span class="cell-code">{{ color.code }}</span>
      </button>
    </div>

    <!-- 自定义颜色 -->
    <div class="custom-color">
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

const usedColors = computed(() => {
  if (!store.result) return []
  return store.result.beadColors
})

function handleHexInput(e: Event) {
  const input = e.target as HTMLInputElement
  let hex = input.value.trim()
  if (!hex.startsWith('#')) hex = '#' + hex
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    // emit
  }
}
</script>

<style lang="scss" scoped>
.color-palette {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.palette-title {
  font-size: $font-size-sm;
  font-weight: 600;
  margin-bottom: $spacing-md;
}

.current-color {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  background: $color-bg;
  border-radius: $radius-md;

  .current-swatch {
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    border: 2px solid $color-border;
  }

  .current-hex {
    font-size: $font-size-sm;
    font-family: monospace;
    color: $color-text-secondary;
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-xs;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: $spacing-md;
}

.color-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 2px solid transparent;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-border;
  }

  &.active {
    border-color: $color-primary;
    background: rgba($color-primary, 0.06);
  }

  &.highlighted {
    box-shadow: 0 0 0 2px $color-secondary;
  }

  .cell-color {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .cell-code {
    font-size: 9px;
    color: $color-text-muted;
  }
}

.custom-color {
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
