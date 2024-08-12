<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { Button } from "@/components/ui/button";

const { toast } = useToast();

const props = defineProps<{
  product: any;
}>();

const emit = defineEmits<{
  (e: "update-product", product: any): void;
}>();

const editedProduct = ref({ ...props.product });

const saveChanges = () => {
  const updatedProduct = {
    id: props.product.id,
    ...editedProduct.value,
    stripeProductId: editedProduct.value.stripeProductId || undefined,
    paddleProductId: editedProduct.value.paddleProductId || undefined,
    prices: editedProduct.value.prices.map((price) => ({
      ...price,
      unitAmount: Number(price.unitAmount),
      checkoutUrl: price.checkoutUrl || undefined,
    })),
  };
  emit("update-product", updatedProduct);
};
</script>

<template>
  <div>
    <form @submit.prevent="saveChanges">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          v-model="editedProduct.name"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700"
          >Description</label
        >
        <textarea
          id="description"
          v-model="editedProduct.description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows="3"
        ></textarea>
      </div>
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
        <input
          id="price"
          v-model="editedProduct.prices[0].unitAmount"
          type="number"
          step="0.01"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label for="currency" class="block text-sm font-medium text-gray-700"
          >Currency</label
        >
        <input
          id="currency"
          v-model="editedProduct.prices[0].currency"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label for="buttonText" class="block text-sm font-medium text-gray-700"
          >Button Text</label
        >
        <input
          id="buttonText"
          v-model="editedProduct.buttonText"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div class="flex items-center">
        <input
          id="isHighlighted"
          v-model="editedProduct.isHighlighted"
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600 shadow-sm"
        />
        <label for="isHighlighted" class="ml-2 block text-sm text-gray-900"
          >Highlighted</label
        >
      </div>
      <div class="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  </div>
</template>
