import { encode, encodeChat } from 'gpt-tokenizer'
import type { ChatMessage } from 'gpt-tokenizer/GptEncoding'
import type { Message } from './message'

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
