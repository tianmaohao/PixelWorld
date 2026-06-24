<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-emoji">🧩</span>
          PixelWorld
        </h1>
        <p class="hero-subtitle">拼豆像素图案生成器</p>
        <p class="hero-desc">
          轻松将任何图片转换为精美的拼豆模版，支持多种调色盘品牌和导出格式
        </p>
        <div class="hero-actions">
          <n-button type="primary" size="large" @click="$router.push('/convert')">
            🎨 开始转换
          </n-button>
          <n-button size="large" @click="$router.push('/editor')">
            ✏️ 打开编辑器
          </n-button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="pixel-grid">
          <div v-for="(color, i) in heroPixels" :key="i" class="pixel" :style="{ background: color }" />
        </div>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">核心功能</h2>
        <div class="feature-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 支持的调色盘 -->
    <section class="palettes">
      <div class="container">
        <h2 class="section-title">支持的调色盘品牌</h2>
        <div class="palette-grid">
          <div v-for="p in palettes" :key="p.name" class="palette-card">
            <div class="palette-colors">
              <div
                v-for="color in p.colors"
                :key="color"
                class="palette-dot"
                :style="{ background: color }"
              />
            </div>
            <span class="palette-name">{{ p.name }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

const features = [
  {
    icon: '🖼️',
    title: '图片转像素',
    desc: '上传任意图片，自动转换为拼豆像素图案，支持多种尺寸和风格',
  },
  {
    icon: '🎨',
    title: '品牌调色盘',
    desc: '支持 Artkal S/R、Perler、Hama 等主流拼豆品牌调色盘映射',
  },
  {
    icon: '✨',
    title: '智能算法',
    desc: 'Median Cut 颜色量化 + Floyd-Steinberg 抖动，还原真实效果',
  },
  {
    icon: '✏️',
    title: '在线编辑',
    desc: '内置像素编辑器，支持画笔、橡皮擦、取色、填充等工具',
  },
  {
    icon: '📄',
    title: '多格式导出',
    desc: '导出预览图、模版图、纯色块图，支持 PDF A4 打印模版',
  },
  {
    icon: '📱',
    title: '响应式设计',
    desc: '完美适配桌面端、平板和手机，随时随地创作',
  },
]

const palettes = [
  {
    name: 'Artkal S系列',
    colors: ['#E4002B', '#FF6B35', '#FFD700', '#4ECDC4', '#1E90FF', '#9B59B6'],
  },
  {
    name: 'Artkal R系列',
    colors: ['#DC143C', '#FF8C00', '#32CD32', '#4169E1', '#800080', '#8B4513'],
  },
  {
    name: 'Perler Beads',
    colors: ['#D10000', '#FF6D00', '#FFD500', '#0099FF', '#7F00FF', '#894800'],
  },
  {
    name: 'Hama Beads',
    colors: ['#CC0000', '#FF6600', '#FFCC00', '#0066CC', '#660099', '#993300'],
  },
]

// Hero 区域的装饰性像素图案
const heroPixels = [
  '#FF6B35', '#FF6B35', '#FFD700', '#FFD700', '#4ECDC4', '#4ECDC4',
  '#FF8F65', '#FF8F65', '#FFE066', '#FFE066', '#7EDDD6', '#7EDDD6',
  '#FFD700', '#FFD700', '#FF6B35', '#4ECDC4', '#1E90FF', '#9B59B6',
  '#FFE066', '#FFE066', '#FF8F65', '#7EDDD6', '#87CEEB', '#B39DDB',
  '#4ECDC4', '#4ECDC4', '#1E90FF', '#9B59B6', '#FF6B35', '#FFD700',
  '#7EDDD6', '#7EDDD6', '#87CEEB', '#B39DDB', '#FF8F65', '#FFE066',
]
</script>

<style lang="scss" scoped>
.home-page {
  overflow: hidden;
}

.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-lg;
  gap: $spacing-2xl;
  background: linear-gradient(135deg, rgba($color-primary, 0.05), rgba($color-secondary, 0.05));
}

.hero-content {
  max-width: 500px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: $spacing-sm;
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .hero-emoji {
    font-size: 56px;
  }
}

.hero-subtitle {
  font-size: $font-size-2xl;
  color: $color-primary;
  font-weight: 600;
  margin-bottom: $spacing-md;
}

.hero-desc {
  font-size: $font-size-md;
  color: $color-text-secondary;
  line-height: 1.8;
  margin-bottom: $spacing-xl;
}

.hero-actions {
  display: flex;
  gap: $spacing-md;
}

.hero-visual {
  .pixel-grid {
    display: grid;
    grid-template-columns: repeat(6, 40px);
    gap: 4px;
    padding: $spacing-lg;
    background: $color-bg-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    transform: rotate(-5deg);
  }

  .pixel {
    width: 40px;
    height: 40px;
    border-radius: $radius-sm;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.15);
    }
  }
}

.features {
  padding: $spacing-2xl 0;
}

.section-title {
  text-align: center;
  font-size: $font-size-2xl;
  font-weight: 700;
  margin-bottom: $spacing-xl;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
}

.feature-card {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  text-align: center;
  transition: all $transition-normal;
  box-shadow: $shadow-sm;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }

  .feature-icon {
    font-size: 40px;
    display: block;
    margin-bottom: $spacing-md;
  }

  .feature-title {
    font-size: $font-size-lg;
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  .feature-desc {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    line-height: 1.6;
  }
}

.palettes {
  padding: $spacing-2xl 0;
  background: $color-bg-white;
}

.palette-grid {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  flex-wrap: wrap;
}

.palette-card {
  background: $color-bg;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  text-align: center;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
  }

  .palette-colors {
    display: flex;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
  }

  .palette-dot {
    width: 28px;
    height: 28px;
    border-radius: $radius-round;
    border: 2px solid $color-bg-white;
    box-shadow: $shadow-sm;
  }

  .palette-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-secondary;
  }
}

@media (max-width: $breakpoint-md) {
  .hero {
    flex-direction: column;
    text-align: center;
    min-height: auto;
    padding: $spacing-xl $spacing-md;
  }

  .hero-title {
    font-size: 32px;
    justify-content: center;

    .hero-emoji {
      font-size: 40px;
    }
  }

  .hero-subtitle {
    font-size: $font-size-lg;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual .pixel-grid {
    grid-template-columns: repeat(6, 28px);

    .pixel {
      width: 28px;
      height: 28px;
    }
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
