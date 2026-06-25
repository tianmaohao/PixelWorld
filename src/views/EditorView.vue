<template>
  <div class="editor-page">
    <!-- 左侧工具栏 -->
    <ToolBar
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

    <!-- 中间画布 -->
    <div class="editor-canvas-area">
      <EditorCanvas
        ref="canvasRef"
        :tool="currentTool"
        :selected-color="selectedColor"
        :show-grid="showGrid"
        :highlight-color="highlightColor"
        :zoom="zoom"
        @update:zoom="(v: number) => zoom = v"
        @color-picked="handleColorPicked"
        @modified="saveHistory"
      />
    </div>

    <!-- 右侧面板 -->
    <aside class="editor-sidebar">
      <ColorPalette
        :selected-color="selectedColor"
        :highlight-color="highlightColor"
        @select-color="selectedColor = $event"
      />

      <div v-if="store.result" class="info-panel">
        <h4 class="info-title">📊 图片信息</h4>
        <div class="info-grid">
          <span class="info-label">尺寸:</span>
          <span class="info-value">{{ store.editorWidth }} × {{ store.editorHeight }}</span>
          <span class="info-label">豆子数:</span>
          <span class="info-value">{{ store.editorPixels.size }}颗</span>
          <span class="info-label">颜色数:</span>
          <span class="info-value">{{ usedColorCount }}种</span>
        </div>
      </div>

      <div class="quick-export">
        <n-button block type="primary" secondary @click="showExportModal = true">
          📥 导出作品
        </n-button>
      </div>
    </aside>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NModal, useMessage } from 'naive-ui'
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

// 历史记录
const history = ref<Map<string, string>[]>([])
const historyIndex = ref(-1)
const maxHistory = 50

const usedColorCount = computed(() => {
  const colors = new Set(store.editorPixels.values())
  return colors.size
})

onMounted(() => {
  saveHistory()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
  // 同步回当前活动图层
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
}

.editor-canvas-area {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
}

.editor-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  overflow-y: auto;
  min-height: 0;
  padding-right: 2px;

  > * {
    flex-shrink: 0;
  }
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

@media (max-width: $breakpoint-lg) {
  .editor-page { flex-direction: column; }
  .editor-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; overflow-x: auto; }
}
</style>
