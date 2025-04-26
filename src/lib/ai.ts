import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

export type AiProvider = 'openai' | 'anthropic'
export type AiModel = 'gpt-4.1' | 'claude-3-5-sonnet-20240620'

export const AiModelContextWindowLimit: Record<AiModel, number> = {
  // 1,047,576 tokens
  'gpt-4.1': 1047576,
  /* The API actually supports 200K+ tokens but we use different tokenizer so we limit it to 128K */
  'claude-3-5-sonnet-20240620': 128000,
}

export function createAi({
  modelProvider,
  modelProviderApiKey,
  modelName,
}: {
  modelProvider: AiProvider
  modelProviderApiKey: string
  modelName: AiModel
}) {
  if (!modelProviderApiKey) {
    throw new Error('Provider API key is not set')
  }

  if (modelProvider === 'openai') {
    const ai = createOpenAI({ apiKey: modelProviderApiKey })
    return ai(modelName)
  }

  if (modelProvider === 'anthropic') {
    const ai = createAnthropic({ apiKey: modelProviderApiKey })
    return ai(modelName, { cacheControl: true })
  }

  throw new Error(`Unknown provider: ${modelProvider}`)
}

export function getAiModelName(provider: AiProvider): AiModel {
  switch (provider) {
    case 'openai':
      return 'gpt-4.1'
    case 'anthropic':
      return 'claude-3-5-sonnet-20240620'
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
