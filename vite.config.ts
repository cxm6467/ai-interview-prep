import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
    esbuildOptions: {
      target: 'es2020',
      supported: { bigint: true }
    }
  },
  esbuild: {
    // Ignore eval warnings from PDF.js
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/components/organisms'),
      '@templates': path.resolve(__dirname, './src/components/templates'),
      '@pages': path.resolve(__dirname, './src/components/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to Netlify Functions
      '/api/ai-handler': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/consolidated-ai-handler': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit (in kB)
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Handle PDF.js worker separately
          if (id.includes('pdf.worker.entry')) {
            return 'pdf.worker';
          }
          
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdf-worker';
            }
            return 'vendor-other';
          }
          
          // Split components into separate chunks
          if (id.includes('/components/')) {
            if (id.includes('/organisms/')) {
              return 'chunk-organisms';
            }
            if (id.includes('/molecules/')) {
              return 'chunk-molecules';
            }
            if (id.includes('/atoms/')) {
              return 'chunk-atoms';
            }
          }
          
          // Split services into a separate chunk
          if (id.includes('/services/')) {
            return 'chunk-services';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  assetsInclude: ['**/*.pdf'],
  define: {
    'process.env': {},
    global: 'window',
  }
})