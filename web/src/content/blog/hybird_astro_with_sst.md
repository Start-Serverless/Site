---
title: How to Build  Hybrid Astro Sites with SST on AWS
authors: ["Trevor Cohen"]
description: Deploying websites and web applications to AWS can be challenging and SST helps with that.  
tags: [Astro, AWS, SST, Typescript, Web Development, Front End]
publishDate: 2023-06-28
image: "/src/assets/hybrid_astro_site_with_sst.jpg"
draft: true
---
- [Hybrid Astro Site with SST](#hybrid-astro-site-with-sst)

### Hybrid Astro Site with SST

Now that we have our SST and Astro setup we are going to setup a contact page for our project in the  `index.astro` file.  We can setup a simple contact form on our `index.astro`  located in our pages directory that looks something like this.

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="Welcome to Astro.">
  <main>
    <body>
      <header>
        <h1>Static Sites with Astro and SST</h1>
      </header>
    </body>
    <main>
      <h2>Contact Us</h2>
      <form>
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