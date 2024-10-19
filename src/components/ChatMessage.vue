<template>
  <div
    :class="[
      'flex gap-4 group',
      message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse',
    ]"
  >
    <div className="flex-none flex flex-col items-center pt-2">
      <Avatar :role="message.role" />
    </div>

    <div class="flex-1">
      <div
        class="bg-indigo-100 dark:bg-indigo-950 text-gray-800 p-2 px-3 rounded-lg relative"
      >
        <!-- Loading state -->
        <template v-if="!message.content && message.role === 'assistant'">
          <div>...</div>
        </template>

        <VueShowdown
          v-else
          :markdown="message.content"
          :class="[
            'prose prose-sm break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-headings:text-sm max-w-full',
          ]"
        />

        <!-- Arrow -->
        <div
          v-if="message.role === 'assistant'"
          className="absolute left-0 top-6 transform -translate-x-1/2 rotate-45 w-2 -mt-1 h-2 bg-indigo-100 dark:bg-indigo-950"
        />
        <div
          v-else
          className="absolute right-0 top-6 transform translate-x-1/2 rotate-45 w-2 -mt-1 h-2 bg-indigo-100 dark:bg-indigo-950"
        />
      </div>

      <!-- Copy button -->
      <div class="opacity-0 group-hover:opacity-100 transition-opacity relative">
        <div class="absolute left-0 right-0 top-2 flex justify-start">
          <CopyButton v-if="message.role === 'assistant'" :text="message.content" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '@/components/Avatar.vue'
import CopyButton from '@/components/CopyButton.vue'
import type { Message } from '@/lib/message'

defineProps<{
  message: Message
}>()
</script>
