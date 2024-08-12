<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import PriceTablePreview from "@/components/PriceTablePreview.vue";
import { usePriceTableStore } from "@/stores/priceTable";
import SettingsSidebar from "@/components/sidebars/Settings.vue";
import ProductsSidebar from "@/components/sidebars/Products.vue";
import PricesSidebar from "@/components/sidebars/Prices.vue";
import FeaturesSidebar from "@/components/sidebars/Features.vue";
import { useRoute } from "vue-router";
import type { Component } from "vue";

const route = useRoute();
const priceTableStore = usePriceTableStore();
const { activeSidebar, priceTable } = storeToRefs(priceTableStore);
const { fetchPriceTable } = priceTableStore;

const settingsSidebarRef = ref<InstanceType<typeof SettingsSidebar> | null>(null);

const sidebarComponents: Record<string, Component> = {
  Settings: SettingsSidebar,
  Products: ProductsSidebar,
  Prices: PricesSidebar,
  Features: FeaturesSidebar,
};

const currentSidebarComponent = computed(() => sidebarComponents[activeSidebar.value]);

onMounted(async () => {
  await fetchPriceTable(route.params.id as string);
});
</script>

<template>
  <DefaultLayout>
    <div class="flex h-full">
      <aside class="w-80 bg-gray-100 p-4 overflow-y-auto">
        <component
          :is="currentSidebarComponent"
          :ref="activeSidebar === 'Settings' ? settingsSidebarRef : undefined"
          :priceTable="priceTable"
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
            <PriceTablePreview v-if="priceTable.id" :priceTableId="priceTable.id" />
            <div v-else>Loading...</div>
          </div>
        </div>
      </main>
    </div>
  </DefaultLayout>
</template>
