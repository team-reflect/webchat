<template>
  <Button
    @click="copyToClipboard"
    variant="ghost"
    size="icon"
    class="h-4 w-4"
    title="Copy to clipboard"
  >
    <Copy class="h-3 w-3" />
  </Button>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { Copy } from 'lucide-vue-next'

const props = defineProps<{
  text: string
}>()

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
</script>
