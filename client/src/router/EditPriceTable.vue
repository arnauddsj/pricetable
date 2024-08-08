<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { trpc } from "@/services/server";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import PriceTablePreview from "@/components/PriceTablePreview.vue";
import ProductList from "@/components/ProductList.vue";
import AddProductForm from "@/components/AddProductForm.vue";

const route = useRoute();
const router = useRouter();
const priceTable = ref<any>({
  name: "",
  generalSettings: {
    baseCurrency: "USD",
    iconStyle: "icon",
    paymentType: "cycles",
  },
  stripePublicKey: "",
  paddlePublicKey: "",
  products: [],
});
const showAddProductForm = ref(false);

const fetchPriceTable = async () => {
  try {
    const result = await trpc.priceTable.getOne.query({
      id: route.params.id as string,
    });
    console.log("Fetched price table:", result);
    priceTable.value = {
      ...priceTable.value,
      ...result,
      generalSettings: {
        ...priceTable.value.generalSettings,
        ...(result.generalSettings || {}),
      },
    };
  } catch (error) {
    console.error("Error fetching price table:", error);
  }
};

const fetchProducts = async () => {
  try {
    const result = await trpc.product.getAll.query({
      priceTableId: route.params.id as string,
    });
    console.log("Fetched products:", result);
    priceTable.value.products = result;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const updatePriceTable = async () => {
  try {
    await trpc.priceTable.update.mutate({
      id: priceTable.value.id,
      data: priceTable.value,
    });
    router.push({ name: "priceTableManagement" });
  } catch (error) {
    console.error("Error updating price table:", error);
  }
};

const addProduct = async (product: any) => {
  try {
    const newProduct = await trpc.product.create.mutate({
      priceTableId: priceTable.value.id,
      ...product,
    });
    priceTable.value.products.push(newProduct);
    showAddProductForm.value = false;
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

const removeProduct = async (productId: string) => {
  try {
    await trpc.product.delete.mutate({ id: productId });
    priceTable.value.products = priceTable.value.products.filter(
      (product: { id: string }) => product.id !== productId
    );
  } catch (error) {
    console.error("Error removing product:", error);
  }
};

onMounted(async () => {
  await fetchPriceTable();
  await fetchProducts();
});
</script>

<template>
  <DefaultLayout>
    <h1>Edit Price Table</h1>

    <div v-if="priceTable.id" class="edit-price-table-container">
      <form @submit.prevent="updatePriceTable" class="edit-form">
        <input v-model="priceTable.name" placeholder="Price Table Name" required />
        <input v-model="priceTable.stripePublicKey" placeholder="Stripe Public Key" />
        <input v-model="priceTable.paddlePublicKey" placeholder="Paddle Public Key" />

        <h3>General Settings</h3>
        <select v-model="priceTable.generalSettings.baseCurrency">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>

        <select v-model="priceTable.generalSettings.iconStyle">
          <option value="icon">Icon</option>
          <option value="text">Text</option>
        </select>

        <select v-model="priceTable.generalSettings.paymentType">
          <option value="cycles">Cycles</option>
          <option value="one-time">One-time</option>
          <option value="usage-based">Usage-based</option>
        </select>

        <button type="submit">Update Price Table</button>
      </form>

      <div class="products-section">
        <h2>Products</h2>
        <ProductList :products="priceTable.products" @remove-product="removeProduct" />
        <button @click="showAddProductForm = true">Add Product</button>
        <AddProductForm
          v-if="showAddProductForm"
          @add-product="addProduct"
          @cancel="showAddProductForm = false"
        />
      </div>

      <PriceTablePreview :priceTable="priceTable" />
    </div>
    <div v-else>Loading...</div>
  </DefaultLayout>
</template>

<style scoped>
.edit-price-table-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.products-section {
  margin-top: 2rem;
}
</style>
