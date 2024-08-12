<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import Toaster from "@/components/ui/toast/Toaster.vue";

const userStore = useUserStore();

onMounted(async () => {
  const user = await userStore.fetchUser();
  if (!user) {
    console.log("User not authenticated");
  }
});
</script>

<template>
  <Toaster />
  <RouterView />
</template>
