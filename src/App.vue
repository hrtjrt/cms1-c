<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
</script>

<template>
  <SiteHeader />
  <RouterView />
  <SiteFooter />
  <BackToTop />
</template>
