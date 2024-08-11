<script setup lang="ts">
import TopBar from "@/components/TopBar.vue";
</script>

<template>
  <div class="w-full flex flex-col bg-gray-100">
    <TopBar />
    <div class="w-full px-4 items-center justify-center">
      <slot></slot>
    </div>
  </div>
</template>
