<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  products: any[];
}>();

const emit = defineEmits(["remove-product"]);

const removeProduct = (productId: string) => {
  emit("remove-product", productId);
};
</script>

<template>
  <div class="product-list">
    <div v-if="props.products.length === 0">No products added yet.</div>
    <div v-else v-for="product in props.products" :key="product.id" class="product-item">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <p v-if="product.prices && product.prices.length > 0">
        Price: {{ product.prices[0].unitAmount }} {{ product.prices[0].currency }}
      </p>
      <button @click="removeProduct(product.id)">Remove</button>
    </div>
  </div>
</template>

<style scoped>
.product-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
}
</style>
