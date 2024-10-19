import { ignorableWatch, type MaybeRefOrGetter, toRef } from '@vueuse/core'
import { debounce } from 'lodash'
import { ref, type Ref, watch } from 'vue'

type StorageArea = 'local' | 'sync' | 'session'

interface UseChromeStorageOptions<T> {
  key: MaybeRefOrGetter<string>
  defaultValue: () => T
  storageArea?: StorageArea
}

export function useChromeStorage<T>(options: UseChromeStorageOptions<T>): Ref<T> {
  const { defaultValue, storageArea = 'local' } = options
  const keyRef = toRef(options.key)
  const storage = chrome.storage[storageArea]
  const value = ref<T>(defaultValue()) as Ref<T>

  // Load initial value from storage
  const loadValue = async () => {
    try {
      const key = keyRef.value
      const result = await storage.get(key)
      value.value = key in result ? deserialize(result[key]) : defaultValue()
    } catch (error) {
      console.error(`Error loading value for key "${keyRef.value}":`, error)
    }
  }

  const saveValue = async () => {
    try {
      await storage.set({ [keyRef.value]: serialize(value.value) })
    } catch (error) {
      console.error(`Error saving value for key "${keyRef.value}":`, error)
    }
  }

  const saveValueDebounced = debounce(saveValue, 300)

  loadValue()

  // Watch for changes in the key and reload value
  watch(keyRef, loadValue)

  // Watch for changes and update storage
  const { ignoreUpdates: ignoreSaveToStoreWatcher } = ignorableWatch(
    value,
    async () => {
      try {
        await saveValueDebounced()
      } catch (error) {
        console.error(`Error saving value for key "${keyRef.value}":`, error)
      }
    },
    { deep: true },
  )

  // Listen for changes from other contexts (e.g., other tabs)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === storageArea && keyRef.value in changes) {
      ignoreSaveToStoreWatcher(() => {
        value.value = deserialize(changes[keyRef.value].newValue)
      })
    }
  })

  return value
}

function serialize<T>(value: T): string {
  return JSON.stringify(value)
}

function deserialize<T>(value: string): T {
  try {
    return JSON.parse(value)
  } catch {
    return value as T
  }
}
