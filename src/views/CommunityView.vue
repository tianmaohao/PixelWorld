<template>
  <div class="coming-soon">
    <div class="coming-content">
      <div class="coming-emoji">🚧</div>
      <h1 class="coming-title">功能正在建设中~</h1>
      <p class="coming-desc">
        社区功能正在紧锣密鼓地开发中，请再等我们一下下噢！🫶
      </p>
      <div class="coming-features">
        <div class="feature-item">🌍 发现优秀作品</div>
        <div class="feature-item">💬 评论互动</div>
        <div class="feature-item">❤️ 点赞收藏</div>
        <div class="feature-item">👤 关注创作者</div>
      </div>
      <div class="coming-hint">
        先去试试图片转换和编辑器吧~ ✨
      </div>
      <n-button type="primary" size="large" @click="$router.push('/convert')">
        🎨 去转换图片
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
</script>

<style lang="scss" scoped>
.coming-soon {
  min-height: calc(100vh - $header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
}

.coming-content {
  text-align: center;
  max-width: 460px;
}

.coming-emoji {
  font-size: 72px;
  margin-bottom: $spacing-lg;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.coming-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-text;
  margin-bottom: $spacing-md;
}

.coming-desc {
  font-size: $font-size-md;
  color: $color-text-secondary;
  line-height: 1.8;
  margin-bottom: $spacing-xl;
}

.coming-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
}

.feature-item {
  padding: $spacing-sm $spacing-md;
  background: $color-bg;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.coming-hint {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin-bottom: $spacing-lg;
}
</style>
