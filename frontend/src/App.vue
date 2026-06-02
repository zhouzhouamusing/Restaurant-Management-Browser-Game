<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Comic Sans MS', 'Segoe UI', cursive, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ElementPlus覆盖样式 */
.el-message {
  border-radius: 12px !important;
  font-family: 'Comic Sans MS', cursive !important;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(155, 89, 182, 0.3);
  border-radius: 3px;
}
</style>
