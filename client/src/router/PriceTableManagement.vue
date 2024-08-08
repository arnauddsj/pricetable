<script setup lang="ts">
import { ref, onMounted } from "vue";
import { trpc } from "@/services/server";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterLink } from "vue-router";

const priceTables = ref<any[]>([]);
const newPriceTable = ref({
  name: "",
  generalSettings: {
    baseCurrency: "USD",
    availableCurrencies: ["USD"],
    generalStyle: "default",
    iconStyle: "icon" as "text" | "icon",
    paymentType: "cycles" as "cycles" | "one-time" | "usage-based",
    cycleOptions: ["month", "year"],
  },
  stripePublicKey: "",
  paddlePublicKey: "",
  localizationSettings: {
    enableAutomaticCurrencyConversion: false,
    countrySpecificPricing: {},
  },
});

const fetchPriceTables = async () => {
  try {
    priceTables.value = await trpc.priceTable.getAll.query();
  } catch (error) {
    console.error("Error fetching price tables:", error);
  }
};

const createPriceTable = async () => {
  try {
    await trpc.priceTable.create.mutate(newPriceTable.value);
    await fetchPriceTables();
    newPriceTable.value.name = "";
  } catch (error) {
    console.error("Error creating price table:", error);
  }
};

const deletePriceTable = async (id: string) => {
  try {
    await trpc.priceTable.delete.mutate({ id });
    await fetchPriceTables();
  } catch (error) {
    console.error("Error deleting price table:", error);
  }
};

onMounted(fetchPriceTables);
</script>

<template>
  <DefaultLayout>
    <h1>Price Table Management</h1>

    <form @submit.prevent="createPriceTable">
      <input v-model="newPriceTable.name" placeholder="Price Table Name" required />
      <input v-model="newPriceTable.stripePublicKey" placeholder="Stripe Public Key" />
      <input v-model="newPriceTable.paddlePublicKey" placeholder="Paddle Public Key" />
      <button type="submit">Create Price Table</button>
    </form>

    <ul>
      <li v-for="table in priceTables" :key="table.id">
        {{ table.name }}
        <RouterLink :to="{ name: 'editPriceTable', params: { id: table.id } }"
          >Edit</RouterLink
        >
        <button @click="deletePriceTable(table.id)">Delete</button>
      </li>
    </ul>
  </DefaultLayout>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin-bottom: 2rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 1rem;
}
</style>
