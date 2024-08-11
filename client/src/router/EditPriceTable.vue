<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { trpc } from "@/services/server";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import PriceTablePreview from "@/components/PriceTablePreview.vue";
import ProductList from "@/components/ProductList.vue";
import AddProductForm from "@/components/AddProductForm.vue";
import { useToast } from "@/components/ui/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const priceTable = ref<any>({
  name: "",
  generalSettings: {
    baseCurrency: "USD",
    iconStyle: "icon",
    paymentType: "cycles",
  },
  stripePublicKey: "",
  paddlePublicKey: "",
  products: [],
  template: null,
});

const showAddProductForm = ref(false);

const fetchPriceTable = async () => {
  try {
    const result = await trpc.priceTable.getOne.query({
      id: route.params.id as string,
    });
    console.log("Fetched price table:", result);
    priceTable.value = {
      ...priceTable.value,
      ...result,
      generalSettings: {
        ...priceTable.value.generalSettings,
        ...(result.generalSettings || {}),
      },
    };

    if (!priceTable.value.template) {
      await fetchFirstAvailableTemplate();
    }
  } catch (error) {
    console.error("Error fetching price table:", error);
    toast({
      title: "Error",
      description: "Failed to fetch price table. Please try again.",
    });
  }
};

const fetchFirstAvailableTemplate = async () => {
  try {
    const latestVersion = await trpc.template.getLatestVersion.query();
    if (latestVersion) {
      priceTable.value.template = { version: latestVersion };
    } else {
      console.log("No templates available");
      toast({
        title: "Warning",
        description: "No templates available. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Error fetching latest template version:", error);
    toast({
      title: "Error",
      description: "Failed to fetch template information. Please try again.",
    });
  }
};

const fetchProducts = async () => {
  try {
    const result = await trpc.product.getAll.query({
      priceTableId: route.params.id as string,
    });
    console.log("Fetched products:", result);
    priceTable.value.products = result;
  } catch (error) {
    console.error("Error fetching products:", error);
    toast({
      title: "Error",
      description: "Failed to fetch products. Please try again.",
    });
  }
};

const updatePriceTable = async () => {
  try {
    await trpc.priceTable.update.mutate({
      id: priceTable.value.id,
      data: priceTable.value,
    });
    toast({
      title: "Success",
      description: "Price table updated successfully.",
    });
    router.push({ name: "priceTableManagement" });
  } catch (error) {
    console.error("Error updating price table:", error);
    toast({
      title: "Error",
      description: "Failed to update price table. Please try again.",
    });
  }
};

const addProduct = async (product: any) => {
  try {
    const newProduct = await trpc.product.create.mutate({
      priceTableId: priceTable.value.id,
      ...product,
    });
    priceTable.value.products.push(newProduct);
    showAddProductForm.value = false;
    toast({
      title: "Success",
      description: "Product added successfully.",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    toast({
      title: "Error",
      description: "Failed to add product. Please try again.",
    });
  }
};

const removeProduct = async (productId: string) => {
  try {
    await trpc.product.delete.mutate({ id: productId });
    priceTable.value.products = priceTable.value.products.filter(
      (product: { id: string }) => product.id !== productId
    );
    toast({
      title: "Success",
      description: "Product removed successfully.",
    });
  } catch (error) {
    console.error("Error removing product:", error);
    toast({
      title: "Error",
      description: "Failed to remove product. Please try again.",
    });
  }
};

onMounted(async () => {
  await fetchPriceTable();
  await fetchProducts();
});
</script>

<template>
  <DefaultLayout>
    <h1>Edit Price Table</h1>

    <div v-if="priceTable.id" class="edit-price-table-container">
      <form @submit.prevent="updatePriceTable" class="edit-form">
        <FormField name="name">
          <FormItem>
            <FormLabel>Price Table Name</FormLabel>
            <FormControl>
              <Input v-model="priceTable.name" required />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="stripePublicKey">
          <FormItem>
            <FormLabel>Stripe Public Key</FormLabel>
            <FormControl>
              <Input v-model="priceTable.stripePublicKey" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="paddlePublicKey">
          <FormItem>
            <FormLabel>Paddle Public Key</FormLabel>
            <FormControl>
              <Input v-model="priceTable.paddlePublicKey" />
            </FormControl>
          </FormItem>
        </FormField>

        <h3>General Settings</h3>
        <FormField name="baseCurrency">
          <FormItem>
            <FormLabel>Base Currency</FormLabel>
            <FormControl>
              <select v-model="priceTable.generalSettings.baseCurrency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="iconStyle">
          <FormItem>
            <FormLabel>Icon Style</FormLabel>
            <FormControl>
              <select v-model="priceTable.generalSettings.iconStyle">
                <option value="icon">Icon</option>
                <option value="text">Text</option>
              </select>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="paymentType">
          <FormItem>
            <FormLabel>Payment Type</FormLabel>
            <FormControl>
              <select v-model="priceTable.generalSettings.paymentType">
                <option value="cycles">Cycles</option>
                <option value="one-time">One-time</option>
                <option value="usage-based">Usage-based</option>
              </select>
            </FormControl>
          </FormItem>
        </FormField>

        <Button type="submit">Update Price Table</Button>
      </form>

      <div class="products-section">
        <h2>Products</h2>
        <ProductList :products="priceTable.products" @remove-product="removeProduct" />
        <Button @click="showAddProductForm = true">Add Product</Button>
        <AddProductForm
          v-if="showAddProductForm"
          @add-product="addProduct"
          @cancel="showAddProductForm = false"
        />
      </div>

      <PriceTablePreview :priceTableId="priceTable.id" />
    </div>
    <div v-else>Loading...</div>
  </DefaultLayout>
</template>

<style scoped>
.edit-price-table-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

.products-section {
  margin-top: 2rem;
}
</style>
