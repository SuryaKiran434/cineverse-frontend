import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind is wired up here and *only* here. The repo previously also carried a
// postcss.config.cjs that ran '@tailwindcss/postcss', which meant Tailwind was
// configured twice over the same stylesheet. The Vite plugin is the supported,
// faster path for Tailwind v4, so the PostCSS copy was removed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
