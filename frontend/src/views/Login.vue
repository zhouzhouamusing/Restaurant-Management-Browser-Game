<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <div class="bg-scene">
      <div class="bg-gradient"></div>
      <div class="floating-items">
        <div v-for="i in 12" :key="i" class="float-item" :class="'item-' + i"></div>
      </div>
      <div class="ground"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-top">
        <div class="restaurant-icon">
          <span class="icon-main">🍳</span>
          <span class="icon-sparkle sparkle-1">✨</span>
          <span class="icon-sparkle sparkle-2">⭐</span>
        </div>
        <h1 class="game-title">欢乐餐厅</h1>
        <p class="game-subtitle">经营属于你的梦想小餐厅</p>
      </div>

      <div class="card-body">
        <div class="form-group">
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              v-model="form.username"
              type="text"
              placeholder="输入用户名"
              class="game-input"
              @keyup.enter="handleSubmit"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="输入密码"
              class="game-input"
              @keyup.enter="handleSubmit"
            />
            <span class="pwd-toggle" @click="showPwd = !showPwd">
              {{ showPwd ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>

        <div class="form-group" v-if="isRegister">
          <div class="input-wrapper">
            <span class="input-icon">⭐</span>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="给自己取个昵称"
              class="game-input"
              @keyup.enter="handleSubmit"
            />
          </div>
        </div>

        <button
          class="submit-btn"
          :class="{ loading: loading }"
          @click="handleSubmit"
          :disabled="loading"
        >
          <span v-if="!loading">{{ isRegister ? '🚀 注册并开始' : '🎮 开始游戏' }}</span>
          <span v-else>加载中...</span>
        </button>

        <div class="switch-mode" @click="isRegister = !isRegister">
          {{ isRegister ? '已有账号? 点击登录' : '没有账号? 点击注册' }}
        </div>
      </div>

      <div class="card-footer">
        <div class="feature-tags">
          <span class="tag">🍕 经营</span>
          <span class="tag">👨‍🍳 烹饪</span>
          <span class="tag">💰 赚钱</span>
          <span class="tag">⬆️ 升级</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '../api'

const router = useRouter()
const isRegister = ref(false)
const loading = ref(false)
const showPwd = ref(false)

const form = reactive({
  username: '',
  password: '',
  nickname: ''
})

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  if (form.username.length < 2) {
    ElMessage.warning('用户名至少2个字符')
    return
  }
  if (form.password.length < 4) {
    ElMessage.warning('密码至少4个字符')
    return
  }
  loading.value = true
  try {
    const api = isRegister.value ? userApi.register : userApi.login
    const res = await api(form)
    if (res.data.code === 200) {
      localStorage.setItem('user', JSON.stringify(res.data.data))
      ElMessage.success(isRegister.value ? '注册成功! 欢迎来到欢乐餐厅!' : '欢迎回来!')
      router.push('/game')
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (e) {
    ElMessage.error('网络错误，请稍后重试')
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景场景 */
.bg-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%);
}

.ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, #2d1b69 0%, transparent 100%);
}

.floating-items {
  position: absolute;
  inset: 0;
}

.float-item {
  position: absolute;
  font-size: 2rem;
  animation: floatAround 12s ease-in-out infinite;
  opacity: 0.5;
}

.item-1 { left: 5%; top: 15%; animation-delay: 0s; }
.item-1::after { content: '🍕'; }
.item-2 { left: 85%; top: 10%; animation-delay: 1.2s; }
.item-2::after { content: '🍔'; }
.item-3 { left: 15%; top: 75%; animation-delay: 2.4s; }
.item-3::after { content: '🍜'; }
.item-4 { left: 75%; top: 80%; animation-delay: 3.6s; }
.item-4::after { content: '🧁'; }
.item-5 { left: 45%; top: 8%; animation-delay: 4.8s; }
.item-5::after { content: '🍣'; }
.item-6 { left: 92%; top: 50%; animation-delay: 6s; }
.item-6::after { content: '🥤'; }
.item-7 { left: 3%; top: 45%; animation-delay: 7.2s; }
.item-7::after { content: '🍰'; }
.item-8 { left: 35%; top: 88%; animation-delay: 8.4s; }
.item-8::after { content: '🍩'; }
.item-9 { left: 60%; top: 20%; animation-delay: 1.8s; }
.item-9::after { content: '🫕'; }
.item-10 { left: 25%; top: 35%; animation-delay: 5.5s; }
.item-10::after { content: '🧋'; }
.item-11 { left: 70%; top: 55%; animation-delay: 3s; }
.item-11::after { content: '🍗'; }
.item-12 { left: 50%; top: 65%; animation-delay: 9s; }
.item-12::after { content: '🥞'; }

@keyframes floatAround {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-15px) rotate(5deg) scale(1.05); }
  50% { transform: translateY(-25px) rotate(-3deg) scale(1.1); }
  75% { transform: translateY(-10px) rotate(4deg) scale(1.02); }
}

/* 登录卡片 */
.login-card {
  position: relative;
  z-index: 10;
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
}

.card-top {
  text-align: center;
  padding: 32px 24px 20px;
  background: linear-gradient(135deg, #fff8f0 0%, #fff3e6 100%);
  border-bottom: 2px dashed #fce4c0;
}

.restaurant-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.icon-main {
  font-size: 56px;
  display: inline-block;
  animation: iconBounce 2.5s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.1) rotate(-5deg); }
  60% { transform: scale(1.05) rotate(3deg); }
}

.icon-sparkle {
  position: absolute;
  font-size: 16px;
  animation: sparkle 2s ease-in-out infinite;
}
.sparkle-1 { top: -5px; right: -15px; animation-delay: 0s; }
.sparkle-2 { bottom: 0; left: -12px; animation-delay: 1s; }

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.game-title {
  font-size: 30px;
  font-weight: 800;
  color: #d35400;
  font-family: 'Comic Sans MS', cursive;
  text-shadow: 2px 2px 0 rgba(211, 84, 0, 0.1);
  margin: 4px 0;
}

.game-subtitle {
  font-size: 13px;
  color: #a0785a;
}

/* 表单区域 */
.card-body {
  padding: 24px 28px;
}

.form-group {
  margin-bottom: 14px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f4f0;
  border-radius: 14px;
  padding: 0 14px;
  border: 2px solid transparent;
  transition: all 0.25s;
}

.input-wrapper:focus-within {
  border-color: #f39c12;
  background: #fffaf3;
  box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.1);
}

.input-icon {
  font-size: 18px;
  margin-right: 10px;
}

.game-input {
  flex: 1;
  border: none;
  background: none;
  padding: 14px 0;
  font-size: 14px;
  color: #333;
  outline: none;
  font-family: 'Comic Sans MS', cursive;
}

.game-input::placeholder {
  color: #bbb;
}

.pwd-toggle {
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  user-select: none;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Comic Sans MS', cursive;
  color: white;
  background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 6px;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.switch-mode:hover {
  color: #d35400;
}

/* 底部标签 */
.card-footer {
  padding: 14px 24px 18px;
  background: #fdf8f3;
  border-top: 1px solid #f5ebe0;
}

.feature-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #fff;
  color: #d35400;
  border: 1px solid #fce4c0;
  font-family: 'Comic Sans MS', cursive;
}
</style>
