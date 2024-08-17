<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePriceTableStore } from "@/stores/priceTable";
import { Input } from "@/components/ui/input";
import Multiselect from "vue-multiselect";
import { useToast } from "@/components/ui/toast/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const { toast } = useToast();

const priceTableStore = usePriceTableStore();
const { priceTable } = storeToRefs(priceTableStore);

const name = computed({
  get: () => priceTable.value.name,
  set: (value) => (priceTable.value.name = value),
});

const paddlePublicKey = computed({
  get: () => priceTable.value.paddlePublicKey,
  set: (value) => (priceTable.value.paddlePublicKey = value),
});

const stripePublicKey = computed({
  get: () => priceTable.value.stripePublicKey,
  set: (value) => (priceTable.value.stripePublicKey = value),
});

const availableCurrencies = ref([
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
]);

const baseCurrency = computed({
  get: () => priceTable.value.currencySettings.baseCurrency,
  set: (value) => (priceTable.value.currencySettings.baseCurrency = value),
});

const filteredAvailableCurrencies = computed(() =>
  availableCurrencies.value.filter((currency) => currency.code !== baseCurrency.value)
);

const selectedCurrencies = computed({
  get: () => {
    const currencies = priceTable.value.currencySettings.availableCurrencies || [];
    return availableCurrencies.value.filter(
      (currency) =>
        currencies.includes(currency.code) && currency.code !== baseCurrency.value
    );
  },
  set: (value) => {
    const newSelectedCurrencies = value.map((currency) => currency.code);
    priceTable.value.currencySettings.availableCurrencies = newSelectedCurrencies;
  },
});

// Watch for changes in the base currency
watch(baseCurrency, (newBaseCurrency) => {
  const availableCurrencies = priceTable.value.currencySettings.availableCurrencies || [];

  // If the new base currency was in the available currencies, remove it
  if (availableCurrencies.includes(newBaseCurrency)) {
    priceTable.value.currencySettings.availableCurrencies = availableCurrencies.filter(
      (code) => code !== newBaseCurrency
    );
  }
});
</script>

<template>
  <div>
    <div>
      <label for="name">Name</label>
      <Input v-model="name" id="name" />
    </div>
    <div>
      <label for="paddlePublicKey">Paddle Public Key</label>
      <Input v-model="paddlePublicKey" id="paddlePublicKey" />
    </div>

    <div>
      <label for="stripePublicKey">Stripe Public Key</label>
      <Input v-model="stripePublicKey" id="stripePublicKey" />
    </div>

    <div class="mb-4">
      <label for="baseCurrency" class="block text-sm font-medium text-gray-700"
        >Base Currency</label
      >
      <Select v-model="baseCurrency">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select base currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }} ({{ currency.code }})
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="mb-4">
      <label for="availableCurrencies" class="block text-sm font-medium text-gray-700"
        >Available Currencies</label
      >
      <Multiselect
        v-model="selectedCurrencies"
        :options="filteredAvailableCurrencies"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Select currencies"
        label="name"
        track-by="code"
      >
        <template #option="{ option }"> {{ option.name }} ({{ option.code }}) </template>
      </Multiselect>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
