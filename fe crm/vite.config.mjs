import {
  defineConfig,
  loadEnv
} from 'vite';
import jsconfigPaths from 'vite-jsconfig-paths';

import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Base URL configuration
  const API_URL = (env.VITE_APP_BASE_NAME || '/').startsWith('/') ? env.VITE_APP_BASE_NAME || '/' : `/${env.VITE_APP_BASE_NAME}/`;

  // Port configuration
  const PORT = env.VITE_APP_PORT || 3000;

  return {
    server: {
      open: true,
      port: PORT
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: [
        { find: '@', replacement: '/src' },
        { find: '@assets', replacement: '/src/assets' },
        { find: '@components', replacement: '/src/components' }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          additionalData: `@use "sass:color";`
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()]
  };
});
