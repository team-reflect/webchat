export interface Message {
  id: string
  content: string
  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool'
}
