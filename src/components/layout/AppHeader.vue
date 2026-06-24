<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">🧩</span>
        <span class="logo-text">PixelWorld</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/convert" class="nav-link">
          <span class="nav-icon">🎨</span>
          图片转换
        </router-link>
        <router-link to="/editor" class="nav-link">
          <span class="nav-icon">✏️</span>
          编辑器
        </router-link>

        <!-- 全局导出 -->
        <div v-if="hasData" class="nav-link export-trigger" @click.stop="toggleExport">
          <span class="nav-icon">📥</span>
          导出
          <div v-if="showExport" class="export-dropdown">
            <div class="export-option" @click="doExport($event, 'preview')">🖼️ 像素预览图</div>
            <div class="export-option" @click="doExport($event, 'template')">📋 拼豆模版图</div>
            <div class="export-option" @click="doExport($event, 'colorblock')">🎨 纯色块图</div>
            <div class="export-option" @click="doExport($event, 'pdf')">📄 PDF 模版</div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { exportPreviewImage, exportTemplateImage, exportColorBlockImage, exportPDF, downloadImage } from '@/core/export'

const store = useProjectStore()
const showExport = ref(false)

const hasData = computed(() => store.editorPixels.size > 0)

function toggleExport(e: MouseEvent) {
  e.stopPropagation()
  showExport.value = !showExport.value
}

function closeDropdown() { showExport.value = false }

onMounted(() => {
  setTimeout(() => document.addEventListener('click', closeDropdown), 0)
})
onUnmounted(() => document.removeEventListener('click', closeDropdown))

function buildResult() {
  return {
    pixels: Array.from(store.editorPixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      return { x, y, color, colorIndex: 0 }
    }),
    beadColors: store.result?.beadColors || [],
    width: store.editorWidth,
    height: store.editorHeight,
    imageData: new ImageData(1, 1),
  }
}

function doExport(e: MouseEvent, type: string) {
  e.stopPropagation()
  const result = buildResult()
  const name = `pixelworld-${Date.now()}`
  switch (type) {
    case 'preview': downloadImage(exportPreviewImage(result), `${name}-preview.png`); break
    case 'template': downloadImage(exportTemplateImage(result), `${name}-template.png`); break
    case 'colorblock': downloadImage(exportColorBlockImage(result), `${name}-colorblock.png`); break
    case 'pdf': exportPDF(result, 'PixelWorld 模版'); break
  }
  showExport.value = false
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $header-height;
  background: $color-bg-white;
  border-bottom: 1px solid $color-border;
  z-index: $z-sticky;
}

.header-inner {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 0 $spacing-lg;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  text-decoration: none;
  color: $color-text;

  .logo-icon { font-size: 28px; }
  .logo-text {
    font-size: $font-size-xl;
    font-weight: 700;
    background: linear-gradient(135deg, $color-primary, $color-secondary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.nav-links {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-text-secondary;
  text-decoration: none;
  transition: all $transition-fast;
  position: relative;

  &:hover {
    color: $color-primary;
    background: rgba($color-primary, 0.06);
  }

  &.router-link-active {
    color: $color-primary;
    background: rgba($color-primary, 0.1);
  }

  .nav-icon { font-size: 16px; }
}

.export-trigger { cursor: pointer; }

.export-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: $color-bg-white;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  min-width: 200px;
  z-index: 9999;
  overflow: hidden;
}

.export-option {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: background $transition-fast;
  white-space: nowrap;

  &:hover {
    background: rgba($color-primary, 0.06);
    color: $color-primary;
  }
}

@media (max-width: $breakpoint-md) {
  .logo-text { display: none; }
}
</style>
