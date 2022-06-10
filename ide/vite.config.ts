import { defineConfig, } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{
      find: /^@\//,
      replacement: '/src/',
    }],
  },
  plugins: [vue()],
  base: '/__wesim__/',
  build: {
    outDir: '../dist/__wesim__',
    emptyOutDir: true,
    // only for debug
    minify: process.env.NODE_ENV === 'production',
  },
  server: {
    proxy: {
      "/__app__/": {
        target: 'http://localhost:4040',
        changeOrigin: true,
      },
      "/__fs__/": {
        target: 'http://localhost:4040',
        changeOrigin: true,
      },
      "/__rpc__/message": {
        target: 'http://localhost:4040',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    }
  },
});
