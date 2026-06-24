import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USER_KEY = 'pixelworld_user'
const FOLLOW_KEY = 'pixelworld_follows'

interface User {
  id: string
  username: string
  email: string
  avatar: string
  bio: string
  points: number
  isVip: boolean
}

function loadUser(): User | null {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

function loadFollows(): string[] {
  try {
    const data = localStorage.getItem(FOLLOW_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveFollows(follows: string[]) {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(follows))
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(loadUser())
  const isLoggedIn = computed(() => !!user.value)
  const following = ref<string[]>(loadFollows())

  function login(username: string, email: string) {
    const u: User = {
      id: Date.now().toString(36),
      username, email,
      avatar: '🧑‍🎨',
      bio: '拼豆爱好者',
      points: 100,
      isVip: false,
    }
    user.value = u
    saveUser(u)
  }

  function register(username: string, email: string, _password: string) {
    login(username, email)
  }

  function logout() {
    user.value = null
    saveUser(null)
  }

  function updateProfile(data: Partial<User>) {
    if (!user.value) return
    Object.assign(user.value, data)
    saveUser(user.value)
  }

  function addPoints(amount: number) {
    if (!user.value) return
    user.value.points += amount
    saveUser(user.value)
  }

  function toggleFollow(authorName: string) {
    const idx = following.value.indexOf(authorName)
    if (idx >= 0) {
      following.value.splice(idx, 1)
    } else {
      following.value.push(authorName)
    }
    saveFollows(following.value)
  }

  function isFollowing(authorName: string) {
    return following.value.includes(authorName)
  }

  return {
    user, isLoggedIn, following,
    login, register, logout, updateProfile, addPoints,
    toggleFollow, isFollowing,
  }
})
