import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        modelReview: resolve(process.cwd(), "model-review.html"),
        stationReview: resolve(process.cwd(), "station-review.html"),
      },
    },
  },
});
