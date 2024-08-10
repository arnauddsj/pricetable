<script setup lang="ts">
import TopBar from "@/components/TopBar.vue";
</script>

<template>
  <div class="default-layout">
    <TopBar />
    <slot></slot>
  </div>
</template>
