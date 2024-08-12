<script setup lang="ts">
import { ref } from "vue";
import { trpc } from "@/services/server";
import { useToast } from "@/components/ui/toast/use-toast";
import AddProductForm from "@/components/AddProductForm.vue";
import ProductList from "@/components/ProductList.vue";

const props = defineProps<{
  priceTable: any;
}>();

const { toast } = useToast();
const showAddProductForm = ref(false);

const fetchProducts = async () => {
  try {
    const result = await trpc.product.getAll.query({
      priceTableId: props.priceTable.id,
    });
    console.log("Fetched products:", result);
    props.priceTable.products = result;
  } catch (error) {
    console.error("Error fetching products:", error);
    toast({
      title: "Error",
      description: "Failed to fetch products. Please try again.",
    });
  }
};

const addProduct = async (product: any) => {
  try {
    const newProduct = await trpc.product.create.mutate({
      priceTableId: props.priceTable.id,
      ...product,
    });
    props.priceTable.products.push(newProduct);
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
    props.priceTable.products = props.priceTable.products.filter(
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
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Products</h2>
    <button
      @click="showAddProductForm = true"
      class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add Product
    </button>
    <AddProductForm
      v-if="showAddProductForm"
      @add-product="addProduct"
      @cancel="showAddProductForm = false"
    />
    <ProductList :products="priceTable.products" @remove-product="removeProduct" />
  </div>
</template>
