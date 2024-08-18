import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQueryStatusStore = defineStore('queryStatus', () => {
  const savingQueries = ref(new Set<string>())
  const savedTimeout = ref<number | null>(null)

  const addSavingQuery = (queryKey: string) => {
    savingQueries.value.add(queryKey)
  }

  const removeSavingQuery = (queryKey: string) => {
    savingQueries.value.delete(queryKey)
    if (savingQueries.value.size === 0) {
      if (savedTimeout.value) clearTimeout(savedTimeout.value)
      savedTimeout.value = setTimeout(() => {
        savedTimeout.value = null
      }, 2000) as unknown as number
    }
  }

  const isSaving = computed(() => savingQueries.value.size > 0)
  const isSaved = computed(() => savingQueries.value.size === 0 && savedTimeout.value !== null)

  return {
    addSavingQuery,
    removeSavingQuery,
    isSaving,
    isSaved
  }
})