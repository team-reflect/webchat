<template>
  <div
    class="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 cursor-pointer text-sm"
    @click="handleClick"
  >
    {{ label ?? text }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  label?: string
}>()

const emit = defineEmits<{
  (event: 'select', text: string): void
}>()

const handleClick = () => {
  emit('select', props.text)
}
</script>
