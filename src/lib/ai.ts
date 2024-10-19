import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

export type AiProvider = 'openai' | 'anthropic'
export type AiModel = 'gpt-4o' | 'claude-3-5-sonnet-20240620'

export function createAi({
  provider,
  providerApiKey,
}: {
  provider: AiProvider
  providerApiKey: string
}) {
  if (!providerApiKey) {
    throw new Error('Provider API key is not set')
  }

  const aiCreator = ((provider: AiProvider) => {
    switch (provider) {
      case 'openai':
        return createOpenAI
      case 'anthropic':
        return createAnthropic
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  })(provider)

  return aiCreator({
    apiKey: providerApiKey,
  })
}

export function getAiModelName(provider: AiProvider): AiModel {
  switch (provider) {
    case 'openai':
      return 'gpt-4o'
    case 'anthropic':
      return 'claude-3-5-sonnet-20240620'
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
