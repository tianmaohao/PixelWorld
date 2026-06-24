<template>
  <div class="converter-page">
    <div class="converter-layout">
      <!-- 左侧：参数面板 -->
      <aside class="converter-sidebar">
        <ImageUploader @upload="handleUpload" />
        <ParameterPanel @convert="handleConvert" />
      </aside>

      <!-- 右侧：预览 + 导出 -->
      <main class="converter-main">
        <PixelPreview />
        <ExportPanel />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useProjectStore } from '@/stores/project'
import { convertImage } from '@/core/converter'
import ImageUploader from '@/components/converter/ImageUploader.vue'
import ParameterPanel from '@/components/converter/ParameterPanel.vue'
import PixelPreview from '@/components/converter/PixelPreview.vue'
import ExportPanel from '@/components/converter/ExportPanel.vue'

const store = useProjectStore()
const message = useMessage()

function handleUpload(src: string, fileName: string) {
  store.setSourceImage(src, fileName)
}

async function handleConvert() {
  if (!store.sourceImage) {
    message.warning('请先上传图片')
    return
  }

  store.isConverting = true

  try {
    const result = await convertImage(store.sourceImage, store.convertParams)
    store.setResult(result)
    message.success(`转换完成！共使用 ${result.beadColors.length} 种颜色`)
  } catch (err) {
    message.error('转换失败，请重试')
    console.error(err)
  } finally {
    store.isConverting = false
  }
}
</script>

<style lang="scss" scoped>
.converter-page {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: $spacing-lg;
}

.converter-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: $spacing-lg;
  align-items: start;
}

.converter-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  position: sticky;
  top: calc($header-height + $spacing-lg);
}

.converter-main {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

@media (max-width: $breakpoint-lg) {
  .converter-layout {
    grid-template-columns: 1fr;
  }

  .converter-sidebar {
    position: static;
  }
}
</style>
