import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda"


// https://astro.build/config
export default defineConfig({
	output: "hybrid",
	adapter: aws(),
	//   integrations: [image()]
	experimental: {
		assets: true,
	},
});
