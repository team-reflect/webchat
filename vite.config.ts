import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import { crx } from '@crxjs/vite-plugin'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

import zipPack from 'vite-plugin-zip-pack'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
    },
    plugins: [
      Components({
        dirs: ['./src/components'],
        directives: false,
      }),
      svgLoader({
        defaultImport: 'component',
      }),
      crx({
        manifest: {
          manifest_version: 3,
          name: 'Reflect Webchat',
          version: require('./package.json').version,
          description: 'AI Chat with web pages',
          side_panel: {
            default_path: 'sidepanel.html',
          },
          background: {
            service_worker: 'src/background.ts',
          },
          icons: {
            '16': 'public/icons/icon-16.png',
            '32': 'public/icons/icon-32.png',
            '48': 'public/icons/icon-48.png',
            '128': 'public/icons/icon-128.png',
          },
          permissions: ['storage', 'sidePanel', 'scripting', 'tabs'],
          host_permissions: ['<all_urls>'],
          // key: process.env.VITE_EXTENSION_PUBLIC_KEY,
        },
      }),
      vue(),
      zipPack({
        outDir: path.resolve(__dirname),
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'chrome114',
    },
    server: {
      hmr: {
        port: 5174,
      },
    },
  }
})
