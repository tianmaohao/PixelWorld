<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">🧩</span>
        <span class="footer-name">PixelWorld</span>
      </div>
      <p class="footer-copy">© {{ year }} PixelWorld - 拼豆像素图案生成器</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
.app-footer {
  padding: $spacing-lg 0;
  border-top: 1px solid $color-border;
  background: $color-bg-white;
}

.footer-inner {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 0 $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  .footer-logo {
    font-size: 20px;
  }

  .footer-name {
    font-weight: 600;
    color: $color-text;
  }
}

.footer-copy {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

@media (max-width: $breakpoint-md) {
  .footer-inner {
    flex-direction: column;
    gap: $spacing-sm;
  }
}
</style>
