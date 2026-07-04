import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Tin_Tuc_247/',
  server: {
    port: 5173
  }
});
