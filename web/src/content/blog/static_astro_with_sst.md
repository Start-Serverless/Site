---
title: How to use Static Pages with Astro and SST on AWS
authors: ["Trevor Cohen"]
description: Deploying websites and web applications to AWS can be challenging and SST helps with that.  
tags: [Astro, AWS, SST, Typescript, Web Development, Front End]
publishDate: 2023-06-28
image: "/src/assets/static-astro-sst.jpg"
draft: true
---

### Introduction

Being able to jump-start your web development seems to be a core focus for the AWS framework SST allowing you to quickly build and deploy various web frameworks as well as the AWS infrastructure to support them.

In this blog we will cover starting your Astro project, and then configuring it to meet your different static rendering needs.

### Prerequisites
 
 Verify that you have these  prerequisites from the [SST docs for Astro](https://docs.sst.dev/start/astro#prerequisites) which require at least Node.js 16 and npm 7 and your AWS credentials configured locally.

 ### Getting Started

First we are going to build our Astro project by using the `npx create-astro@latest` command.  You can specify "astro" as your project name.  For this post we chose "a few best practices" for our project setup,  yes for npm dependencies, yes for git, and strictest typescript.  

The fastest way to get started with SST is to use their [drop in mode](https://docs.sst.dev/what-is-sst#drop-in-mode).  This will allow SST to quickly detect that we have an Astro project, and setup initial configuration for us.  We can add SST by running `npx create-sst`


