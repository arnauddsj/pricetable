<script setup lang="ts">
import { ref } from "vue";
import { trpc } from "@/services/server";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { PriceTable } from "@/trpc/types";
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

const queryClient = useQueryClient();

const { data: priceTables, error, isPending } = useQuery({
  queryKey: ["priceTables"],
  queryFn: () => trpc.priceTable.getAll.query(),
});

const newPriceTable = ref<PriceTable>({
  name: "",
  currencySettings: {
    baseCurrency: "USD",
    availableCurrencies: ["USD"],
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

const createPriceTableMutation = useMutation({
  mutationFn: (newTable: PriceTable) => trpc.priceTable.create.mutate(newTable),
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ["priceTables"] });
    newPriceTable.value.name = "";
    router.push({ name: "editPriceTable", params: { id: result.id } });
  },
  onError: (error) => {
    console.error("Error creating price table:", error);
  },
});

const deletePriceTableMutation = useMutation({
  mutationFn: (id: string) => trpc.priceTable.delete.mutate({ id }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["priceTables"] });
  },
  onError: (error) => {
    console.error("Error deleting price table:", error);
  },
});

const renamePriceTableMutation = useMutation({
  mutationFn: ({ id, newName }: { id: string; newName: string }) =>
    trpc.priceTable.update.mutate({ id, data: { name: newName } }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["priceTables"] });
  },
  onError: (error) => {
    console.error("Error renaming price table:", error);
  },
});
</script>

<template>
  <DefaultLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="flex gap-5 items-center mb-6">
        <h1 class="text-2xl font-bold">Price Tables</h1>
        <button @click="createPriceTableMutation.mutate(newPriceTable)">
          <Icon name="plus" class="w-5 h-5 fill-indigo-600" />
          New
        </button>
      </div>
      <div v-if="isPending">Loading...</div>
      <div v-else-if="error">An error occurred: {{ error }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <span
                class="text-lg font-semibold text-indigo-500 hover:text-indigo-800"
                v-if="table.name.length < 1"
                >Untitled</span
              >
              <span
                class="text-lg font-semibold text-indigo-500 hover:text-indigo-800"
                v-else
                >{{ table.name }}</span
              >
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
                <DropdownMenuItem
                  @click="
                    renamePriceTableMutation.mutate({ id: table.id, newName: 'New Name' })
                  "
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem @click="deletePriceTableMutation.mutate(table.id)">
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
