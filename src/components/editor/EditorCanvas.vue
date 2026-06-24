<template>
  <div
    class="editor-canvas-container"
    ref="containerRef"
    @mousedown="handleContainerMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @wheel.prevent="handleWheel"
    @dblclick="fitToView"
    @contextmenu.prevent
  >
    <canvas
      ref="canvasRef"
      class="editor-canvas"
      :style="canvasStyle"
    />

    <!-- 覆盖层：始终贴在容器四角，不受画布缩放平移影响 -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:10;">
      <div v-if="hoverCoord" style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.7);color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;font-family:monospace;">
        X: {{ hoverCoord.x }}, Y: {{ hoverCoord.y }}
      </div>

      <div style="position:absolute;bottom:8px;right:44px;background:rgba(0,0,0,0.7);color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;font-family:monospace;">
        {{ Math.round(zoom * 100) }}%
      </div>

      <button
        style="position:absolute;bottom:8px;right:8px;width:32px;height:32px;border:none;border-radius:10px;background:rgba(0,0,0,0.6);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;pointer-events:auto;"
        title="居中 (双击画布)"
        @click="fitToView"
        @mouseenter="($event.target as HTMLElement).style.background='rgba(0,0,0,0.85)'"
        @mouseleave="($event.target as HTMLElement).style.background='rgba(0,0,0,0.6)'"
      >⊕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { EditorTool } from '@/types'

const props = defineProps<{
  tool: EditorTool
  selectedColor: string
  showGrid: boolean
  highlightColor: string | null
  zoom: number
}>()

const emit = defineEmits<{
  (e: 'update:zoom', zoom: number): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'colorPicked', color: string): void
  (e: 'modified'): void
}>()

const store = useProjectStore()
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const PIXEL_SIZE = 16

// 交互状态
const isDrawing = ref(false)
const isPanning = ref(false)
const spaceHeld = ref(false)
const hoverCoord = ref<{ x: number; y: number } | null>(null)

// 变换状态
const panX = ref(0)
const panY = ref(0)
const lastMouse = ref({ x: 0, y: 0 })

const canvasStyle = computed(() => {
  let cursor = 'crosshair'
  if (props.tool === 'move' || isPanning.value || spaceHeld.value) {
    cursor = isPanning.value ? 'grabbing' : 'grab'
  } else if (props.tool === 'picker') {
    cursor = 'crosshair'
  } else if (props.tool === 'fill') {
    cursor = 'crosshair'
  }

  return {
    imageRendering: 'pixelated' as const,
    cursor,
    transform: `translate(${panX.value}px, ${panY.value}px) scale(${props.zoom})`,
    transformOrigin: '0 0',
  }
})

// ==================== 画布渲染 ====================

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')!
  const w = store.editorWidth
  const h = store.editorHeight
  canvas.width = w * PIXEL_SIZE
  canvas.height = h * PIXEL_SIZE

  // 棋盘格背景
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#FFFFFF' : '#F0F0F0'
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
    }
  }

  // 图层渲染
  for (const layer of store.layers) {
    if (!layer.visible) continue
    ctx.globalAlpha = layer.opacity

    for (const [key, color] of layer.pixels) {
      const [x, y] = key.split(',').map(Number)
      const cx = x * PIXEL_SIZE + PIXEL_SIZE / 2
      const cy = y * PIXEL_SIZE + PIXEL_SIZE / 2
      const r = (PIXEL_SIZE - 2) / 2

      if (props.highlightColor && color === props.highlightColor) {
        // 高亮：画圆 + 红色边框
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#FF0000'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        // 正常豆子
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        // 高光
        ctx.beginPath()
        ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fill()
      }
    }
  }

  ctx.globalAlpha = 1

  // 网格线
  if (props.showGrid) {
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= w; x++) {
      ctx.beginPath()
      ctx.moveTo(x * PIXEL_SIZE, 0)
      ctx.lineTo(x * PIXEL_SIZE, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * PIXEL_SIZE)
      ctx.lineTo(canvas.width, y * PIXEL_SIZE)
      ctx.stroke()
    }
  }
}

// ==================== 坐标转换 ====================

/** 屏幕坐标 → 画布像素坐标（已考虑缩放和平移） */
function screenToPixel(e: MouseEvent): { x: number; y: number } | null {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return null

  const containerRect = container.getBoundingClientRect()
  // 鼠标相对于容器左上角的偏移
  const mouseX = e.clientX - containerRect.left
  const mouseY = e.clientY - containerRect.top

  // 逆变换：先减去平移，再除以缩放，得到 canvas 像素坐标
  const canvasX = (mouseX - panX.value) / props.zoom
  const canvasY = (mouseY - panY.value) / props.zoom

  // canvas 像素坐标 → 网格坐标
  const gridX = Math.floor(canvasX / PIXEL_SIZE)
  const gridY = Math.floor(canvasY / PIXEL_SIZE)

  if (gridX < 0 || gridX >= store.editorWidth || gridY < 0 || gridY >= store.editorHeight) {
    return null
  }
  return { x: gridX, y: gridY }
}

// ==================== 缩放 ====================

/** 以鼠标位置为中心缩放 */
function zoomAtPoint(newZoom: number, e: MouseEvent) {
  const container = containerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 缩放前鼠标在画布上的位置
  const canvasX = (mouseX - panX.value) / props.zoom
  const canvasY = (mouseY - panY.value) / props.zoom

  // 应用新缩放
  const clamped = Math.max(0.1, Math.min(10, newZoom))
  emit('update:zoom', clamped)

  // 缩放后调整平移，使鼠标下的画布点保持不动
  panX.value = mouseX - canvasX * clamped
  panY.value = mouseY - canvasY * clamped
}

function handleWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    // Ctrl + 滚轮 → 缩放
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoomAtPoint(props.zoom * (1 + delta), e)
  } else {
    // 普通滚轮 → 平移
    panX.value -= e.deltaX
    panY.value -= e.deltaY
  }
}

// ==================== 鼠标交互 ====================

function shouldPan(e: MouseEvent): boolean {
  return props.tool === 'move' || spaceHeld.value || e.button === 1 || e.button === 2
}

function handleContainerMouseDown(e: MouseEvent) {
  if (e.target !== canvasRef.value && e.target !== containerRef.value) return

  if (shouldPan(e)) {
    isPanning.value = true
    lastMouse.value = { x: e.clientX, y: e.clientY }
    e.preventDefault()
    return
  }

  const coord = screenToPixel(e)
  if (!coord) return

  const layer = store.activeLayer
  if (layer && layer.locked) return

  if (props.tool === 'picker') {
    const key = `${coord.x},${coord.y}`
    const color = store.editorPixels.get(key)
    if (color) emit('colorPicked', color)
    return
  }

  if (props.tool === 'fill') {
    floodFill(coord.x, coord.y)
    emit('modified')
    return
  }

  isDrawing.value = true
  applyTool(coord.x, coord.y)
}

function handleMouseMove(e: MouseEvent) {
  hoverCoord.value = screenToPixel(e)

  if (isPanning.value) {
    const dx = e.clientX - lastMouse.value.x
    const dy = e.clientY - lastMouse.value.y
    panX.value += dx
    panY.value += dy
    lastMouse.value = { x: e.clientX, y: e.clientY }
    return
  }

  if (!isDrawing.value) return
  const coord = screenToPixel(e)
  if (coord) applyTool(coord.x, coord.y)
}

function handleMouseUp() {
  if (isDrawing.value) emit('modified')
  isDrawing.value = false
  isPanning.value = false
}

// ==================== 工具 ====================

function applyTool(x: number, y: number) {
  switch (props.tool) {
    case 'brush':
      store.updatePixel(x, y, props.selectedColor)
      break
    case 'eraser':
      store.updatePixel(x, y, null)
      break
  }
}

function floodFill(startX: number, startY: number) {
  const targetKey = `${startX},${startY}`
  const targetColor = store.editorPixels.get(targetKey) || ''
  if (targetColor === props.selectedColor) return

  const stack: [number, number][] = [[startX, startY]]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    const key = `${x},${y}`
    if (visited.has(key)) continue
    if (x < 0 || x >= store.editorWidth || y < 0 || y >= store.editorHeight) continue
    const currentColor = store.editorPixels.get(key) || ''
    if (currentColor !== targetColor) continue

    visited.add(key)
    store.updatePixel(x, y, props.selectedColor)
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
}

// ==================== 适配视图 ====================

function fitToView() {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const cw = store.editorWidth * PIXEL_SIZE
  const ch = store.editorHeight * PIXEL_SIZE
  const vw = container.clientWidth - 40
  const vh = container.clientHeight - 40

  const scale = Math.min(vw / cw, vh / ch, 2)
  emit('update:zoom', scale)

  panX.value = (container.clientWidth - cw * scale) / 2
  panY.value = (container.clientHeight - ch * scale) / 2
}

// ==================== 键盘 ====================

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !e.repeat) {
    spaceHeld.value = true
    e.preventDefault()
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    spaceHeld.value = false
  }
}

// ==================== 生命周期 ====================

let firstFitDone = false

watch(() => [store.editorPixels.size, store.editorWidth, store.editorHeight], () => {
  drawCanvas()
  // 内容变化时重新适配（仅在首次加载后）
  if (firstFitDone) {
    nextTick(fitToView)
  }
}, { deep: true })

watch(() => props.showGrid, () => drawCanvas())
watch(() => props.highlightColor, () => drawCanvas())
watch(() => props.zoom, () => drawCanvas())

onMounted(() => {
  drawCanvas()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // 等容器尺寸稳定后适配
  const tryFit = () => {
    const container = containerRef.value
    if (!container || container.clientWidth === 0) {
      requestAnimationFrame(tryFit)
      return
    }
    fitToView()
    firstFitDone = true
  }
  requestAnimationFrame(tryFit)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

defineExpose({ fitToView, getCanvas: () => canvasRef.value })
</script>

<style lang="scss" scoped>
.editor-canvas-container {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #E8E8E8;
  border-radius: $radius-lg;
  user-select: none;
}
</style>
