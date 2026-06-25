<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <div class="footer-brand">
          <span class="footer-logo">🧩</span>
          <span class="footer-name">PixelWorld</span>
        </div>
        <p class="footer-copy">© {{ year }} PixelWorld - 拼豆像素图案生成器</p>
      </div>
      <div class="footer-contact">
        <span class="contact-label">有任何想法或建议？欢迎随时告诉我们噢~ 💌</span>
        <a href="mailto:tianmaohao@outlook.com" class="contact-email">📧 tianmaohao@outlook.com</a>
      </div>
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

.footer-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  .footer-logo { font-size: 20px; }
  .footer-name { font-weight: 600; color: $color-text; }
}

.footer-copy {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.footer-contact {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .contact-label {
    font-size: $font-size-xs;
    color: $color-text-muted;
  }

  .contact-email {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover { color: $color-primary; }
  }
}

@media (max-width: $breakpoint-md) {
  .footer-inner {
    flex-direction: column;
    gap: $spacing-sm;
  }

  .footer-left {
    flex-direction: column;
    gap: $spacing-xs;
  }
}
</style>
