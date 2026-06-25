<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="app-layout" :class="{ 'no-footer': isEditor }">
        <AppHeader />
        <main class="app-main">
          <router-view />
        </main>
        <AppFooter v-if="!isEditor" />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()
const isEditor = computed(() => route.name === 'editor')

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#F43F5E',
    primaryColorHover: '#FB7185',
    primaryColorPressed: '#E11D48',
    primaryColorSuppl: '#F43F5E',
    borderRadius: '10px',
    borderRadiusSmall: '6px',
  },
  Button: {
    borderRadiusMedium: '10px',
    borderRadiusLarge: '12px',
  },
  Card: {
    borderRadius: '14px',
  },
  Tag: {
    borderRadius: '8px',
  },
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &.no-footer {
    height: 100vh;
    overflow: hidden;
  }
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: $header-height;
  min-height: 0;
}
</style>
