import type { ConvertParams, ConvertResult, Pixel, GridSize, BeadColor, PaletteBrand } from '@/types'
import { getPalette, hexToRgb, colorDistance } from './palette'
import { medianCut, extractPixels } from './quantize'

/** 预设网格尺寸 */
export const GRID_SIZES: GridSize[] = [
  { name: 'classic', label: '经典像素 (29×29)', width: 29, height: 29 },
  { name: 'large', label: '大尺寸 (58×58)', width: 58, height: 58 },
  { name: 'extra-large', label: '超大尺寸 (116×116)', width: 116, height: 116 },
  { name: 'circle', label: '圆形模版 (29×29)', width: 29, height: 29 },
  { name: 'heart', label: '心形模版 (29×29)', width: 29, height: 29 },
]

function createOffscreenCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// ==================== 内容感知裁剪 ====================

function getContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number = 10
): { x: number; y: number; w: number; h: number } | null {
  let minX = width, minY = height, maxX = 0, maxY = 0
  let found = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha >= alphaThreshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        found = true
      }
    }
  }

  if (!found) return null
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

function smartResize(img: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement {
  const { canvas: tempCanvas, ctx: tempCtx } = createOffscreenCanvas(img.width, img.height)
  tempCtx.drawImage(img, 0, 0)
  const imgData = tempCtx.getImageData(0, 0, img.width, img.height)

  let hasAlpha = false
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] < 250) { hasAlpha = true; break }
  }

  const { canvas, ctx } = createOffscreenCanvas(targetWidth, targetHeight)

  if (hasAlpha) {
    const bounds = getContentBounds(imgData.data, img.width, img.height)
    if (!bounds) return canvas

    const padX = Math.round(bounds.w * 0.05)
    const padY = Math.round(bounds.h * 0.05)
    const cropX = Math.max(0, bounds.x - padX)
    const cropY = Math.max(0, bounds.y - padY)
    const cropW = Math.min(img.width - cropX, bounds.w + padX * 2)
    const cropH = Math.min(img.height - cropY, bounds.h + padY * 2)

    const contentRatio = cropW / cropH
    const targetRatio = targetWidth / targetHeight
    let drawW: number, drawH: number, drawX: number, drawY: number

    if (contentRatio > targetRatio) {
      drawW = targetWidth; drawH = targetWidth / contentRatio
      drawX = 0; drawY = (targetHeight - drawH) / 2
    } else {
      drawH = targetHeight; drawW = targetHeight * contentRatio
      drawX = (targetWidth - drawW) / 2; drawY = 0
    }

    ctx.drawImage(img, cropX, cropY, cropW, cropH, drawX, drawY, drawW, drawH)
  } else {
    const imgRatio = img.width / img.height
    const targetRatio = targetWidth / targetHeight
    let drawW: number, drawH: number, drawX: number, drawY: number

    if (imgRatio > targetRatio) {
      drawH = targetHeight; drawW = targetHeight * imgRatio
      drawX = -(drawW - targetWidth) / 2; drawY = 0
    } else {
      drawW = targetWidth; drawH = targetWidth / imgRatio
      drawX = 0; drawY = -(drawH - targetHeight) / 2
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH)
  }

  return canvas
}

// ==================== 图像调整 ====================

function applyImageAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  params: Pick<ConvertParams, 'brightness' | 'contrast' | 'saturation' | 'blur'>
): void {
  // 模糊：使用 Canvas filter 在获取像素数据之前应用
  if (params.blur > 0) {
    ctx.filter = `blur(${params.blur}px)`
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.drawImage(ctx.canvas, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.filter = 'none'
  }

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const brightness = params.brightness * 2.55
  const contrastFactor = (259 * (params.contrast * 2.55 + 255)) / (255 * (259 - params.contrast * 2.55))
  const satFactor = 1 + params.saturation / 50

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    let r = data[i], g = data[i + 1], b = data[i + 2]

    r += brightness; g += brightness; b += brightness
    r = contrastFactor * (r - 128) + 128
    g = contrastFactor * (g - 128) + 128
    b = contrastFactor * (b - 128) + 128

    const gray = 0.2989 * r + 0.587 * g + 0.114 * b
    r = gray + satFactor * (r - gray)
    g = gray + satFactor * (g - gray)
    b = gray + satFactor * (b - gray)

    data[i] = Math.max(0, Math.min(255, r))
    data[i + 1] = Math.max(0, Math.min(255, g))
    data[i + 2] = Math.max(0, Math.min(255, b))
  }

  ctx.putImageData(imageData, 0, 0)
}

// ==================== 形状蒙版 ====================

function applyShapeMask(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  shape: 'circle' | 'heart'
): void {
  const { canvas: maskCanvas, ctx: maskCtx } = createOffscreenCanvas(width, height)
  maskCtx.fillStyle = '#000000'
  maskCtx.beginPath()

  if (shape === 'circle') {
    const cx = width / 2, cy = height / 2
    maskCtx.arc(cx, cy, Math.min(width, height) / 2 - 1, 0, Math.PI * 2)
  } else if (shape === 'heart') {
    const cx = width / 2, cy = height / 2
    const size = Math.min(width, height) * 0.45
    maskCtx.moveTo(cx, cy + size * 0.7)
    maskCtx.bezierCurveTo(cx - size * 1.2, cy - size * 0.3, cx - size * 0.6, cy - size * 1.2, cx, cy - size * 0.5)
    maskCtx.bezierCurveTo(cx + size * 0.6, cy - size * 1.2, cx + size * 1.2, cy - size * 0.3, cx, cy + size * 0.7)
  }

  maskCtx.closePath(); maskCtx.fill()

  const imageData = ctx.getImageData(0, 0, width, height)
  const maskData = maskCtx.getImageData(0, 0, width, height)
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (maskData.data[i] === 0) imageData.data[i + 3] = 0
  }
  ctx.putImageData(imageData, 0, 0)
}

// ==================== 颜色查找 ====================

/** 在调色盘 RGB 数组中找到最接近的索引 */
function findClosestPaletteIndex(
  r: number, g: number, b: number,
  palette: [number, number, number][]
): number {
  let bestIdx = 0, bestDist = Infinity
  for (let j = 0; j < palette.length; j++) {
    const [pr, pg, pb] = palette[j]
    const dist = colorDistance(r, g, b, pr, pg, pb)
    if (dist < bestDist) { bestDist = dist; bestIdx = j }
  }
  return bestIdx
}

// ==================== 主转换函数 ====================

export async function convertImage(
  imageSrc: string,
  params: ConvertParams
): Promise<ConvertResult> {
  const img = await loadImage(imageSrc)
  const { width, height } = params.gridSize

  // 1. 智能缩放
  const resizedCanvas = smartResize(img, width, height)

  // 2. 形状蒙版
  if (params.gridSize.name === 'circle' || params.gridSize.name === 'heart') {
    applyShapeMask(resizedCanvas.getContext('2d')!, width, height, params.gridSize.name as 'circle' | 'heart')
  }

  // 3. 调整参数
  const { ctx } = createOffscreenCanvas(width, height)
  ctx.drawImage(resizedCanvas, 0, 0)
  applyImageAdjustments(ctx, width, height, params)

  // 4. 获取像素数据
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 5. 是否使用拼豆调色盘
  const useBeadPalette = params.palette !== 'none'
  const beadPalette = useBeadPalette ? getPalette(params.palette) : []
  const beadRgb: [number, number, number][] = beadPalette.map(b => hexToRgb(b.hex))

  // ===== 阶段一：Median Cut 从图像提取主导色 =====
  const rawPixels = extractPixels(imageData)
  let mcPalette = medianCut(rawPixels, params.colorCount)

  // ===== 阶段二：构建最终使用的调色盘 =====
  let finalPalette: [number, number, number][]  // 逐像素映射的目标调色盘
  let mcToFinal: Map<number, number>             // mcPalette 索引 → finalPalette 索引

  if (useBeadPalette) {
    // 有拼豆调色盘：mc → bead（一对多映射，可能多个mc映射到同一个bead）
    mcToFinal = new Map()
    for (let i = 0; i < mcPalette.length; i++) {
      const [mr, mg, mb] = mcPalette[i]
      mcToFinal.set(i, findClosestPaletteIndex(mr, mg, mb, beadRgb))
    }
    finalPalette = beadRgb
  } else {
    // 纯色模式：直接用 Median Cut 颜色，不做任何映射
    mcToFinal = new Map()
    for (let i = 0; i < mcPalette.length; i++) {
      mcToFinal.set(i, i)  // 直接映射到自身
    }
    finalPalette = mcPalette
  }

  // ===== 阶段三：抖动（可选） =====
  if (params.dither === 'floyd-steinberg' || params.dither === 'atkinson') {
    // 构造"有效调色盘"（实际被用到的 finalPalette 子集）
    const usedFinalIndices = new Set<number>(mcToFinal.values())
    const ditherTarget: [number, number, number][] = Array.from(usedFinalIndices).map(i => finalPalette[i])
    ditherImage(data, width, height, ditherTarget, params.dither)
  }

  // ===== 阶段四：逐像素生成结果 =====
  const pixels: Pixel[] = []
  const usedColors = new Map<string, BeadColor>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const offset = idx * 4
      if (data[offset + 3] < 128) continue

      let r = data[offset], g = data[offset + 1], b = data[offset + 2]
      let dr: number, dg: number, db: number

      if (params.dither === 'floyd-steinberg' || params.dither === 'atkinson') {
        // 抖动已经量化过了，直接取最近匹配
        const ditherTarget = Array.from(new Set(mcToFinal.values())).map(i => finalPalette[i])
        const nearest = findClosestPaletteIndex(r, g, b, ditherTarget)
        ;[dr, dg, db] = ditherTarget[nearest]
      } else {
        // 未抖动：mcPalette 索引 → finalPalette 索引
        const mcIdx = findClosestPaletteIndex(r, g, b, mcPalette)
        const finalIdx = mcToFinal.get(mcIdx)!
        ;[dr, dg, db] = finalPalette[finalIdx]
      }

      const hex = '#' + [dr, dg, db].map((c: number) => c.toString(16).padStart(2, '0')).join('')
      let beadColor = usedColors.get(hex)
      if (!beadColor) {
        if (useBeadPalette) {
          beadColor = beadPalette.find(bc => bc.hex.toUpperCase() === hex.toUpperCase())
          if (!beadColor) beadColor = { code: 'C?', name: hex, hex, brand: params.palette }
        } else {
          // 纯色模式：动态生成颜色条目
          const idx = finalPalette.findIndex(([fr, fg, fb]) => fr === dr && fg === dg && fb === db)
          beadColor = { code: `C${idx + 1}`.padStart(3, '0'), name: hex, hex, brand: 'none' as PaletteBrand }
        }
        usedColors.set(hex, beadColor)
      }

      pixels.push({
        x, y,
        color: beadColor.hex,
        colorIndex: usedColors.size,
      })
    }
  }

  // 5. 生成结果 ImageData
  const { canvas: resultCanvas, ctx: resultCtx } = createOffscreenCanvas(width, height)
  const resultData = resultCtx.createImageData(width, height)
  for (const pixel of pixels) {
    const [r, g, b] = hexToRgb(pixel.color)
    const offset = (pixel.y * width + pixel.x) * 4
    resultData.data[offset] = r
    resultData.data[offset + 1] = g
    resultData.data[offset + 2] = b
    resultData.data[offset + 3] = 255
  }

  return {
    pixels,
    beadColors: Array.from(usedColors.values()),
    width, height,
    imageData: resultData,
  }
}

// ==================== Alpha 感知抖动（只用有效调色盘） ====================

function ditherImage(
  data: Uint8ClampedArray,
  width: number, height: number,
  palette: [number, number, number][],
  mode: 'floyd-steinberg' | 'atkinson'
): void {
  const total = width * height
  const errR = new Float32Array(total)
  const errG = new Float32Array(total)
  const errB = new Float32Array(total)
  const isOpaque = new Uint8Array(total)

  for (let i = 0; i < total; i++) {
    isOpaque[i] = data[i * 4 + 3] >= 128 ? 1 : 0
    if (isOpaque[i]) {
      errR[i] = data[i * 4]
      errG[i] = data[i * 4 + 1]
      errB[i] = data[i * 4 + 2]
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (!isOpaque[idx]) continue

      let oldR = Math.max(0, Math.min(255, errR[idx]))
      let oldG = Math.max(0, Math.min(255, errG[idx]))
      let oldB = Math.max(0, Math.min(255, errB[idx]))

      const nearestIdx = findClosestPaletteIndex(oldR, oldG, oldB, palette)
      const [newR, newG, newB] = palette[nearestIdx]
      const er = oldR - newR, eg = oldG - newG, eb = oldB - newB

      const offset = idx * 4
      data[offset] = newR
      data[offset + 1] = newG
      data[offset + 2] = newB
      data[offset + 3] = 255

      if (mode === 'floyd-steinberg') {
        const neighbors: [number, number, number][] = [
          [x + 1, y, 7 / 16], [x - 1, y + 1, 3 / 16], [x, y + 1, 5 / 16], [x + 1, y + 1, 1 / 16],
        ]
        for (const [nx, ny, weight] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx
            if (isOpaque[nIdx]) {
              errR[nIdx] += er * weight
              errG[nIdx] += eg * weight
              errB[nIdx] += eb * weight
            }
          }
        }
      } else {
        // Atkinson
        const offsets: [number, number][] = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]
        for (const [dx, dy] of offsets) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx
            if (isOpaque[nIdx]) {
              errR[nIdx] += er / 8; errG[nIdx] += eg / 8; errB[nIdx] += eb / 8
            }
          }
        }
      }
    }
  }
}
