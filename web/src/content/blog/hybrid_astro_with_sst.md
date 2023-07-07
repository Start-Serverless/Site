---
title: How to Build  Hybrid Astro Sites with SST on AWS
authors: ["Trevor Cohen"]
description: Deploying websites and web applications to AWS can be challenging and SST helps with that.  
tags: [Astro, AWS, SST, Typescript, Web Development, Front End]
publishDate: 2023-06-28
image: "/src/assets/hybrid_astro_site_with_sst.jpg"
draft: true
---

### Introduction

### Overview

Being able to jump-start your web development seems to be a core focus for the AWS framework SST allowing you to quickly build and deploy various web frameworks as well as the AWS infrastructure to support them.

In this post we are going to start with SST drop-in mode, and show how to modify for a hybrid site.

[Here is the source code ](https://github.com/Start-Serverless/AstroSST)
### Prerequisites
 
 Verify that you have these  prerequisites from the [SST docs for Astro](https://docs.sst.dev/start/astro#prerequisites) which require at least Node.js 16 and npm 7 and your AWS credentials configured locally.
 ### Setup

First we are going to build our Astro project by using the `npx create-astro@latest` command.   

Pick your preferences on the cli prompts.  For this post our project is called "hybrid-project".

The fastest way to get started with SST is to use their [drop in mode](https://docs.sst.dev/what-is-sst#drop-in-mode).  This will allow SST to quickly detect that we have an Astro project, and setup initial configuration for us.  We can add SST by running `npx create-sst`

This will create `sst.config.ts` which inside has an AstroSite construct that should look like this

`sst.config.ts`
```ts 
import type { SSTConfig } from "sst";
import { AstroSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "hbyrid-project",
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


Now that we have our SST and Astro setup, we can now an HTML form in our `./src/pages/index.astro` we are going to have our from submit a POST request which will be received by our server
```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="Welcome to Astro.">
  <main>
    <body>
      <header>
        <h1>Hybrid Sites with Astro and SST</h1>
      </header>
    </body>
    <main>
      <h2>Contact Us</h2>
      <form method="POST">
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
  </main>
</Layout>
```