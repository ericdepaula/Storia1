import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  // --- Adicione esta seção para o desenvolvimento com Docker ---
  server: {
    host: '0.0.0.0', // Permite que o servidor seja acessado de fora do container
    port: 5173,
  },
  // -----------------------------------------------------------
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});