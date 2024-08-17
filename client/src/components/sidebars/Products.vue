<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePriceTableStore } from "@/stores/priceTable";
import { useToast } from "@/components/ui/toast/use-toast";
import ProductForm from "@/components/ProductForm.vue";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icon.vue";

const { toast } = useToast();
const priceTableStore = usePriceTableStore();
const { priceTable } = storeToRefs(priceTableStore);

const showProductForm = ref(false);
const showPaymentTypeForm = ref(false);
const selectedProductId = ref<string | null>(null);

const addOrUpdateProduct = (product: any) => {
  try {
    if (selectedProductId.value) {
      priceTableStore.updateProductLocally(selectedProductId.value, product);
      toast({
        title: "Success",
        description: "Product updated locally.",
      });
    } else {
      priceTableStore.addProductLocally(product);
      toast({
        title: "Success",
        description: "Product added locally.",
      });
    }
    showProductForm.value = false;
    selectedProductId.value = null;
  } catch (error) {
    console.error("Error adding/updating product locally:", error);
    toast({
      title: "Error",
      description: "Failed to add/update product locally. Please try again.",
    });
  }
};

const removeProduct = (productId: string) => {
  try {
    priceTableStore.removeProductLocally(productId);
    toast({
      title: "Success",
      description: "Product removed locally.",
    });
  } catch (error) {
    console.error("Error removing product locally:", error);
    toast({
      title: "Error",
      description: "Failed to remove product locally. Please try again.",
    });
  }
};

const editProduct = (productId: string) => {
  selectedProductId.value = productId;
  showProductForm.value = true;
};

const selectedProduct = computed(() => {
  return priceTable.value.products.find(
    (product) => product.id === selectedProductId.value
  );
});

const availableCurrencies = computed(
  () => priceTable.value.currencySettings?.availableCurrencies || []
);
const availableBillingCycles = computed(
  () => priceTable.value.paymentTypes?.map((pt) => pt.name) || []
);
</script>

<template>
  <div class="products-container">
    <div v-if="!showProductForm && !showPaymentTypeForm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Products</h2>
        <div>
          <Button @click="showProductForm = true" class="flex items-center gap-2 mr-2">
            <Icon name="plus" class="w-5 h-5" />
            Add Product
          </Button>
        </div>
      </div>

      <div v-if="priceTable.products.length > 0" class="flex flex-col gap-4">
        <div
          v-for="product in priceTable.products"
          :key="product.id"
          class="bg-white rounded-lg shadow-md p-4"
        >
          <div class="flex justify-between items-center mb-2">
            <h3
              class="text-lg font-semibold cursor-pointer hover:text-blue-500"
              @click="editProduct(product.id)"
            >
              {{ product.name }}
            </h3>
            <div>
              <Button @click="removeProduct(product.id)" variant="ghost" size="icon">
                <Icon name="trash" class="w-5 h-5 text-red-500" />
              </Button>
            </div>
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
            <Button @click="editProduct(product.id)" size="sm">Edit Product</Button>
          </div>
        </div>
      </div>
    </div>

    <ProductForm
      v-else-if="showProductForm"
      :product="selectedProduct"
      :availableCurrencies="availableCurrencies"
      :availableBillingCycles="availableBillingCycles"
      :paymentTypes="priceTable.paymentTypes"
      @save="addOrUpdateProduct"
      @cancel="
        showProductForm = false;
        selectedProductId = null;
      "
    />
  </div>
</template>

<style scoped>
.products-container {
  @apply p-4;
}
</style>
