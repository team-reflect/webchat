import { convertToCoreMessages, streamText, type LanguageModel } from 'ai'
import { type Ref } from 'vue'
import { type Message } from '@/lib/message'
import type { AiProvider } from '@/lib/ai'

interface UseChatOptions {
  model: LanguageModel
  modelProvider: AiProvider
  messages: Ref<Message[]>
  systemMessage: Ref<Message>
  onStart?: () => void
  onFinish?: () => void
}

export function useChat(options: UseChatOptions) {
  const { model, modelProvider, messages, systemMessage } = options

  const appendUserInput = async (input: string) => {
    // Proactively add the user message to the messages array
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    })

    const responseId = crypto.randomUUID()

    messages.value.push({
      id: responseId,
      role: 'assistant',
      content: '',
    })

    options.onStart?.()

    try {
      const result = await streamText({
        model,
        messages: convertMessages(
          [systemMessage.value, ...messages.value],
          modelProvider,
        ),
        headers,
        onFinish: () => {
          options.onFinish?.()
        },
      })

      for await (const textPart of result.textStream) {
        // Update the message with the new content
        const messageIndex = messages.value.findIndex(
          (message) => message.id === responseId,
        )

        if (messageIndex !== -1) {
          messages.value[messageIndex].content += textPart
        }
      }
    } catch (error) {
      console.error(error)
      alert(
        `Error making request to ${model.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return {
    appendUserInput,
  }
}

// Anthropic requires this header to be set for CORS requests
const headers = { 'anthropic-dangerous-direct-browser-access': 'true' }

function convertMessages(messages: Message[], provider: AiProvider) {
  let convertedMessages = messages

  // Filter out empty messages, Anthropic doesn't like them
  convertedMessages = messages.filter((message) => message.content)

  if (provider === 'anthropic') {
    // Enable ephemeral caching for Anthropic
    convertedMessages = convertedMessages.map((message) => ({
      ...message,
      experimental_providerMetadata: {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    }))
  }

  return convertToCoreMessages(convertedMessages)
}
