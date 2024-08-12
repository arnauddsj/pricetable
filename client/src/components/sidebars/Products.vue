<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePriceTableStore } from "@/stores/priceTable";
import { useToast } from "@/components/ui/toast/use-toast";
import AddProductForm from "@/components/AddProductForm.vue";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icon.vue";
import ProductEdit from "@/components/ProductEdit.vue";

const { toast } = useToast();
const priceTableStore = usePriceTableStore();
const { priceTable } = storeToRefs(priceTableStore);

const showAddProductForm = ref(false);
const selectedProductId = ref<string | null>(null);

const addProduct = async (product: any) => {
  try {
    await priceTableStore.addProduct(product);
    toast({
      title: "Success",
      description: "Product added successfully.",
    });
    showAddProductForm.value = false;
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
    await priceTableStore.removeProduct(productId);
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

const selectProduct = (productId: string) => {
  selectedProductId.value = productId;
};

const backToList = () => {
  selectedProductId.value = null;
};

const selectedProduct = computed(() => {
  return priceTable.value.products.find(
    (product) => product.id === selectedProductId.value
  );
});

const updateProduct = async (updatedProduct: any) => {
  try {
    await priceTableStore.updateProduct(updatedProduct.id, updatedProduct);
    toast({
      title: "Success",
      description: "Product updated successfully.",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    toast({
      title: "Error",
      description: "Failed to update product. Please try again.",
    });
  }
};
</script>

<template>
  <div class="products-container">
    <div v-if="!selectedProductId">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Products</h2>
        <Button @click="showAddProductForm = true" class="flex items-center gap-2">
          <Icon name="plus" class="w-5 h-5" />
          Add Product
        </Button>
      </div>

      <AddProductForm
        v-if="showAddProductForm"
        @add-product="addProduct"
        @cancel="showAddProductForm = false"
      />

      <div
        v-if="priceTable.products.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="product in priceTable.products"
          :key="product.id"
          class="bg-white rounded-lg shadow-md p-4"
        >
          <div class="flex justify-between items-center mb-2">
            <h3
              class="text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors"
              @click="selectProduct(product.id)"
            >
              {{ product.name }}
            </h3>
            <Button variant="ghost" size="icon" @click="removeProduct(product.id)">
              <Icon name="trash" class="w-5 h-5 text-red-500" />
            </Button>
          </div>
          <p class="text-gray-600 mb-2">{{ product.description }}</p>
          <div v-if="product.prices && product.prices.length > 0" class="mb-2">
            <span class="font-semibold">Price:</span>
            {{ product.prices[0].unitAmount }} {{ product.prices[0].currency }}
          </div>
          <div class="flex justify-between items-center">
            <span
              v-if="product.isHighlighted"
              class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              Highlighted
            </span>
            <Button size="sm">{{ product.buttonText }}</Button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="flex items-center mb-6">
        <Button @click="backToList" class="mr-4" variant="ghost" size="sm">
          <Icon name="chevron" size="18" class="w-5 h-5" />
          Back
        </Button>
        <h2 class="text-2xl font-bold">Edit Product</h2>
      </div>
      <ProductEdit
        v-if="selectedProduct"
        :product="selectedProduct"
        @update-product="updateProduct"
      />
    </div>
  </div>
</template>

<style scoped>
.products-container {
  @apply p-4;
}
</style>
