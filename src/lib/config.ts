interface AppConfig {
  provider: 'openai' | 'anthropic'
  openaiApiKey?: string
  anthropicApiKey?: string
}

const defaultConfig: AppConfig = {
  provider: 'openai',
}

class Config {
  private config: AppConfig

  constructor() {
    this.config = { ...defaultConfig, ...this.loadConfig() }
  }

  private loadConfig(): Partial<AppConfig> {
    const storedConfig = localStorage.getItem('appConfig')
    return storedConfig ? JSON.parse(storedConfig) : {}
  }

  private saveConfig() {
    localStorage.setItem('appConfig', JSON.stringify(this.config))
  }

  get provider() {
    return this.config.provider
  }

  get openaiApiKey() {
    return this.config.openaiApiKey
  }

  get anthropicApiKey() {
    return this.config.anthropicApiKey
  }

  get providerApiKey() {
    return this.config.provider === 'openai'
      ? this.config.openaiApiKey
      : this.config.anthropicApiKey
  }

  set(newConfig: Partial<AppConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }

  clear() {
    this.config = { ...defaultConfig }
    localStorage.removeItem('appConfig')
  }
}

export const config = new Config()

export function useConfig() {
  return config
}
