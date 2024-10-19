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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import ChatInput from '@/components/ChatInput.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { useChat } from '@/composables/useChat'
import { createAi, getAiModelName } from '@/lib/ai'
import { useConfig } from '@/lib/config'
import { useActiveTab } from '@/composables/useActiveTab'
import type { Message } from '@/lib/message'
import { useChromeStorage } from '@/utils/useChromeStorage'
import { getTabContent } from '@/lib/getTabContent'
import { htmlToText } from '@/lib/htmlToText'
import { buildSystemMessage } from '@/lib/prompt'

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

const pageContent = ref<string | null>(null)
const systemMessage = ref<Message>(buildSystemMessage({ messages: [], modelName }))

watch(messagesKey, () => {
  if (!activeTab.value?.id) {
    return
  }

  getTabContent(activeTab.value.id).then((result) => {
    pageContent.value = result.text || (result.html ? htmlToText(result.html) : null)
  })
})

watch(pageContent, (newVal) => {
  systemMessage.value = buildSystemMessage({
    messages: messages.value,
    modelName,
    pageText: newVal,
  })
})

const messages = useChromeStorage<Message[]>({
  key: messagesKey,
  defaultValue: () => [],
  storageArea: 'session',
})

const { appendUserInput } = useChat({
  model,
  messages,
  systemMessage,
  onStart: () => scrollToLastMessage(),
})

const chatContainer = ref<HTMLElement | null>(null)

const handleSubmit = (input: string) => {
  if (input.trim()) {
    appendUserInput(input)
    scrollToLastMessage()
  }
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
