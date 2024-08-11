<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { trpc } from "@/services/server";
import { useUserStore } from "@/stores/user";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

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
import { toast } from "@/components/ui/toast";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const success = ref(false);

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Invalid email address"),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  console.log(values);
  try {
    await trpc.auth.sendMagicLink.mutate({ email: values.email });
    toast({
      title: "You submitted the following values:",
    });
    success.value = true;
  } catch (error) {
    toast({
      title: "Error sending magic link. Please try again.",
    });
  }
});

const errorMessage = ref<string | null>(null);

onMounted(async () => {
  const token = route.query.token as string;
  if (token) {
    try {
      const result = await trpc.auth.verifyToken.mutate({ token });
      userStore.setUser(result.email);
      router.push("/");
    } catch (error) {
      errorMessage.value = "Invalid or expired token. Please try again.";
      await userStore.logout();
    }
  }
});
</script>

<template>
  <AuthLayout>
    <div v-if="success">
      <p>Check your email and spams for your login link</p>
    </div>
    <div v-else>
      <form :validation-schema="formSchema" @submit="onSubmit" class="space-y-5">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem v-auto-animate>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Your email" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit" class="w-full">Login with my email</Button>
      </form>
      <p v-if="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</p>
    </div>
  </AuthLayout>
</template>
