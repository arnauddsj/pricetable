<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { useIsFetching, useIsMutating, useMutation } from "@tanstack/vue-query";
import { Button } from "@/components/ui/button";
import { usePriceTableStore } from "@/stores/priceTable";
import { useToast } from "@/components/ui/toast/use-toast";
import { trpc } from "@/services/server";

const { toast } = useToast();
const logo = defineAsyncComponent(() => import("../assets/logo.svg"));

const { setActiveSidebar, activeSidebar } = usePriceTableStore();

const isFetching = useIsFetching();
const isMutating = useIsMutating();

const isSaving = computed(() => isFetching.value > 0 || isMutating.value > 0);

const priceTableId = ref("your-price-table-id"); // Replace with actual ID or prop

const publishMutation = useMutation({
  mutationFn: () => trpc.priceTable.publish.mutate({ id: priceTableId.value }),
  onSuccess: () => {
    toast({
      title: "Success",
      description: "Price table published successfully.",
    });
  },
  onError: (error) => {
    console.error("Error publishing price table:", error);
    toast({
      title: "Error",
      description: "Failed to publish price table. Please try again.",
      variant: "destructive",
    });
  },
});

const handlePublish = () => {
  publishMutation.mutate();
};

const sidebarOptions = ["Settings", "Products", "Features"];
</script>

<template>
  <nav class="w-full flex px-8 gap-5">
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
      <div class="flex items-center gap-4">
        <span v-if="isSaving" class="text-sm text-gray-500">Saving...</span>
        <Button
          @click="handlePublish"
          :disabled="isSaving || publishMutation.isPending.value"
        >
          {{ publishMutation.isPending.value ? "Publishing..." : "Publish" }}
        </Button>
      </div>
    </div>
  </nav>
</template>
