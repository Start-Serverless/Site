import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda"

export default defineConfig({
	output: "hybrid",
	adapter: aws(),
	redirects: {
		"/blog/hybrid_astro_with_sst/index.html": "/blog/hybrid-astro-with-sst/index.html",
		"/blog/static_astro_with_sst/index.html": "/blog/static-astro-with-sst/index.html"
	}
});