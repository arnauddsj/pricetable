<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { Button } from "@/components/ui/button";
import { usePriceTableStore } from "@/stores/priceTable";
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();
const logo = defineAsyncComponent(() => import("../assets/logo.svg"));

const { handleSave, setActiveSidebar, activeSidebar } = usePriceTableStore();

const handleSaveButton = async () => {
  try {
    await handleSave();
    toast({
      title: "Success",
      description: "Price table saved successfully.",
    });
  } catch (error) {
    console.error("Error saving price table:", error);
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to save price table. Please try again.",
    });
  }
};

const sidebarOptions = ["Settings", "Products", "Prices", "Features"];
</script>

<template>
  <nav class="w-full flex flex px-8 gap-5">
    <div class="flex items-center">
      <a class="logo" href="/">
        <component :is="logo" />
      </a>
    </div>
    <div class="w-full flex justify-between p-4 shadow-sm">
      <div class="flex items-center gap-4">
        <button
          v-for="option in sidebarOptions"
          :key="option"
          @click="setActiveSidebar(option)"
          :class="[
            'text-md font-medium text-indigo-500',
            activeSidebar === option
              ? 'text-indigo-900'
              : 'text-indigo-500 hover:text-indigo-900',
          ]"
        >
          {{ option }}
        </button>
      </div>
      <button
        @click="handleSaveButton"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
      >
        Save
      </button>
    </div>
  </nav>
</template>
