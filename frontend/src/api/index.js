import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 用户相关
export const userApi = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data)
}

// 游戏存档相关
export const gameApi = {
  load: (userId) => api.get(`/game/load/${userId}`),
  save: (data) => api.post('/game/save', data)
}

export default api
