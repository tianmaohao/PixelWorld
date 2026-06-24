<template>
  <n-modal
    :show="show"
    @update:show="onUpdateShow"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
  >
    <div class="publish-modal">
      <button class="close-btn" @click="onUpdateShow(false)">&times;</button>

      <div class="publish-header">
        <span class="publish-icon">🚀</span>
        <h2 class="publish-title">发布作品</h2>
        <p class="publish-subtitle">分享你的像素创意到社区</p>
      </div>

      <!-- Editor info -->
      <n-alert type="info" :show-icon="true" class="info-alert">
        <div class="info-content">
          <span>当前画布：<strong>{{ editorWidth }} x {{ editorHeight }}</strong></span>
          <span>像素数：<strong>{{ editorPixelCount }}</strong></span>
        </div>
      </n-alert>

      <n-alert v-if="editorPixelCount === 0" type="warning" :show-icon="true" class="info-alert">
        画布为空，请先在编辑器中创作内容再发布。
      </n-alert>

      <n-form ref="formRef" :model="form" :rules="formRules" label-placement="top">
        <n-form-item path="title" label="作品标题">
          <n-input
            v-model:value="form.title"
            placeholder="给你的作品起个名字"
            maxlength="50"
            show-count
          />
        </n-form-item>

        <n-form-item path="description" label="作品描述">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="描述一下你的作品（可选）"
            :rows="3"
            maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item path="tags" label="标签">
          <n-input
            v-model:value="form.tagsInput"
            placeholder="用逗号分隔，如：动物,柴犬,可爱"
          />
          <div class="tags-preview" v-if="parsedTags.length > 0">
            <n-tag
              v-for="(tag, i) in parsedTags"
              :key="i"
              size="small"
              round
              :bordered="false"
              class="tag-item"
            >
              {{ tag }}
            </n-tag>
          </div>
        </n-form-item>

        <n-form-item path="palette" label="调色盘品牌">
          <n-select
            v-model:value="form.palette"
            :options="paletteOptions"
            placeholder="选择使用的调色盘"
          />
        </n-form-item>
      </n-form>

      <div class="publish-actions">
        <n-button @click="onUpdateShow(false)" :disabled="publishing">
          取消
        </n-button>
        <n-button
          type="primary"
          strong
          :loading="publishing"
          :disabled="editorPixelCount === 0"
          @click="handlePublish"
        >
          发布
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  NModal, NForm, NFormItem, NInput, NSelect,
  NButton, NTag, NAlert, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useCommunityStore } from '@/stores/community'
import type { PaletteBrand } from '@/types'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  published: []
}>()

const message = useMessage()
const userStore = useUserStore()
const projectStore = useProjectStore()
const communityStore = useCommunityStore()

const formRef = ref<FormInst | null>(null)
const publishing = ref(false)

// ---- Editor data ----
const editorPixelCount = computed(() => projectStore.editorPixels.size)
const editorWidth = computed(() => projectStore.editorWidth)
const editorHeight = computed(() => projectStore.editorHeight)

// ---- Form ----
const form = reactive({
  title: '',
  description: '',
  tagsInput: '',
  palette: null as PaletteBrand | null,
})

const parsedTags = computed(() =>
  form.tagsInput
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(Boolean)
)

const paletteOptions = [
  { label: 'Artkal S 系列', value: 'artkal-s' },
  { label: 'Artkal R 系列', value: 'artkal-r' },
  { label: 'Perler', value: 'perler' },
  { label: 'Hama', value: 'hama' },
  { label: '无 / 自定义', value: 'none' },
]

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度为1-50个字符', trigger: 'blur' },
  ],
}

// ---- Handlers ----
function onUpdateShow(val: boolean) {
  emit('update:show', val)
}

async function handlePublish() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (!userStore.isLoggedIn) {
    message.warning('请先登录后再发布')
    return
  }

  if (editorPixelCount.value === 0) {
    message.warning('画布为空，请先创作内容')
    return
  }

  publishing.value = true
  try {
    const pixels = Array.from(projectStore.editorPixels.entries()).map(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      return { x, y, color, colorIndex: 0 }
    })

    communityStore.publishProject({
      title: form.title,
      description: form.description,
      tags: parsedTags.value,
      palette: form.palette || 'none',
      width: projectStore.editorWidth,
      height: projectStore.editorHeight,
      pixels,
      beadColors: projectStore.result?.beadColors || [],
      authorName: userStore.user!.username,
      authorAvatar: userStore.user!.avatar,
    })

    message.success('发布成功！ 🎉')
    emit('published')
    emit('update:show', false)
    resetForm()
  } finally {
    publishing.value = false
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.tagsInput = ''
  form.palette = null
}
</script>

<style lang="scss" scoped>
.publish-modal {
  position: relative;
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  background: $color-bg-white;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-lg;
}

.close-btn {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  background: none;
  border: none;
  font-size: 24px;
  color: $color-text-muted;
  cursor: pointer;
  line-height: 1;
  transition: color $transition-fast;

  &:hover {
    color: $color-text;
  }
}

.publish-header {
  text-align: center;
  margin-bottom: $spacing-lg;

  .publish-icon {
    font-size: 40px;
    display: block;
    margin-bottom: $spacing-sm;
  }

  .publish-title {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-text;
    margin: 0 0 $spacing-xs;
  }

  .publish-subtitle {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;
  }
}

.info-alert {
  margin-bottom: $spacing-md;
  border-radius: $radius-md;

  .info-content {
    display: flex;
    gap: $spacing-lg;
    font-size: $font-size-sm;

    strong {
      color: $color-primary;
    }
  }
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-sm;

  .tag-item {
    background: rgba($color-primary, 0.08);
    color: $color-primary-dark;
  }
}

.publish-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border-light;

  :deep(.n-button--primary-type) {
    background-color: $color-primary;
    border-color: $color-primary;

    &:hover,
    &:focus {
      background-color: $color-primary-dark;
      border-color: $color-primary-dark;
    }
  }
}

:deep(.n-form-item-label__text) {
  font-weight: 500;
  color: $color-text;
}

:deep(.n-input--focus .n-input__border) {
  border-color: $color-primary;
}

:deep(.n-alert) {
  border-radius: $radius-md;
}
</style>
