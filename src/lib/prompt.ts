import type { Message } from './message'
import type { AiModel } from './ai'
import { AiModelContextWindowLimit, countStringTokens, countTokens } from './tokenizer'

/**
 *
 * @param {Object} params - The parameters for building messages.
 * @param {string | null} [params.pageText] - The content of the current web page, if any.
 * @param {Message[]} params.messages - The list of messages to build.
 * @param {AiModel} params.model - The AI model to use, which determines the token limit.
 * @returns {Message[]} A new array of messages that fits within the model's token limit.
 */
export function buildSystemMessage({
  pageText,
  messages = [],
  modelName,
}: {
  pageText?: string | null
  messages: Message[]
  modelName: AiModel
}): Message {
  const limit = AiModelContextWindowLimit[modelName]
  const systemMessage = internalBuildSystemMessage(pageText)
  const messagesWithSystem = [systemMessage, ...messages]

  // If we are within the limit, return the system message
  if (countTokens(messagesWithSystem) <= limit) {
    return systemMessage
  }

  // Truncate the pageText so that it fits within the token limit
  const messagesTokenCount = countTokens(messages)
  const maxPageTextLength = limit - messagesTokenCount
  const truncatedPageText = truncateString(maxPageTextLength, pageText ?? '')

  return internalBuildSystemMessage(truncatedPageText)
}

const SYSTEM_PROMPT = `You are a helpful assistant that can answer questions or perform tasks that are typically related to the contents of a web page. Return your response in markdown format.`

const SYSTEM_PROMPT_WITH_PAGE_TEXT = `The user is currently viewing a web page with the following content:`

/**
 * Builds a system message for the AI assistant.
 *
 * This function creates a system message that sets the context for the AI assistant.
 * If page text is provided, it includes this text in the message to give the AI
 * context about the web page the user is currently viewing.
 *
 * @param {string | null | undefined} pageText - The content of the current web page, if any.
 * @returns {Message} A Message object representing the system message.
 */

function internalBuildSystemMessage(pageText?: string | null): Message {
  let prompt = SYSTEM_PROMPT

  if (pageText) {
    prompt += `\n\n${SYSTEM_PROMPT_WITH_PAGE_TEXT}\n\n ${pageText}.`
  }

  return {
    id: 'system',
    role: 'system',
    content: prompt,
  }
}

/**
 * Truncates a string to fit within a specified number of tokens.
 *
 * This function uses a binary search algorithm to find the longest substring
 * that fits within the token limit. It starts by estimating the ratio of
 * characters to tokens and then uses binary search to find the exact truncation point.
 *
 * @param {number} maxTokens - The maximum number of tokens the string should contain.
 * @param {string} text - The string to be truncated.
 * @returns {string} The truncated string.
 */
function truncateString(maxTokens: number, text: string): string {
  const tokenCount = countStringTokens(text)

  if (tokenCount <= maxTokens) {
    return text
  }

  // Binary search for the right truncation point
  let start = 0
  let end = text.length

  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    const truncated = text.slice(0, mid)
    const truncatedTokenCount = countStringTokens(truncated)

    if (truncatedTokenCount > maxTokens) {
      end = mid - 1
    } else if (truncatedTokenCount < maxTokens - 1) {
      start = mid + 1
    } else {
      return truncated
    }
  }

  // Fallback: return the last valid truncation
  return text.slice(0, end)
}
