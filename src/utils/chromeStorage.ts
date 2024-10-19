import { reactive } from 'vue'
import { ignorableWatch, useDebounceFn } from '@vueuse/core'
import isEqual from 'lodash/isEqual'
import { deepToRaw } from './deepToRaw'

const store = reactive<Record<string, any>>(
  await (async () => {
    const sync = await chrome.storage.sync.get()

    const newStore: Record<string, any> = {}
    Object.entries(sync).forEach(([key, value]) => {
      newStore[key] = JSON.parse(value)
    })

    return newStore
  })(),
)

const getItem = <T>(key: string) => store[key] as T

const setItem = async (key: string, value: any) => {
  if (isEqual(deepToRaw(store[key]), deepToRaw(value))) return

  store[key] = value
}

const saveCloudState = useDebounceFn(async () => {
  const storage = await chrome.storage.sync.get()

  Object.keys(store).forEach(async (key) => {
    const storeValue = store[key]
    const storageValue = storage[key]

    if (typeof storeValue !== 'undefined' && typeof storageValue !== 'undefined') {
      if (isEqual(deepToRaw(JSON.parse(storage[key])), deepToRaw(storeValue))) return
    }

    if (typeof storeValue === 'undefined' && typeof storageValue === 'undefined') return

    await chrome.storage.sync.set({
      [key]: JSON.stringify(storeValue),
    })
  })
}, 500)

const { ignoreUpdates: ignoreSaveToStoreWatcher } = ignorableWatch(
  store,
  () => {
    saveCloudState()
  },
  {
    deep: true,
  },
)

export const storage = {
  get: getItem,
  set: setItem,
  clear: async () => {
    await chrome.storage.sync.clear()
  },
}

chrome.storage.onChanged.addListener((changes) => {
  Object.keys(changes).forEach((key) => {
    if (changes[key].newValue === undefined) return

    const jsonChanges = JSON.parse(changes[key].newValue)

    if (isEqual(store[key], jsonChanges)) return

    ignoreSaveToStoreWatcher(() => {
      store[key] = jsonChanges
    })
  })
})
