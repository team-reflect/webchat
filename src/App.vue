<template>
  <div :class="darkMode ? 'dark' : ''" class="h-screen overflow-hidden">
    <div
      class="flex flex-col h-screen overflow-hidden user-select-none bg-background text-foreground"
    >
      <!-- Nav bar -->
      <div
        class="flex justify-end p-1 px-2 border-b border-system-border gap-2 flex-none"
      >
        <Button @click="toggleConfig" variant="ghost" size="icon" class="w-8 h-8">
          <CircleX v-if="showConfig" class="w-4 h-4" />
          <Settings v-else class="w-4 h-4" />
        </Button>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <ConfigScreen v-if="showConfig" @config-saved="onConfigSaved" />
        <ChatScreen v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConfig } from '@/lib/config'
import Button from '@/components/ui/button/Button.vue'
import { Settings, CircleX } from 'lucide-vue-next'
import ChatScreen from '@/screens/ChatScreen.vue'
import ConfigScreen from '@/screens/ConfigScreen.vue'
import { usePreferredDark } from '@vueuse/core'

const darkMode = usePreferredDark()

const config = useConfig()

const showConfig = ref(!config.providerApiKey)

const toggleConfig = () => {
  showConfig.value = !showConfig.value
}

const onConfigSaved = () => {
  showConfig.value = false
}
</script>
