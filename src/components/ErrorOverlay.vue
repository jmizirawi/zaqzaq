<script setup lang="ts">
import { errorState } from '../utils/errorLogger';
import { ref } from 'vue';

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="error-overlay-container">
    <button class="toggle-btn" @click="toggle" :class="{ 'has-errors': errorState.errors.length > 0 }">
      {{ isOpen ? 'Close Debug' : 'Debug' }} ({{ errorState.errors.length }})
    </button>
    
    <div v-if="isOpen" class="error-log">
      <div class="header">
        <h3>Error Log</h3>
        <button @click="errorState.clearErrors()">Clear</button>
      </div>
      <div v-if="errorState.errors.length === 0" class="empty">
        No errors captured.
      </div>
      <ul v-else class="error-list">
        <li v-for="(err, index) in errorState.errors" :key="index" class="error-item">
          <div class="error-msg">{{ err.message }}</div>
          <div class="error-source" v-if="err.source">Source: {{ err.source }}</div>
           <div class="error-time">{{ new Date(err.timestamp).toLocaleTimeString() }}</div>
           <pre v-if="err.stack" class="error-stack">{{ err.stack }}</pre>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.error-overlay-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: monospace;
}

.toggle-btn {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  font-weight: bold;
}

.toggle-btn.has-errors {
  background: #d32f2f;
  opacity: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.error-log {
  position: fixed;
  top: 60px;
  left: 20px;
  right: 20px;
  bottom: 80px;
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  overflow-y: auto;
  border: 1px solid #444;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

.header h3 {
    margin: 0;
    color: #fff;
}

.header button {
    background: #444;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.error-list {
    padding: 0;
    margin: 0;
}

.error-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
  list-style: none;
}

.error-msg {
  color: #ff5252;
  font-weight: bold;
  word-break: break-all;
}

.error-source {
  color: #aaa;
  font-size: 0.8em;
  margin-top: 4px;
}

.error-time {
  color: #666;
  font-size: 0.7em;
  margin-top: 2px;
}

.error-stack {
  font-size: 0.7em;
  color: #ddd;
  background: #222;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  margin-top: 5px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #333;
}
</style>
