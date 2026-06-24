<template>
  <div class="user-center">
    <!-- Not logged in state -->
    <div v-if="!userStore.isLoggedIn" class="login-prompt">
      <div class="login-prompt-card">
        <span class="login-icon">🔐</span>
        <h2>请先登录</h2>
        <p>登录后即可查看个人中心、管理作品和收藏</p>
        <n-button type="primary" size="large" @click="showLoginModal = true">
          立即登录
        </n-button>
      </div>

      <n-modal v-model:show="showLoginModal" preset="dialog" title="登录">
        <n-form ref="loginFormRef" :model="loginForm" label-placement="left">
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="loginForm.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input v-model:value="loginForm.email" placeholder="请输入邮箱" />
          </n-form-item>
        </n-form>
        <template #action>
          <n-button type="primary" @click="handleLogin">登录</n-button>
        </template>
      </n-modal>
    </div>

    <!-- Logged in state -->
    <template v-else>
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-content">
          <div class="profile-avatar">
            <n-avatar :size="80" round class="avatar-emoji">
              {{ userStore.user?.avatar }}
            </n-avatar>
          </div>
          <div class="profile-info">
            <div class="profile-name-row">
              <h1 class="profile-name">{{ userStore.user?.username }}</h1>
              <n-tag v-if="userStore.user?.isVip" type="warning" size="small" round>
                VIP
              </n-tag>
            </div>
            <p class="profile-bio">{{ userStore.user?.bio }}</p>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ userStore.user?.points }}</span>
                <span class="stat-label">积分</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ myWorks.length }}</span>
                <span class="stat-label">作品</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ myFavorites.length }}</span>
                <span class="stat-label">收藏</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ userStore.following.length }}</span>
                <span class="stat-label">关注</span>
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <n-button type="primary" @click="showEditModal = true">
              ✏️ 编辑资料
            </n-button>
            <n-button @click="handleLogout">
              退出登录
            </n-button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-section">
        <n-tabs type="line" animated @update:value="activeTab = $event">
          <n-tab-pane name="works" tab="📋 我的作品">
            <div class="tab-content">
              <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
                <n-gi v-for="project in myWorks" :key="project.id">
                  <n-card class="project-card" hoverable>
                    <template #header>
                      <div class="card-header">
                        <span class="card-title">{{ project.title }}</span>
                        <n-tag size="small" round>{{ project.palette }}</n-tag>
                      </div>
                    </template>
                    <template #header-extra>
                      <span class="card-date">{{ formatDate(project.createdAt) }}</span>
                    </template>
                    <div class="card-body">
                      <p class="card-desc">{{ project.description }}</p>
                      <div class="card-tags">
                        <n-tag v-for="tag in project.tags" :key="tag" size="tiny" round>
                          {{ tag }}
                        </n-tag>
                      </div>
                    </div>
                    <template #footer>
                      <div class="card-stats">
                        <span class="stat">❤️ {{ project.likesCount }}</span>
                        <span class="stat">⭐ {{ project.favoritesCount }}</span>
                        <span class="stat">💬 {{ project.commentsCount }}</span>
                        <span class="stat">📥 {{ project.downloadsCount }}</span>
                      </div>
                    </template>
                  </n-card>
                </n-gi>
              </n-grid>
              <n-empty v-if="myWorks.length === 0" description="还没有发布过作品" />
            </div>
          </n-tab-pane>

          <n-tab-pane name="favorites" tab="⭐ 我的收藏">
            <div class="tab-content">
              <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
                <n-gi v-for="project in myFavorites" :key="project.id">
                  <n-card class="project-card" hoverable>
                    <template #header>
                      <div class="card-header">
                        <span class="card-title">{{ project.title }}</span>
                        <n-tag size="small" round>{{ project.palette }}</n-tag>
                      </div>
                    </template>
                    <template #header-extra>
                      <span class="card-author">{{ project.authorName }}</span>
                    </template>
                    <div class="card-body">
                      <p class="card-desc">{{ project.description }}</p>
                      <div class="card-tags">
                        <n-tag v-for="tag in project.tags" :key="tag" size="tiny" round>
                          {{ tag }}
                        </n-tag>
                      </div>
                    </div>
                    <template #footer>
                      <div class="card-stats">
                        <span class="stat">❤️ {{ project.likesCount }}</span>
                        <span class="stat">⭐ {{ project.favoritesCount }}</span>
                        <span class="stat">💬 {{ project.commentsCount }}</span>
                        <span class="stat">📥 {{ project.downloadsCount }}</span>
                      </div>
                    </template>
                  </n-card>
                </n-gi>
              </n-grid>
              <n-empty v-if="myFavorites.length === 0" description="还没有收藏过作品" />
            </div>
          </n-tab-pane>

          <n-tab-pane name="following" tab="👥 我的关注">
            <div class="tab-content">
              <div v-if="followingList.length > 0" class="following-list">
                <div v-for="author in followingList" :key="author.name" class="following-item">
                  <div class="author-info">
                    <n-avatar :size="48" round class="author-avatar">
                      {{ author.avatar }}
                    </n-avatar>
                    <div class="author-details">
                      <span class="author-name">{{ author.name }}</span>
                      <span class="author-works">{{ author.worksCount }} 个作品</span>
                    </div>
                  </div>
                  <n-button
                    size="small"
                    type="error"
                    secondary
                    @click="handleUnfollow(author.name)"
                  >
                    取消关注
                  </n-button>
                </div>
              </div>
              <n-empty v-else description="还没有关注任何作者" />
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- Edit Profile Modal -->
      <n-modal v-model:show="showEditModal" preset="dialog" title="编辑资料">
        <n-form :model="editForm" label-placement="left">
          <n-form-item label="头像">
            <div class="avatar-picker">
              <n-button
                v-for="emoji in avatarOptions"
                :key="emoji"
                :type="editForm.avatar === emoji ? 'primary' : 'default'"
                size="small"
                class="avatar-option"
                @click="editForm.avatar = emoji"
              >
                {{ emoji }}
              </n-button>
            </div>
          </n-form-item>
          <n-form-item label="用户名">
            <n-input v-model:value="editForm.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="个人简介">
            <n-input
              v-model:value="editForm.bio"
              type="textarea"
              placeholder="介绍一下自己"
              :rows="3"
            />
          </n-form-item>
        </n-form>
        <template #action>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleSaveProfile">保存</n-button>
        </template>
      </n-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  NButton, NTabs, NTabPane, NTag, NEmpty,
  NCard, NAvatar, NGrid, NGi, NModal,
  NInput, NForm, NFormItem,
  useMessage
} from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useCommunityStore } from '@/stores/community'

const userStore = useUserStore()
const communityStore = useCommunityStore()
const message = useMessage()

const activeTab = ref('works')
const showEditModal = ref(false)
const showLoginModal = ref(false)

const loginForm = reactive({
  username: '',
  email: '',
})

const editForm = reactive({
  avatar: userStore.user?.avatar || '🧑‍🎨',
  username: userStore.user?.username || '',
  bio: userStore.user?.bio || '',
})

const avatarOptions = [
  '🧑‍🎨', '👩‍🎨', '👨‍🎨', '🎨', '✨', '🌟',
  '🦊', '🐱', '🐶', '🐼', '🦄', '🐰',
  '🎮', '🎵', '📚', '🌸', '🍀', '🔥',
]

// My works: filter by authorName matching logged-in user
const myWorks = computed(() => {
  if (!userStore.user) return []
  return communityStore.projects.filter(p => p.authorName === userStore.user?.username)
})

// My favorites: filter by isFavorited
const myFavorites = computed(() => {
  return communityStore.projects.filter(p => p.isFavorited)
})

// Following list: extract unique authors from followed names
const followingList = computed(() => {
  return userStore.following.map(name => {
    const projects = communityStore.projects.filter(p => p.authorName === name)
    const avatar = projects.length > 0 ? projects[0].authorAvatar : '👤'
    return {
      name,
      avatar,
      worksCount: projects.length,
    }
  })
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function handleLogin() {
  if (!loginForm.username.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!loginForm.email.trim()) {
    message.warning('请输入邮箱')
    return
  }
  userStore.login(loginForm.username.trim(), loginForm.email.trim())
  showLoginModal.value = false
  loginForm.username = ''
  loginForm.email = ''
  message.success('登录成功')
}

function handleLogout() {
  userStore.logout()
  message.success('已退出登录')
}

function handleSaveProfile() {
  if (!editForm.username.trim()) {
    message.warning('用户名不能为空')
    return
  }
  userStore.updateProfile({
    avatar: editForm.avatar,
    username: editForm.username.trim(),
    bio: editForm.bio.trim(),
  })
  showEditModal.value = false
  message.success('资料已更新')
}

function handleUnfollow(authorName: string) {
  userStore.toggleFollow(authorName)
  message.success(`已取消关注 ${authorName}`)
}
</script>

<style lang="scss" scoped>
.user-center {
  min-height: 100vh;
  background: #FFF7ED;
  display: flex;
  flex-direction: column;
}

// Login prompt
.login-prompt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
}

.login-prompt-card {
  background: white;
  border-radius: $radius-lg;
  padding: $spacing-2xl;
  text-align: center;
  box-shadow: $shadow-md;
  max-width: 400px;
  width: 100%;

  .login-icon {
    font-size: 64px;
    display: block;
    margin-bottom: $spacing-lg;
  }

  h2 {
    font-size: $font-size-2xl;
    font-weight: 700;
    margin-bottom: $spacing-md;
    color: #F43F5E;
  }

  p {
    color: $color-text-secondary;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }
}

// Profile header
.profile-header {
  background: linear-gradient(135deg, #F43F5E, #FB923C);
  padding: $spacing-2xl $spacing-xl;
  color: white;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: $spacing-xl;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    text-align: center;
  }
}

.profile-avatar {
  flex-shrink: 0;

  .avatar-emoji {
    background: rgba(255, 255, 255, 0.2);
    font-size: 40px;
  }
}

.profile-info {
  flex: 1;

  @media (max-width: $breakpoint-md) {
    width: 100%;
  }
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;

  @media (max-width: $breakpoint-md) {
    justify-content: center;
  }
}

.profile-name {
  font-size: $font-size-2xl;
  font-weight: 700;
  margin: 0;
}

.profile-bio {
  font-size: $font-size-md;
  opacity: 0.9;
  margin-bottom: $spacing-md;
}

.profile-stats {
  display: flex;
  gap: $spacing-xl;

  @media (max-width: $breakpoint-md) {
    justify-content: center;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .stat-value {
    font-size: $font-size-xl;
    font-weight: 700;
  }

  .stat-label {
    font-size: $font-size-sm;
    opacity: 0.8;
  }
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @media (max-width: $breakpoint-md) {
    flex-direction: row;
    justify-content: center;
  }
}

// Tabs section
.tabs-section {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: $spacing-xl;
}

.tab-content {
  padding-top: $spacing-lg;
}

// Project cards
.project-card {
  height: 100%;
  background: white;
  border-radius: $radius-lg;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: #1a1a1a;
}

.card-date,
.card-author {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.card-body {
  min-height: 80px;
}

.card-desc {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  line-height: 1.6;
  margin-bottom: $spacing-sm;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.card-stats {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;

  .stat {
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
}

// Following list
.following-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.following-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background: white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: all $transition-normal;

  &:hover {
    box-shadow: $shadow-md;
  }

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    gap: $spacing-md;
  }
}

.author-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.author-avatar {
  background: linear-gradient(135deg, #F43F5E, #FB923C);
  font-size: 24px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: #1a1a1a;
}

.author-works {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

// Avatar picker
.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;

  .avatar-option {
    font-size: 24px;
    width: 48px;
    height: 48px;
    padding: 0;
  }
}
</style>
