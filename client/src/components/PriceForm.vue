<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  price: {
    id?: string;
    unitAmount: number;
    currency: string;
    billingCycle: string;
    checkoutUrl?: string;
  };
  availableCurrencies: string[];
  availableBillingCycles: string[];
}>();

const emit = defineEmits<{
  (e: "update", price: any): void;
  (e: "cancel"): void;
}>();

const localPrice = ref({ ...props.price });

watch(
  () => props.price,
  (newPrice) => {
    localPrice.value = { ...newPrice };
  },
  { deep: true }
);

const updatePrice = () => {
  emit("update", localPrice.value);
};

const cancelEdit = () => {
  emit("cancel");
};
</script>

<template>
  <div class="price-form">
    <div class="flex gap-4">
      <div class="flex-1">
        <label for="unitAmount" class="block text-sm font-medium text-gray-700"
          >Price</label
        >
        <Input
          id="unitAmount"
          v-model="localPrice.unitAmount"
          type="number"
          step="0.01"
          required
        />
      </div>
      <div class="flex-1">
        <label for="currency" class="block text-sm font-medium text-gray-700"
          >Currency</label
        >
        <Select v-model="localPrice.currency">
          <SelectTrigger>
            <SelectValue :placeholder="localPrice.currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="currency in availableCurrencies"
              :key="currency"
              :value="currency"
            >
              {{ currency }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex-1">
        <label for="billingCycle" class="block text-sm font-medium text-gray-700"
          >Billing Cycle</label
        >
        <Select v-model="localPrice.billingCycle">
          <SelectTrigger>
            <SelectValue :placeholder="localPrice.billingCycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="cycle in availableBillingCycles"
              :key="cycle"
              :value="cycle"
            >
              {{ cycle }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div class="flex-1 mt-4">
      <label for="checkoutUrl" class="block text-sm font-medium text-gray-700"
        >Checkout URL (optional)</label
      >
      <Input id="checkoutUrl" v-model="localPrice.checkoutUrl" type="text" />
    </div>
    <div class="mt-4 flex justify-end space-x-2">
      <Button @click="cancelEdit" variant="outline">Cancel</Button>
      <Button @click="updatePrice">Save Price</Button>
    </div>
  </div>
</template>
