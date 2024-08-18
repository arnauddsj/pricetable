import { defineStore } from "pinia"
import { ref, reactive, computed } from "vue"
import { trpc } from "@/services/server"
import type { PriceTable, Product, FeatureGroup, Price } from "@/trpc/types"
import type { PaymentTypeData } from '@/types'

export const usePriceTableStore = defineStore("priceTable", () => {
  const activeSidebar = ref("Settings")

  const priceTable = reactive<PriceTable>({
    id: "",
    name: "",
    currencySettings: {
      baseCurrency: "USD",
      availableCurrencies: ["USD"]
    },
    stripePublicKey: "",
    paddlePublicKey: "",
    useLocalization: false,
    translations: {},
    products: [],
    featureGroups: [],
    prices: [],
    template: {},
    paymentTypes: [
      {
        name: "Month",
        type: "cycle",
        unitName: "/month"
      }
    ],
  })

  async function fetchPriceTable(id: string) {
    try {
      const data = await trpc.priceTable.getById.query({ id })
      console.log(data)
      if (data) {
        Object.assign(priceTable, data)
        // Ensure that products are properly set
        priceTable.products = data.products || []
        // Ensure that featureGroups are properly set
        priceTable.featureGroups = data.featureGroups || []
        priceTable.template = data.template || {}
      }
    } catch (error) {
      console.error("Error fetching price table:", error)
    }
  }

  function setActiveSidebar(sidebar: string) {
    activeSidebar.value = sidebar
  }

  function updatePriceTable(newData: Partial<PriceTable>) {
    Object.assign(priceTable, newData)
  }

  function addProductLocally(product: any) {
    const newProduct = {
      id: crypto.randomUUID(),
      ...product,
      buttonLink: product.buttonLink || null,
      isNew: true, // Flag to identify locally added products
    }
    priceTable.products.push(newProduct)
    return newProduct
  }

  function updateProductLocally(productId: string, updatedProduct: Partial<Product>) {
    const index = priceTable.products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      priceTable.products[index] = {
        ...priceTable.products[index],
        ...updatedProduct,
        buttonLink: updatedProduct.buttonLink || null,
        stripeProductId: updatedProduct.stripeProductId || null,
        paddleProductId: updatedProduct.paddleProductId || null
      }
    }
  }

  function removeProductLocally(productId: string) {
    priceTable.products = priceTable.products.filter(
      (product: { id: string }) => product.id !== productId
    )
  }

  async function handleSave() {
    try {
      if (!priceTable.id) {
        throw new Error("Price table ID is missing")
      }

      console.log("Products before save:", JSON.stringify(priceTable.products, null, 2))

      // Save all products, both new and existing
      const updatedProducts = await Promise.all(priceTable.products.map(async (product: Product) => {
        const cleanedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          isHighlighted: product.isHighlighted,
          highlightText: product.highlightText || '',
          buttonText: product.buttonText || '',
          buttonLink: product.buttonLink || '',
          stripeProductId: product.stripeProductId || null,
          paddleProductId: product.paddleProductId || null,
          prices: product.prices.map((price: Price) => ({
            id: price.id,
            unitAmount: Number(price.unitAmount),
            currency: price.currency,
            paymentTypeName: price.paymentTypeName,
            checkoutUrl: price.checkoutUrl || '',
          })),
        }

        console.log("Cleaned product:", JSON.stringify(cleanedProduct, null, 2))

        if (product.isNew) {
          console.log('Creating new product', product)
          const { isNew, ...productData } = cleanedProduct
          const createdProduct = await trpc.product.create.mutate({
            priceTableId: priceTable.id,
            ...productData,
          })
          console.log("Created product:", JSON.stringify(createdProduct, null, 2))
          return { ...createdProduct, isNew: false }
        } else {
          console.log('Updating existing product', product)
          const updatedProduct = await trpc.product.update.mutate({
            priceTableId: priceTable.id,
            product: cleanedProduct,
          })
          console.log("Updated product:", JSON.stringify(updatedProduct, null, 2))
          return updatedProduct
        }
      }))

      console.log("Updated products:", JSON.stringify(updatedProducts, null, 2))

      // Update the local products with the saved data
      priceTable.products = updatedProducts

      // Prepare the data for price table update
      const priceTableUpdateData = {
        name: priceTable.name,
        currencySettings: priceTable.currencySettings,
        stripePublicKey: priceTable.stripePublicKey,
        paddlePublicKey: priceTable.paddlePublicKey,
        paymentTypes: priceTable.paymentTypes,
        products: updatedProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          isHighlighted: product.isHighlighted,
          highlightText: product.highlightText,
          buttonText: product.buttonText,
          buttonLink: product.buttonLink,
          stripeProductId: product.stripeProductId,
          paddleProductId: product.paddleProductId,
          prices: product.prices.map(price => ({
            id: price.id,
            unitAmount: Number(price.unitAmount),
            currency: price.currency,
            paymentTypeName: price.paymentTypeName,
            checkoutUrl: price.checkoutUrl,
          })),
        })),
      }

      // Update price table
      const updatedPriceTable = await trpc.priceTable.update.mutate({
        id: priceTable.id,
        data: priceTableUpdateData,
      })

      console.log("Updated price table:", JSON.stringify(updatedPriceTable, null, 2))

      return updatedPriceTable

    } catch (error) {
      console.error("Error updating price table:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      throw error
    }
  }

  function addFeatureGroup(featureGroup: FeatureGroup) {
    priceTable.featureGroups.push(featureGroup)
  }

  function updateFeatureGroup(groupId: string, updatedGroup: Partial<FeatureGroup>) {
    const index = priceTable.featureGroups.findIndex((g) => g.id === groupId)
    if (index !== -1) {
      priceTable.featureGroups[index] = {
        ...priceTable.featureGroups[index],
        ...updatedGroup,
      }
    }
  }

  function removeFeatureGroup(groupId: string) {
    priceTable.featureGroups = priceTable.featureGroups.filter((g) => g.id !== groupId)
  }

  function updatePaymentTypes(paymentTypes: PaymentTypeData[]) {
    priceTable.paymentTypes = paymentTypes
  }

  function removePaymentTypeAndPrices(paymentTypeName: string) {
    // Remove the payment type
    priceTable.paymentTypes = priceTable.paymentTypes.filter(pt => pt.name !== paymentTypeName)

    // Remove prices associated with the payment type
    priceTable.products.forEach(product => {
      product.prices = product.prices.filter(price => price.paymentTypeName !== paymentTypeName)
    })
  }

  return {
    activeSidebar: computed(() => activeSidebar.value),
    priceTable,
    setActiveSidebar,
    updatePriceTable,
    addProductLocally,
    updateProductLocally,
    removeProductLocally,
    addFeatureGroup,
    updateFeatureGroup,
    removeFeatureGroup,
    updatePaymentTypes,
    removePaymentTypeAndPrices,
    handleSave,
    fetchPriceTable,
  }
})