import type { Message } from './message'
import { encode, encodeChat } from 'gpt-tokenizer'
import type { ChatMessage } from 'gpt-tokenizer/GptEncoding'
import type { AiModel } from './ai'

export const AiModelContextWindowLimit: Record<AiModel, number> = {
  'gpt-4o': 128000,
  /* The API actually supports 200K+ tokens but we use different tokenizer so we limit it to 128K */
  'claude-3-5-sonnet-20240620': 128000,
}

export function countTokens(messages: Message[]): number {
  const chatMessages: ChatMessage[] = messages.map((message) => ({
    role: 'assistant',
    content: message.content,
  }))

  return encodeChat(chatMessages, 'gpt-4o').length
}

export function countStringTokens(text: string): number {
  return encode(text).length
}
