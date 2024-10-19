<template>
  <div class="flex-shrink-0">
    <div
      v-if="role === 'assistant'"
      class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-secondary-foreground font-bold"
    >
      AI
    </div>

    <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
      <User class="w-5 h-5 text-primary-foreground" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next'

defineProps({
  role: {
    type: String,
    required: true,
  },
})
</script>
