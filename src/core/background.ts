/**
 * 背景移除模块
 * 使用 @imgly/background-removal 在浏览器端离线抠图
 * 模型文件约 40-50MB，首次加载需要一些时间
 */

import { removeBackground } from '@imgly/background-removal'

/** 移除背景，返回去背景后的 PNG DataURL */
export async function removeImageBackground(
  imageSrc: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<string> {
  onProgress?.('正在加载AI模型...', 0)

  // 将图片转为 Blob
  const response = await fetch(imageSrc)
  const blob = await response.blob()

  onProgress?.('正在分析图像...', 30)

  // 使用 @imgly/background-removal 抠图
  const resultBlob = await removeBackground(blob, {
    progress: (key: string, current: number, total: number) => {
      if (total > 0) {
        const percent = Math.round((current / total) * 100)
        if (key === 'fetch:model') {
          onProgress?.(`正在下载AI模型 (${percent}%)`, 5 + percent * 0.25)
        } else if (key === 'compute:inference') {
          onProgress?.(`正在处理图像 (${percent}%)`, 35 + percent * 0.6)
        }
      }
    },
  })

  onProgress?.('正在生成结果...', 95)

  // Blob 转 DataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(resultBlob)
  })
}

/** 检查是否支持 Web Workers (背景移除需要) */
export function isBackgroundRemovalSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
}
