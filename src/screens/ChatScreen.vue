<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="chatContainer">
      <ChatMessage v-for="(message, index) in messages" :key="index" :message="message" />
    </div>

    <div
      class="flex-none p-4 space-y-2 flex flex-col items-end"
      v-if="messages.length === 0"
    >
      <SampleChatMessage
        text="Pull out the main points from the page"
        @select="(text: string) => handleSubmit(text)"
      />

      <SampleChatMessage
        text="Turn the page into a recipe"
        @select="(text: string) => handleSubmit(text)"
      />
    </div>

    <div class="p-4 flex-none">
      <ChatInput @send="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatInput from '@/components/ChatInput.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { useActiveTab } from '@/composables/useActiveTab'
import { useChat } from '@/composables/useChat'
import { createAi, getAiModelName } from '@/lib/ai'
import { useConfig } from '@/lib/config'
import { getTabContentAsText } from '@/lib/getTabContent'
import type { Message } from '@/lib/message'
import { buildSystemMessage } from '@/lib/prompt'
import { useChromeStorage } from '@/utils/useChromeStorage'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const config = useConfig()

const provider = config.provider
const providerApiKey = config.providerApiKey

if (!providerApiKey) {
  throw new Error('No API key set')
}

const activeTab = useActiveTab()

const ai = createAi({
  provider,
  providerApiKey,
})

const modelName = getAiModelName(provider)
const model = ai(modelName)

// Create a computed property for the messages key
const messagesKey = computed(() => `messages-${activeTab.value?.url}`)

const systemMessage = ref<Message | null>(null)
const defaultSystemMessage = buildSystemMessage({
  messages: [],
  modelName,
})

watch(messagesKey, () => {
  if (!activeTab.value?.id) {
    return
  }

  // Reset the system message when the messages key changes
  systemMessage.value = null
})

const messages = useChromeStorage<Message[]>({
  key: messagesKey,
  defaultValue: () => [],
  storageArea: 'session',
})

const { appendUserInput } = useChat({
  model,
  messages,
  systemMessage: computed(() => systemMessage.value || defaultSystemMessage),
  onStart: () => scrollToLastMessage(),
})

const chatContainer = ref<HTMLElement | null>(null)

const handleSubmit = async (input: string) => {
  // If we don't have a system message, try to generate one from the page content
  if (activeTab.value && !systemMessage.value) {
    const text = await getTabContentAsText(activeTab.value.id)

    if (text) {
      systemMessage.value = buildSystemMessage({
        messages: messages.value,
        modelName,
        pageText: text,
      })
    }
  }

  appendUserInput(input)
  scrollToLastMessage()
}

const scrollToLastMessage = () => {
  nextTick(() => {
    const lastChild = chatContainer.value?.lastElementChild

    if (lastChild) {
      lastChild.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

onMounted(() => {
  scrollToLastMessage()
})
</script>
