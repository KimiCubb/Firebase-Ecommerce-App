import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],

          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],

          "firebase-vendor": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],

          "query-vendor": ["@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
