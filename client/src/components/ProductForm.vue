<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PriceForm from "@/components/PriceForm.vue";

const props = defineProps<{
  product?: any;
  availableCurrencies: string[];
  availableBillingCycles: string[];
}>();

const emit = defineEmits<{
  (e: "save", product: any): void;
  (e: "cancel"): void;
}>();

const editedProduct = ref({
  name: "",
  description: "",
  isHighlighted: false,
  highlightText: "",
  buttonText: "Buy Now",
  buttonLink: "",
  prices: [],
  ...props.product,
});

const showPriceForm = ref(false);
const editingPriceIndex = ref<number | null>(null);
const currentEditingPrice = ref({
  unitAmount: 0,
  currency: "",
  billingCycle: "",
  checkoutUrl: "",
});

const addPrice = () => {
  showPriceForm.value = true;
  editingPriceIndex.value = null;
  currentEditingPrice.value = {
    unitAmount: 0,
    currency: props.availableCurrencies[0],
    billingCycle: props.availableBillingCycles[0],
    checkoutUrl: "",
  };
};

const editPrice = (index: number) => {
  showPriceForm.value = true;
  editingPriceIndex.value = index;
  currentEditingPrice.value = { ...editedProduct.value.prices[index] };
};

const updatePrice = (updatedPrice: any) => {
  if (editingPriceIndex.value !== null) {
    editedProduct.value.prices[editingPriceIndex.value] = updatedPrice;
  } else {
    editedProduct.value.prices.push(updatedPrice);
  }
  showPriceForm.value = false;
  editingPriceIndex.value = null;
};

const cancelPriceEdit = () => {
  showPriceForm.value = false;
  editingPriceIndex.value = null;
};

const removePrice = (index: number) => {
  editedProduct.value.prices.splice(index, 1);
};

const saveProduct = () => {
  emit("save", editedProduct.value);
};

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      editedProduct.value = { ...newProduct };
    }
  }
);
</script>

<template>
  <Form @submit="saveProduct">
    <FormField name="name" v-slot="{ field }">
      <FormItem>
        <FormLabel>Product Name</FormLabel>
        <FormControl>
          <Input v-model="editedProduct.name" v-bind="field" required />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="description" v-slot="{ field }">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Input v-model="editedProduct.description" v-bind="field" required />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="isHighlighted" v-slot="{ field }">
      <FormItem
        class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
      >
        <FormControl>
          <Checkbox v-model="editedProduct.isHighlighted" v-bind="field" />
        </FormControl>
        <div class="space-y-1 leading-none">
          <FormLabel>Highlight this product</FormLabel>
        </div>
      </FormItem>
    </FormField>

    <FormField v-if="editedProduct.isHighlighted" name="highlightText" v-slot="{ field }">
      <FormItem>
        <FormLabel>Highlight Text</FormLabel>
        <FormControl>
          <Input v-model="editedProduct.highlightText" v-bind="field" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="buttonText" v-slot="{ field }">
      <FormItem>
        <FormLabel>Button Text</FormLabel>
        <FormControl>
          <Input v-model="editedProduct.buttonText" v-bind="field" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="buttonLink" v-slot="{ field }">
      <FormItem>
        <FormLabel>Button Link</FormLabel>
        <FormControl>
          <Input v-model="editedProduct.buttonLink" v-bind="field" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Prices section -->
    <div class="mt-6">
      <h3 class="text-lg font-medium text-gray-900">Prices</h3>
      <div v-for="(price, index) in editedProduct.prices" :key="index" class="mt-2">
        <div class="flex justify-between items-center">
          <span
            >{{ price.unitAmount }} {{ price.currency }} / {{ price.billingCycle }}</span
          >
          <div>
            <Button @click="editPrice(index)" variant="outline" size="sm" class="mr-2"
              >Edit</Button
            >
            <Button @click="removePrice(index)" variant="outline" size="sm"
              >Remove</Button
            >
          </div>
        </div>
      </div>
      <Button @click="addPrice" class="mt-4">Add Price</Button>
    </div>

    <PriceForm
      v-if="showPriceForm"
      :price="currentEditingPrice"
      :availableCurrencies="availableCurrencies"
      :availableBillingCycles="availableBillingCycles"
      @update="updatePrice"
      @cancel="cancelPriceEdit"
    />

    <div class="mt-6 flex justify-end space-x-2">
      <Button type="button" variant="outline" @click="$emit('cancel')">Cancel</Button>
      <Button type="submit">Save Product</Button>
    </div>
  </Form>
</template>
