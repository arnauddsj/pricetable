<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["add-product", "cancel"]);

const product = ref({
  name: "",
  description: "",
  isHighlighted: false,
  highlightText: "",
  buttonSettings: {
    text: "Buy Now",
    link: "",
  },
});

const price = ref({
  unitAmount: 0,
  currency: "USD",
  billingCycle: "monthly",
});

const addProduct = () => {
  emit("add-product", { ...product.value, prices: [price.value] });
  resetForm();
};

const resetForm = () => {
  product.value = {
    name: "",
    description: "",
    isHighlighted: false,
    highlightText: "",
    buttonSettings: {
      text: "Buy Now",
      link: "",
    },
  };
  price.value = {
    unitAmount: 0,
    currency: "USD",
    billingCycle: "monthly",
  };
};
</script>

<template>
  <div class="add-product-form">
    <h3>Add New Product</h3>
    <form @submit.prevent="addProduct">
      <input v-model="product.name" placeholder="Product Name" required />
      <textarea
        v-model="product.description"
        placeholder="Product Description"
        required
      ></textarea>
      <div>
        <input type="checkbox" v-model="product.isHighlighted" id="isHighlighted" />
        <label for="isHighlighted">Highlight this product</label>
      </div>
      <input
        v-model="product.highlightText"
        placeholder="Highlight Text"
        :disabled="!product.isHighlighted"
      />
      <input v-model="product.buttonSettings.text" placeholder="Button Text" />
      <input v-model="product.buttonSettings.link" placeholder="Button Link" />

      <h4>Price</h4>
      <input
        v-model.number="price.unitAmount"
        type="number"
        placeholder="Price Amount"
        required
      />
      <select v-model="price.currency">
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
      <select v-model="price.billingCycle">
        <option value="one-time">One-time</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <div class="form-actions">
        <button type="submit">Add Product</button>
        <button type="button" @click="emit('cancel')">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-product-form {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

button[type="button"] {
  background-color: #ccc;
}

button:hover {
  opacity: 0.8;
}
</style>
