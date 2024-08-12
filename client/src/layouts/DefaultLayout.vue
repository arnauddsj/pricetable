<script setup lang="ts">
import TopBar from "@/components/TopBar.vue";
import PriceTableTopBar from "@/components/PriceTableTopBar.vue";
import { useRoute } from "vue-router";

const route = useRoute();

defineEmits(["save"]);
</script>

<template>
  <div class="w-full flex flex-col bg-gray-100">
    <PriceTableTopBar @save="$emit('save')" v-if="route.name === 'editPriceTable'" />
    <TopBar v-else />
    <div class="w-full px-4 items-center justify-center">
      <slot></slot>
    </div>
  </div>
</template>
