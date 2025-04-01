import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/datadiagram/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper MIME types for assets
    assetsInlineLimit: 0,
  },
  plugins: [react(),
    tailwindcss(),
  ],
})
