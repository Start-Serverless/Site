---
title: How to Build  Hybrid Astro Sites with SST on AWS
authors: ["Trevor Cohen"]
description: Deploying websites and web applications to AWS can be challenging and SST helps with that.  
tags: [Astro, AWS, SST, Typescript, Web Development, Front End]
publishDate: 2023-06-28
image: "/src/assets/hybrid_astro_site_with_sst.jpg"
draft: false
---

### Introduction
Astro recently released their [hybrid rendering](https://astro.build/blog/hybrid-rendering/) mode which will allow you to statically generate web-pages for fast-performance while also allowing you to opt-in to server-side functionality for server-side rendered pages, or server-side endpoints.  

[SST](https://docs.sst.dev/what-is-sst) is a framework for for building full-stack serverless applications on AWS

### Overview

We are going to demonstrate from scratch how to create an Astro project, convert it to hybrid mode, and deploy it with SST.  We will have our 2 pages `/index` and `/contact` statically rendered while allowing a form submission on the `/contact` page to POST to a server-side endpoint with no client-side JavaScript.  Once the endpoint is called, the server will return a redirect back to our index page.

[Here is the source code ](https://github.com/Start-Serverless/AstroSST)
### Prerequisites
 
 Before getting started, please verify that you have the following prerequisites from  [SST docs for Astro](https://docs.sst.dev/start/astro#prerequisites)

 * Node.js 16 or higher
 * npm 7 or higher
 * AWS credentials configured locally 

 ### Setup

First we are going to build our Astro project by using the `npx create-astro@latest` command.   

Pick your preferences on the cli prompts. We are using the layout template generated from the CLI.  For this post our project is called "hybrid-project".

The fastest way to get started with SST is to use their [drop in mode](https://docs.sst.dev/what-is-sst#drop-in-mode).  This will allow SST to quickly detect that we have an Astro project, and setup initial configuration for us.  We can add SST by running `npx create-sst`

This will create `sst.config.ts` which inside has an AstroSite construct that should look like this

`sst.config.ts`
```ts 
import type { SSTConfig } from "sst";
import { AstroSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "hybrid-project",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new AstroSite(stack, "site");
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;
```

The SST drop-in mode will also edit your `astro.config.mjs` to look like this

`astro.config.mjs`
```ts
import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda";

export default defineConfig({
	output: "server",
	adapter: aws(),
})
```
Now that we have SST and Astro setup we are going to setup 2 pages `./src/pages/index.astro` and `./src/pages/contact.astro` using a starter Layout from the Astro wizard.

`./src/layouts/Layout.astro`
```astro
---
export interface Props {
	title: string;
}

const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="description" content="Astro description">
		<meta name="viewport" content="width=device-width" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta name="generator" content={Astro.generator} />
		<title>{title}</title>
	</head>
	<body>
		<slot />
	</body>
</html>
<style is:global>
	:root {
		--accent: 124, 58, 237;
		--accent-gradient: linear-gradient(45deg, rgb(var(--accent)), #da62c4 30%, white 60%);
	}
	html {
		font-family: system-ui, sans-serif;
		background-color: #F6F6F6;
	}
	code {
		font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
			Bitstream Vera Sans Mono, Courier New, monospace;
	}
</style>
```
`./src/pages/index.astro`
```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="">
  <header>
    <h1>Static Sites with Astro and SST</h1>
  </header>

  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>

  <main>
    <h2>Welcome to the Static Sites with Astro and SST Blog</h2>
    <p>
      This blog focuses on building static sites using Astro, a modern static
      site builder, and SST (Serverless Stack), a framework for building
      serverless apps. You'll find tutorials, guides, and tips to help you get
      started with building static sites with Astro and SST.
    </p>
  </main>

  <footer>&copy; 2023 Your Blog Name. All rights reserved.</footer>
</Layout>
```

`./src/pages/contact.astro`
```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="Welcome to Astro.">
  <main>
    <h2>Contact Us</h2>
    <form action="/api/submit" method="POST">
      <label for="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Your Name"
        required
      />

      <label for="email">Email</label>
      <input
        type="text"
        id="email"
        name="email"
        placeholder="Your Email"
        required
      />

      <label for="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        placeholder="Your Message"
        required></textarea>

      <input type="submit" value="Submit" />
    </form>
  </main>

  <footer>&copy; 2023 Your Blog Name. All rights reserved.</footer>
</Layout>
```

### Switching to  Hybrid

By switching our Astro project from server to hybrid we are going to have all of our pages statically render by default. 

To  turn our Astro  project from the default server-mode to hybrid we need to change our output type

`astro.config.mjs`
```diff
import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda";

export default defineConfig({
-	output: "server",
+	output: "hybrid",
	adapter: aws(),
})
```
This is what our form action is going to POST to.  We will use the  redirect to know that our server is working.

`./src/pages/api/submit.ts`
```ts
import type { APIRoute } from "astro";

export const prerender = false;

export const post: APIRoute = async ({ request, redirect }) => {
	// DO SOMETHING
	return redirect("/");
};

```
The `export const prerender = false;` line is critical since without it  this endpoint would only be available at build-time. This boolean flag will tell the Astro build process that this is a server-side endpoint.

### Fix the Static Routes

Since SST doesn't currently support Astro's hybrid mode we need to make some brute force adjustments to fix our routing.  Cloudfront which is what SST is deploying our site to, does not support [multi-page routing](https://docs.astro.build/en/guides/deploy/aws/#cloudfront-functions-setup).  SST makes the Astro server function the default behavior for our Cloudfront routes which leaves us 3 options.

- Make a cloudfront  index function the default behavior
- Add the cloudfront index function as additional behavior for the individual routes
- Edit our webpage routes to append `index.html`

We cannot do the first option as this would overwrite, and disconnect the SST x Astro backend server that our endpoint would be on.  We can add an index function to each of the routes specifically through cloudfront additional behavior, but then that seems like more effort than what it's worth.

So we are going to go with appending `index.html` to our routes in HTML since it's the simplest solution.

`./src/pages/index.astro`
```diff
<Layout title="">
  <header>
    <h1>Static Sites with Astro and SST</h1>
  </header>

  <nav>
    <ul>
+      <li><a href="/index.html">Home</a></li>
-      <li><a href="/">Home</a></li>
+      <li><a href="/contact/index.html">Contact</a></li>
-      <li><a href="/contact/">Contact</a></li>
    </ul>
  </nav>

  <main>
    <h2>Welcome to the Static Sites with Astro and SST Blog</h2>
    <p>
      This blog focuses on building static sites using Astro, a modern static
      site builder, and SST a framework for building
      serverless apps. You'll find tutorials, guides, and tips to help you get
      started with building static sites with Astro and SST.
    </p>
  </main>

  <footer>&copy; 2023 Your Blog Name. All rights reserved.</footer>
</Layout>
```

Finally we need to point our AstroSite construct to `index.html` which is our root file that is generated after Astros build process

`sst.config.ts`

```diff
import type { SSTConfig } from "sst";
import { AstroSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "hybrid-project",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
-   const site = new AstroSite(stack, "site");
+   const site = new AstroSite(stack, "site", {
+       cdk: {
+         distribution: {
+           defaultRootObject: "index.html",
+         },
+       },
+    });
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;

const site = new AstroSite(stack, "site", {
        cdk: {
          distribution: {
            defaultRootObject: "index.html",
          },
        },
      });
```


### Deploy and Test

We can now run `npx sst deploy --stage dev` to deploy this app to your AWS account.  

SST should output a cloudfront URL after deployment.  Navigate to the URL, and you should then see our index page.  Now navigate to the contact page, and fill out the form with some test information.  Once you hit submit your server-side endpoint should redirect you back to the home page


