import { defineConfig } from "astro/config";
import astroAws from "@astro-aws/adapter";

// https://astro.build/config
export default defineConfig({
    // output: "server",
    output: "hybrid",
    adapter: astroAws(),
    //   integrations: [image()]
    experimental: {
        assets: true,
    },
});
