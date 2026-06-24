<template>
  <div v-if="result" class="export-panel">
    <h3 class="panel-title">📥 导出选项</h3>

    <div class="export-list">
      <div class="export-item" @click="handleExport('preview')">
        <span class="export-icon">🖼️</span>
        <div class="export-info">
          <span class="export-name">像素预览图</span>
          <span class="export-desc">带网格的像素化效果预览</span>
        </div>
      </div>

      <div class="export-item" @click="handleExport('template')">
        <span class="export-icon">📋</span>
        <div class="export-info">
          <span class="export-name">拼豆模版图</span>
          <span class="export-desc">带颜色编号的模版，方便对照制作</span>
        </div>
      </div>

      <div class="export-item" @click="handleExport('colorblock')">
        <span class="export-icon">🎨</span>
        <div class="export-info">
          <span class="export-name">纯色块图</span>
          <span class="export-desc">无网格，适合直接打印</span>
        </div>
      </div>

      <div class="export-item" @click="handleExport('pdf')">
        <span class="export-icon">📄</span>
        <div class="export-info">
          <span class="export-name">PDF 模版</span>
          <span class="export-desc">A4尺寸，含图案+颜色对照表</span>
        </div>
      </div>
    </div>

    <!-- 使用的调色盘颜色列表 -->
    <div class="color-summary">
      <h4 class="summary-title">使用的颜色 ({{ result.beadColors.length }}种)</h4>
      <div class="color-list">
        <div
          v-for="color in result.beadColors"
          :key="color.code"
          class="color-chip"
          :title="`${color.code} - ${color.name}`"
        >
          <div class="chip-color" :style="{ background: color.hex }" />
          <span class="chip-code">{{ color.code }}</span>
        </div>
      </div>
    </div>

    <!-- 跳转到编辑器 -->
    <n-button
      block
      type="primary"
      secondary
      @click="goToEditor"
      class="editor-btn"
    >
      ✏️ 在编辑器中打开
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { NButton, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import {
  exportPreviewImage,
  exportTemplateImage,
  exportColorBlockImage,
  exportPDF,
  downloadImage,
} from '@/core/export'

const store = useProjectStore()
const result = computed(() => store.result)
const message = useMessage()
const router = useRouter()

import { computed } from 'vue'

function handleExport(type: 'preview' | 'template' | 'colorblock' | 'pdf') {
  if (!result.value) return

  const filename = `pixelworld-${Date.now()}`

  try {
    switch (type) {
      case 'preview': {
        const dataUrl = exportPreviewImage(result.value)
        downloadImage(dataUrl, `${filename}-preview.png`)
        message.success('预览图已导出')
        break
      }
      case 'template': {
        const dataUrl = exportTemplateImage(result.value)
        downloadImage(dataUrl, `${filename}-template.png`)
        message.success('模版图已导出')
        break
      }
      case 'colorblock': {
        const dataUrl = exportColorBlockImage(result.value)
        downloadImage(dataUrl, `${filename}-colorblock.png`)
        message.success('色块图已导出')
        break
      }
      case 'pdf': {
        exportPDF(result.value, store.sourceFileName || 'PixelWorld 模版')
        message.success('PDF 已导出')
        break
      }
    }
  } catch (err) {
    message.error('导出失败，请重试')
    console.error(err)
  }
}

function goToEditor() {
  router.push('/editor')
}
</script>

<style lang="scss" scoped>
.export-panel {
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
}

.panel-title {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $color-border-light;
}

.export-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.export-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  border: 1px solid $color-border-light;

  &:hover {
    background: rgba($color-primary, 0.04);
    border-color: $color-primary;
  }

  .export-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .export-info {
    display: flex;
    flex-direction: column;

    .export-name {
      font-weight: 500;
      font-size: $font-size-sm;
    }

    .export-desc {
      font-size: $font-size-xs;
      color: $color-text-muted;
      margin-top: 2px;
    }
  }
}

.color-summary {
  margin-top: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 1px solid $color-border-light;

  .summary-title {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-secondary;
    margin-bottom: $spacing-md;
  }

  .color-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .color-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: $color-bg;
    border-radius: $radius-sm;
    font-size: $font-size-xs;

    .chip-color {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .chip-code {
      color: $color-text-secondary;
    }
  }
}

.editor-btn {
  margin-top: $spacing-lg;
}
</style>
