<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  width: { type: [Number, String], default: 20 },
});

const icon = defineAsyncComponent(() => import(`../assets/icons/${props.name}.svg`));
</script>

<template>
  <component
    :is="icon"
    class="fill-current"
    :style="{ minWidth: `${width}px`, width: `${width}px`, height: 'auto' }"
  />
</template>
