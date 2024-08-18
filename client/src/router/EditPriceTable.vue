<script setup lang="ts">
import { ref, computed } from "vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import PriceTablePreview from "@/components/PriceTablePreview.vue";
import SettingsSidebar from "@/components/sidebars/Settings.vue";
import ProductsSidebar from "@/components/sidebars/Products.vue";
import FeaturesSidebar from "@/components/sidebars/Features.vue";
import { useRoute } from "vue-router";
import type { Component } from "vue";
import type { PriceTable } from "@/trpc/types";
import { trpc } from "@/services/server";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { useQueryStatusStore } from "@/stores/queryStatus";

const route = useRoute();
const queryStatusStore = useQueryStatusStore();

const activeSidebar = ref<string>("Settings");

const sidebarComponents: Record<string, Component> = {
  Settings: SettingsSidebar,
  Products: ProductsSidebar,
  Features: FeaturesSidebar,
};

const currentSidebarComponent = computed(() => sidebarComponents[activeSidebar.value]);

// Fetch the draft price table
const { data: priceTable, refetch: refetchPriceTable, isPending } = useQuery({
  queryKey: ["priceTable", "getDraft", route.params.id],
  queryFn: () => trpc.priceTable.getDraft.query({ id: route.params.id as string }),
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

// Function to save changes to the draft
const { mutate: saveDraftChanges } = useMutation({
  mutationFn: (data: Partial<PriceTable>) => {
    queryStatusStore.addSavingQuery("saveDraft");
    console.log("Sending data to server:", { id: route.params.id, ...data });
    return trpc.priceTable.updateDraft.mutate({ id: route.params.id as string, ...data });
  },
  onSuccess: () => {
    refetchPriceTable();
    queryStatusStore.removeSavingQuery("saveDraft");
  },
  onError: (error) => {
    console.error("Error saving draft changes:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    queryStatusStore.removeSavingQuery("saveDraft");
  },
});

// Handler for updating settings
const handleSettingsUpdate = (updatedSettings: Partial<PriceTable>) => {
  console.log("Received updated settings:", updatedSettings);
  saveDraftChanges(updatedSettings);
};

// Handler for updating products
const handleProductsUpdate = (updatedProducts: PriceTable["products"]) => {
  saveDraftChanges({ products: updatedProducts });
};

// Handler for updating features
const handleFeaturesUpdate = (updatedFeatures: PriceTable["features"]) => {
  saveDraftChanges({ features: updatedFeatures });
};
</script>

<template>
  <DefaultLayout>
    <div v-if="isPending">Loading...</div>
    <div v-else class="flex h-full">
      <aside class="w-80 bg-gray-100 p-4 overflow-y-auto">
        <component
          :is="currentSidebarComponent"
          :priceTable="priceTable"
          @update:settings="handleSettingsUpdate"
          @update:products="handleProductsUpdate"
          @update:features="handleFeaturesUpdate"
        />
      </aside>

      <!-- Main content -->
      <main class="flex-grow flex">
        <!-- Preview container -->
        <div class="flex-grow p-4 bg-gray-100">
          <div class="mb-4 flex justify-center">
            <!-- Add device selector icons here -->
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <PriceTablePreview v-if="priceTable?.id" :priceTableId="priceTable.id" />
          </div>
        </div>
      </main>
    </div>
  </DefaultLayout>
</template>
