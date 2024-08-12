import { defineStore } from "pinia"
import { ref, reactive, computed } from "vue"
import { trpc } from "@/services/server"
import type { PriceTable, Product, FeatureGroup } from "@/trpc/types" // This should now work, assuming you've set up the path correctly

export const usePriceTableStore = defineStore("priceTable", () => {
  const activeSidebar = ref("Settings")

  const priceTable = reactive<PriceTable>({
    id: "",
    name: "",
    generalSettings: {
      baseCurrency: "USD",
      availableCurrencies: ["USD"],
      generalStyle: "default",
      templateId: "",
      iconStyle: "icon",
      paymentType: "cycles",
      cycleOptions: ["month", "year"],
      usageRanges: [],
    },
    stripePublicKey: "",
    paddlePublicKey: "",
    useLocalization: false,
    translations: {},
    products: [],
    featureGroups: [],
  })

  async function fetchPriceTable(id: string) {
    try {
      const data = await trpc.priceTable.getById.query({ id })
      console.log(data)
      if (data) {
        Object.assign(priceTable, data)
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

  function addProduct(product: Product) {
    priceTable.products.push(product)
  }

  function updateProduct(productId: string, updatedProduct: Partial<Product>) {
    const index = priceTable.products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      priceTable.products[index] = { ...priceTable.products[index], ...updatedProduct }
    }
  }

  function removeProduct(productId: string) {
    priceTable.products = priceTable.products.filter((p) => p.id !== productId)
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

  async function handleSave() {
    try {
      if (!priceTable.id) {
        throw new Error("Price table ID is missing")
      }
      await trpc.priceTable.update.mutate({
        id: priceTable.id,
        data: priceTable,
      })
    } catch (error) {
      console.error("Error updating price table:", error)
      throw error
    }
  }

  return {
    activeSidebar: computed(() => activeSidebar.value),
    priceTable,
    setActiveSidebar,
    updatePriceTable,
    addProduct,
    updateProduct,
    removeProduct,
    addFeatureGroup,
    updateFeatureGroup,
    removeFeatureGroup,
    handleSave,
    fetchPriceTable
  }
})