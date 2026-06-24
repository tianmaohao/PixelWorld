import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ConvertParams, ConvertResult, GridSize, DitherAlgorithm, PaletteBrand, Layer } from '@/types'
import { GRID_SIZES } from '@/core/converter'
import { hexToRgb, rgbToHex } from '@/core/palette'

let layerIdCounter = 0

function createDefaultLayer(name: string = '图层 1'): Layer {
  return {
    id: `layer-${++layerIdCounter}`,
    name,
    visible: true,
    locked: false,
    opacity: 1,
    pixels: new Map(),
  }
}

export const useProjectStore = defineStore('project', () => {
  // ===== 转换参数 =====
  const gridSize = ref<GridSize>(GRID_SIZES[0])
  const colorCount = ref(32)
  const brightness = ref(0)
  const contrast = ref(0)
  const saturation = ref(0)
  const blur = ref(0)
  const dither = ref<DitherAlgorithm>('none')
  const palette = ref<PaletteBrand>('none')

  // ===== 源图片 =====
  const sourceImage = ref<string | null>(null)
  const sourceFileName = ref('')

  // ===== 转换结果 =====
  const result = ref<ConvertResult | null>(null)
  const isConverting = ref(false)

  // ===== 编辑器状态 =====
  const editorPixels = ref<Map<string, string>>(new Map())
  const editorWidth = ref(29)
  const editorHeight = ref(29)

  // ===== 图层 =====
  const layers = ref<Layer[]>([createDefaultLayer()])
  const activeLayerId = ref(layers.value[0].id)

  const activeLayer = computed(() =>
    layers.value.find(l => l.id === activeLayerId.value) || layers.value[0]
  )

  // ===== 计算属性 =====
  const convertParams = computed<ConvertParams>(() => ({
    gridSize: gridSize.value,
    colorCount: colorCount.value,
    brightness: brightness.value,
    contrast: contrast.value,
    saturation: saturation.value,
    blur: blur.value,
    dither: dither.value,
    palette: palette.value,
  }))

  const beadCount = computed(() => {
    if (result.value) return result.value.pixels.length
    return gridSize.value.width * gridSize.value.height
  })

  /** 将所有可见图层合并到 editorPixels（从底到顶） */
  function compositeLayers() {
    editorPixels.value.clear()
    for (const layer of layers.value) {
      if (!layer.visible || layer.opacity <= 0) continue
      for (const [key, color] of layer.pixels) {
        // 透明度 < 1 时：如果下层已有颜色则混合，否则直接覆盖
        if (layer.opacity < 1) {
          const existing = editorPixels.value.get(key)
          if (existing) {
            // 简单 alpha 混合
            const [er, eg, eb] = hexToRgb(existing)
            const [nr, ng, nb] = hexToRgb(color)
            const a = layer.opacity
            const r = Math.round(er * (1 - a) + nr * a)
            const g = Math.round(eg * (1 - a) + ng * a)
            const b = Math.round(eb * (1 - a) + nb * a)
            editorPixels.value.set(key, rgbToHex(r, g, b))
          } else {
            editorPixels.value.set(key, color)
          }
        } else {
          editorPixels.value.set(key, color)
        }
      }
    }
  }

  // ===== 操作 =====
  function setSourceImage(src: string, fileName: string = '') {
    sourceImage.value = src
    sourceFileName.value = fileName
    result.value = null
    editorPixels.value.clear()
  }

  function setResult(r: ConvertResult) {
    result.value = r
    editorWidth.value = r.width
    editorHeight.value = r.height
    // 重置图层：把转换结果放到第一层
    layers.value = [createDefaultLayer('图层 1')]
    activeLayerId.value = layers.value[0].id
    for (const pixel of r.pixels) {
      layers.value[0].pixels.set(`${pixel.x},${pixel.y}`, pixel.color)
    }
    compositeLayers()
  }

  function updatePixel(x: number, y: number, color: string | null) {
    const layer = activeLayer.value
    if (!layer || layer.locked) return
    const key = `${x},${y}`
    if (color === null) {
      layer.pixels.delete(key)
    } else {
      layer.pixels.set(key, color)
    }
    compositeLayers()
  }

  // ===== 图层操作 =====
  function addLayer() {
    const name = `图层 ${layers.value.length + 1}`
    const layer = createDefaultLayer(name)
    layers.value.push(layer)
    activeLayerId.value = layer.id
  }

  function removeLayer(id: string) {
    if (layers.value.length <= 1) return
    const idx = layers.value.findIndex(l => l.id === id)
    if (idx === -1) return
    layers.value.splice(idx, 1)
    if (activeLayerId.value === id) {
      activeLayerId.value = layers.value[Math.min(idx, layers.value.length - 1)].id
    }
    compositeLayers()
  }

  function selectLayer(id: string) {
    activeLayerId.value = id
  }

  function toggleLayerVisibility(id: string) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) {
      layer.visible = !layer.visible
      compositeLayers()
    }
  }

  function toggleLayerLock(id: string) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) layer.locked = !layer.locked
  }

  function setLayerOpacity(id: string, opacity: number) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) layer.opacity = opacity
  }

  function resetParams() {
    gridSize.value = GRID_SIZES[0]
    colorCount.value = 32
    brightness.value = 0
    contrast.value = 0
    saturation.value = 0
    blur.value = 0
    dither.value = 'none'
    palette.value = 'none'
  }

  return {
    // 状态
    gridSize, colorCount, brightness, contrast, saturation, blur, dither, palette,
    sourceImage, sourceFileName, result, isConverting,
    editorPixels, editorWidth, editorHeight,
    // 图层
    layers, activeLayerId, activeLayer,
    // 计算属性
    convertParams, beadCount,
    // 操作
    setSourceImage, setResult, updatePixel, resetParams,
    addLayer, removeLayer, selectLayer,
    toggleLayerVisibility, toggleLayerLock, setLayerOpacity,
    compositeLayers,
  }
})
