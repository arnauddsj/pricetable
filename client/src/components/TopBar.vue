<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";

const router = useRouter();
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const navigateToAccount = () => {
  if (isLoggedIn.value) {
    router.push("/account");
  } else {
    router.push("/auth");
  }
};
</script>

<template>
  <header>
    <a class="logo" href="/">
      <img src="@/assets/vue.svg" alt="Logo" />
      <span>QuickStart</span>
    </a>
    <nav>
      <Button @click="navigateToAccount" variant="outline">
        {{ isLoggedIn ? "Account" : "Login" }}
      </Button>
    </nav>
  </header>
</template>
