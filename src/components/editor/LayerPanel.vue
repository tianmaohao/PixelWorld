<template>
  <div class="layer-panel">
    <div class="panel-header">
      <h3 class="panel-title">📑 图层</h3>
      <n-button size="tiny" quaternary @click="$emit('addLayer')">+ 新建</n-button>
    </div>

    <div class="layer-list">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="layer-item"
        :class="{ active: layer.id === activeLayerId, locked: layer.locked }"
        @click="$emit('selectLayer', layer.id)"
      >
        <!-- 显隐 -->
        <button
          class="layer-vis"
          :class="{ hidden: !layer.visible }"
          @click.stop="$emit('toggleVisibility', layer.id)"
          :title="layer.visible ? '隐藏' : '显示'"
        >
          {{ layer.visible ? '👁️' : '🚫' }}
        </button>

        <!-- 名称 -->
        <span class="layer-name">{{ layer.name }}</span>

        <!-- 操作按钮 -->
        <div class="layer-actions">
          <button
            class="layer-btn"
            :class="{ active: layer.locked }"
            @click.stop="$emit('toggleLock', layer.id)"
            :title="layer.locked ? '解锁' : '锁定'"
          >
            {{ layer.locked ? '🔒' : '🔓' }}
          </button>
          <button
            class="layer-btn"
            title="删除"
            :disabled="layers.length <= 1"
            @click.stop="$emit('removeLayer', layer.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 透明度 -->
    <div v-if="activeLayer" class="opacity-control">
      <label class="opacity-label">透明度: {{ Math.round(activeLayer.opacity * 100) }}%</label>
      <n-slider
        :value="Math.round(activeLayer.opacity * 100)"
        :min="0" :max="100" :step="5"
        @update:value="(v: number) => $emit('setOpacity', v / 100)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NSlider, NButton } from 'naive-ui'
import type { Layer } from '@/types'

const props = defineProps<{
  layers: Layer[]
  activeLayerId: string
}>()

defineEmits<{
  (e: 'addLayer'): void
  (e: 'removeLayer', id: string): void
  (e: 'selectLayer', id: string): void
  (e: 'toggleVisibility', id: string): void
  (e: 'toggleLock', id: string): void
  (e: 'setOpacity', opacity: number): void
}>()

const activeLayer = computed(() => props.layers.find(l => l.id === props.activeLayerId))
</script>

<style lang="scss" scoped>
.layer-panel {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.panel-title {
  font-size: $font-size-sm;
  font-weight: 600;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition-fast;
  border: 1px solid transparent;

  &:hover {
    background: rgba($color-primary, 0.04);
  }

  &.active {
    background: rgba($color-primary, 0.08);
    border-color: rgba($color-primary, 0.3);
  }

  &.locked {
    opacity: 0.6;
  }
}

.layer-vis {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.8;

  &.hidden { opacity: 0.3; }
}

.layer-name {
  flex: 1;
  font-size: $font-size-xs;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity $transition-fast;

  .layer-item:hover & {
    opacity: 1;
  }
}

.layer-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  border-radius: 3px;

  &:hover { background: rgba(0,0,0,0.06); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
}

.opacity-control {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border-light;

  .opacity-label {
    display: block;
    font-size: $font-size-xs;
    color: $color-text-secondary;
    margin-bottom: $spacing-xs;
  }
}
</style>
