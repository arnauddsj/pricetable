<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";

const logo = defineAsyncComponent(() => import("../assets/logo.svg"));

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const navigateToAccount = () => {
  if (isLoggedIn.value) {
    router.push("/account");
  } else {
    router.push("/auth");
  }
};

const emit = defineEmits(["save"]);

const handleSave = () => {
  emit("save");
};

const handleClose = () => {
  router.push({ name: "home" });
};
</script>

<template>
  <nav class="w-full flex justify-between p-4">
    <div class="flex items-center gap-8">
      <a class="logo" href="/">
        <component :is="logo" />
      </a>
      <div class="flex items-center gap-4">
        <router-link
          to="/price-tables"
          class="text-md font-semibold text-indigo-500 hover:text-indigo-800"
          >Price Table</router-link
        >
      </div>
    </div>
    <div class="flex items-center gap-4">
      <Button @click="handleSave" variant="outline"> Save </Button>
      <Button @click="handleClose" variant="outline"> Close </Button>
    </div>
  </nav>
</template>
