<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { PriceTable } from "@/trpc/types";
import { Input } from "@/components/ui/input";
import {
  ComboboxAnchor,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
} from "radix-vue";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown } from "lucide-vue-next";

const props = defineProps<{
  priceTable: PriceTable | null;
}>();

const emit = defineEmits<{
  (e: "update:settings", settings: Partial<PriceTable>): void;
}>();

// Input refs
const name = ref("");
const paddlePublicKey = ref("");
const stripePublicKey = ref("");
const baseCurrency = ref("");

// Available currencies (you might want to fetch this from an API)
const availableCurrencies = ref([
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
]);

const selectedCurrencies = ref<string[]>([]);
const openCurrencySelect = ref(false);
const currencySearchTerm = ref("");

const filteredAvailableCurrencies = computed(() =>
  availableCurrencies.value.filter(
    (currency) =>
      currency.code !== baseCurrency.value &&
      !selectedCurrencies.value.includes(currency.code) &&
      (currency.name.toLowerCase().includes(currencySearchTerm.value.toLowerCase()) ||
        currency.code.toLowerCase().includes(currencySearchTerm.value.toLowerCase()))
  )
);

// Watch for changes in the priceTable prop
watch(
  () => props.priceTable,
  (newPriceTable) => {
    if (newPriceTable) {
      name.value = newPriceTable.name;
      paddlePublicKey.value = newPriceTable.paddlePublicKey || "";
      stripePublicKey.value = newPriceTable.stripePublicKey || "";
      baseCurrency.value = newPriceTable.currencySettings.baseCurrency;
      selectedCurrencies.value = newPriceTable.currencySettings.availableCurrencies.filter(
        (code) => code !== baseCurrency.value
      );
    }
  },
  { immediate: true }
);

// Watch for changes in the base currency and selected currencies
watch(
  [baseCurrency, selectedCurrencies],
  ([newBaseCurrency, newSelectedCurrencies]) => {
    if (!props.priceTable) return;

    // Update the priceTable with the new array
    props.priceTable.currencySettings = {
      baseCurrency: newBaseCurrency,
      availableCurrencies: [newBaseCurrency, ...newSelectedCurrencies],
    };

    // Emit the updated settings
    updateSettings();
  },
  { deep: true }
);

// Update function
const updateSettings = () => {
  if (!props.priceTable) return;

  const updatedSettings: Partial<PriceTable> = {
    name: name.value,
    paddlePublicKey: paddlePublicKey.value,
    stripePublicKey: stripePublicKey.value,
    currencySettings: {
      baseCurrency: baseCurrency.value,
      availableCurrencies: selectedCurrencies.value,
    },
  };
  console.log("Emitting updated settings:", updatedSettings);
  emit("update:settings", updatedSettings);
};
</script>

<template>
  <div v-if="!priceTable">Loading...</div>
  <div v-else class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
      <Input id="name" v-model="name" @blur="updateSettings" />
    </div>
    <div>
      <label for="paddlePublicKey" class="block text-sm font-medium text-gray-700"
        >Paddle Public Key</label
      >
      <Input id="paddlePublicKey" v-model="paddlePublicKey" @blur="updateSettings" />
    </div>
    <div>
      <label for="stripePublicKey" class="block text-sm font-medium text-gray-700"
        >Stripe Public Key</label
      >
      <Input id="stripePublicKey" v-model="stripePublicKey" @blur="updateSettings" />
    </div>
    <div>
      <label for="baseCurrency" class="block text-sm font-medium text-gray-700"
        >Base Currency</label
      >
      <Select v-model="baseCurrency" @update:modelValue="updateSettings">
        <SelectTrigger>
          <SelectValue :placeholder="baseCurrency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Available Currencies</label>
      <ComboboxRoot
        v-model="selectedCurrencies"
        v-model:open="openCurrencySelect"
        v-model:searchTerm="currencySearchTerm"
        multiple
        class="relative"
        @update:modelValue="updateSettings"
      >
        <ComboboxAnchor
          class="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <TagsInput
            :model-value="selectedCurrencies"
            class="flex gap-2 items-center rounded-lg flex-wrap"
            @update:modelValue="
              (newValue) => {
                selectedCurrencies = newValue;
                updateSettings();
              }
            "
          >
            <TagsInputItem
              v-for="code in selectedCurrencies"
              :key="code"
              :value="code"
              class="flex items-center justify-center gap-2 text-white bg-primary rounded px-2 py-1"
            >
              <TagsInputItemText class="text-sm">
                {{ availableCurrencies.find((c) => c.code === code)?.name }} ({{ code }})
              </TagsInputItemText>
              <TagsInputItemDelete>
                <X />
              </TagsInputItemDelete>
            </TagsInputItem>

            <ComboboxInput as-child>
              <TagsInputInput
                placeholder="Select currencies..."
                class="focus:outline-none flex-1 rounded !bg-transparent placeholder:text-muted-foreground px-1"
                @keydown.enter.prevent
              />
            </ComboboxInput>
          </TagsInput>

          <ComboboxTrigger class="ml-2">
            <ChevronDown class="h-4 w-4 opacity-50Icon" />
          </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxPortal>
          <CommandList
            position="popper"
            class="w-[--radix-popper-anchor-width] rounded-md mt-2 border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <CommandEmpty>No currencies found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="currency in filteredAvailableCurrencies"
                :key="currency.code"
                :value="currency.code"
                @select.prevent="
                  (ev) => {
                    if (typeof ev.detail.value === 'string') {
                      currencySearchTerm = '';
                      selectedCurrencies.push(ev.detail.value);
                      updateSettings();
                    }
                  }
                "
              >
                {{ currency.name }} ({{ currency.code }})
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </ComboboxPortal>
      </ComboboxRoot>
    </div>
  </div>
</template>
