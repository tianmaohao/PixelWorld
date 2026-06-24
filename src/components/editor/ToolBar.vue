<template>
  <div class="toolbar">
    <!-- 工具按钮 -->
    <div class="tool-section">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-btn"
        :class="{ active: currentTool === tool.id }"
        :title="tool.label"
        @click="$emit('selectTool', tool.id)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-name">{{ tool.label }}</span>
      </button>
    </div>

    <div class="tool-divider" />

    <!-- 辅助功能 -->
    <div class="tool-section">
      <button
        class="tool-btn"
        :class="{ active: showGrid }"
        title="网格线"
        @click="$emit('toggleGrid')"
      >
        <span class="tool-icon">📐</span>
      </button>
      <button
        class="tool-btn"
        :class="{ active: highlightColor }"
        title="颜色高亮"
        @click="$emit('toggleHighlight')"
      >
        <span class="tool-icon">💡</span>
      </button>
    </div>

    <div class="tool-divider" />

    <!-- 撤销重做 -->
    <div class="tool-section">
      <button
        class="tool-btn"
        title="撤销 (Ctrl+Z)"
        :disabled="!canUndo"
        @click="$emit('undo')"
      >
        <span class="tool-icon">↩️</span>
      </button>
      <button
        class="tool-btn"
        title="重做 (Ctrl+Y)"
        :disabled="!canRedo"
        @click="$emit('redo')"
      >
        <span class="tool-icon">↪️</span>
      </button>
    </div>

    <div class="tool-divider" />

    <!-- 缩放 -->
    <div class="tool-section">
      <button class="tool-btn" title="放大" @click="$emit('zoomIn')">
        <span class="tool-icon">🔍+</span>
      </button>
      <span class="zoom-display">{{ Math.round(zoom * 100) }}%</span>
      <button class="tool-btn" title="缩小" @click="$emit('zoomOut')">
        <span class="tool-icon">🔍-</span>
      </button>
    </div>

    <div class="tool-spacer" />

    <!-- 导出 -->
    <div class="tool-section">
      <button class="tool-btn" title="导出图片" @click="$emit('exportImage')">
        <span class="tool-icon">📥</span>
      </button>
      <button class="tool-btn" title="导出 PDF" @click="$emit('exportPDF')">
        <span class="tool-icon">📄</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditorTool } from '@/types'

defineProps<{
  currentTool: EditorTool
  showGrid: boolean
  highlightColor: string | null
  zoom: number
  canUndo: boolean
  canRedo: boolean
}>()

defineEmits<{
  (e: 'selectTool', tool: EditorTool): void
  (e: 'toggleGrid'): void
  (e: 'toggleHighlight'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'exportImage'): void
  (e: 'exportPDF'): void
}>()

const tools = [
  { id: 'brush' as EditorTool, icon: '✏️', label: '画笔' },
  { id: 'eraser' as EditorTool, icon: '🧹', label: '橡皮' },
  { id: 'picker' as EditorTool, icon: '💉', label: '取色' },
  { id: 'fill' as EditorTool, icon: '🪣', label: '填充' },
  { id: 'move' as EditorTool, icon: '✋', label: '移动' },
]
</script>

<style lang="scss" scoped>
.toolbar {
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm 0;
  background: $color-bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.tool-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 50px;
  padding: 6px 0;
  border: 1px solid transparent;
  border-radius: $radius-md;
  background: transparent;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    background: rgba($color-primary, 0.06);
    border-color: rgba($color-primary, 0.2);
  }

  &.active {
    background: rgba($color-primary, 0.1);
    border-color: $color-primary;
    color: $color-primary;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .tool-icon { font-size: 18px; }
  .tool-name { font-size: 9px; color: $color-text-secondary; }
}

.tool-divider {
  width: 36px;
  height: 1px;
  background: $color-border;
}

.tool-spacer { flex: 1; }

.zoom-display {
  font-size: 9px;
  color: $color-text-muted;
  text-align: center;
  line-height: 1;
}
</style>
