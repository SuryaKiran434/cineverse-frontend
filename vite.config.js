import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind is wired up here and *only* here. The repo previously also carried a
// postcss.config.cjs that ran '@tailwindcss/postcss', which meant Tailwind was
// configured twice over the same stylesheet. The Vite plugin is the supported,
// faster path for Tailwind v4, so the PostCSS copy was removed.
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Vitest. jsdom is required because the components under test read
  // localStorage and render DOM; coverage is emitted as lcov so the SonarCloud
  // step later in the same CI job can import it (a source file Sonar analyses
  // but cannot find in a coverage report is scored 0% covered, not unmeasured).
  test: {
    environment: 'jsdom',
    globals: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/__tests__/**', 'src/main.jsx'],
    },
  },
})
