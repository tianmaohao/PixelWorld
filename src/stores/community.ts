import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CommunityProject, Comment, Pixel, BeadColor, PaletteBrand } from '@/types'

const STORAGE_KEY = 'pixelworld_projects'
const COMMENTS_KEY = 'pixelworld_comments'

function loadProjects(): CommunityProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveProjects(projects: CommunityProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

function loadComments(): Comment[] {
  try {
    const data = localStorage.getItem(COMMENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useCommunityStore = defineStore('community', () => {
  const projects = ref<CommunityProject[]>(loadProjects())
  const comments = ref<Comment[]>(loadComments())

  // 初始化一些示例数据
  function initDemoData() {
    if (projects.value.length > 0) return

    const demoProjects: CommunityProject[] = [
      {
        id: genId(), title: '可爱柴犬', description: '用 Artkal S 系列制作的柴犬像素画',
        tags: ['动物', '柴犬', '可爱'], palette: 'artkal-s', width: 29, height: 29,
        beadCount: 841, thumbnail: '', pixels: [], beadColors: [],
        authorName: '像素达人', authorAvatar: '🧑‍🎨',
        likesCount: 128, favoritesCount: 45, commentsCount: 12, downloadsCount: 89,
        isLiked: false, isFavorited: false, createdAt: '2025-06-20T10:00:00Z',
      },
      {
        id: genId(), title: '樱花树下', description: '春天的樱花树像素画，粉色系调色盘',
        tags: ['风景', '樱花', '春天'], palette: 'perler', width: 58, height: 58,
        beadCount: 3364, thumbnail: '', pixels: [], beadColors: [],
        authorName: '手工小屋', authorAvatar: '🏠',
        likesCount: 256, favoritesCount: 89, commentsCount: 34, downloadsCount: 167,
        isLiked: false, isFavorited: false, createdAt: '2025-06-19T15:30:00Z',
      },
      {
        id: genId(), title: '超级马里奥', description: '经典马里奥像素画，Perler 调色盘',
        tags: ['游戏', '马里奥', '经典'], palette: 'perler', width: 29, height: 29,
        beadCount: 841, thumbnail: '', pixels: [], beadColors: [],
        authorName: '游戏怀旧', authorAvatar: '🎮',
        likesCount: 512, favoritesCount: 203, commentsCount: 67, downloadsCount: 342,
        isLiked: false, isFavorited: false, createdAt: '2025-06-18T08:00:00Z',
      },
    ]

    projects.value = demoProjects
    saveProjects(demoProjects)
  }

  // 发布作品
  function publishProject(data: {
    title: string; description: string; tags: string[]
    palette: PaletteBrand; width: number; height: number
    pixels: Pixel[]; beadColors: BeadColor[]
    authorName: string; authorAvatar: string
  }) {
    const project: CommunityProject = {
      id: genId(),
      ...data,
      beadCount: data.pixels.length,
      thumbnail: '',
      likesCount: 0, favoritesCount: 0, commentsCount: 0, downloadsCount: 0,
      isLiked: false, isFavorited: false,
      createdAt: new Date().toISOString(),
    }
    projects.value.unshift(project)
    saveProjects(projects.value)
    return project
  }

  // 点赞
  function toggleLike(projectId: string) {
    const p = projects.value.find(x => x.id === projectId)
    if (!p) return
    p.isLiked = !p.isLiked
    p.likesCount += p.isLiked ? 1 : -1
    saveProjects(projects.value)
  }

  // 收藏
  function toggleFavorite(projectId: string) {
    const p = projects.value.find(x => x.id === projectId)
    if (!p) return
    p.isFavorited = !p.isFavorited
    p.favoritesCount += p.isFavorited ? 1 : -1
    saveProjects(projects.value)
  }

  // 评论
  function addComment(projectId: string, authorName: string, authorAvatar: string, content: string) {
    const comment: Comment = {
      id: genId(), projectId, authorName, authorAvatar, content,
      likesCount: 0, isLiked: false, createdAt: new Date().toISOString(),
    }
    comments.value.push(comment)
    saveComments(comments.value)

    const p = projects.value.find(x => x.id === projectId)
    if (p) { p.commentsCount++; saveProjects(projects.value) }
    return comment
  }

  function getProjectComments(projectId: string) {
    return comments.value.filter(c => c.projectId === projectId)
  }

  function toggleCommentLike(commentId: string) {
    const c = comments.value.find(x => x.id === commentId)
    if (!c) return
    c.isLiked = !c.isLiked
    c.likesCount += c.isLiked ? 1 : -1
    saveComments(comments.value)
  }

  // 搜索
  function searchProjects(query: string) {
    const q = query.toLowerCase()
    return projects.value.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.authorName.toLowerCase().includes(q)
    )
  }

  // 排序
  const latestProjects = computed(() =>
    [...projects.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )
  const popularProjects = computed(() =>
    [...projects.value].sort((a, b) => b.likesCount - a.likesCount)
  )

  // 初始化
  initDemoData()

  return {
    projects, comments,
    publishProject, toggleLike, toggleFavorite,
    addComment, getProjectComments, toggleCommentLike,
    searchProjects, latestProjects, popularProjects,
  }
})
