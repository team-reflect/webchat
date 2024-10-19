import { ref, onMounted, onUnmounted } from 'vue'

interface ActiveTab {
  url: string
  id: number
}

export function useActiveTab() {
  const activeTab = ref<ActiveTab | null>(null)

  const updateActiveTab = (tab: chrome.tabs.Tab) => {
    if (tab.active && tab.id && tab.url) {
      activeTab.value = {
        url: tab.url,
        id: tab.id,
      }
    }
  }

  const handleActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      updateActiveTab(tab)
    } catch (error) {
      console.error('Error getting activated tab:', error)
    }
  }

  const handleUpdated = (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ) => {
    updateActiveTab(tab)
  }

  onMounted(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      updateActiveTab(tab)
    } catch (error) {
      console.error('Error querying active tab:', error)
    }

    chrome.tabs.onActivated.addListener(handleActivated)
    chrome.tabs.onUpdated.addListener(handleUpdated)
  })

  onUnmounted(() => {
    chrome.tabs.onActivated.removeListener(handleActivated)
    chrome.tabs.onUpdated.removeListener(handleUpdated)
  })

  return activeTab
}
