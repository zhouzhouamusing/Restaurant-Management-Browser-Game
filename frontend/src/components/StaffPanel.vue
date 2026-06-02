<template>
  <div class="staff-panel">
    <h3 class="panel-title">
      <span class="title-icon">👥</span>
      <span>员工管理</span>
    </h3>

    <!-- Hired Staff -->
    <div v-if="staff.length > 0" class="staff-section">
      <div class="section-label">🏷️ 在职员工</div>
      <div class="staff-list">
        <div
          v-for="s in staff"
          :key="s.id"
          class="staff-card"
          :class="{ busy: s.busy }"
        >
          <div class="staff-avatar">
            <span class="staff-emoji">{{ s.emoji }}</span>
            <span class="staff-level">Lv.{{ s.level }}</span>
          </div>
          <div class="staff-info">
            <div class="staff-name">{{ s.name }}</div>
            <div class="staff-role">{{ s.type === 'waiter' ? '服务员' : '收银员' }}</div>
            <div class="proficiency-bar">
              <div class="proficiency-fill" :style="{ width: (s.proficiency / s.maxProficiency * 100) + '%' }"></div>
            </div>
            <div class="staff-stats">
              <span class="stat-efficiency">效率 +{{ Math.floor((s.getEfficiency() - 1) * 100) }}%</span>
              <span class="stat-served">服务 {{ s.totalServed }} 次</span>
            </div>
          </div>
          <button
            v-if="s.canUpgrade()"
            class="upgrade-btn"
            :class="{ affordable: coins >= s.getUpgradeCost() }"
            @click="$emit('upgrade-staff', s)"
          >
            <span class="upgrade-icon">⬆️</span>
            <span class="upgrade-cost">🪙{{ s.getUpgradeCost() }}</span>
          </button>
          <div v-else class="max-level-badge">MAX</div>
        </div>
      </div>
    </div>

    <!-- Hire Section -->
    <div class="staff-section">
      <div class="section-label">🆕 招聘员工</div>
      <div class="hire-list">
        <div class="hire-card" @click="$emit('hire-staff', 'waiter')">
          <div class="hire-icon">🧑‍🍳</div>
          <div class="hire-info">
            <div class="hire-name">服务员</div>
            <div class="hire-desc">自动接单上菜</div>
          </div>
          <div class="hire-cost" :class="{ affordable: coins >= waiterCost }">
            🪙 {{ waiterCost }}
          </div>
        </div>
        <div class="hire-card" @click="$emit('hire-staff', 'cashier')">
          <div class="hire-icon">💁</div>
          <div class="hire-info">
            <div class="hire-name">收银员</div>
            <div class="hire-desc">自动收银结账</div>
          </div>
          <div class="hire-cost" :class="{ affordable: coins >= cashierCost }">
            🪙 {{ cashierCost }}
          </div>
        </div>
      </div>
    </div>

    <!-- Salary Info -->
    <div v-if="staff.length > 0" class="salary-info">
      <span class="salary-label">💰 总薪资支出:</span>
      <span class="salary-amount">{{ totalSalary }} /分钟</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getHireCost } from '../game/staff.js'

const props = defineProps({
  staff: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 }
})

defineEmits(['hire-staff', 'upgrade-staff'])

const waiterCost = computed(() => {
  const count = props.staff.filter(s => s.type === 'waiter').length
  return getHireCost('waiter', count)
})

const cashierCost = computed(() => {
  const count = props.staff.filter(s => s.type === 'cashier').length
  return getHireCost('cashier', count)
})

const totalSalary = computed(() => {
  return props.staff.reduce((sum, s) => sum + s.getSalary(), 0)
})
</script>

<style scoped>
.staff-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #74b9ff;
  font-size: 15px;
  margin-bottom: 12px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.title-icon {
  font-size: 18px;
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 10px 0 8px 2px;
  font-weight: 600;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.staff-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(41, 128, 185, 0.04) 100%);
  border: 1px solid rgba(52, 152, 219, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.staff-card.busy {
  border-color: rgba(241, 196, 15, 0.4);
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.08) 0%, rgba(243, 156, 18, 0.04) 100%);
  animation: busyPulse 2s ease infinite;
}

@keyframes busyPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.1); }
  50% { box-shadow: 0 0 8px 2px rgba(241, 196, 15, 0.15); }
}

.staff-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.staff-emoji {
  font-size: 24px;
}

.staff-level {
  font-size: 9px;
  color: #74b9ff;
  font-weight: bold;
  background: rgba(116, 185, 255, 0.15);
  padding: 1px 5px;
  border-radius: 6px;
}

.staff-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.staff-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.staff-role {
  color: #95a5a6;
  font-size: 10px;
}

.proficiency-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  margin-top: 3px;
  overflow: hidden;
}

.proficiency-fill {
  height: 100%;
  background: linear-gradient(90deg, #74b9ff, #0984e3);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.staff-stats {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.stat-efficiency {
  font-size: 9px;
  color: #2ecc71;
  font-weight: 600;
}

.stat-served {
  font-size: 9px;
  color: #95a5a6;
}

.upgrade-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1.5px solid rgba(155, 89, 182, 0.3);
  background: rgba(155, 89, 182, 0.08);
  cursor: pointer;
  transition: all 0.25s;
}

.upgrade-btn.affordable {
  border-color: rgba(46, 204, 113, 0.5);
  background: rgba(46, 204, 113, 0.1);
}

.upgrade-btn.affordable:hover {
  transform: scale(1.05);
  background: rgba(46, 204, 113, 0.2);
  box-shadow: 0 2px 10px rgba(46, 204, 113, 0.2);
}

.upgrade-icon {
  font-size: 14px;
}

.upgrade-cost {
  font-size: 9px;
  color: #f39c12;
  font-weight: 600;
}

.max-level-badge {
  font-size: 10px;
  color: #f39c12;
  font-weight: bold;
  background: rgba(243, 156, 18, 0.15);
  padding: 4px 8px;
  border-radius: 8px;
}

.hire-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hire-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px dashed rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hire-card:hover {
  background: rgba(116, 185, 255, 0.08);
  border-color: rgba(116, 185, 255, 0.4);
  transform: translateX(3px);
  box-shadow: 0 2px 12px rgba(116, 185, 255, 0.1);
}

.hire-card:active {
  transform: translateX(1px) scale(0.98);
}

.hire-icon {
  font-size: 28px;
  min-width: 36px;
  text-align: center;
}

.hire-info {
  flex: 1;
}

.hire-name {
  color: #ecf0f1;
  font-size: 13px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.hire-desc {
  color: #95a5a6;
  font-size: 10px;
  margin-top: 2px;
}

.hire-cost {
  color: #e74c3c;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.1);
  transition: all 0.3s;
}

.hire-cost.affordable {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
}

.salary-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.06);
  border: 1px solid rgba(231, 76, 60, 0.15);
}

.salary-label {
  font-size: 11px;
  color: #bdc3c7;
}

.salary-amount {
  font-size: 12px;
  color: #e74c3c;
  font-weight: 600;
}
</style>
