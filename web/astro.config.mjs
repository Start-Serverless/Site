import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda"

export default defineConfig({
	output: "hybrid",
	adapter: aws(),
	experimental: {
		assets: true
	}
});