import type { ConvertResult, BeadColor } from '@/types'
import { hexToRgb } from './palette'

/** 导出像素预览图 (带网格) */
export function exportPreviewImage(result: ConvertResult, pixelSize: number = 16): string {
  const { width, height, pixels } = result
  const canvas = document.createElement('canvas')
  canvas.width = width * pixelSize
  canvas.height = height * pixelSize
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制圆形豆子
  const beadRadius = (pixelSize - 2) / 2
  for (const pixel of pixels) {
    const cx = pixel.x * pixelSize + pixelSize / 2
    const cy = pixel.y * pixelSize + pixelSize / 2
    ctx.beginPath()
    ctx.arc(cx, cy, beadRadius, 0, Math.PI * 2)
    ctx.fillStyle = pixel.color
    ctx.fill()
    // 高光
    ctx.beginPath()
    ctx.arc(cx - beadRadius * 0.15, cy - beadRadius * 0.15, beadRadius * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fill()
  }

  // 绘制网格线
  ctx.strokeStyle = '#E0E0E0'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= width; x++) {
    ctx.beginPath()
    ctx.moveTo(x * pixelSize, 0)
    ctx.lineTo(x * pixelSize, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * pixelSize)
    ctx.lineTo(canvas.width, y * pixelSize)
    ctx.stroke()
  }

  return canvas.toDataURL('image/png')
}

/** 导出纯色块图 (无网格，用于打印) */
export function exportColorBlockImage(result: ConvertResult, pixelSize: number = 16): string {
  const { width, height, pixels } = result
  const canvas = document.createElement('canvas')
  canvas.width = width * pixelSize
  canvas.height = height * pixelSize
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制像素
  for (const pixel of pixels) {
    ctx.fillStyle = pixel.color
    ctx.fillRect(
      pixel.x * pixelSize,
      pixel.y * pixelSize,
      pixelSize,
      pixelSize
    )
  }

  return canvas.toDataURL('image/png')
}

/** 导出模版图 (带颜色编号) */
export function exportTemplateImage(result: ConvertResult, pixelSize: number = 20): string {
  const { width, height, pixels } = result
  const canvas = document.createElement('canvas')
  canvas.width = width * pixelSize
  canvas.height = height * pixelSize
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 创建像素查找表
  const pixelMap = new Map<string, string>()
  for (const pixel of pixels) {
    pixelMap.set(`${pixel.x},${pixel.y}`, pixel.color)
  }

  // 绘制网格和编号
  ctx.strokeStyle = '#CCCCCC'
  ctx.lineWidth = 0.5
  ctx.font = `${Math.max(8, pixelSize * 0.45)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixelMap.get(`${x},${y}`)
      if (!color) continue

      const px = x * pixelSize
      const py = y * pixelSize

      // 绘制色块
      ctx.fillStyle = color
      ctx.fillRect(px, py, pixelSize, pixelSize)

      // 绘制网格边框
      ctx.strokeStyle = '#999999'
      ctx.strokeRect(px, py, pixelSize, pixelSize)

      // 在色块上绘制颜色编号（使用对比色）
      const [r, g, b] = hexToRgb(color)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      ctx.fillStyle = brightness > 128 ? '#333333' : '#FFFFFF'

      // 找到对应的颜色编号
      const beadColor = result.beadColors.find(bc => bc.hex.toUpperCase() === color.toUpperCase())
      if (beadColor && pixelSize >= 16) {
        ctx.fillText(beadColor.code, px + pixelSize / 2, py + pixelSize / 2)
      }
    }
  }

  return canvas.toDataURL('image/png')
}

/** 下载图片 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 生成颜色对照表 HTML */
function generateColorTableHTML(beadColors: BeadColor[]): string {
  let html = `
    <div style="margin-top: 20px; page-break-inside: avoid;">
      <h3 style="font-size: 14px; margin-bottom: 10px;">颜色对照表</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 12px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 6px;">编号</th>
            <th style="border: 1px solid #ccc; padding: 6px;">名称</th>
            <th style="border: 1px solid #ccc; padding: 6px;">颜色</th>
            <th style="border: 1px solid #ccc; padding: 6px;">数量</th>
          </tr>
        </thead>
        <tbody>`

  // 统计每种颜色的使用数量
  const colorCounts = new Map<string, number>()
  for (const color of beadColors) {
    colorCounts.set(color.hex, (colorCounts.get(color.hex) || 0) + 1)
  }

  for (const color of beadColors) {
    html += `
          <tr>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${color.code}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${color.name}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">
              <div style="width: 20px; height: 20px; background: ${color.hex}; border: 1px solid #ccc; margin: 0 auto;"></div>
            </td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${colorCounts.get(color.hex) || 0}</td>
          </tr>`
  }

  html += `
        </tbody>
      </table>
    </div>`

  return html
}

/** 导出 PDF 模版 */
export async function exportPDF(result: ConvertResult, title: string = 'PixelWorld 模版'): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')

  // 页面尺寸
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15

  // 标题
  doc.setFontSize(18)
  doc.text(title, pageWidth / 2, margin + 10, { align: 'center' })

  // 图案预览图
  const previewUrl = exportPreviewImage(result, 8)
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (result.height / result.width) * imgWidth

  doc.addImage(previewUrl, 'PNG', margin, margin + 20, imgWidth, Math.min(imgHeight, 160))

  // 颜色对照表
  const startY = margin + 20 + Math.min(imgHeight, 160) + 10
  doc.setFontSize(12)
  doc.text('颜色对照表', margin, startY)

  doc.setFontSize(8)
  let y = startY + 8
  const colWidth = 35
  const rowHeight = 8

  // 表头
  doc.setFont('helvetica', 'bold')
  doc.text('编号', margin, y)
  doc.text('名称', margin + colWidth, y)
  doc.text('数量', margin + colWidth * 2, y)
  doc.setFont('helvetica', 'normal')
  y += rowHeight

  // 统计数量
  const colorCounts = new Map<string, number>()
  for (const pixel of result.pixels) {
    colorCounts.set(pixel.color, (colorCounts.get(pixel.color) || 0) + 1)
  }

  for (const color of result.beadColors) {
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
    }

    const count = colorCounts.get(color.hex) || 0
    doc.text(color.code, margin, y)
    doc.text(color.name, margin + colWidth, y)
    doc.text(`${count}颗`, margin + colWidth * 2, y)

    // 颜色方块
    const [r, g, b] = hexToRgb(color.hex)
    doc.setFillColor(r, g, b)
    doc.rect(margin + colWidth * 3, y - 4, 4, 4, 'F')

    y += rowHeight
  }

  // 页脚
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(
    `PixelWorld - 共 ${result.beadColors.length} 种颜色, ${result.pixels.length} 颗豆子`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  doc.save(`${title}.pdf`)
}
