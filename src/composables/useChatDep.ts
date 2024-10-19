import type {
  LanguageModelV1FinishReason,
  JSONValue as JSONValue$1,
} from '@ai-sdk/provider'

import type {
  ChatRequest,
  ChatRequestOptions,
  CreateMessage,
  FunctionCallHandler,
  IdGenerator,
  JSONValue,
  Message,
  ToolCallHandler,
} from '@ai-sdk/ui-utils'
import {
  callChatApi,
  generateId as generateIdFunc,
  processChatStream,
} from '@ai-sdk/ui-utils'
import swrv from 'swrv'
import type { Ref } from 'vue'
import { ref, unref } from 'vue'
import { streamText, type CompletionTokenUsage } from 'ai'
type FetchFunction = typeof globalThis.fetch

export type { CreateMessage, Message, UseChatOptions }

interface ToolCall$1<NAME extends string, ARGS> {
  /**
ID of the tool call. This ID is used to match the tool call with the tool result.
 */
  toolCallId: string
  /**
Name of the tool that is being called.
 */
  toolName: NAME
  /**
Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
   */
  args: ARGS
}

type UseChatOptions = {
  /**
Keeps the last message when an error happens. This will be the default behavior
starting with the next major release.
The flag was introduced for backwards compatibility and currently defaults to `false`.
Please enable it and update your error handling/resubmit behavior.
   */
  keepLastMessageOnError?: boolean
  /**
   * The API endpoint that accepts a `{ messages: Message[] }` object and returns
   * a stream of tokens of the AI chat response. Defaults to `/api/chat`.
   */
  api?: string
  /**
   * A unique identifier for the chat. If not provided, a random one will be
   * generated. When provided, the `useChat` hook with the same `id` will
   * have shared states across components.
   */
  id?: string
  /**
   * Initial messages of the chat. Useful to load an existing chat history.
   */
  initialMessages?: Message[]
  /**
   * Initial input of the chat.
   */
  initialInput?: string
  /**
   * @deprecated Use AI SDK 3.1 `streamText` and `onToolCall` instead.
   *
   * Callback function to be called when a function call is received.
   * If the function returns a `ChatRequest` object, the request will be sent
   * automatically to the API and will be used to update the chat.
   */
  experimental_onFunctionCall?: FunctionCallHandler
  /**
   * @deprecated Use AI SDK 3.1 `streamText` and `onToolCall` instead.
   *
   * Callback function to be called when a tool call is received.
   * If the function returns a `ChatRequest` object, the request will be sent
   * automatically to the API and will be used to update the chat.
   */
  experimental_onToolCall?: ToolCallHandler
  /**
Optional callback function that is invoked when a tool call is received.
Intended for automatic client-side tool execution.

You can optionally return a result for the tool call,
either synchronously or asynchronously.
   */
  onToolCall?: ({
    toolCall,
  }: {
    toolCall: ToolCall$1<string, unknown>
  }) => void | Promise<unknown> | unknown
  /**
   * Callback function to be called when the API response is received.
   */
  onResponse?: (response: Response) => void | Promise<void>
  /**
   * Optional callback function that is called when the assistant message is finished streaming.
   *
   * @param message The message that was streamed.
   * @param options.usage The token usage of the message.
   * @param options.finishReason The finish reason of the message.
   */
  onFinish?: (
    message: Message,
    options: {
      usage: CompletionTokenUsage
      finishReason: LanguageModelV1FinishReason
    },
  ) => void
  /**
   * Callback function to be called when an error is encountered.
   */
  onError?: (error: Error) => void
  /**
   * A way to provide a function that is going to be used for ids for messages.
   * If not provided nanoid is used by default.
   */
  generateId?: IdGenerator
  /**
   * The credentials mode to be used for the fetch request.
   * Possible values are: 'omit', 'same-origin', 'include'.
   * Defaults to 'same-origin'.
   */
  credentials?: RequestCredentials
  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers
  /**
   * Extra body object to be sent with the API request.
   * @example
   * Send a `sessionId` to the API along with the messages.
   * ```js
   * useChat({
   *   body: {
   *     sessionId: '123',
   *   }
   * })
   * ```
   */
  body?: object
  /**
   * Whether to send extra message fields such as `message.id` and `message.createdAt` to the API.
   * Defaults to `false`. When set to `true`, the API endpoint might need to
   * handle the extra fields before forwarding the request to the AI service.
   */
  sendExtraMessageFields?: boolean
  /**
   * Stream mode (default to "stream-data")
   *
   * @deprecated Use `streamProtocol` instead.
   */
  streamMode?: 'stream-data' | 'text'
  /**
Streaming protocol that is used. Defaults to `data`.
   */
  streamProtocol?: 'data' | 'text'
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
    */
  fetch?: FetchFunction
}

export type UseChatHelpers = {
  /** Current messages in the chat */
  messages: Ref<Message[]>
  /** The error object of the API request */
  error: Ref<undefined | Error>
  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   */
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>
  /**
   * Reload the last AI chat response for the given chat history. If the last
   * message isn't from the assistant, it will request the API to generate a
   * new response.
   */
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop: () => void
  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void
  /** The current value of the input */
  input: Ref<string>
  /** Form submission handler to automatically reset input and append a user message  */
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions,
  ) => void
  /** Whether the API request is in progress */
  isLoading: Ref<boolean | undefined>

  /** Additional data added on the server via StreamData */
  data: Ref<JSONValue[] | undefined>

  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void
}

let uniqueId = 0

// @ts-expect-error - some issues with the default export of useSWRV
const useSWRV = (swrv.default as (typeof import('swrv'))['default']) || swrv
const store: Record<string, Message[] | undefined> = {}

export function useChat(
  {
    api = '/api/chat',
    id,
    initialMessages = [],
    initialInput = '',
    sendExtraMessageFields,
    experimental_onFunctionCall,
    streamMode,
    streamProtocol,
    onResponse,
    onFinish,
    onError,
    credentials,
    headers: metadataHeaders,
    body: metadataBody,
    generateId = generateIdFunc,
    onToolCall,
    fetch,
    keepLastMessageOnError = false,
    maxSteps,
  }: UseChatOptions & {
    /**
     * Maximum number of sequential LLM calls (steps), e.g. when you use tool calls. Must be at least 1.
     * A maximum number is required to prevent infinite loops in the case of misconfigured tools.
     * By default, it's set to 1, which means that only a single LLM call is made.
     */
    maxSteps?: number
  } = {
    maxSteps: 1,
  },
): UseChatHelpers {
  // streamMode is deprecated, use streamProtocol instead.
  if (streamMode) {
    streamProtocol ??= streamMode === 'text' ? 'text' : undefined
  }

  // Generate a unique ID for the chat if not provided.
  const chatId = id || `chat-${uniqueId++}`

  const key = `${api}|${chatId}`
  const { data: messagesData, mutate: originalMutate } = useSWRV<Message[]>(
    key,
    () => store[key] || initialMessages,
  )

  const { data: isLoading, mutate: mutateLoading } = useSWRV<boolean>(
    `${chatId}-loading`,
    null,
  )

  isLoading.value ??= false

  // Force the `data` to be `initialMessages` if it's `undefined`.
  messagesData.value ??= initialMessages

  const mutate = (data?: Message[]) => {
    store[key] = data
    return originalMutate()
  }

  // Because of the `initialData` option, the `data` will never be `undefined`.
  const messages = messagesData as Ref<Message[]>

  const error = ref<undefined | Error>(undefined)
  // cannot use JSONValue[] in ref because of infinite Typescript recursion:
  const streamData = ref<undefined | unknown[]>(undefined)

  let abortController: AbortController | null = null

  async function triggerRequest(
    messagesSnapshot: Message[],
    { options, data, headers, body }: ChatRequestOptions = {},
  ) {
    const messageCount = messages.value.length

    try {
      error.value = undefined
      mutateLoading(() => true)

      abortController = new AbortController()

      // Do an optimistic update to the chat state to show the updated messages
      // immediately.
      const previousMessages = messagesSnapshot
      mutate(messagesSnapshot)

      const requestOptions = {
        headers: headers ?? options?.headers,
        body: body ?? options?.body,
      }

      let chatRequest: ChatRequest = {
        messages: messagesSnapshot,
        options: requestOptions,
        body: requestOptions.body,
        headers: requestOptions.headers,
        data,
      }

      await processChatStream({
        getStreamedResponse: async () => {
          const existingData = (streamData.value ?? []) as JSONValue[]

          const constructedMessagesPayload = sendExtraMessageFields
            ? chatRequest.messages
            : chatRequest.messages.map(
                ({
                  role,
                  content,
                  name,
                  data,
                  annotations,
                  toolInvocations,
                  function_call,
                }) => ({
                  role,
                  content,
                  ...(name !== undefined && { name }),
                  ...(data !== undefined && { data }),
                  ...(annotations !== undefined && { annotations }),
                  ...(toolInvocations !== undefined && { toolInvocations }),
                  // outdated function/tool call handling (TODO deprecate):
                  ...(function_call !== undefined && { function_call }),
                }),
              )

          return await callChatApi({
            api,
            body: {
              messages: constructedMessagesPayload,
              data: chatRequest.data,
              ...unref(metadataBody), // Use unref to unwrap the ref value
              ...requestOptions.body,
            },
            streamProtocol,
            headers: {
              ...metadataHeaders,
              ...requestOptions.headers,
            },
            abortController: () => abortController,
            credentials,
            onResponse,
            onUpdate(merged, data) {
              mutate([...chatRequest.messages, ...merged])
              streamData.value = [...existingData, ...(data ?? [])]
            },
            onFinish,
            restoreMessagesOnFailure() {
              // Restore the previous messages if the request fails.
              if (!keepLastMessageOnError) {
                mutate(previousMessages)
              }
            },
            generateId,
            onToolCall,
            fetch,
          })
        },
        experimental_onFunctionCall,
        updateChatRequest(newChatRequest) {
          chatRequest = newChatRequest
        },
        getCurrentMessages: () => messages.value,
      })

      abortController = null
    } catch (err) {
      // Ignore abort errors as they are expected.
      if ((err as any).name === 'AbortError') {
        abortController = null
        return null
      }

      if (onError && err instanceof Error) {
        onError(err)
      }

      error.value = err as Error
    } finally {
      mutateLoading(() => false)
    }

    // auto-submit when all tool calls in the last assistant message have results:
    const lastMessage = messages.value[messages.value.length - 1]
    if (
      // ensure we actually have new messages (to prevent infinite loops in case of errors):
      messages.value.length > messageCount &&
      // ensure there is a last message:
      lastMessage != null &&
      // check if the feature is enabled:
      maxSteps &&
      maxSteps > 1 &&
      // check that next step is possible:
      isAssistantMessageWithCompletedToolCalls(lastMessage) &&
      // limit the number of automatic steps:
      countTrailingAssistantMessages(messages.value) <= maxSteps
    ) {
      await triggerRequest(messages.value)
    }
  }

  const append: UseChatHelpers['append'] = async (message, options) => {
    if (!message.id) {
      message.id = generateId()
    }

    return triggerRequest(messages.value.concat(message as Message), options)
  }

  const reload: UseChatHelpers['reload'] = async (options) => {
    const messagesSnapshot = messages.value
    if (messagesSnapshot.length === 0) return null

    const lastMessage = messagesSnapshot[messagesSnapshot.length - 1]
    if (lastMessage.role === 'assistant') {
      return triggerRequest(messagesSnapshot.slice(0, -1), options)
    }

    return triggerRequest(messagesSnapshot, options)
  }

  const stop = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  const setMessages = (messagesArg: Message[] | ((messages: Message[]) => Message[])) => {
    if (typeof messagesArg === 'function') {
      messagesArg = messagesArg(messages.value)
    }

    mutate(messagesArg)
  }

  const input = ref(initialInput)

  const handleSubmit = (
    event?: { preventDefault?: () => void },
    options: ChatRequestOptions = {},
  ) => {
    event?.preventDefault?.()

    const inputValue = input.value

    if (!inputValue && !options.allowEmptySubmit) return

    triggerRequest(
      !inputValue && options.allowEmptySubmit
        ? messages.value
        : messages.value.concat({
            id: generateId(),
            createdAt: new Date(),
            content: inputValue,
            role: 'user',
          }),
      options,
    )

    input.value = ''
  }

  const addToolResult = ({ toolCallId, result }: { toolCallId: string; result: any }) => {
    const updatedMessages = messages.value.map((message, index, arr) =>
      // update the tool calls in the last assistant message:
      index === arr.length - 1 && message.role === 'assistant' && message.toolInvocations
        ? {
            ...message,
            toolInvocations: message.toolInvocations.map((toolInvocation) =>
              toolInvocation.toolCallId === toolCallId
                ? { ...toolInvocation, result }
                : toolInvocation,
            ),
          }
        : message,
    )

    mutate(updatedMessages)

    // auto-submit when all tool calls in the last assistant message have results:
    const lastMessage = updatedMessages[updatedMessages.length - 1]

    if (isAssistantMessageWithCompletedToolCalls(lastMessage)) {
      triggerRequest(updatedMessages)
    }
  }

  return {
    messages,
    append,
    error,
    reload,
    stop,
    setMessages,
    input,
    handleSubmit,
    isLoading,
    data: streamData as Ref<undefined | JSONValue[]>,
    addToolResult,
  }
}

/**
Check if the message is an assistant message with completed tool calls.
The message must have at least one tool invocation and all tool invocations
must have a result.
 */
function isAssistantMessageWithCompletedToolCalls(message: Message) {
  return (
    message.role === 'assistant' &&
    message.toolInvocations &&
    message.toolInvocations.length > 0 &&
    message.toolInvocations.every((toolInvocation) => 'result' in toolInvocation)
  )
}

/**
Returns the number of trailing assistant messages in the array.
 */
function countTrailingAssistantMessages(messages: Message[]) {
  let count = 0
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      count++
    } else {
      break
    }
  }
  return count
}
