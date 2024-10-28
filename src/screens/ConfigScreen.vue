<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col gap-2 prose prose-sm dark:prose-invert prose-ul:m-0">
      <h2>Configuration</h2>

      <p>
        You can find API keys on either
        <a
          href="https://platform.openai.com/account/api-keys"
          target="_blank"
          class="underline text-primary"
          >OpenAI</a
        >
        or
        <a
          href="https://console.anthropic.com/api-keys"
          target="_blank"
          class="underline text-primary"
          >Anthropic</a
        >'s website.
      </p>

      <ul>
        <li>
          Your API key is private and <strong>will not</strong> be shared with anyone
          (other than the AI providers).
        </li>
        <li>Keys are stored locally in your browser.</li>
        <li>Requests are sent directly to the AI providers.</li>
        <li>
          The source code is
          <a
            href="https://github.com/team-reflect/webchat"
            target="_blank"
            class="underline text-primary"
            >open source</a
          >.
        </li>
      </ul>
    </div>

    <form @submit.prevent="saveConfig" class="space-y-4">
      <div class="space-y-2">
        <Label for="llm-provider">AI Provider</Label>
        <Select v-model="provider" id="llm-provider">
          <SelectTrigger>
            <SelectValue placeholder="Select an AI provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="api-key">API Key</Label>

        <div class="relative">
          <Input
            id="api-key"
            class="pr-12 w-full"
            v-model="openaiApiKey"
            :type="showApiKey ? 'text' : 'password'"
            required
            v-if="provider === 'openai'"
          />
          <Input
            id="api-key"
            class="pr-12 w-full"
            v-model="anthropicApiKey"
            :type="showApiKey ? 'text' : 'password'"
            required
            v-else-if="provider === 'anthropic'"
          />
          <a
            @click="showApiKey = !showApiKey"
            :class="[
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer w-8 h-8',
            ]"
          >
            <Eye v-if="showApiKey" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </a>
        </div>
      </div>

      <footer class="mt-6">
        <Button type="submit">Save configuration</Button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { config } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Eye, EyeOff } from 'lucide-vue-next'
import { type AiProvider } from '@/lib/ai'

const provider = ref<AiProvider>('openai')
const showApiKey = ref(false)
const anthropicApiKey = ref('')
const openaiApiKey = ref('')

const emit = defineEmits(['configSaved'])

onMounted(async () => {
  provider.value = config.provider
  openaiApiKey.value = config.openaiApiKey || ''
  anthropicApiKey.value = config.anthropicApiKey || ''
})

const saveConfig = async () => {
  await config.set({
    openaiApiKey: openaiApiKey.value,
    anthropicApiKey: anthropicApiKey.value,
    provider: provider.value,
  })
  emit('configSaved')
}
</script>
