<template>
  <form @submit.prevent="handleSubmit" class="flex gap-3">
    <Textarea
      v-model="inputText"
      autofocus
      placeholder="Type your message..."
      @keydown="handleKeyDown"
      class="min-h-3"
    />

    <Button type="submit" :disabled="!inputText.trim()" title="Send message">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </Button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

const inputText = ref('')
const emit = defineEmits(['send'])

const handleKeyDown = (event: KeyboardEvent) => {
  // If opt is pressed, ignore the enter key
  if (event.metaKey || event.ctrlKey || event.shiftKey) {
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (inputText.value.trim()) {
    emit('send', inputText.value)
    inputText.value = ''
  }
}
</script>
