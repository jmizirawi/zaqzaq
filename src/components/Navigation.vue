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
@import '../styles/variables';
@import '../styles/mixins';

.navbar {
  background-color: transparent;
  padding-top: calc(1rem + env(safe-area-inset-top));
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: $spacing-xxl;
}

.logo-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  height: $spacing-xxl;
  width: auto;
}

.logo {
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  color: $color-fg-accent-primary;
  line-height: 1;
  margin-bottom: 0;
  text-align: left;
}

.logo-subtitle {
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  display: block;
  color: $color-fg-accent-primary;
  line-height: 1;
  margin-bottom: 0;
  margin-top: 0.5rem;
  text-align: left;
}

.nav-links {
  display: flex;
  gap: $spacing-md;
}

.nav-link {
  @include btn-icon;
  padding: $spacing-sm $spacing-lg;

}
</style>
