<template>
  <div class="uploader-card">
    <div
      class="image-uploader"
      :class="{ 'has-image': !!previewUrl, 'drag-over': isDragOver }"
      @dragover.prevent="onDragEnter"
      @dragleave="onDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        class="file-input"
        @change="handleFileChange"
      />

      <!-- 空状态 -->
      <div v-if="!previewUrl && !isProcessing" class="upload-placeholder">
        <div class="upload-icon">📷</div>
        <p class="upload-text">拖拽图片到此处，或点击选择</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、WebP，最大 10MB</p>
      </div>

      <!-- 处理中状态 -->
      <div v-else-if="isProcessing" class="processing-state">
        <div class="processing-spinner" />
        <p class="processing-stage">{{ processingStage }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: processingProgress + '%' }" />
        </div>
        <p class="processing-hint">🎨 小助手正在努力抠图中，请稍等一下下噢~</p>
      </div>

      <!-- 预览状态 -->
      <div v-else-if="previewUrl" class="preview-area">
        <img :src="previewUrl" alt="预览" class="preview-image" />
        <div class="preview-actions" @click.stop>
          <n-button size="small" type="error" quaternary @click="clearImage">
            🗑️ 移除
          </n-button>
        </div>
      </div>
    </div>

    <!-- 去背景按钮 -->
    <div v-if="previewUrl && !isProcessing" class="bg-remove-bar" @click.stop>
      <n-button
        v-if="!bgRemoved"
        size="small"
        type="primary"
        :loading="isProcessing"
        @click="handleRemoveBg"
      >
        ✨ AI 一键抠图
      </n-button>
      <n-button
        v-if="bgRemoved"
        size="small"
        quaternary
        @click="handleRestoreOriginal"
      >
        ↩️ 还原原图
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { removeImageBackground } from '@/core/background'

const emit = defineEmits<{
  (e: 'upload', src: string, fileName: string): void
}>()

const message = useMessage()
const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const originalUrl = ref('')
const isDragOver = ref(false)
const dragCounter = ref(0)
const isProcessing = ref(false)
const processingStage = ref('')
const processingProgress = ref(0)
const bgRemoved = ref(false)
const currentFileName = ref('')

function onDragEnter() {
  dragCounter.value++
  isDragOver.value = true
}

function onDragLeave() {
  dragCounter.value--
  if (dragCounter.value <= 0) {
    dragCounter.value = 0
    isDragOver.value = false
  }
}

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function triggerFileInput() {
  if (!previewUrl.value && !isProcessing.value) {
    fileInput.value?.click()
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    processFile(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

function processFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    message.error('不支持的文件格式，请上传 JPG、PNG、GIF 或 WebP 图片')
    return
  }
  if (file.size > MAX_SIZE) {
    message.error('文件大小超过 10MB 限制')
    return
  }

  currentFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    const src = e.target?.result as string
    previewUrl.value = src
    originalUrl.value = src
    bgRemoved.value = false
    emit('upload', src, file.name)
  }
  reader.readAsDataURL(file)
}

/** 去背景 */
async function handleRemoveBg() {
  if (!originalUrl.value) return

  isProcessing.value = true
  processingProgress.value = 0
  processingStage.value = '正在准备...'

  try {
    const result = await removeImageBackground(originalUrl.value, (stage, progress) => {
      processingStage.value = stage
      processingProgress.value = progress
    })

    previewUrl.value = result
    bgRemoved.value = true
    emit('upload', result, currentFileName.value)
    message.success('背景已移除！')
  } catch (err) {
    console.error('背景移除失败:', err)
    message.error('背景移除失败，请重试或检查网络连接')
  } finally {
    isProcessing.value = false
  }
}

/** 还原原图 */
function handleRestoreOriginal() {
  previewUrl.value = originalUrl.value
  bgRemoved.value = false
  emit('upload', originalUrl.value, currentFileName.value)
}

/** 清除图片 */
function clearImage() {
  previewUrl.value = ''
  originalUrl.value = ''
  bgRemoved.value = false
  bgRemoveEnabled.value = true
  currentFileName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('upload', '', '')
}
</script>

<style lang="scss" scoped>
.uploader-card {
  background: $color-bg-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.image-uploader {
  position: relative;
  border: 2px dashed $color-border;
  margin: $spacing-md;
  border-radius: $radius-md;
  padding: $spacing-xl;
  text-align: center;
  cursor: pointer;
  transition: all $transition-normal;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(.has-image) {
    border-color: $color-primary;
    background: rgba($color-primary, 0.03);
  }

  &.drag-over {
    border-color: $color-primary;
    background: rgba($color-primary, 0.06);
    transform: scale(1.01);
  }

  &.has-image {
    cursor: default;
    padding: $spacing-sm;
    border-style: solid;
    border-color: $color-border;
  }
}

.file-input {
  display: none;
}

.upload-placeholder {
  .upload-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  .upload-text {
    font-size: $font-size-md;
    font-weight: 500;
    color: $color-text;
    margin-bottom: $spacing-xs;
  }

  .upload-hint {
    font-size: $font-size-xs;
    color: $color-text-muted;
  }
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;

  .processing-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid $color-border;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .processing-stage {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text;
  }

  .progress-bar {
    width: 200px;
    height: 6px;
    background: $color-border-light;
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $color-primary, $color-secondary);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  }

  .processing-hint {
    font-size: $font-size-xs;
    color: $color-text-muted;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-area {
  width: 100%;
  position: relative;

  .preview-image {
    max-width: 100%;
    max-height: 260px;
    border-radius: $radius-md;
    object-fit: contain;
  }

  .preview-actions {
    position: absolute;
    top: $spacing-xs;
    right: $spacing-xs;
    background: rgba(255, 255, 255, 0.9);
    border-radius: $radius-md;
    padding: 2px;
  }
}

.bg-remove-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  border-top: 1px solid $color-border-light;
  background: rgba($color-primary, 0.02);

  .bg-remove-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .bg-remove-label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-secondary;
  }
}
</style>
