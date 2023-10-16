---
title: How to use Amazon Bedrock in your APIs with SST
authors: ["Trevor Cohen"]
description:  Learn how to create an API endpoint that utilizes text-generation with Amazon Bedrock.
tags: [Bedrock, AWS, SST, Typescript, Web Development, Api Gateway, Serverless]
publishDate: 2023-10-12
image: "/src/assets/sst-bedrock.jpg"
draft: true
---
### Introduction
AWS recently released their  fully managed service for deep learning models, Amazon Bedrock.  Now you can [access these](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-service.html#models-supported) models through an API, in a serverless, pay-per-use model. 

### Overview
We are going to create a new standalone SST project where we are going to write a lambda function that can take in a prompt from our API Gateay.  It will then send this prompt to Amazon Bedrock where we are going to use the Cohere Command model, and return the response back to the client.

### Prequisites
We will need to meet the prequisites for SST, as well as requesting access to Bedrock models

* Nodejs. 16.6 or higher
* npm 7
* [Request Bedrock Model access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html#add-model-access)

### Setup

We will create a new SST project  and make sure our dependencies are installed

```bash
npx create-sst@latest . 
npm i
```

### Bedrock API

We are going to be using the InvokeModel action for the Bedrock API.  This will allow us to specify a base model id that is supported by Bedrock, and run inference which allows us to give it a prompt, and receive a response.  You can find a [list of base model ids here](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html).  Our example is going to use `cohere.command-text-v14` model id.

Depending on which model you decide to use the [inference parameters](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html) can vary. 

## SST

In our SST stack file `MyStack.ts` we are going to have an API defined with a POST route, and adding permissions to our lambda function for Bedrock InvokeModel 

```ts
import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        permissions: ["bedrock:InvokeModel"],
      },
    },
    routes: {
      "POST /bedrock": "packages/functions/src/lambda.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
```

Next, we are going to define our lambda function that is located in `packages/functions/src/lambda.ts`

```ts
import { ApiHandler } from "sst/node/api";
import {
  BedrockRuntime,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntime();

export const handler = ApiHandler(async (_evt) => {
  if (_evt.body == undefined) {
    return { statusCode: 400, body: "No valid input" };
  }

  const prompt = JSON.parse(_evt.body!)["prompt"];
  const inputBody = {
    prompt: prompt,
    max_tokens: 100,
    temperature: 0.8,
    return_likelihoods: "NONE",
  };

  const command = new InvokeModelCommand({
    body: JSON.stringify(inputBody),
    contentType: "application/json",
    accept: "*/*",
    modelId: "cohere.command-text-v14",
  });

  const response = await client.send(command);
  const output = Buffer.from(response.body).toString("utf8");
  const body = JSON.parse(output);
  const [generation] = body.generations;
  const text = generation.text;

  return {
    statusCode: 200,
    body: text,
  };
});
```

  