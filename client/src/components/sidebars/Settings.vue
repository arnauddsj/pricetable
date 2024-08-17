<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { usePriceTableStore } from "@/stores/priceTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

const priceTableStore = usePriceTableStore();
const { priceTable } = storeToRefs(priceTableStore);

const name = computed({
  get: () => priceTable.value.name,
  set: (value) => (priceTable.value.name = value),
});

const paddlePublicKey = computed({
  get: () => priceTable.value.paddlePublicKey,
  set: (value) => (priceTable.value.paddlePublicKey = value),
});

const stripePublicKey = computed({
  get: () => priceTable.value.stripePublicKey,
  set: (value) => (priceTable.value.stripePublicKey = value),
});

const baseCurrency = computed({
  get: () => priceTable.value.generalSettings.baseCurrency,
  set: (value) => (priceTable.value.generalSettings.baseCurrency = value),
});
</script>

<template>
  <div>
    <div>
      <label for="name">Name</label>
      <Input v-model="name" id="name" />
    </div>
    <div>
      <label for="paddlePublicKey">Paddle Public Key</label>
      <Input v-model="paddlePublicKey" id="paddlePublicKey" />
    </div>

    <div>
      <label for="stripePublicKey">Stripe Public Key</label>
      <Input v-model="stripePublicKey" id="stripePublicKey" />
    </div>
  </div>
</template>
