import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
    exclude: ['pdfjs-dist/build/pdf.worker.min.mjs'],
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
      '@common': path.resolve(__dirname, './src/components/common'),
      '@debug': path.resolve(__dirname, './src/components/debug'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@constants': path.resolve(__dirname, './src/constants'),
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
      plugins: process.env.NODE_ENV === 'production' ? [
        // Remove console statements in production builds
        {
          name: 'remove-console',
          transform(code, id) {
            if (id.includes('node_modules')) return null;
            
            // Remove console.log, console.debug, console.info but keep console.error and console.warn
            return {
              code: code
                .replace(/console\.log\([^)]*\);?/g, '')
                .replace(/console\.debug\([^)]*\);?/g, '')
                .replace(/console\.info\([^)]*\);?/g, ''),
              map: null
            };
          }
        }
      ] : [],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-pdf': ['pdfjs-dist']
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
  ssr: {
    noExternal: ['pdfjs-dist']
  }
})