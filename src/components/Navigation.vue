<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-content">
        <div class="logo-container">
          <img :src="logo" alt="Logo" class="logo-image" />
          <h1 class="logo">
            زقزق
            <span class="logo-subtitle">
            Palestinian<br/>Dictionary
          </span>
          </h1>
          
        </div>

        <div class="nav-links">
          <router-link
            to="/"
            class="nav-link"
            active-class="active"
          >
            <Search :size="24" />
          </router-link>

          <router-link
            to="/library"
            class="nav-link"
            active-class="active"
          >
            <BookMarked :size="24" />
          </router-link>
          
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Search, BookMarked } from 'lucide-vue-next';
import logo from '../assets/bird-logo.svg';
</script>

<style scoped lang="scss">
.navbar {
  background-color: transparent;
  padding-top: calc(1rem + env(safe-area-inset-top));
  margin-bottom: 2rem;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
}

.logo-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  width: 64px;
  height: auto;
}

.logo {
  font-size: 1.75rem;
  font-weight: 300;
  color: #8B1E24; // Brand Maroon
  line-height: 1;
  margin-bottom: 0;
  text-align: left;
}

.logo-subtitle {
  font-size: 1rem;
  font-weight: 300;
  display: block;
  color: #8B1E24; // Brand Maroon
  line-height: 1;
  margin-bottom: 0;
  margin-top: 0.5rem;
  text-align: left;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: color 0.2s;
  color: #8F9B85; // Sage Green (inactive)
  
  &:hover {
    color: #6b7280;
  }

  &.active {
    color: #8B1E24; // Brand Maroon (active)
  }
}
</style>
