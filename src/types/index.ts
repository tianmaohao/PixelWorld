/** 像素网格尺寸预设 */
export interface GridSize {
  name: string
  label: string
  width: number
  height: number
}

/** 调色盘品牌 */
export type PaletteBrand = 'artkal-s' | 'artkal-r' | 'perler' | 'hama' | 'none'

/** 调色盘颜色 */
export interface BeadColor {
  code: string
  name: string
  hex: string
  brand: PaletteBrand
}

/** 抖动算法 */
export type DitherAlgorithm = 'none' | 'floyd-steinberg' | 'atkinson'

/** 豆子形状 */
export type BeadShape = 'round' | 'square'

/** 转换参数 */
export interface ConvertParams {
  gridSize: GridSize
  colorCount: number
  brightness: number
  contrast: number
  saturation: number
  blur: number
  dither: DitherAlgorithm
  palette: PaletteBrand
  beadShape: BeadShape
}

/** 像素点 */
export interface Pixel {
  x: number
  y: number
  color: string
  colorIndex: number
}

/** 转换结果 */
export interface ConvertResult {
  pixels: Pixel[]
  beadColors: BeadColor[]
  width: number
  height: number
  imageData: ImageData
}

/** 编辑器工具 */
export type EditorTool = 'brush' | 'eraser' | 'picker' | 'fill' | 'move'

/** 编辑器历史记录 */
export interface HistoryEntry {
  pixels: Map<string, string>
  timestamp: number
}

/** 项目数据 (用于保存/加载) */
export interface ProjectData {
  id: string
  name: string
  pixels: Pixel[]
  beadColors: BeadColor[]
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

/** 图层 */
export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  pixels: Map<string, string>
}

/** 社区作品 */
export interface CommunityProject {
  id: string
  title: string
  description: string
  tags: string[]
  palette: PaletteBrand
  width: number
  height: number
  beadCount: number
  thumbnail: string       // base64 thumbnail
  pixels: Pixel[]
  beadColors: BeadColor[]
  authorName: string
  authorAvatar: string
  likesCount: number
  favoritesCount: number
  commentsCount: number
  downloadsCount: number
  isLiked: boolean
  isFavorited: boolean
  createdAt: string
}

/** 社区评论 */
export interface Comment {
  id: string
  projectId: string
  authorName: string
  authorAvatar: string
  content: string
  likesCount: number
  isLiked: boolean
  createdAt: string
}
