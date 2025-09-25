
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow-models/pose-detection'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@tensorflow/tfjs',
      '@tensorflow-models/pose-detection',
      '@mediapipe/pose',
      '@tensorflow/tfjs-backend-webgpu',
      '@tensorflow/tfjs-backend-cpu',
      '@tensorflow/tfjs-backend-webgl'
    ],
  },
}));
