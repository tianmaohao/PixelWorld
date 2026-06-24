<template>
  <div class="community-page">
    <!-- Hero 区域 -->
    <section class="community-hero">
      <h1 class="hero-title">发现优秀作品</h1>
      <p class="hero-subtitle">浏览社区中其他创作者的拼豆像素作品</p>
    </section>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <n-input
        v-model:value="searchQuery"
        placeholder="搜索作品、作者或标签..."
        clearable
        size="large"
      >
        <template #prefix>
          <span class="search-icon">🔍</span>
        </template>
      </n-input>
    </div>

    <!-- 发布按钮 -->
    <div class="publish-action">
      <n-button type="primary" size="large" @click="handlePublish">
        ✨ 发布我的作品
      </n-button>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-section">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="recommend" tab="推荐">
          <div class="project-grid">
            <div
              v-if="displayedProjects.length === 0"
              class="empty-state"
            >
              <n-empty description="暂无作品，快来发布第一个吧！" />
            </div>
            <div
              v-for="project in displayedProjects"
              :key="project.id"
              class="project-card"
              @click="handleOpenProject(project.id)"
            >
              <div
                class="card-thumbnail"
                :style="{ background: generateGradient(project.title) }"
              >
                <div class="thumbnail-overlay">
                  <span class="bead-count">{{ project.beadCount }} 颗粒</span>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ project.title }}</h3>
                <div class="card-author">
                  <span class="author-avatar">{{ project.authorAvatar }}</span>
                  <span class="author-name">{{ project.authorName }}</span>
                </div>
                <div class="card-tags">
                  <n-tag
                    v-for="tag in project.tags"
                    :key="tag"
                    size="small"
                    :bordered="false"
                    type="info"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
                <div class="card-stats">
                  <span class="stat-item">
                    <span class="stat-icon">❤️</span>
                    {{ project.likesCount }}
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">⭐</span>
                    {{ project.favoritesCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="latest" tab="最新">
          <div class="project-grid">
            <div
              v-if="latestList.length === 0"
              class="empty-state"
            >
              <n-empty description="暂无作品，快来发布第一个吧！" />
            </div>
            <div
              v-for="project in latestList"
              :key="project.id"
              class="project-card"
              @click="handleOpenProject(project.id)"
            >
              <div
                class="card-thumbnail"
                :style="{ background: generateGradient(project.title) }"
              >
                <div class="thumbnail-overlay">
                  <span class="bead-count">{{ project.beadCount }} 颗粒</span>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ project.title }}</h3>
                <div class="card-author">
                  <span class="author-avatar">{{ project.authorAvatar }}</span>
                  <span class="author-name">{{ project.authorName }}</span>
                </div>
                <div class="card-tags">
                  <n-tag
                    v-for="tag in project.tags"
                    :key="tag"
                    size="small"
                    :bordered="false"
                    type="info"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
                <div class="card-stats">
                  <span class="stat-item">
                    <span class="stat-icon">❤️</span>
                    {{ project.likesCount }}
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">⭐</span>
                    {{ project.favoritesCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="popular" tab="热门">
          <div class="project-grid">
            <div
              v-if="popularList.length === 0"
              class="empty-state"
            >
              <n-empty description="暂无作品，快来发布第一个吧！" />
            </div>
            <div
              v-for="project in popularList"
              :key="project.id"
              class="project-card"
              @click="handleOpenProject(project.id)"
            >
              <div
                class="card-thumbnail"
                :style="{ background: generateGradient(project.title) }"
              >
                <div class="thumbnail-overlay">
                  <span class="bead-count">{{ project.beadCount }} 颗粒</span>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ project.title }}</h3>
                <div class="card-author">
                  <span class="author-avatar">{{ project.authorAvatar }}</span>
                  <span class="author-name">{{ project.authorName }}</span>
                </div>
                <div class="card-tags">
                  <n-tag
                    v-for="tag in project.tags"
                    :key="tag"
                    size="small"
                    :bordered="false"
                    type="info"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
                <div class="card-stats">
                  <span class="stat-item">
                    <span class="stat-icon">❤️</span>
                    {{ project.likesCount }}
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">⭐</span>
                    {{ project.favoritesCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NTabs, NTabPane, NTag, NButton, NEmpty } from 'naive-ui'
import { useCommunityStore } from '@/stores/community'
import type { CommunityProject } from '@/types'

const emit = defineEmits<{
  openProject: [id: string]
  openPublish: []
}>()

const communityStore = useCommunityStore()

const searchQuery = ref('')
const activeTab = ref('recommend')

// 根据搜索关键词过滤的项目列表
const searchResults = computed<CommunityProject[]>(() => {
  if (!searchQuery.value.trim()) return []
  return communityStore.searchProjects(searchQuery.value.trim())
})

// 推荐: 有搜索词时显示搜索结果，否则按点赞+收藏综合排序
const recommendList = computed<CommunityProject[]>(() => {
  if (searchQuery.value.trim()) return searchResults.value
  return [...communityStore.projects].sort(
    (a, b) => (b.likesCount + b.favoritesCount) - (a.likesCount + a.favoritesCount)
  )
})

// 最新
const latestList = computed<CommunityProject[]>(() => {
  if (searchQuery.value.trim()) return searchResults.value
  return communityStore.latestProjects
})

// 热门
const popularList = computed<CommunityProject[]>(() => {
  if (searchQuery.value.trim()) return searchResults.value
  return communityStore.popularProjects
})

// 当前 tab 对应的展示列表
const displayedProjects = computed<CommunityProject[]>(() => {
  switch (activeTab.value) {
    case 'latest':
      return latestList.value
    case 'popular':
      return popularList.value
    default:
      return recommendList.value
  }
})

// 根据标题生成稳定的渐变色
function generateGradient(title: string): string {
  const gradients = [
    'linear-gradient(135deg, #F43F5E, #FB923C)',
    'linear-gradient(135deg, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #22C55E, #06B6D4)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #8B5CF6, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #F97316)',
    'linear-gradient(135deg, #14B8A6, #22D3EE)',
    'linear-gradient(135deg, #A855F7, #F43F5E)',
    'linear-gradient(135deg, #F97316, #FBBF24)',
    'linear-gradient(135deg, #6366F1, #8B5CF6)',
    'linear-gradient(135deg, #F43F5E, #A855F7)',
  ]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function handleOpenProject(id: string) {
  emit('openProject', id)
}

function handlePublish() {
  emit('openPublish')
}
</script>

<style lang="scss" scoped>
.community-page {
  min-height: calc(100vh - #{$header-height} - 80px);
  padding: $spacing-xl $spacing-lg;
  max-width: $content-max-width;
  margin: 0 auto;
  background: $color-bg;
}

.community-hero {
  text-align: center;
  margin-bottom: $spacing-xl;

  .hero-title {
    font-size: $font-size-3xl;
    font-weight: 800;
    color: $color-text;
    margin-bottom: $spacing-sm;
  }

  .hero-subtitle {
    font-size: $font-size-md;
    color: $color-text-secondary;
  }
}

.search-bar {
  max-width: 600px;
  margin: 0 auto $spacing-md;
}

.publish-action {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.tab-section {
  :deep(.n-tabs-tab) {
    font-size: $font-size-md;
    font-weight: 500;
  }

  :deep(.n-tabs-tab--active) {
    color: $color-primary !important;
  }

  :deep(.n-tabs-tab-active-bar) {
    background-color: $color-primary;
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
  padding-top: $spacing-md;
}

.empty-state {
  grid-column: 1 / -1;
  padding: $spacing-2xl 0;
}

.project-card {
  background: $color-bg-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  cursor: pointer;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }

  .card-thumbnail {
    position: relative;
    width: 100%;
    padding-top: 75%;
    overflow: hidden;

    .thumbnail-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: $spacing-xs $spacing-sm;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
      display: flex;
      justify-content: flex-end;

      .bead-count {
        font-size: $font-size-xs;
        color: $color-text-inverse;
        font-weight: 500;
      }
    }
  }

  .card-body {
    padding: $spacing-md;
  }

  .card-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-text;
    margin-bottom: $spacing-sm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-author {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;

    .author-avatar {
      font-size: $font-size-lg;
    }

    .author-name {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
  }

  .card-stats {
    display: flex;
    gap: $spacing-md;

    .stat-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-sm;
      color: $color-text-muted;

      .stat-icon {
        font-size: $font-size-sm;
      }
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .community-page {
    padding: $spacing-md $spacing-sm;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .community-hero .hero-title {
    font-size: $font-size-2xl;
  }
}
</style>
