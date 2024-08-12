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
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

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

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Name is required"),
    stripePublicKey: z.string().optional(),
    paddlePublicKey: z.string().optional(),
    generalSettings: z.object({
      baseCurrency: z.enum(["USD", "EUR", "GBP"]),
      iconStyle: z.enum(["icon", "text"]),
      paymentType: z.enum(["cycles", "one-time", "usage-based"]),
    }),
  })
);

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    stripePublicKey: "",
    paddlePublicKey: "",
    generalSettings: {
      baseCurrency: "USD",
      iconStyle: "icon",
      paymentType: "cycles",
    },
  },
});

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

const handleSave = async () => {
  try {
    await updatePriceTable();
    toast({
      title: "Success",
      description: "Price table saved successfully.",
    });
  } catch (error) {
    console.error("Error saving price table:", error);
    toast({
      title: "Error",
      description: "Failed to save price table. Please try again.",
    });
  }
};

onMounted(async () => {
  await fetchPriceTable();
  await fetchProducts();
});
</script>

<template>
  <DefaultLayout @save="handleSave">
    <div class="flex h-full">
      <!-- Left sidebar -->
      <aside class="w-80 bg-gray-100 p-4 overflow-y-auto">
        <form class="space-y-4">
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
        </form>
      </aside>

      <!-- Main content -->
      <main class="flex-grow flex">
        <!-- Product list -->
        <div class="w-64 p-4 border-r border-gray-200">
          <button
            class="w-full py-2 px-4 mb-4 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            + Add Product
          </button>
          <div class="space-y-2">
            <div
              v-for="product in priceTable.products"
              :key="product.id"
              class="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"
            >
              <span>{{ product.name }}</span>
              <button class="text-gray-500 hover:text-gray-700">•••</button>
            </div>
          </div>
        </div>

        <!-- Preview container -->
        <div class="flex-grow p-4 bg-gray-100">
          <div class="mb-4 flex justify-center">
            <!-- Add device selector icons here -->
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <PriceTablePreview v-if="priceTable.id" :priceTableId="priceTable.id" />
            <div v-else>Loading...</div>
          </div>
        </div>
      </main>
    </div>
  </DefaultLayout>
</template>
