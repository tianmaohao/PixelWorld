<template>
  <div class="parameter-panel">
    <h3 class="panel-title">⚙️ 转换参数</h3>

    <!-- 网格尺寸 -->
    <div class="param-group">
      <label class="param-label">网格尺寸</label>
      <n-select
        :value="store.gridSize.name"
        :options="gridOptions"
        @update:value="handleGridChange"
      />
    </div>

    <!-- 豆子形状 -->
    <div class="param-group">
      <label class="param-label">豆子形状</label>
      <n-radio-group v-model:value="store.beadShape" size="small">
        <n-radio-button value="round">⚪ 圆形</n-radio-button>
        <n-radio-button value="square">⬛ 方形</n-radio-button>
      </n-radio-group>
    </div>

    <!-- 颜色数量 -->
    <div class="param-group">
      <label class="param-label">颜色数量: {{ store.colorCount }}</label>
      <n-slider v-model:value="store.colorCount" :min="8" :max="256" :step="8" />
    </div>

    <!-- 调色盘品牌 -->
    <div class="param-group">
      <label class="param-label">调色盘品牌</label>
      <n-select
        :value="store.palette"
        :options="paletteOptions"
        @update:value="(v: PaletteBrand) => store.palette = v"
      />
    </div>

    <!-- 高级参数折叠 -->
    <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
      <span class="toggle-label">高级参数</span>
      <span class="toggle-arrow" :class="{ open: showAdvanced }">▸</span>
    </div>

    <Transition name="fold">
      <div v-show="showAdvanced" class="advanced-body">
        <!-- 亮度 -->
        <div class="param-group">
          <label class="param-label">亮度: {{ store.brightness > 0 ? '+' : '' }}{{ store.brightness }}%</label>
          <n-slider v-model:value="store.brightness" :min="-50" :max="50" :step="1" />
        </div>

        <!-- 对比度 -->
        <div class="param-group">
          <label class="param-label">对比度: {{ store.contrast > 0 ? '+' : '' }}{{ store.contrast }}%</label>
          <n-slider v-model:value="store.contrast" :min="-50" :max="50" :step="1" />
        </div>

        <!-- 饱和度 -->
        <div class="param-group">
          <label class="param-label">饱和度: {{ store.saturation > 0 ? '+' : '' }}{{ store.saturation }}%</label>
          <n-slider v-model:value="store.saturation" :min="-50" :max="50" :step="1" />
        </div>

        <!-- 模糊 -->
        <div class="param-group">
          <label class="param-label">模糊: {{ store.blur }}px</label>
          <n-slider v-model:value="store.blur" :min="0" :max="10" :step="0.5" />
        </div>

        <!-- 抖动算法 -->
        <div class="param-group">
          <label class="param-label">抖动算法</label>
          <n-radio-group v-model:value="store.dither" size="small">
            <n-radio-button value="none">无</n-radio-button>
            <n-radio-button value="floyd-steinberg">F-S</n-radio-button>
            <n-radio-button value="atkinson">Atkinson</n-radio-button>
          </n-radio-group>
        </div>
      </div>
    </Transition>

    <!-- 开始转换按钮 -->
    <n-button
      type="primary"
      block
      size="large"
      :loading="store.isConverting"
      :disabled="!store.sourceImage"
      @click="$emit('convert')"
      class="convert-btn"
    >
      🎨 开始转换
    </n-button>

    <n-button
      block
      size="small"
      quaternary
      @click="store.resetParams()"
      class="reset-btn"
    >
      重置参数
    </n-button>

    <!-- 豆子数量统计 -->
    <div v-if="store.result" class="stats">
      <span class="stat-label">预计豆子数:</span>
      <span class="stat-value">{{ store.beadCount.toLocaleString() }}颗</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NSelect, NSlider, NRadioGroup, NRadioButton, NButton } from 'naive-ui'
import { useProjectStore } from '@/stores/project'
import { GRID_SIZES } from '@/core/converter'
import type { PaletteBrand } from '@/types'

defineEmits<{
  (e: 'convert'): void
}>()

const store = useProjectStore()
const showAdvanced = ref(false)

const gridOptions = GRID_SIZES
  .filter(s => s.name !== 'heart')
  .map(s => ({ value: s.name, label: s.label }))

const paletteOptions = [
  { label: '🎨 纯色模式 (无调色盘限制)', value: 'none' },
  { label: 'Artkal S系列 (2.6mm)', value: 'artkal-s' },
  { label: 'Artkal R系列 (5mm)', value: 'artkal-r' },
  { label: 'Perler Beads', value: 'perler' },
  { label: 'Hama Beads', value: 'hama' },
]

function handleGridChange(name: string) {
  const found = GRID_SIZES.find(s => s.name === name)
  if (found) {
    store.gridSize = found
  }
}
</script>

<style lang="scss" scoped>
.parameter-panel {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.panel-title {
  font-size: $font-size-sm;
  font-weight: 600;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $color-border-light;
}

.param-group {
  margin-bottom: $spacing-md;

  .param-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-secondary;
    margin-bottom: $spacing-xs;
  }
}

.advanced-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  margin-bottom: $spacing-md;
  cursor: pointer;
  border-top: 1px solid $color-border-light;
  transition: color $transition-fast;

  &:hover { color: $color-primary; }

  .toggle-label {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }

  .toggle-arrow {
    font-size: $font-size-xs;
    transition: transform $transition-fast;
    color: $color-text-muted;

    &.open { transform: rotate(90deg); }
  }
}

.fold-enter-active,
.fold-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.fold-enter-from,
.fold-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.fold-enter-to,
.fold-leave-from {
  opacity: 1;
  max-height: 500px;
}

.advanced-body {
  .param-group:last-child { margin-bottom: 0; }
}

.convert-btn {
  margin-top: $spacing-md;
  height: 48px;
  font-size: $font-size-md;
}

.reset-btn {
  margin-top: $spacing-sm;
}

.stats {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border-light;
  text-align: center;

  .stat-label {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }

  .stat-value {
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-primary;
    margin-left: $spacing-xs;
  }
}
</style>
