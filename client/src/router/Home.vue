<script setup lang="ts">
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <DefaultLayout>
    <h1>App Home</h1>
    <p>This is the members-only area.</p>
    <RouterLink to="/price-tables">Manage Price Tables</RouterLink>
  </DefaultLayout>
</template>

<style lang="scss"></style>
