<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PriceForm from "@/components/PriceForm.vue";

const props = defineProps<{
  product?: any;
  availableCurrencies: string[];
  paymentTypes: {
    name: string;
    type: "cycle" | "one-time" | "usage-based";
    unitName: string;
  }[];
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
  paymentTypeName: "",
  checkoutUrl: "",
});

const addPrice = () => {
  showPriceForm.value = true;
  editingPriceIndex.value = null;
  currentEditingPrice.value = {
    unitAmount: 0,
    currency: props.availableCurrencies[0],
    paymentTypeName: props.paymentTypes[0].name,
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
  <div>
    <div class="space-y-4">
      <div>
        <Label for="name">Product Name</Label>
        <Input id="name" v-model="editedProduct.name" required />
      </div>

      <div>
        <Label for="description">Description</Label>
        <Input id="description" v-model="editedProduct.description" required />
      </div>

      <div class="flex items-center space-x-2">
        <Checkbox id="isHighlighted" v-model="editedProduct.isHighlighted" />
        <Label for="isHighlighted">Highlight this product</Label>
      </div>

      <div v-if="editedProduct.isHighlighted">
        <Label for="highlightText">Highlight Text</Label>
        <Input id="highlightText" v-model="editedProduct.highlightText" />
      </div>

      <div>
        <Label for="buttonText">Button Text</Label>
        <Input id="buttonText" v-model="editedProduct.buttonText" />
      </div>

      <div>
        <Label for="buttonLink">Button Link</Label>
        <Input id="buttonLink" v-model="editedProduct.buttonLink" />
      </div>

      <!-- Prices section -->
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900">Prices</h3>
        <div v-for="(price, index) in editedProduct.prices" :key="index" class="mt-2">
          <div class="flex justify-between items-center">
            <span
              >{{ price.unitAmount }} {{ price.currency }}
              {{ price.paymentTypeName }}</span
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
        :paymentTypes="paymentTypes"
        @update="updatePrice"
        @cancel="cancelPriceEdit"
      />

      <div class="flex justify-end space-x-2">
        <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
        <Button @click="saveProduct">Save Product</Button>
      </div>
    </div>
  </div>
</template>
