<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { trpc } from "@/services/server";

const props = defineProps<{
  priceTableId: string;
}>();

const renderedTable = ref<string>("");
const loading = ref(true);
const error = ref<string | null>(null);
const currentVersion = ref<string>("N/A");
const upgradeAvailable = ref(false);
const upgrading = ref(false);

const renderPriceTable = async () => {
  try {
    loading.value = true;
    error.value = null;
    renderedTable.value = await trpc.template.renderTable.query({
      tableId: props.priceTableId,
    });
    const priceTable = await trpc.priceTable.getById.query({ id: props.priceTableId });
    currentVersion.value = priceTable?.template?.version || "N/A";
    checkForUpgrade();
  } catch (err) {
    console.error("Error rendering price table:", err);
    error.value = "Failed to render price table. Please try again.";
  } finally {
    loading.value = false;
  }
};

const checkForUpgrade = async () => {
  try {
    if (currentVersion.value === "N/A") {
      upgradeAvailable.value = false;
      return;
    }
    const latestVersion = await trpc.template.getLatestVersion.query();
    upgradeAvailable.value = latestVersion > currentVersion.value;
  } catch (err) {
    console.error("Error checking for template upgrade:", err);
    upgradeAvailable.value = false;
  }
};

const upgradeTemplate = async () => {
  try {
    upgrading.value = true;
    await trpc.template.upgradeTemplate.mutate({ priceTableId: props.priceTableId });
    await renderPriceTable();
  } catch (err) {
    console.error("Error upgrading template:", err);
    error.value = "Failed to upgrade template. Please try again.";
  } finally {
    upgrading.value = false;
  }
};

watch(() => props.priceTableId, renderPriceTable);

onMounted(renderPriceTable);
</script>

<template>
  <div class="price-table-preview">
    <h3>Preview</h3>
    <div v-if="loading">Loading preview...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else v-html="renderedTable"></div>

    <div class="template-info">
      <h4>Current Template Version: {{ currentVersion }}</h4>
      <div v-if="upgradeAvailable">
        <p>A new template version is available!</p>
        <button @click="upgradeTemplate" :disabled="upgrading">
          {{ upgrading ? "Upgrading..." : "Upgrade Template" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.price-table-preview {
  margin-top: 2rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
}

.template-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
}
</style>
