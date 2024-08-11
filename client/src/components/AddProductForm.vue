<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emit = defineEmits(["add-product", "cancel"]);

const product = ref({
  name: "",
  description: "",
  isHighlighted: false,
  highlightText: "",
  buttonText: "Buy Now",
  buttonLink: "",
  prices: [
    {
      unitAmount: 0,
      currency: "USD",
      billingCycle: "monthly",
    },
  ],
});

const addProduct = () => {
  const productData = {
    ...product.value,
    buttonSettings: {
      text: product.value.buttonText,
      link: product.value.buttonLink,
    },
  };
  emit("add-product", productData);
  resetForm();
};

const resetForm = () => {
  product.value = {
    name: "",
    description: "",
    isHighlighted: false,
    highlightText: "",
    buttonText: "Buy Now",
    buttonLink: "",
    prices: [
      {
        unitAmount: 0,
        currency: "USD",
        billingCycle: "monthly",
      },
    ],
  };
};
</script>

<template>
  <form @submit.prevent="addProduct" class="space-y-4">
    <div>
      <label for="name">Product Name</label>
      <Input id="name" v-model="product.name" required />
    </div>
    <div>
      <label for="description">Description</label>
      <Input id="description" v-model="product.description" required />
    </div>
    <div class="flex items-center space-x-2">
      <Checkbox id="isHighlighted" v-model="product.isHighlighted" />
      <label for="isHighlighted">Highlight this product</label>
    </div>
    <div v-if="product.isHighlighted">
      <label for="highlightText">Highlight Text</label>
      <Input id="highlightText" v-model="product.highlightText" />
    </div>
    <div>
      <label for="buttonText">Button Text</label>
      <Input id="buttonText" v-model="product.buttonText" />
    </div>
    <div>
      <label for="buttonLink">Button Link</label>
      <Input id="buttonLink" v-model="product.buttonLink" />
    </div>
    <div>
      <label for="price">Price</label>
      <Input
        id="price"
        v-model.number="product.prices[0].unitAmount"
        type="number"
        required
      />
    </div>
    <div>
      <label for="currency">Currency</label>
      <Select v-model="product.prices[0].currency">
        <SelectTrigger>
          <SelectValue :placeholder="product.prices[0].currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <label for="billingCycle">Billing Cycle</label>
      <Select v-model="product.prices[0].billingCycle">
        <SelectTrigger>
          <SelectValue :placeholder="product.prices[0].billingCycle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="one-time">One-time</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="flex justify-end space-x-2">
      <Button type="button" @click="$emit('cancel')">Cancel</Button>
      <Button type="submit">Add Product</Button>
    </div>
  </form>
</template>
