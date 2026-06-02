<template>
  <div class="login-container">
    <!-- 装饰性背景元素 -->
    <div class="bg-decor">
      <div class="floating-food" v-for="i in 8" :key="i" :class="'food-' + i"></div>
    </div>

    <div class="login-card">
      <div class="card-header">
        <div class="logo">🍳</div>
        <h1>欢乐餐厅</h1>
        <p class="subtitle">经营你的梦想小餐厅!</p>
      </div>

      <el-form :model="form" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            class="cute-input"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            class="cute-input"
          />
        </el-form-item>
        <el-form-item v-if="isRegister">
          <el-input
            v-model="form.nickname"
            placeholder="给自己取个昵称吧"
            prefix-icon="Star"
            size="large"
            class="cute-input"
          />
        </el-form-item>

        <div class="btn-group">
          <el-button
            type="primary"
            size="large"
            class="btn-main"
            @click="handleSubmit"
            :loading="loading"
          >
            {{ isRegister ? '注册并开始' : '开始游戏' }}
          </el-button>
          <el-button
            type="info"
            size="large"
            text
            @click="isRegister = !isRegister"
          >
            {{ isRegister ? '已有账号? 去登录' : '没有账号? 去注册' }}
          </el-button>
        </div>
      </el-form>
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
  loading.value = true
  try {
    const api = isRegister.value ? userApi.register : userApi.login
    const res = await api(form)
    if (res.data.code === 200) {
      localStorage.setItem('user', JSON.stringify(res.data.data))
      ElMessage.success(isRegister.value ? '注册成功!' : '登录成功!')
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
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-food {
  position: absolute;
  font-size: 2.5rem;
  animation: floatUp 8s ease-in-out infinite;
  opacity: 0.6;
}

.food-1 { left: 10%; top: 20%; animation-delay: 0s; }
.food-1::after { content: '🍕'; }
.food-2 { left: 80%; top: 30%; animation-delay: 1s; }
.food-2::after { content: '🍔'; }
.food-3 { left: 20%; top: 70%; animation-delay: 2s; }
.food-3::after { content: '🍜'; }
.food-4 { left: 70%; top: 80%; animation-delay: 3s; }
.food-4::after { content: '🧁'; }
.food-5 { left: 50%; top: 15%; animation-delay: 4s; }
.food-5::after { content: '🍣'; }
.food-6 { left: 90%; top: 60%; animation-delay: 5s; }
.food-6::after { content: '🥤'; }
.food-7 { left: 5%; top: 50%; animation-delay: 6s; }
.food-7::after { content: '🍰'; }
.food-8 { left: 40%; top: 85%; animation-delay: 7s; }
.food-8::after { content: '🍩'; }

@keyframes floatUp {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 48px 40px;
  width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 64px;
  margin-bottom: 8px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.card-header h1 {
  font-size: 32px;
  color: #e74c3c;
  font-weight: bold;
  text-shadow: 2px 2px 0px rgba(231, 76, 60, 0.1);
}

.subtitle {
  color: #888;
  font-size: 14px;
  margin-top: 4px;
}

.login-form {
  margin-top: 20px;
}

.cute-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.btn-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.btn-main {
  width: 100%;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  height: 48px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  letter-spacing: 2px;
}

.btn-main:hover {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
}
</style>
