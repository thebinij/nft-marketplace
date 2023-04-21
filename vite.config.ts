import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            backendURL: env.REACT_APP_BACKEND_URL,
            sandbox: env.REACT_APP_SANDBOX_SDK,
          },
        },
      }),
    ],
  };
});
