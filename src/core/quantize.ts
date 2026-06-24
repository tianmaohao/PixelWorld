/**
 * Median Cut 颜色量化算法
 * 将真彩色图像转换为有限颜色数
 */

interface ColorBox {
  rMin: number; rMax: number
  gMin: number; gMax: number
  bMin: number; bMax: number
  pixels: [number, number, number][]
}

/** 获取颜色盒的最大通道范围 */
function getBoxRange(box: ColorBox): { channel: 'r' | 'g' | 'b'; range: number } {
  const rRange = box.rMax - box.rMin
  const gRange = box.gMax - box.gMin
  const bRange = box.bMax - box.bMin

  if (rRange >= gRange && rRange >= bRange) {
    return { channel: 'r', range: rRange }
  } else if (gRange >= rRange && gRange >= bRange) {
    return { channel: 'g', range: gRange }
  } else {
    return { channel: 'b', range: bRange }
  }
}

/** 创建颜色盒 */
function createColorBox(pixels: [number, number, number][]): ColorBox {
  let rMin = 255, rMax = 0
  let gMin = 255, gMax = 0
  let bMin = 255, bMax = 0

  for (const [r, g, b] of pixels) {
    rMin = Math.min(rMin, r)
    rMax = Math.max(rMax, r)
    gMin = Math.min(gMin, g)
    gMax = Math.max(gMax, g)
    bMin = Math.min(bMin, b)
    bMax = Math.max(bMax, b)
  }

  return { rMin, rMax, gMin, gMax, bMin, bMax, pixels }
}

/** 分割颜色盒 */
function splitBox(box: ColorBox): [ColorBox, ColorBox] {
  const { channel } = getBoxRange(box)

  // 按指定通道排序
  box.pixels.sort((a, b) => {
    const idx = channel === 'r' ? 0 : channel === 'g' ? 1 : 2
    return a[idx] - b[idx]
  })

  const mid = Math.floor(box.pixels.length / 2)
  const left = box.pixels.slice(0, mid)
  const right = box.pixels.slice(mid)

  return [createColorBox(left), createColorBox(right)]
}

/** 计算颜色盒的平均颜色 */
function averageColor(box: ColorBox): [number, number, number] {
  if (box.pixels.length === 0) return [0, 0, 0]

  let rSum = 0, gSum = 0, bSum = 0
  for (const [r, g, b] of box.pixels) {
    rSum += r
    gSum += g
    bSum += b
  }

  const len = box.pixels.length
  return [
    Math.round(rSum / len),
    Math.round(gSum / len),
    Math.round(bSum / len),
  ]
}

/**
 * Median Cut 量化算法
 * @param pixels 像素颜色数组 [r, g, b][]
 * @param colorCount 目标颜色数
 * @returns 量化后的颜色调色板
 */
export function medianCut(
  pixels: [number, number, number][],
  colorCount: number
): [number, number, number][] {
  if (pixels.length === 0) return []
  if (colorCount <= 1) return [averageColor(createColorBox(pixels))]

  // 初始化第一个盒子
  let boxes: ColorBox[] = [createColorBox(pixels)]

  // 持续分割直到达到目标颜色数
  while (boxes.length < colorCount) {
    // 找到最大（像素最多）的盒子进行分割
    let maxIdx = 0
    let maxPixels = 0
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length > maxPixels) {
        maxPixels = boxes[i].pixels.length
        maxIdx = i
      }
    }

    const boxToSplit = boxes[maxIdx]
    if (boxToSplit.pixels.length < 2) break // 无法再分割

    const [left, right] = splitBox(boxToSplit)
    boxes.splice(maxIdx, 1, left, right)
  }

  // 从每个盒子提取平均颜色
  return boxes.map(averageColor)
}

/**
 * 从 ImageData 中提取所有像素颜色
 */
export function extractPixels(imageData: ImageData): [number, number, number][] {
  const { data, width, height } = imageData
  const pixels: [number, number, number][] = []

  for (let i = 0; i < data.length; i += 4) {
    // 跳过完全透明的像素
    if (data[i + 3] < 128) continue
    pixels.push([data[i], data[i + 1], data[i + 2]])
  }

  return pixels
}

/**
 * 将 ImageData 映射到最近的调色板颜色
 * @param imageData 原始图像数据
 * @param palette 调色板颜色数组
 * @returns 映射后的像素索引数组和新的调色板
 */
export function quantizeImage(
  imageData: ImageData,
  targetColors: number
): { palette: [number, number, number][]; indices: Uint8Array } {
  const { data, width, height } = imageData
  const totalPixels = width * height

  // 提取像素
  const rawPixels = extractPixels(imageData)

  // 生成调色板
  const palette = medianCut(rawPixels, targetColors)

  // 将每个像素映射到最近的调色板颜色
  const indices = new Uint8Array(totalPixels)

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]

    let bestIdx = 0
    let bestDist = Infinity

    for (let j = 0; j < palette.length; j++) {
      const [pr, pg, pb] = palette[j]
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = j
      }
    }

    indices[i] = bestIdx
  }

  return { palette, indices }
}
