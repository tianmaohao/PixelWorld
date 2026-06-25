<template>
  <div class="editor-page">
    <!-- 手机端提示 -->
    <div v-if="isMobile" class="mobile-tip">
      📱 手机屏幕有点小噢~ 推荐用电脑浏览器体验更好捏！
    </div>

    <!-- 桌面端：左侧工具栏 -->
    <ToolBar
      v-if="!isMobile"
      :current-tool="currentTool"
      :show-grid="showGrid"
      :highlight-color="highlightColor"
      :zoom="zoom"
      :can-undo="historyIndex > 0"
      :can-redo="historyIndex < history.length - 1"
      @select-tool="currentTool = $event"
      @toggle-grid="showGrid = !showGrid"
      @toggle-highlight="toggleHighlight"
      @undo="undo"
      @redo="redo"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @export-image="showExportModal = true"
      @export-pdf="handleExportPDF"
    />

    <!-- 画布 -->
    <div class="editor-canvas-area">
      <EditorCanvas
        ref="canvasRef"
        :tool="currentTool"
        :selected-color="selectedColor"
        :show-grid="showGrid"
        :highlight-color="highlightColor"
        :zoom="zoom"
        @update:zoom="(v: number) => zoom = v"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @color-picked="handleColorPicked"
        @modified="saveHistory"
      />
    </div>

    <!-- 桌面端：右侧面板 -->
    <aside v-if="!isMobile" class="editor-sidebar">
      <ColorPalette
        :selected-color="selectedColor"
        :highlight-color="highlightColor"
        @select-color="selectedColor = $event"
      />

      <div v-if="store.result" class="info-panel">
        <h4 class="info-title">📊 作品信息</h4>
        <div class="info-grid">
          <span class="info-label">豆子数:</span>
          <span class="info-value">{{ store.editorPixels.size }}颗</span>
          <span class="info-label">颜色数:</span>
          <span class="info-value">{{ usedColorCount }}种</span>
        </div>
      </div>

      <div class="canvas-settings">
        <h4 class="settings-title">⚙️ 画布设置</h4>
        <div class="setting-row">
          <span class="setting-label">尺寸</span>
          <div class="size-inputs">
            <input type="number" class="size-input" :value="store.editorWidth" min="1" max="200"
              @change="handleWidthChange" />
            <span class="size-x">×</span>
            <input type="number" class="size-input" :value="store.editorHeight" min="1" max="200"
              @change="handleHeightChange" />
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">背景</span>
          <div class="bg-options">
            <button v-for="bg in bgOptions" :key="bg.name"
              class="bg-btn" :class="[bg.name, { active: store.canvasBg === bg.name }]"
              :title="bg.label" @click="store.canvasBg = bg.name" />
          </div>
        </div>
      </div>

      <div class="quick-export">
        <n-button block type="primary" secondary @click="showExportModal = true">
          📥 导出作品
        </n-button>
      </div>
    </aside>

    <!-- 移动端：底部工具栏 -->
    <div v-if="isMobile" class="mobile-bottom-bar">
      <div class="mobile-tools">
        <button v-for="tool in mobileTools" :key="tool.id"
          class="mobile-tool-btn" :class="{ active: currentTool === tool.id }"
          @click="currentTool = tool.id">
          {{ tool.icon }}
        </button>
        <div class="mobile-divider" />
        <button class="mobile-tool-btn" @click="undo" :disabled="historyIndex <= 0">↩️</button>
        <button class="mobile-tool-btn" @click="redo" :disabled="historyIndex >= history.length - 1">↪️</button>
        <div class="mobile-divider" />
        <button class="mobile-tool-btn" :class="{ active: showGrid }" @click="showGrid = !showGrid">📐</button>
        <button class="mobile-tool-btn" @click="showSidebar = !showSidebar">🎨</button>
        <button class="mobile-tool-btn" @click="showExportModal = true">📥</button>
      </div>

      <!-- 当前颜色指示器 -->
      <div class="mobile-color-bar">
        <div class="mobile-color-swatch" :style="{ background: selectedColor }" />
        <span class="mobile-color-hex">{{ selectedColor }}</span>
        <div class="mobile-zoom">
          <button @click="zoomOut">−</button>
          <span>{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoomIn">+</button>
        </div>
      </div>
    </div>

    <!-- 移动端：侧边栏抽屉 -->
    <Transition name="slide">
      <div v-if="isMobile && showSidebar" class="mobile-drawer-mask" @click="showSidebar = false" />
    </Transition>
    <Transition name="slide-right">
      <aside v-if="isMobile && showSidebar" class="mobile-drawer">
        <div class="drawer-header">
          <span>🎨 调色盘</span>
          <button class="drawer-close" @click="showSidebar = false">✕</button>
        </div>
        <div class="drawer-body">
          <ColorPalette
            :selected-color="selectedColor"
            :highlight-color="highlightColor"
            @select-color="selectedColor = $event; showSidebar = false"
          />
        </div>
      </aside>
    </Transition>

    <!-- 导出弹窗 -->
    <n-modal v-model:show="showExportModal" preset="card" title="📥 导出选项" style="max-width: 480px">
      <div class="export-options">
        <div class="export-item" @click="handleExport('preview')">
          <span class="export-icon">🖼️</span>
          <div><div class="export-name">像素预览图</div><div class="export-desc">带网格的像素化效果</div></div>
        </div>
        <div class="export-item" @click="handleExport('template')">
          <span class="export-icon">📋</span>
          <div><div class="export-name">拼豆模版图</div><div class="export-desc">带颜色编号的模版</div></div>
        </div>
        <div class="export-item" @click="handleExport('colorblock')">
          <span class="export-icon">🎨</span>
          <div><div class="export-name">纯色块图</div><div class="export-desc">无网格，适合打印</div></div>
        </div>
        <div class="export-item" @click="handleExport('pdf')">
          <span class="export-icon">📄</span>
          <div><div class="export-name">PDF 模版</div><div class="export-desc">A4尺寸，含颜色对照表</div></div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { NModal, NButton, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import type { EditorTool } from '@/types'
import { exportPreviewImage, exportTemplateImage, exportColorBlockImage, exportPDF, downloadImage } from '@/core/export'
import ToolBar from '@/components/editor/ToolBar.vue'
import ColorPalette from '@/components/editor/ColorPalette.vue'
import EditorCanvas from '@/components/editor/EditorCanvas.vue'

const store = useProjectStore()
const message = useMessage()
const router = useRouter()

const canvasRef = ref<InstanceType<typeof EditorCanvas>>()

const currentTool = ref<EditorTool>('brush')
const selectedColor = ref('#F43F5E')
const showGrid = ref(true)
const highlightColor = ref<string | null>(null)
const zoom = ref(1)
const showExportModal = ref(false)
const showSidebar = ref(false)
const isMobile = ref(false)

// 历史记录
const history = ref<Map<string, string>[]>([])
const historyIndex = ref(-1)
const maxHistory = 50

const usedColorCount = computed(() => {
  const colors = new Set(store.editorPixels.values())
  return colors.size
})

const mobileTools = [
  { id: 'brush' as EditorTool, icon: '✏️' },
  { id: 'eraser' as EditorTool, icon: '🧹' },
  { id: 'picker' as EditorTool, icon: '💉' },
  { id: 'fill' as EditorTool, icon: '🪣' },
  { id: 'move' as EditorTool, icon: '✋' },
]

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  saveHistory()
  window.addEventListener('keydown', handleKeydown)
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', checkMobile)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') { e.preventDefault(); undo() }
    else if (e.key === 'y') { e.preventDefault(); redo() }
  }
  switch (e.key) {
    case 'b': currentTool.value = 'brush'; break
    case 'e': currentTool.value = 'eraser'; break
    case 'i': currentTool.value = 'picker'; break
    case 'g': currentTool.value = 'fill'; break
    case 'v': currentTool.value = 'move'; break
  }
}

function saveHistory() {
  const snapshot = new Map(store.editorPixels)
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(snapshot)
  if (history.value.length > maxHistory) {
    history.value.shift()
  } else {
    historyIndex.value++
  }
}

function undo() {
  if (historyIndex.value <= 0) return
  historyIndex.value--
  restoreHistory()
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) return
  historyIndex.value++
  restoreHistory()
}

function restoreHistory() {
  const snapshot = history.value[historyIndex.value]
  if (!snapshot) return
  store.editorPixels.clear()
  for (const [key, color] of snapshot) {
    store.editorPixels.set(key, color)
  }
  const layer = store.activeLayer
  if (layer) {
    layer.pixels = new Map(store.editorPixels)
  }
}

function handleColorPicked(color: string) {
  selectedColor.value = color
  currentTool.value = 'brush'
  message.info(`已选取颜色: ${color}`)
}

function toggleHighlight() {
  highlightColor.value = highlightColor.value ? null : selectedColor.value
}

function zoomIn() { zoom.value = Math.min(3, zoom.value + 0.25) }
function zoomOut() { zoom.value = Math.max(0.25, zoom.value - 0.25) }

const bgOptions = [
  { name: 'checker', label: '棋盘格' },
  { name: 'white', label: '白色' },
  { name: 'light', label: '浅灰' },
  { name: 'dark', label: '深灰' },
  { name: 'black', label: '黑色' },
]

function handleWidthChange(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  if (val >= 1 && val <= 200) {
    store.editorWidth = val
    store.compositeLayers()
    nextTick(() => canvasRef.value?.fitToView())
  }
}

function handleHeightChange(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  if (val >= 1 && val <= 200) {
    store.editorHeight = val
    store.compositeLayers()
    nextTick(() => canvasRef.value?.fitToView())
  }
}

function buildResult() {
  return {
    pixels: Array.from(store.editorPixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      return { x, y, color, colorIndex: 0 }
    }),
    beadColors: store.result?.beadColors || [],
    width: store.editorWidth,
    height: store.editorHeight,
    imageData: new ImageData(1, 1),
  }
}

function handleExport(type: string) {
  const result = buildResult()
  const name = `pixelworld-editor-${Date.now()}`

  try {
    switch (type) {
      case 'preview':
        downloadImage(exportPreviewImage(result, 16, store.beadShape), `${name}-preview.png`)
        break
      case 'template':
        downloadImage(exportTemplateImage(result), `${name}-template.png`)
        break
      case 'colorblock':
        downloadImage(exportColorBlockImage(result), `${name}-colorblock.png`)
        break
      case 'pdf':
        exportPDF(result, 'PixelWorld 编辑器导出')
        break
    }
    showExportModal.value = false
    message.success('导出成功')
  } catch (err) {
    message.error('导出失败')
    console.error(err)
  }
}

function handleExportPDF() {
  exportPDF(buildResult(), 'PixelWorld 编辑器导出')
  message.success('PDF 已导出')
}
</script>

<style lang="scss" scoped>
.editor-page {
  display: flex;
  flex: 1;
  padding: $spacing-sm;
  gap: $spacing-sm;
  background: $color-bg;
  overflow: hidden;
  position: relative;
}

.mobile-tip {
  position: absolute;
  top: $spacing-sm;
  left: 50%;
  transform: translateX(-50%);
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 50;
  pointer-events: none;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.editor-canvas-area {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.editor-canvas-container) {
  flex: 1 !important;
}

.editor-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  min-height: 0;
  overflow-y: auto;
}

.info-panel {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;

  .info-title { font-size: $font-size-sm; font-weight: 600; margin-bottom: $spacing-md; }
  .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
    .info-label { color: $color-text-muted; }
    .info-value { font-weight: 500; }
  }
}

.quick-export { margin-top: auto; }

.canvas-settings {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;

  .settings-title {
    font-size: $font-size-sm;
    font-weight: 600;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $color-border-light;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
    &:last-child { margin-bottom: 0; }
  }

  .setting-label {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    flex-shrink: 0;
  }

  .size-inputs {
    display: flex;
    align-items: center;
    gap: 4px;

    .size-input {
      width: 48px;
      height: 28px;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      text-align: center;
      font-size: $font-size-sm;
      font-family: monospace;
      padding: 0;
      outline: none;
      &:focus { border-color: $color-primary; }
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      -moz-appearance: textfield;
    }

    .size-x { color: $color-text-muted; font-size: $font-size-sm; }
  }

  .bg-options { display: flex; gap: 4px; }

  .bg-btn {
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-radius: 5px;
    padding: 0;
    cursor: pointer;
    transition: border-color $transition-fast;

    &.checker {
      background: conic-gradient(#e0e0e0 25%, #fff 25% 50%, #e0e0e0 50% 75%, #fff 75%);
      background-size: 6px 6px;
    }
    &.white { background: #fff; border-color: $color-border-light; }
    &.light { background: #f0f0f0; }
    &.dark { background: #666; }
    &.black { background: #1a1a1a; }

    &.active { border-color: $color-primary; }
    &:hover:not(.active) { border-color: $color-text-muted; }
  }
}

.export-options { display: flex; flex-direction: column; gap: $spacing-sm; }

.export-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-md;
  border: 1px solid $color-border-light;
  cursor: pointer;
  transition: all $transition-fast;
  &:hover { background: rgba($color-primary, 0.04); border-color: $color-primary; }
  .export-icon { font-size: 28px; }
  .export-name { font-weight: 500; font-size: $font-size-sm; }
  .export-desc { font-size: $font-size-xs; color: $color-text-muted; margin-top: 2px; }
}

// ===== 移动端样式 =====
.mobile-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $color-bg-white;
  border-top: 1px solid $color-border;
  z-index: 100;
  padding: 4px 8px env(safe-area-inset-bottom, 4px);
}

.mobile-tools {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 0;
}

.mobile-tool-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-fast;

  &:active { background: rgba(0, 0, 0, 0.08); }
  &.active { background: rgba($color-primary, 0.12); }
  &:disabled { opacity: 0.3; }
}

.mobile-divider {
  width: 1px;
  height: 24px;
  background: $color-border;
  margin: 0 2px;
}

.mobile-color-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 4px 0;
  border-top: 1px solid $color-border-light;

  .mobile-color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid $color-border;
  }

  .mobile-color-hex {
    font-size: $font-size-xs;
    font-family: monospace;
    color: $color-text-secondary;
  }

  .mobile-zoom {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    button {
      width: 28px;
      height: 28px;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      background: $color-bg-white;
      font-size: 16px;
      cursor: pointer;
    }

    span {
      font-size: $font-size-xs;
      min-width: 36px;
      text-align: center;
    }
  }
}

.mobile-drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: $color-bg;
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md;
    background: $color-bg-white;
    font-weight: 600;
    font-size: $font-size-md;
    border-bottom: 1px solid $color-border;
    padding-top: calc($spacing-md + env(safe-area-inset-top, 0px));

    .drawer-close {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: $radius-sm;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      &:hover { background: rgba(0, 0, 0, 0.06); }
    }
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm;
  }
}

// ===== 过渡动画 =====
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
