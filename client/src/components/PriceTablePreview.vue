<script setup lang="ts">
import { ref, watch } from "vue";
import { trpc } from "@/services/server";

const props = defineProps<{
  priceTable: any;
}>();

const renderedTable = ref<string>("");

const renderPriceTable = async () => {
  try {
    renderedTable.value = await trpc.priceTable.renderTable.query({
      tableId: props.priceTable.id,
    });
  } catch (error) {
    console.error("Error rendering price table:", error);
  }
};

watch(() => props.priceTable, renderPriceTable, { deep: true });

renderPriceTable();
</script>

<template>
  <div class="price-table-preview">
    <h3>Preview</h3>
    <div v-html="renderedTable"></div>
  </div>
</template>

<style scoped>
.price-table-preview {
  margin-top: 2rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
}
</style>
