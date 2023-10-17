---
title: How to use Amazon Bedrock in your APIs with SST
authors: ["Trevor Cohen"]
description:  Learn how to create an API endpoint that utilizes text-generation with Amazon Bedrock.
tags: [Bedrock, AWS, SST, Typescript, Web Development, Api Gateway, Serverless]
publishDate: 2023-10-16
image: "/src/assets/sst-bedrock.jpg"
draft: false
---
### Introduction
AWS recently released their  fully managed service for deep learning models, Amazon Bedrock.  Now you can [access these models](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-service.html#models-supported)  through an API, in a serverless, pay-per-use model. 

You can find the [github repository here]()

### Overview
We are going to create a new standalone SST project where we are going to write a lambda function that can take in a prompt from our API Gateay.  It will then send this prompt to Amazon Bedrock where we are going to use the Cohere Command model, and return the response back to the client.

[SST is is a framework](https://docs.sst.dev/what-is-sst) that makes it easy to build modern full-stack applications on AWS.

### Prerequisites

We will need to meet the prequisites for SST, and requesting AWS access to Bedrock models

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

Next, we are going to define our lambda function that is located in 
`packages/functions/src/lambda.ts`.  

Our inputBody is going to match the inference parameters for the [cohere.command-text-v14 model](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html#model-parameters-cohere).

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

### Deploy

We will now deploy our project using `npx sst dev`.  Once deployed you should see an output with API Gateway endpoint, and we can take that endpoint, and invoke it like this

```bash
curl --location 'https://i5prdhoo3d.execute-api.us-east-1.amazonaws.com/bedrock' \
--header 'Content-Type: application/json' \
--data '{
    "prompt": "Hello"
}'
```

and you should receive a response that is similar to this.

`Hi, how can I help you today?`


Bedrock seems to be a great way to quicky add text generation to your APIs with minimal overhead. If you want to talk more about serverless please reach out!
  