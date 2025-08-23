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
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1200, // Adjusted for PDF.js worker requirements (in kB)
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
          // Handle PDF.js components separately for better chunking
          if (id.includes('pdf.worker.entry') || id.includes('pdf.worker.js')) {
            return 'pdf-worker';
          }
          if (id.includes('pdfjs-dist/build/pdf.js') || id.includes('pdfjs-dist')) {
            return 'pdf-lib';
          }
          
          // Split large node_modules into smaller chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            // Document processing libraries
            if (id.includes('mammoth') || id.includes('docx')) {
              return 'vendor-documents';
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('classnames')) {
              return 'vendor-utils';
            }
            // Development/build tools
            if (id.includes('vite') || id.includes('rollup') || id.includes('esbuild')) {
              return 'vendor-build';
            }
            // Everything else
            return 'vendor-other';
          }
          
          // Split application code into logical chunks
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
          
          // Services and business logic
          if (id.includes('/services/') || id.includes('/store/')) {
            return 'chunk-services';
          }
          
          // Utilities and helpers
          if (id.includes('/utils/') || id.includes('/hooks/')) {
            return 'chunk-utils';
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