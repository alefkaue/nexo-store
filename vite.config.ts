import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: { sourcemap: false, chunkSizeWarningLimit: 350 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/services/**', 'src/state/persistence.ts'],
      thresholds: { statements: 85, branches: 80, functions: 85, lines: 85 },
    },
  },
})
