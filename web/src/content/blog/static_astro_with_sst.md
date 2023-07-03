---
title: How to Build Static  Astro Sites with SST on AWS
authors: ["Trevor Cohen"]
description: Learn how to build static Astro sties with SST on AWS
tags: [Astro, AWS, SST, Typescript, Web Development, Front End]
publishDate: 2023-06-28
image: "/src/assets/static-astro-sst.jpg"
draft: true
---
### Overview

Being able to jump-start your web development seems to be a core focus for the AWS framework SST allowing you to quickly build and deploy various web frameworks as well as the AWS infrastructure to support them.

In this post we are going to start with SST drop-in mode, and show how to modify for a static site.

You can find the source code [here](https://github.com/Start-Serverless/AstroSST)
### Prerequisites
 
 Verify that you have these  prerequisites from the [SST docs for Astro](https://docs.sst.dev/start/astro#prerequisites) which require at least Node.js 16 and npm 7 and your AWS credentials configured locally.
 ### Setup

First we are going to build our Astro project by using the `npx create-astro@latest` command.   

Pick your preferences on the cli prompts.  For this post our project is called "static-project".

The fastest way to get started with SST is to use their [drop in mode](https://docs.sst.dev/what-is-sst#drop-in-mode).  This will allow SST to quickly detect that we have an Astro project, and setup initial configuration for us.  We can add SST by running `npx create-sst`

This will create `sst.config.ts` which inside has an AstroSite construct that should look like this

`sst.config.ts`
```ts 
import type { SSTConfig } from "sst";
import { AstroSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "static-project",
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
### Static Astro Site with SST
Next, we are going to remove the server-side adapter to restore Astro to it's defaults static mode.  To switch our Astro project from  server mode to static mode we need to edit our `astro.config.mjs` file. 


`astro.config.mjs`
```diff
import { defineConfig } from "astro/config";
- import aws from "astro-sst/lambda";

export default defineConfig({
- output: "server",
- adapter: aws(),
})
```
Now we are going to switch the SST Constructions from AstroSite to StaticSite, and add our AWS profile 

`sst.config.ts`
```diff
import type { SSTConfig } from "sst";
- import { AstroSite } from "sst/constructs";
+ import { StaticSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "astro-static-sst",
      region: "us-east-1",
+     profile: "dev",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
-   const site = new AstroSite(stack, "site");
+   const site = new StaticSite(stack, "site", {
+      buildOutput: "dist",
+   });
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;
```

Just run `npx sst deploy --stage dev` to deploy this app to your AWS account, and now you have a static Astro site. 

