<template>
  <n-modal
    :show="show"
    @update:show="onUpdateShow"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
  >
    <div class="auth-modal">
      <button class="close-btn" @click="onUpdateShow(false)">&times;</button>

      <div class="auth-header">
        <span class="auth-icon">🧩</span>
        <h2 class="auth-title">欢迎来到 PixelWorld</h2>
        <p class="auth-subtitle">加入社区，分享你的像素作品</p>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated justify-content="center">
        <n-tab-pane name="login" tab="登录">
          <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="loginForm.username"
                placeholder="请输入用户名"
                @keydown.enter="handleLogin"
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password-on="click"
                @keydown.enter="handleLogin"
              />
            </n-form-item>
          </n-form>
          <n-button
            type="primary"
            block
            strong
            :loading="loading"
            class="submit-btn"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-tab-pane>

        <n-tab-pane name="register" tab="注册">
          <n-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="registerForm.username"
                placeholder="请输入用户名"
              />
            </n-form-item>
            <n-form-item path="email" label="邮箱">
              <n-input
                v-model:value="registerForm.email"
                placeholder="请输入邮箱"
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="registerForm.password"
                type="password"
                placeholder="请输入密码（至少6位）"
                show-password-on="click"
              />
            </n-form-item>
            <n-form-item path="confirmPassword" label="确认密码">
              <n-input
                v-model:value="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password-on="click"
                @keydown.enter="handleRegister"
              />
            </n-form-item>
          </n-form>
          <n-button
            type="primary"
            block
            strong
            :loading="loading"
            class="submit-btn"
            @click="handleRegister"
          >
            注册
          </n-button>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  NModal, NTabs, NTabPane, NForm, NFormItem,
  NInput, NButton, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  authSuccess: []
}>()

const userStore = useUserStore()
const message = useMessage()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)

// ---- Login form ----
const loginFormRef = ref<FormInst | null>(null)
const loginForm = reactive({
  username: '',
  password: '',
})
const loginRules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

// ---- Register form ----
const registerFormRef = ref<FormInst | null>(null)
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
  return true
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// ---- Handlers ----
function onUpdateShow(val: boolean) {
  emit('update:show', val)
}

async function handleLogin() {
  try {
    await loginFormRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    userStore.login(loginForm.username, `${loginForm.username}@pixelworld.com`)
    message.success('登录成功！欢迎回来 🎉')
    emit('authSuccess')
    emit('update:show', false)
    resetLogin()
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  try {
    await registerFormRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    userStore.register(registerForm.username, registerForm.email, registerForm.password)
    message.success('注册成功！欢迎加入 PixelWorld 🎉')
    emit('authSuccess')
    emit('update:show', false)
    resetRegister()
  } finally {
    loading.value = false
  }
}

function resetLogin() {
  loginForm.username = ''
  loginForm.password = ''
}

function resetRegister() {
  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}
</script>

<style lang="scss" scoped>
.auth-modal {
  position: relative;
  width: 420px;
  max-width: 90vw;
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

.auth-header {
  text-align: center;
  margin-bottom: $spacing-lg;

  .auth-icon {
    font-size: 40px;
    display: block;
    margin-bottom: $spacing-sm;
  }

  .auth-title {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-text;
    margin: 0 0 $spacing-xs;
  }

  .auth-subtitle {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;
  }
}

.submit-btn {
  margin-top: $spacing-md;
  height: 42px;
  font-size: $font-size-md;
  font-weight: 600;
  border-radius: $radius-md;
  background: $color-primary;
  border-color: $color-primary;

  &:hover,
  &:focus {
    background: $color-primary-dark;
    border-color: $color-primary-dark;
  }
}

:deep(.n-tabs .n-tabs-tab) {
  font-size: $font-size-md;
  font-weight: 500;

  &.n-tabs-tab--active {
    color: $color-primary !important;
  }
}

:deep(.n-tabs .n-tabs-tab-bar) {
  background-color: $color-primary;
}

:deep(.n-form-item-label__text) {
  font-weight: 500;
  color: $color-text;
}

:deep(.n-input--focus .n-input__border) {
  border-color: $color-primary;
}

:deep(.n-button--primary-type) {
  background-color: $color-primary;
  border-color: $color-primary;

  &:hover,
  &:focus {
    background-color: $color-primary-dark;
    border-color: $color-primary-dark;
  }
}
</style>
