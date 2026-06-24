<template>
  <div class="pixel-preview" ref="containerRef">
    <div v-if="!result" class="preview-placeholder">
      <span class="placeholder-icon">🎨</span>
      <p>上传图片并点击"开始转换"查看效果</p>
    </div>

    <div v-else class="preview-canvas-wrap">
      <canvas
        ref="canvasRef"
        class="preview-canvas"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @wheel.prevent="onZoom"
        @touchstart="startTouch"
        @touchmove="onTouchMove"
        @touchend="endTouch"
      />
    </div>

    <!-- 缩放控制 -->
    <div v-if="result" class="zoom-controls">
      <n-button size="small" quaternary @click="zoomIn">🔍+</n-button>
      <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
      <n-button size="small" quaternary @click="zoomOut">🔍-</n-button>
      <n-button size="small" quaternary @click="resetZoom">重置</n-button>
    </div>

    <!-- 颜色信息提示 -->
    <div v-if="hoveredColor" class="color-tooltip" :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
      <div class="tooltip-swatch" :style="{ background: hoveredColor.hex }" />
      <div class="tooltip-info">
        <span class="tooltip-code">{{ hoveredColor.code }}</span>
        <span class="tooltip-name">{{ hoveredColor.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { NButton } from 'naive-ui'
import { useProjectStore } from '@/stores/project'
import type { ConvertResult, BeadColor } from '@/types'

const store = useProjectStore()
const result = computed(() => store.result)

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

const hoveredColor = ref<BeadColor | null>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const pixelSize = 16

const displayWidth = computed(() => {
  if (!result.value) return 0
  return result.value.width * pixelSize * zoom.value
})

const displayHeight = computed(() => {
  if (!result.value) return 0
  return result.value.height * pixelSize * zoom.value
})

watch(() => result.value, async () => {
  if (!result.value) return
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  await nextTick()
  drawCanvas()
}, { immediate: true })

watch(() => store.beadShape, () => drawCanvas())

async function drawCanvas() {
  const canvas = canvasRef.value
  const r = result.value
  if (!canvas || !r) return

  const ctx = canvas.getContext('2d')!
  const w = r.width * pixelSize
  const h = r.height * pixelSize

  canvas.width = w
  canvas.height = h

  // 背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, w, h)

  // 绘制像素
  const isRound = store.beadShape === 'round'
  const beadRadius = (pixelSize - 2) / 2
  for (const pixel of r.pixels) {
    const cx = pixel.x * pixelSize + pixelSize / 2
    const cy = pixel.y * pixelSize + pixelSize / 2

    if (isRound) {
      // 圆形豆子
      ctx.beginPath()
      ctx.arc(cx, cy, beadRadius, 0, Math.PI * 2)
      ctx.fillStyle = pixel.color
      ctx.fill()
      // 高光
      ctx.beginPath()
      ctx.arc(cx - beadRadius * 0.15, cy - beadRadius * 0.15, beadRadius * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fill()
    } else {
      // 方形豆子
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x * pixelSize + 1, pixel.y * pixelSize + 1, pixelSize - 2, pixelSize - 2)
    }
  }

  // 网格线
  ctx.strokeStyle = '#E8E8E8'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= r.width; x++) {
    ctx.beginPath()
    ctx.moveTo(x * pixelSize, 0)
    ctx.lineTo(x * pixelSize, h)
    ctx.stroke()
  }
  for (let y = 0; y <= r.height; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * pixelSize)
    ctx.lineTo(w, y * pixelSize)
    ctx.stroke()
  }
}

function startPan(e: MouseEvent) {
  isPanning.value = true
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onPan(e: MouseEvent) {
  if (!isPanning.value) {
    // 悬浮显示颜色信息
    updateTooltip(e)
    return
  }

  const dx = e.clientX - lastMouse.value.x
  const dy = e.clientY - lastMouse.value.y
  panX.value += dx
  panY.value += dy
  lastMouse.value = { x: e.clientX, y: e.clientY }

  applyTransform()
}

function endPan() {
  isPanning.value = false
}

function onZoom(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.max(0.25, Math.min(4, zoom.value + delta))
  applyTransform()
}

function zoomIn() {
  zoom.value = Math.min(4, zoom.value + 0.25)
  applyTransform()
}

function zoomOut() {
  zoom.value = Math.max(0.25, zoom.value - 0.25)
  applyTransform()
}

function resetZoom() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  applyTransform()
}

function applyTransform() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.style.transform = `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`
}

function updateTooltip(e: MouseEvent) {
  const canvas = canvasRef.value
  const r = result.value
  if (!canvas || !r) return

  const rect = canvas.getBoundingClientRect()
  // getBoundingClientRect 已包含 transform，直接算网格坐标
  const x = Math.floor((e.clientX - rect.left) / (rect.width / r.width))
  const y = Math.floor((e.clientY - rect.top) / (rect.height / r.height))

  if (x < 0 || x >= r.width || y < 0 || y >= r.height) {
    hoveredColor.value = null
    return
  }

  const pixel = r.pixels.find(p => p.x === x && p.y === y)
  if (pixel) {
    hoveredColor.value = r.beadColors.find(c => c.hex === pixel.color) || null
    tooltipX.value = e.clientX - (containerRef.value?.getBoundingClientRect().left || 0) + 15
    tooltipY.value = e.clientY - (containerRef.value?.getBoundingClientRect().top || 0) + 15
  } else {
    hoveredColor.value = null
  }
}

// 触摸支持
let lastTouchDist = 0

function startTouch(e: TouchEvent) {
  if (e.touches.length === 1) {
    isPanning.value = true
    lastMouse.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && isPanning.value) {
    const dx = e.touches[0].clientX - lastMouse.value.x
    const dy = e.touches[0].clientY - lastMouse.value.y
    panX.value += dx
    panY.value += dy
    lastMouse.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    applyTransform()
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const scale = dist / lastTouchDist
    zoom.value = Math.max(0.25, Math.min(4, zoom.value * scale))
    lastTouchDist = dist
    applyTransform()
  }
}

function endTouch() {
  isPanning.value = false
}
</script>

<style lang="scss" scoped>
.pixel-preview {
  position: relative;
  background: $color-bg-white;
  border-radius: $radius-lg;
  overflow: auto;
  min-height: 400px;
  box-shadow: $shadow-sm;
}

.preview-placeholder {
  text-align: center;
  color: $color-text-muted;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .placeholder-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }
}

.preview-canvas-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  min-width: min-content;
}

.preview-canvas {
  image-rendering: pixelated;
  cursor: grab;
  transition: transform 0.05s linear;

  &:active {
    cursor: grabbing;
  }
}

.zoom-controls {
  position: absolute;
  bottom: $spacing-md;
  right: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $radius-md;
  padding: $spacing-xs $spacing-sm;
  box-shadow: $shadow-md;

  .zoom-level {
    font-size: $font-size-xs;
    font-weight: 500;
    min-width: 40px;
    text-align: center;
  }
}

.color-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: $radius-md;
  padding: $spacing-xs $spacing-sm;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  white-space: nowrap;
  z-index: 10;

  .tooltip-swatch {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .tooltip-info {
    display: flex;
    flex-direction: column;

    .tooltip-code {
      font-weight: 600;
    }

    .tooltip-name {
      opacity: 0.7;
    }
  }
}
</style>
