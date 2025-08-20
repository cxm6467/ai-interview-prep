import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          dest: 'assets'
        }
      ]
    })
  ],
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdfjs-dist/build/pdf', 'pdfjs-dist/build/pdf.worker.entry'],
    esbuildOptions: {
      target: 'es2020',
      supported: { bigint: true }
    }
  },
  esbuild: {
    // Ignore eval warnings from PDF.js
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'eval': 'silent'
    }
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
    port: 5173,
    proxy: {
      // Proxy API requests to Netlify functions in development
      '/.netlify/functions/': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\//, '/.netlify/functions/')
      },
      // Fallback for any other /api routes
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/.netlify/functions')
      }
    },
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1500, // Increase chunk size warning limit for PDF.js (in kB)
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress eval warnings from PDF.js
        if (warning.code === 'EVAL' && warning.id?.includes('pdfjs-dist')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          // Handle PDF.js worker separately (largest chunk)
          if (id.includes('pdf.worker.entry') || id.includes('pdf.worker.js')) {
            return 'pdf-worker';
          }
          
          // Split PDF.js main library 
          if (id.includes('pdfjs-dist') && !id.includes('pdf.worker')) {
            return 'pdf-lib';
          }
          
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('zustand')) {
              return 'vendor-store';
            }
            return 'vendor-other';
          }
          
          // Split components into separate chunks based on usage patterns
          if (id.includes('/components/')) {
            if (id.includes('/organisms/InterviewChat')) {
              return 'chunk-chat'; // Lazy loaded, separate chunk
            }
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
  },
})