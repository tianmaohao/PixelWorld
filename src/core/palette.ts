import type { BeadColor, PaletteBrand } from '@/types'

/**
 * Artkal S系列 (2.6mm) 调色盘 - 完整色卡
 * 参考 Artkal 官方色卡，涵盖肤色、灰色阶、彩虹色系
 */
const ARTKAL_S: BeadColor[] = [
  // === 黑白灰阶 ===
  { code: 'S01', name: '白色', hex: '#FFFFFF', brand: 'artkal-s' },
  { code: 'S02', name: '雪白', hex: '#F5F5F5', brand: 'artkal-s' },
  { code: 'S03', name: '亮灰', hex: '#E0E0E0', brand: 'artkal-s' },
  { code: 'S04', name: '浅灰', hex: '#C0C0C0', brand: 'artkal-s' },
  { code: 'S05', name: '银灰', hex: '#A9A9A9', brand: 'artkal-s' },
  { code: 'S06', name: '中灰', hex: '#808080', brand: 'artkal-s' },
  { code: 'S07', name: '深灰', hex: '#555555', brand: 'artkal-s' },
  { code: 'S08', name: '暗灰', hex: '#333333', brand: 'artkal-s' },
  { code: 'S09', name: '黑色', hex: '#1A1A1A', brand: 'artkal-s' },

  // === 红色系 ===
  { code: 'S10', name: '大红', hex: '#E4002B', brand: 'artkal-s' },
  { code: 'S11', name: '正红', hex: '#CC0033', brand: 'artkal-s' },
  { code: 'S12', name: '深红', hex: '#B22222', brand: 'artkal-s' },
  { code: 'S13', name: '暗红', hex: '#8B0000', brand: 'artkal-s' },
  { code: 'S14', name: '酒红', hex: '#722F37', brand: 'artkal-s' },
  { code: 'S15', name: '砖红', hex: '#CB4154', brand: 'artkal-s' },
  { code: 'S16', name: '玫瑰红', hex: '#FF007F', brand: 'artkal-s' },
  { code: 'S17', name: '珊瑚红', hex: '#FF7F50', brand: 'artkal-s' },
  { code: 'S18', name: '浅红', hex: '#FF6B6B', brand: 'artkal-s' },
  { code: 'S19', name: '粉红', hex: '#FFB3C1', brand: 'artkal-s' },
  { code: 'S20', name: '浅粉', hex: '#FFD1DC', brand: 'artkal-s' },

  // === 橙色系 ===
  { code: 'S21', name: '橙色', hex: '#FF6B35', brand: 'artkal-s' },
  { code: 'S22', name: '亮橙', hex: '#FF8C00', brand: 'artkal-s' },
  { code: 'S23', name: '深橙', hex: '#E65100', brand: 'artkal-s' },
  { code: 'S24', name: '橙黄', hex: '#FFA500', brand: 'artkal-s' },
  { code: 'S25', name: '杏色', hex: '#FBCEB1', brand: 'artkal-s' },
  { code: 'S26', name: '桃色', hex: '#FFCBA4', brand: 'artkal-s' },

  // === 黄色系 ===
  { code: 'S27', name: '柠檬黄', hex: '#FFF44F', brand: 'artkal-s' },
  { code: 'S28', name: '明黄', hex: '#FFD700', brand: 'artkal-s' },
  { code: 'S29', name: '金色', hex: '#DAA520', brand: 'artkal-s' },
  { code: 'S30', name: '土黄', hex: '#C19A6B', brand: 'artkal-s' },
  { code: 'S31', name: '暗黄', hex: '#B8860B', brand: 'artkal-s' },
  { code: 'S32', name: '米色', hex: '#F5DEB3', brand: 'artkal-s' },
  { code: 'S33', name: '象牙', hex: '#FFFFF0', brand: 'artkal-s' },

  // === 绿色系 ===
  { code: 'S34', name: '荧光绿', hex: '#39FF14', brand: 'artkal-s' },
  { code: 'S35', name: '嫩绿', hex: '#7CFC00', brand: 'artkal-s' },
  { code: 'S36', name: '草绿', hex: '#4ECDC4', brand: 'artkal-s' },
  { code: 'S37', name: '翠绿', hex: '#00A86B', brand: 'artkal-s' },
  { code: 'S38', name: '正绿', hex: '#00AA00', brand: 'artkal-s' },
  { code: 'S39', name: '深绿', hex: '#2E8B57', brand: 'artkal-s' },
  { code: 'S40', name: '墨绿', hex: '#006400', brand: 'artkal-s' },
  { code: 'S41', name: '橄榄绿', hex: '#556B2F', brand: 'artkal-s' },
  { code: 'S42', name: '暗绿', hex: '#004D00', brand: 'artkal-s' },

  // === 蓝色系 ===
  { code: 'S43', name: '天蓝', hex: '#87CEEB', brand: 'artkal-s' },
  { code: 'S44', name: '浅蓝', hex: '#ADD8E6', brand: 'artkal-s' },
  { code: 'S45', name: '湖蓝', hex: '#00CED1', brand: 'artkal-s' },
  { code: 'S46', name: '蓝色', hex: '#1E90FF', brand: 'artkal-s' },
  { code: 'S47', name: '宝蓝', hex: '#0066CC', brand: 'artkal-s' },
  { code: 'S48', name: '钴蓝', hex: '#0047AB', brand: 'artkal-s' },
  { code: 'S49', name: '深蓝', hex: '#003366', brand: 'artkal-s' },
  { code: 'S50', name: '藏青', hex: '#003153', brand: 'artkal-s' },
  { code: 'S51', name: '海军蓝', hex: '#000080', brand: 'artkal-s' },

  // === 紫色系 ===
  { code: 'S52', name: '薰衣草', hex: '#B57EDC', brand: 'artkal-s' },
  { code: 'S53', name: '淡紫', hex: '#DDA0DD', brand: 'artkal-s' },
  { code: 'S54', name: '紫色', hex: '#9B59B6', brand: 'artkal-s' },
  { code: 'S55', name: '深紫', hex: '#7B1FA2', brand: 'artkal-s' },
  { code: 'S56', name: '暗紫', hex: '#4A148C', brand: 'artkal-s' },

  // === 肤色系 (人像关键，密集排列) ===
  { code: 'S57', name: '瓷白', hex: '#FFF8F0', brand: 'artkal-s' },
  { code: 'S58', name: '白皙', hex: '#FFEEE0', brand: 'artkal-s' },
  { code: 'S59', name: '浅肤1', hex: '#FFE4D0', brand: 'artkal-s' },
  { code: 'S60', name: '浅肤2', hex: '#FFD8BE', brand: 'artkal-s' },
  { code: 'S61', name: '肤色1', hex: '#FFCDB2', brand: 'artkal-s' },
  { code: 'S62', name: '肤色2', hex: '#FFC1A8', brand: 'artkal-s' },
  { code: 'S63', name: '暖肤1', hex: '#FFB899', brand: 'artkal-s' },
  { code: 'S64', name: '暖肤2', hex: '#F5A882', brand: 'artkal-s' },
  { code: 'S65', name: '自然肤1', hex: '#E89B72', brand: 'artkal-s' },
  { code: 'S66', name: '自然肤2', hex: '#D4896A', brand: 'artkal-s' },
  { code: 'S67', name: '中肤1', hex: '#C4805E', brand: 'artkal-s' },
  { code: 'S68', name: '中肤2', hex: '#B57554', brand: 'artkal-s' },
  { code: 'S69', name: '深肤1', hex: '#A06848', brand: 'artkal-s' },
  { code: 'S70', name: '深肤2', hex: '#8B5C3E', brand: 'artkal-s' },
  { code: 'S71', name: '棕肤1', hex: '#7A5035', brand: 'artkal-s' },
  { code: 'S72', name: '棕肤2', hex: '#6B4530', brand: 'artkal-s' },

  // === 棕色/咖啡色系 ===
  { code: 'S73', name: '浅棕', hex: '#D2B48C', brand: 'artkal-s' },
  { code: 'S74', name: '棕色', hex: '#8B4513', brand: 'artkal-s' },
  { code: 'S75', name: '咖啡', hex: '#6F4E37', brand: 'artkal-s' },
  { code: 'S76', name: '深棕', hex: '#5C4033', brand: 'artkal-s' },
  { code: 'S77', name: '巧克力', hex: '#3E2723', brand: 'artkal-s' },

  // === 粉紫特殊色 ===
  { code: 'S78', name: '玫红', hex: '#FF1493', brand: 'artkal-s' },
  { code: 'S79', name: '洋红', hex: '#C71585', brand: 'artkal-s' },
  { code: 'S80', name: '荧光粉', hex: '#FF69B4', brand: 'artkal-s' },
]

/**
 * Artkal R系列 (5mm) 调色盘 - 完整色卡
 */
const ARTKAL_R: BeadColor[] = [
  // === 黑白灰阶 ===
  { code: 'R01', name: '白色', hex: '#FFFFFF', brand: 'artkal-r' },
  { code: 'R02', name: '雪白', hex: '#F0F0F0', brand: 'artkal-r' },
  { code: 'R03', name: '浅灰', hex: '#D3D3D3', brand: 'artkal-r' },
  { code: 'R04', name: '中灰', hex: '#A9A9A9', brand: 'artkal-r' },
  { code: 'R05', name: '深灰', hex: '#707070', brand: 'artkal-r' },
  { code: 'R06', name: '暗灰', hex: '#404040', brand: 'artkal-r' },
  { code: 'R07', name: '黑色', hex: '#1A1A1A', brand: 'artkal-r' },

  // === 红色系 ===
  { code: 'R08', name: '大红', hex: '#DC143C', brand: 'artkal-r' },
  { code: 'R09', name: '深红', hex: '#B22222', brand: 'artkal-r' },
  { code: 'R10', name: '暗红', hex: '#8B0000', brand: 'artkal-r' },
  { code: 'R11', name: '酒红', hex: '#722F37', brand: 'artkal-r' },
  { code: 'R12', name: '浅红', hex: '#FF6B6B', brand: 'artkal-r' },
  { code: 'R13', name: '粉红', hex: '#FFB6C1', brand: 'artkal-r' },
  { code: 'R14', name: '玫红', hex: '#C71585', brand: 'artkal-r' },

  // === 橙色系 ===
  { code: 'R15', name: '橙色', hex: '#FF8C00', brand: 'artkal-r' },
  { code: 'R16', name: '深橙', hex: '#E65100', brand: 'artkal-r' },
  { code: 'R17', name: '杏色', hex: '#FBCEB1', brand: 'artkal-r' },
  { code: 'R18', name: '桃色', hex: '#FFCBA4', brand: 'artkal-r' },

  // === 黄色系 ===
  { code: 'R19', name: '柠檬黄', hex: '#FFF44F', brand: 'artkal-r' },
  { code: 'R20', name: '金色', hex: '#FFD700', brand: 'artkal-r' },
  { code: 'R21', name: '土黄', hex: '#DAA520', brand: 'artkal-r' },
  { code: 'R22', name: '米色', hex: '#F5DEB3', brand: 'artkal-r' },

  // === 绿色系 ===
  { code: 'R23', name: '嫩绿', hex: '#7CFC00', brand: 'artkal-r' },
  { code: 'R24', name: '草绿', hex: '#32CD32', brand: 'artkal-r' },
  { code: 'R25', name: '翠绿', hex: '#00A86B', brand: 'artkal-r' },
  { code: 'R26', name: '深绿', hex: '#006400', brand: 'artkal-r' },
  { code: 'R27', name: '墨绿', hex: '#004D00', brand: 'artkal-r' },
  { code: 'R28', name: '橄榄绿', hex: '#556B2F', brand: 'artkal-r' },

  // === 蓝色系 ===
  { code: 'R29', name: '天蓝', hex: '#87CEEB', brand: 'artkal-r' },
  { code: 'R30', name: '浅蓝', hex: '#ADD8E6', brand: 'artkal-r' },
  { code: 'R31', name: '湖蓝', hex: '#00CED1', brand: 'artkal-r' },
  { code: 'R32', name: '蓝色', hex: '#4169E1', brand: 'artkal-r' },
  { code: 'R33', name: '宝蓝', hex: '#0066CC', brand: 'artkal-r' },
  { code: 'R34', name: '深蓝', hex: '#00008B', brand: 'artkal-r' },
  { code: 'R35', name: '藏青', hex: '#003153', brand: 'artkal-r' },

  // === 紫色系 ===
  { code: 'R36', name: '薰衣草', hex: '#B57EDC', brand: 'artkal-r' },
  { code: 'R37', name: '紫色', hex: '#800080', brand: 'artkal-r' },
  { code: 'R38', name: '深紫', hex: '#4B0082', brand: 'artkal-r' },

  // === 肤色系 ===
  { code: 'R39', name: '白皙', hex: '#FFF5EE', brand: 'artkal-r' },
  { code: 'R40', name: '浅肤', hex: '#FFE4C4', brand: 'artkal-r' },
  { code: 'R41', name: '肤色', hex: '#FFDAB9', brand: 'artkal-r' },
  { code: 'R42', name: '暖肤', hex: '#F5C6AA', brand: 'artkal-r' },
  { code: 'R43', name: '中肤', hex: '#DEB887', brand: 'artkal-r' },
  { code: 'R44', name: '深肤', hex: '#C49A6C', brand: 'artkal-r' },
  { code: 'R45', name: '棕肤', hex: '#A0785A', brand: 'artkal-r' },
  { code: 'R46', name: '小麦色', hex: '#CD853F', brand: 'artkal-r' },

  // === 棕色系 ===
  { code: 'R47', name: '浅棕', hex: '#D2B48C', brand: 'artkal-r' },
  { code: 'R48', name: '棕色', hex: '#8B4513', brand: 'artkal-r' },
  { code: 'R49', name: '咖啡', hex: '#6F4E37', brand: 'artkal-r' },
  { code: 'R50', name: '深棕', hex: '#3E2723', brand: 'artkal-r' },
]

/**
 * Perler Beads 调色盘 - 完整色卡
 */
const PERLER: BeadColor[] = [
  // === 黑白灰阶 ===
  { code: 'P01', name: 'White', hex: '#FFFFFF', brand: 'perler' },
  { code: 'P02', name: 'Cream', hex: '#FFF8DC', brand: 'perler' },
  { code: 'P03', name: 'Light Grey', hex: '#C0C0C0', brand: 'perler' },
  { code: 'P04', name: 'Grey', hex: '#808080', brand: 'perler' },
  { code: 'P05', name: 'Dark Grey', hex: '#505050', brand: 'perler' },
  { code: 'P06', name: 'Black', hex: '#1B1B1B', brand: 'perler' },

  // === 红色系 ===
  { code: 'P07', name: 'Red', hex: '#D10000', brand: 'perler' },
  { code: 'P08', name: 'Dark Red', hex: '#9B0000', brand: 'perler' },
  { code: 'P09', name: 'Rust', hex: '#A13D2D', brand: 'perler' },
  { code: 'P10', name: 'Bubblegum', hex: '#FF69B4', brand: 'perler' },
  { code: 'P11', name: 'Pink', hex: '#FFA4B9', brand: 'perler' },
  { code: 'P12', name: 'Hot Coral', hex: '#FF6D00', brand: 'perler' },
  { code: 'P13', name: 'Magenta', hex: '#E3007F', brand: 'perler' },

  // === 橙色系 ===
  { code: 'P14', name: 'Orange', hex: '#FF6D00', brand: 'perler' },
  { code: 'P15', name: 'Peach', hex: '#FFCBA4', brand: 'perler' },
  { code: 'P16', name: 'Tan', hex: '#F3D6A4', brand: 'perler' },

  // === 黄色系 ===
  { code: 'P17', name: 'Yellow', hex: '#FFD500', brand: 'perler' },
  { code: 'P18', name: 'Gold', hex: '#DAA520', brand: 'perler' },
  { code: 'P19', name: 'Butterscotch', hex: '#E59400', brand: 'perler' },
  { code: 'P20', name: 'Kiwi Lime', hex: '#97C93D', brand: 'perler' },

  // === 绿色系 ===
  { code: 'P21', name: 'Light Green', hex: '#00DF00', brand: 'perler' },
  { code: 'P22', name: 'Green', hex: '#00AA00', brand: 'perler' },
  { code: 'P23', name: 'Dark Green', hex: '#007C00', brand: 'perler' },
  { code: 'P24', name: 'Blue Green', hex: '#007D7D', brand: 'perler' },
  { code: 'P25', name: 'Turquoise', hex: '#00CED1', brand: 'perler' },

  // === 蓝色系 ===
  { code: 'P26', name: 'Light Blue', hex: '#0099FF', brand: 'perler' },
  { code: 'P27', name: 'Blue', hex: '#0055FF', brand: 'perler' },
  { code: 'P28', name: 'Dark Blue', hex: '#003380', brand: 'perler' },
  { code: 'P29', name: 'Plum', hex: '#660099', brand: 'perler' },

  // === 紫色系 ===
  { code: 'P30', name: 'Light Purple', hex: '#B39DDB', brand: 'perler' },
  { code: 'P31', name: 'Purple', hex: '#7F00FF', brand: 'perler' },
  { code: 'P32', name: 'Dark Purple', hex: '#4B0082', brand: 'perler' },

  // === 肤色系 ===
  { code: 'P33', name: 'Toothpaste', hex: '#E8F5E9', brand: 'perler' },
  { code: 'P34', name: 'Light Pink', hex: '#FFD1DC', brand: 'perler' },
  { code: 'P35', name: 'Cheddar', hex: '#FFC107', brand: 'perler' },
  { code: 'P36', name: 'Sand', hex: '#C2B280', brand: 'perler' },
  { code: 'P37', name: 'Brown', hex: '#894800', brand: 'perler' },
  { code: 'P38', name: 'Light Brown', hex: '#C69C6D', brand: 'perler' },
  { code: 'P39', name: 'Dark Brown', hex: '#5C3317', brand: 'perler' },
  { code: 'P40', name: 'Auburn', hex: '#A52A2A', brand: 'perler' },
]

/**
 * Hama Beads 调色盘 - 完整色卡
 */
const HAMA: BeadColor[] = [
  // === 黑白灰阶 ===
  { code: 'H01', name: 'White', hex: '#FFFFFF', brand: 'hama' },
  { code: 'H02', name: 'Cream', hex: '#FFF8DC', brand: 'hama' },
  { code: 'H03', name: 'Light Grey', hex: '#CCCCCC', brand: 'hama' },
  { code: 'H04', name: 'Grey', hex: '#999999', brand: 'hama' },
  { code: 'H05', name: 'Dark Grey', hex: '#606060', brand: 'hama' },
  { code: 'H06', name: 'Black', hex: '#222222', brand: 'hama' },

  // === 红色系 ===
  { code: 'H07', name: 'Red', hex: '#CC0000', brand: 'hama' },
  { code: 'H08', name: 'Dark Red', hex: '#990033', brand: 'hama' },
  { code: 'H09', name: 'Rust', hex: '#A0522D', brand: 'hama' },
  { code: 'H10', name: 'Pink', hex: '#FF99CC', brand: 'hama' },
  { code: 'H11', name: 'Light Pink', hex: '#FFB6C1', brand: 'hama' },
  { code: 'H12', name: 'Fuchsia', hex: '#FF00FF', brand: 'hama' },

  // === 橙色系 ===
  { code: 'H13', name: 'Orange', hex: '#FF6600', brand: 'hama' },
  { code: 'H14', name: 'Dark Orange', hex: '#E65100', brand: 'hama' },
  { code: 'H15', name: 'Peach', hex: '#FFCC99', brand: 'hama' },

  // === 黄色系 ===
  { code: 'H16', name: 'Yellow', hex: '#FFCC00', brand: 'hama' },
  { code: 'H17', name: 'Gold', hex: '#DAA520', brand: 'hama' },
  { code: 'H18', name: 'Lemon', hex: '#FFF44F', brand: 'hama' },
  { code: 'H19', name: 'Beige', hex: '#F0DEB4', brand: 'hama' },

  // === 绿色系 ===
  { code: 'H20', name: 'Light Green', hex: '#66CC00', brand: 'hama' },
  { code: 'H21', name: 'Green', hex: '#00AA00', brand: 'hama' },
  { code: 'H22', name: 'Dark Green', hex: '#006600', brand: 'hama' },
  { code: 'H23', name: 'Forest', hex: '#228B22', brand: 'hama' },
  { code: 'H24', name: 'Olive', hex: '#556B2F', brand: 'hama' },
  { code: 'H25', name: 'Turquoise', hex: '#00CED1', brand: 'hama' },

  // === 蓝色系 ===
  { code: 'H26', name: 'Light Blue', hex: '#66CCFF', brand: 'hama' },
  { code: 'H27', name: 'Sky Blue', hex: '#4169E1', brand: 'hama' },
  { code: 'H28', name: 'Blue', hex: '#0066CC', brand: 'hama' },
  { code: 'H29', name: 'Dark Blue', hex: '#003399', brand: 'hama' },
  { code: 'H30', name: 'Navy', hex: '#000080', brand: 'hama' },

  // === 紫色系 ===
  { code: 'H31', name: 'Lavender', hex: '#B57EDC', brand: 'hama' },
  { code: 'H32', name: 'Purple', hex: '#660099', brand: 'hama' },
  { code: 'H33', name: 'Dark Purple', hex: '#330066', brand: 'hama' },

  // === 肤色系 ===
  { code: 'H34', name: 'Blush', hex: '#FFE4E1', brand: 'hama' },
  { code: 'H35', name: 'Flesh', hex: '#FFE4C4', brand: 'hama' },
  { code: 'H36', name: 'Apricot', hex: '#FBCEB1', brand: 'hama' },
  { code: 'H37', name: 'Beige Skin', hex: '#DEB887', brand: 'hama' },
  { code: 'H38', name: 'Tan', hex: '#C49A6C', brand: 'hama' },
  { code: 'H39', name: 'Caramel', hex: '#A0785A', brand: 'hama' },

  // === 棕色系 ===
  { code: 'H40', name: 'Light Brown', hex: '#CC9966', brand: 'hama' },
  { code: 'H41', name: 'Brown', hex: '#993300', brand: 'hama' },
  { code: 'H42', name: 'Dark Brown', hex: '#663300', brand: 'hama' },
  { code: 'H43', name: 'Espresso', hex: '#3E2723', brand: 'hama' },
]

/** 所有调色盘数据 */
export const PALETTES: Record<PaletteBrand, BeadColor[]> = {
  'artkal-s': ARTKAL_S,
  'artkal-r': ARTKAL_R,
  'perler': PERLER,
  'hama': HAMA,
  'none': [],
}

/** 获取指定品牌的调色盘 */
export function getPalette(brand: PaletteBrand): BeadColor[] {
  return PALETTES[brand]
}

/** 将 hex 颜色转换为 RGB */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

/** 将 RGB 转换为 hex */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/** 计算两个颜色之间的欧几里得距离 */
export function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt(
    (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
  )
}

/** 在调色盘中找到最接近的颜色 */
export function findClosestColor(
  r: number, g: number, b: number,
  palette: BeadColor[]
): { color: BeadColor; distance: number } {
  let closest = palette[0]
  let minDist = Infinity

  for (const bead of palette) {
    const [br, bg, bb] = hexToRgb(bead.hex)
    const dist = colorDistance(r, g, b, br, bg, bb)
    if (dist < minDist) {
      minDist = dist
      closest = bead
    }
  }

  return { color: closest, distance: minDist }
}
