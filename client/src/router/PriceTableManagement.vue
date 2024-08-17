<script setup lang="ts">
import { ref, onMounted } from "vue";
import { trpc } from "@/services/server";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterLink, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icon.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const router = useRouter();

const priceTables = ref<any[]>([]);
const newPriceTable = ref({
  name: "",
  generalSettings: {
    baseCurrency: "USD",
    availableCurrencies: ["USD"],
    generalStyle: "default",
    iconStyle: "icon" as "text" | "icon",
  },
  stripePublicKey: "",
  paddlePublicKey: "",
  paymentTypes: [
    {
      name: "Month",
      type: "cycle",
      unitName: "/month",
    },
  ],
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
    const result = await trpc.priceTable.create.mutate(newPriceTable.value);
    await fetchPriceTables();
    newPriceTable.value.name = "";
    router.push({ name: "editPriceTable", params: { id: result.id } });
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

const renamePriceTable = async (id: string, newName: string) => {
  try {
    await trpc.priceTable.update.mutate({ id, data: { name: newName } });
    await fetchPriceTables();
  } catch (error) {
    console.error("Error renaming price table:", error);
  }
};

onMounted(fetchPriceTables);
</script>

<template>
  <DefaultLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="flex gap-5 items-center mb-6">
        <h1 class="text-2xl font-bold">Price Tables</h1>
        <button @click="createPriceTable" class="flex items-center gap-2 fill-indigo-600">
          <Icon name="plus" class="w-5 h-5 fill-indigo-600" />
          New
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="table in priceTables"
          :key="table.id"
          class="bg-white rounded-lg shadow-md p-4"
        >
          <div class="flex justify-between items-center">
            <RouterLink
              :to="{ name: 'editPriceTable', params: { id: table.id } }"
              class="text-lg font-semibold text-indigo-500 hover:text-indigo-800"
            >
              {{ table.name }}
            </RouterLink>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Icon
                  name="menu-dots"
                  width="25"
                  class="fill-indigo-500 hover:fill-indigo-800"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click="renamePriceTable(table.id, 'New Name')">
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem @click="deletePriceTable(table.id)">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
