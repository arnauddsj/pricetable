<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentTypeData } from "@/types";

const props = defineProps({
  initialData: {
    type: Object as () => PaymentTypeData | null,
    default: null,
  },
  availableTypes: {
    type: Array as () => string[],
    required: true,
  },
});

const emit = defineEmits(["save", "cancel"]);

const paymentType = ref<PaymentTypeData>({
  id: "",
  name: "",
  type: "",
  unitName: "",
  usageBasedConfig: {
    min: null,
    max: null,
    step: null,
  },
});

const selectableTypes = computed(() => {
  if (props.initialData && !props.availableTypes.includes(props.initialData.type)) {
    return [...props.availableTypes, props.initialData.type];
  }
  return props.availableTypes;
});

watch(
  () => props.initialData,
  (newValue) => {
    if (newValue) {
      paymentType.value = {
        ...newValue,
        usageBasedConfig: newValue.usageBasedConfig || {
          min: null,
          max: null,
          step: null,
        },
      };
    } else {
      paymentType.value = {
        id: "",
        name: "",
        type: selectableTypes.value[0] || "",
        unitName: "",
        usageBasedConfig: {
          min: null,
          max: null,
          step: null,
        },
      };
    }
  },
  { immediate: true }
);

const isUsageBased = computed(() => paymentType.value.type === "usage-based");

const submitForm = () => {
  const formData: PaymentTypeData = { ...paymentType.value };
  if (!isUsageBased.value) {
    delete (formData as any).usageBasedConfig;
  }
  emit("save", formData);
};

const cancelForm = () => {
  emit("cancel");
};
</script>

<template>
  <div class="flex">
    <form @submit.prevent="submitForm" class="w-1/2 pr-8">
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <Input v-model="paymentType.name" id="name" required />
      </div>
      <div class="mb-4">
        <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
        <Select v-model="paymentType.type" required>
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select a payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="type in selectableTypes" :key="type" :value="type">
              {{ type.charAt(0).toUpperCase() + type.slice(1) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="mb-4">
        <label for="unitName" class="block text-sm font-medium text-gray-700"
          >Unit Name</label
        >
        <Input v-model="paymentType.unitName" id="unitName" required />
        <p class="mt-1 text-sm text-gray-500">
          The name of the unit for this payment type (e.g., "hour", "user", "GB").
        </p>
      </div>
      <template v-if="isUsageBased">
        <div class="mb-4">
          <label for="min" class="block text-sm font-medium text-gray-700">Minimum</label>
          <Input
            v-model.number="paymentType.usageBasedConfig.min"
            id="min"
            type="number"
            step="1"
          />
          <p class="mt-1 text-sm text-gray-500">
            The minimum amount of units that can be charged.
          </p>
        </div>
        <div class="mb-4">
          <label for="max" class="block text-sm font-medium text-gray-700">Maximum</label>
          <Input
            v-model.number="paymentType.usageBasedConfig.max"
            id="max"
            type="number"
            step="1"
          />
          <p class="mt-1 text-sm text-gray-500">
            The maximum amount of units that can be charged.
          </p>
        </div>
        <div class="mb-4">
          <label for="step" class="block text-sm font-medium text-gray-700">Step</label>
          <Input
            v-model.number="paymentType.usageBasedConfig.step"
            id="step"
            type="number"
            step="1"
          />
          <p class="mt-1 text-sm text-gray-500">
            The increment between each chargeable unit.
          </p>
        </div>
      </template>
      <div class="flex justify-end space-x-2">
        <Button type="button" variant="outline" @click="cancelForm">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>

    <div class="w-1/2 pl-8 border-l">
      <h3 class="text-lg font-semibold mb-4">Payment Types Guide</h3>
      <div class="space-y-4">
        <div>
          <h4 class="font-medium">Cycle</h4>
          <p class="text-sm text-gray-600">
            Use for constant, recurring charges. Ideal for subscriptions or flat-rate
            services.
          </p>
        </div>
        <div>
          <h4 class="font-medium">One-time</h4>
          <p class="text-sm text-gray-600">
            For single, non-recurring charges. Suitable for setup fees or one-off
            purchases.
          </p>
        </div>
        <div>
          <h4 class="font-medium">Usage-based</h4>
          <p class="text-sm text-gray-600">
            For charges that vary based on consumption. Perfect for metered services like
            API calls or storage.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
