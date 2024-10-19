<template>
  <div
    class="bg-secondary text-secondary-foreground rounded-lg p-4 py-2 cursor-pointer"
    @click="handleClick"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const emit = defineEmits<{
  (event: 'select', text: string): void
}>()

const handleClick = () => {
  emit('select', props.text)
}
</script>
