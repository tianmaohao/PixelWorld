<template>
  <NModal
    :show="show"
    :mask-closable="true"
    :close-on-esc="true"
    @update:show="handleUpdateShow"
  >
    <div class="project-detail-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="project-title">{{ project?.title || '项目详情' }}</div>
        <div class="author-info" v-if="project">
          <NAvatar
            :size="32"
            round
            class="author-avatar"
          >
            {{ project.authorAvatar }}
          </NAvatar>
          <span class="author-name">{{ project.authorName }}</span>
          <span class="created-date">{{ formatRelativeTime(project.createdAt) }}</span>
        </div>
      </div>

      <NDivider />

      <!-- Info Section -->
      <div class="project-info" v-if="project">
        <div class="info-tags">
          <NTag
            v-for="tag in project.tags"
            :key="tag"
            size="small"
            class="tag"
          >
            {{ tag }}
          </NTag>
        </div>
        <div class="info-details">
          <span class="detail-item" v-if="project.palette">
            <span class="detail-label">色板:</span>
            <span class="detail-value">{{ project.palette }}</span>
          </span>
          <span class="detail-item">
            <span class="detail-label">尺寸:</span>
            <span class="detail-value">{{ project.width }} × {{ project.height }}</span>
          </span>
          <span class="detail-item" v-if="project.beadCount">
            <span class="detail-label">珠子数:</span>
            <span class="detail-value">{{ project.beadCount.toLocaleString() }}</span>
          </span>
        </div>
      </div>

      <!-- Actions Row -->
      <div class="actions-row" v-if="project">
        <NTooltip>
          <template #trigger>
            <NButton
              size="small"
              :type="project.isLiked ? 'error' : 'default'"
              @click="handleLike"
            >
              <template #icon>
                <span class="action-icon">❤️</span>
              </template>
              <span class="action-count">{{ project.likesCount }}</span>
            </NButton>
          </template>
          <span>{{ project.isLiked ? '取消点赞' : '点赞' }}</span>
        </NTooltip>

        <NTooltip>
          <template #trigger>
            <NButton
              size="small"
              :type="project.isFavorited ? 'warning' : 'default'"
              @click="handleFavorite"
            >
              <template #icon>
                <span class="action-icon">⭐</span>
              </template>
              <span class="action-count">{{ project.favoritesCount }}</span>
            </NButton>
          </template>
          <span>{{ project.isFavorited ? '取消收藏' : '收藏' }}</span>
        </NTooltip>

        <NButton
          size="small"
          @click="handleFollow"
          :disabled="!userStore.isLoggedIn"
        >
          <template #icon>
            <span class="action-icon">👤</span>
          </template>
          {{ userStore.isFollowing(project.authorName) ? '已关注' : '关注' }}
        </NButton>

        <NButton size="small" disabled>
          <template #icon>
            <span class="action-icon">📥</span>
          </template>
          下载
        </NButton>
      </div>

      <!-- Description -->
      <div class="project-description" v-if="project?.description">
        <NDivider title-placement="left">项目描述</NDivider>
        <div class="description-content">{{ project.description }}</div>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <NDivider title-placement="left">
          评论 ({{ comments.length }})
        </NDivider>

        <!-- Comments List -->
        <div class="comments-list" v-if="comments.length > 0">
          <div
            class="comment-item"
            v-for="comment in comments"
            :key="comment.id"
          >
            <NAvatar
              :size="28"
              round
              class="comment-avatar"
            >
              {{ comment.authorAvatar }}
            </NAvatar>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.authorName }}</span>
                <span class="comment-time">{{ formatRelativeTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-actions">
                <NButton
                  text
                  size="tiny"
                  :type="comment.isLiked ? 'error' : 'default'"
                  @click="handleLikeComment(comment.id)"
                >
                  ❤️ {{ comment.likesCount }}
                </NButton>
              </div>
            </div>
          </div>
        </div>

        <NEmpty v-else description="暂无评论" />

        <!-- Comment Input -->
        <div class="comment-input-section" v-if="userStore.isLoggedIn">
          <NInput
            v-model:value="commentContent"
            type="textarea"
            placeholder="写下你的评论..."
            :rows="3"
            class="comment-textarea"
          />
          <NButton
            type="primary"
            @click="handleComment"
            :disabled="!commentContent.trim()"
            class="send-button"
          >
            发送
          </NButton>
        </div>
        <div class="login-prompt" v-else>
          <span>请先登录</span>
        </div>
      </div>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal, NButton, NTag, NInput, NAvatar, NEmpty, NDivider, NTooltip
} from 'naive-ui'
import { useCommunityStore } from '@/stores/community'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  show: boolean
  projectId: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const communityStore = useCommunityStore()
const userStore = useUserStore()

const commentContent = ref('')

const project = computed(() => communityStore.projects.find(p => p.id === props.projectId))
const comments = computed(() => communityStore.getProjectComments(props.projectId))

function handleUpdateShow(value: boolean) {
  emit('update:show', value)
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const target = new Date(dateStr).getTime()
  const diff = now - target
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 30)}个月前`
}

function handleLike() {
  if (!userStore.isLoggedIn) return
  communityStore.toggleLike(props.projectId)
}

function handleFavorite() {
  if (!userStore.isLoggedIn) return
  communityStore.toggleFavorite(props.projectId)
}

function handleFollow() {
  if (!userStore.isLoggedIn || !project.value) return
  userStore.toggleFollow(project.value.authorName)
}

function handleLikeComment(commentId: string) {
  if (!userStore.isLoggedIn) return
  communityStore.toggleCommentLike(commentId)
}

function handleComment() {
  if (!userStore.isLoggedIn || !commentContent.value.trim() || !userStore.user) return
  communityStore.addComment(
    props.projectId,
    userStore.user.username,
    userStore.user.avatar,
    commentContent.value.trim()
  )
  commentContent.value = ''
}
</script>

<style scoped lang="scss">
.project-detail-modal {
  background: #FFF7ED;
  border-radius: 16px;
  padding: 24px;
  max-width: 700px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(244, 63, 94, 0.15);
}

.modal-header {
  .project-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .author-avatar {
      border: 2px solid #F43F5E;
    }

    .author-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .created-date {
      font-size: 12px;
      color: #999;
      margin-left: auto;
    }
  }
}

.project-info {
  .info-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;

    .tag {
      background: #F43F5E;
      color: white;
      border: none;
    }
  }

  .info-details {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .detail-item {
      font-size: 13px;
      color: #666;

      .detail-label {
        font-weight: 500;
        margin-right: 4px;
      }

      .detail-value {
        color: #333;
      }
    }
  }
}

.actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  .action-icon {
    margin-right: 4px;
  }

  .action-count {
    font-size: 13px;
  }
}

.project-description {
  .description-content {
    font-size: 14px;
    line-height: 1.7;
    color: #444;
    white-space: pre-wrap;
  }
}

.comments-section {
  .comments-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .comment-item {
    display: flex;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(244, 63, 94, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .comment-avatar {
      flex-shrink: 0;
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .comment-author {
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        .comment-time {
          font-size: 11px;
          color: #999;
        }
      }

      .comment-text {
        font-size: 14px;
        line-height: 1.6;
        color: #444;
      }

      .comment-actions {
        margin-top: 6px;
      }
    }
  }

  .comment-input-section {
    display: flex;
    gap: 10px;
    align-items: flex-start;

    .comment-textarea {
      flex: 1;
    }

    .send-button {
      background: #F43F5E;
      color: white;
      border: none;
      padding: 0 20px;

      &:hover {
        background: #e11d48;
      }
    }
  }

  .login-prompt {
    text-align: center;
    padding: 16px;
    color: #F43F5E;
    font-size: 14px;
    background: rgba(244, 63, 94, 0.05);
    border-radius: 8px;
  }
}

:deep(.n-divider) {
  margin: 16px 0;
}

:deep(.n-button) {
  border-radius: 20px;
}

:deep(.n-tag) {
  border-radius: 12px;
}
</style>
