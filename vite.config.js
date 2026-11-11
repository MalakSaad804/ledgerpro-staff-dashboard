import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// port 5174 so it can run next to the customer app (5173)
export default defineConfig({ plugins: [react()], server: { port: 5174 } });
