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
  <form @submit.prevent="submitForm">
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
      </div>
      <div class="mb-4">
        <label for="max" class="block text-sm font-medium text-gray-700">Maximum</label>
        <Input
          v-model.number="paymentType.usageBasedConfig.max"
          id="max"
          type="number"
          step="1"
        />
      </div>
      <div class="mb-4">
        <label for="step" class="block text-sm font-medium text-gray-700">Step</label>
        <Input
          v-model.number="paymentType.usageBasedConfig.step"
          id="step"
          type="number"
          step="1"
        />
      </div>
    </template>
    <div class="flex justify-end space-x-2">
      <Button type="button" variant="outline" @click="cancelForm">Cancel</Button>
      <Button type="submit">Save</Button>
    </div>
  </form>
</template>
