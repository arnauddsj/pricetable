<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const logo = defineAsyncComponent(() => import("../assets/logo.svg"));
</script>

<template>
  <nav class="w-full flex justify-between p-4">
    <div class="flex items-center gap-8">
      <a class="logo" href="/">
        <component :is="logo" />
      </a>
    </div>
  </nav>
</template>
