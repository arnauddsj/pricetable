<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="py-2 px-4 bg-red-500 text-white">
    {{ message }}
  </div>
</template>
