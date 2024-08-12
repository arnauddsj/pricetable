<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";

const logo = defineAsyncComponent(() => import("../assets/logo.svg"));

const router = useRouter();

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
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
