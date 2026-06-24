/**
 * 抖动算法 - 在有限颜色下模拟渐变效果
 */

/**
 * Floyd-Steinberg 抖动算法
 * 将量化误差扩散到相邻像素
 */
export function floydSteinbergDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  palette: [number, number, number][]
): void {
  const totalPixels = width * height

  // 创建误差缓冲区
  const errorR = new Float32Array(totalPixels)
  const errorG = new Float32Array(totalPixels)
  const errorB = new Float32Array(totalPixels)

  // 初始化误差缓冲区
  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4
    errorR[i] = data[offset]
    errorG[i] = data[offset + 1]
    errorB[i] = data[offset + 2]
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const offset = idx * 4

      // 获取当前像素（含误差）
      let oldR = errorR[idx]
      let oldG = errorG[idx]
      let oldB = errorB[idx]

      // 找到最近的调色板颜色
      const [newR, newG, newB] = findClosestPaletteColor(oldR, oldG, oldB, palette)

      // 计算误差
      const errR = oldR - newR
      const errG = oldG - newG
      const errB = oldB - newB

      // 设置新颜色
      data[offset] = newR
      data[offset + 1] = newG
      data[offset + 2] = newB
      data[offset + 3] = 255

      // 扩散误差到相邻像素
      // 右边 (7/16)
      if (x + 1 < width) {
        const rightIdx = idx + 1
        errorR[rightIdx] += errR * 7 / 16
        errorG[rightIdx] += errG * 7 / 16
        errorB[rightIdx] += errB * 7 / 16
      }

      // 左下 (3/16)
      if (x - 1 >= 0 && y + 1 < height) {
        const blIdx = idx + width - 1
        errorR[blIdx] += errR * 3 / 16
        errorG[blIdx] += errG * 3 / 16
        errorB[blIdx] += errB * 3 / 16
      }

      // 下方 (5/16)
      if (y + 1 < height) {
        const bIdx = idx + width
        errorR[bIdx] += errR * 5 / 16
        errorG[bIdx] += errG * 5 / 16
        errorB[bIdx] += errB * 5 / 16
      }

      // 右下 (1/16)
      if (x + 1 < width && y + 1 < height) {
        const brIdx = idx + width + 1
        errorR[brIdx] += errR * 1 / 16
        errorG[brIdx] += errG * 1 / 16
        errorB[brIdx] += errB * 1 / 16
      }
    }
  }
}

/**
 * Atkinson 抖动算法
 * 只扩散 6/8 的误差，产生更清晰的对比效果
 */
export function atkinsonDither(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  palette: [number, number, number][]
): void {
  const totalPixels = width * height

  const errorR = new Float32Array(totalPixels)
  const errorG = new Float32Array(totalPixels)
  const errorB = new Float32Array(totalPixels)

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4
    errorR[i] = data[offset]
    errorG[i] = data[offset + 1]
    errorB[i] = data[offset + 2]
  }

  const spread = 1 / 8  // Atkinson 只扩散 6/8

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const offset = idx * 4

      let oldR = errorR[idx]
      let oldG = errorG[idx]
      let oldB = errorB[idx]

      const [newR, newG, newB] = findClosestPaletteColor(oldR, oldG, oldB, palette)

      const errR = oldR - newR
      const errG = oldG - newG
      const errB = oldB - newB

      data[offset] = newR
      data[offset + 1] = newG
      data[offset + 2] = newB
      data[offset + 3] = 255

      // Atkinson 的扩散模式: 6个方向各 1/8
      const offsets = [
        [1, 0],   // 右
        [2, 0],   // 右2
        [-1, 1],  // 左下
        [0, 1],   // 下
        [1, 1],   // 右下
        [0, 2],   // 下2
      ]

      for (const [dx, dy] of offsets) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx
          errorR[nIdx] += errR * spread
          errorG[nIdx] += errG * spread
          errorB[nIdx] += errB * spread
        }
      }
    }
  }
}

/** 在调色板中找到最接近的颜色 */
function findClosestPaletteColor(
  r: number, g: number, b: number,
  palette: [number, number, number][]
): [number, number, number] {
  let best = palette[0]
  let bestDist = Infinity

  for (const [pr, pg, pb] of palette) {
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = [pr, pg, pb]
    }
  }

  return best
}
