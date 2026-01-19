import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  return {
    plugins: [react()],
    define: isDev
      ? {
          // "import.meta.env.VITE_API_BASE": JSON.stringify("https://bach.aeoc.io.vn/api"),
          "import.meta.env.VITE_API_BASE": JSON.stringify("http://localhost:8080"),
        }
      : {},
  };
});
