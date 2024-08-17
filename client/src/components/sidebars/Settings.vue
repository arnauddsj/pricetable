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
import { Plus, Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddPaymentTypeForm from "@/components/AddPaymentTypeForm.vue";
import type { PaymentTypeData } from "@/types";

const { toast } = useToast();

const priceTableStore = usePriceTableStore();
const { priceTable } = storeToRefs(priceTableStore);
const { updatePaymentTypes } = priceTableStore;

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

const paymentTypes = computed({
  get: () => priceTable.value.paymentTypes,
  set: (value) => (priceTable.value.paymentTypes = value),
});

const isDialogOpen = ref(false);
const editingPaymentType = ref(null);

const editPaymentType = (index: number) => {
  editingPaymentType.value = { ...paymentTypes.value[index] };
  isDialogOpen.value = true;
};

const savePaymentType = (paymentType: PaymentTypeData) => {
  let updatedPaymentTypes;
  if (editingPaymentType.value) {
    updatedPaymentTypes = paymentTypes.value.map((pt) =>
      pt.name === editingPaymentType.value?.name ? paymentType : pt
    );
  } else {
    updatedPaymentTypes = [...paymentTypes.value, paymentType];
  }
  updatePaymentTypes(updatedPaymentTypes);
  closeDialog();
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingPaymentType.value = null;
};

const availablePaymentTypes = ["cycle", "one-time", "usage-based"];

const getAvailableTypes = computed(() => {
  const usedTypes = paymentTypes.value.map((pt) => pt.type);
  return availablePaymentTypes.filter((type) => !usedTypes.includes(type));
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

    <div class="mb-4">
      <label for="paymentTypes" class="block text-sm font-medium text-gray-700"
        >Payment Types</label
      >
      <div
        v-for="(paymentType, index) in paymentTypes"
        :key="index"
        class="flex items-center justify-between mt-2 p-2 bg-gray-100 rounded"
      >
        <span>{{ paymentType.name }}</span>
        <Button
          variant="ghost"
          size="icon"
          @click="editPaymentType(index)"
          class="text-blue-500"
        >
          <Pencil class="h-5 w-5" />
        </Button>
      </div>
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger asChild>
          <Button class="mt-2 flex items-center text-blue-500">
            <Plus class="h-5 w-5 mr-1" />
            Add Payment Type
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              >{{ editingPaymentType ? "Edit" : "Add" }} Payment Type</DialogTitle
            >
            <DialogDescription>
              {{ editingPaymentType ? "Edit the existing" : "Add a new" }} payment type
              here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <AddPaymentTypeForm
            :initial-data="editingPaymentType"
            :available-types="getAvailableTypes"
            @save="savePaymentType"
            @cancel="closeDialog"
          />
          <DialogFooter>
            <!-- Add any footer content if needed -->
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
