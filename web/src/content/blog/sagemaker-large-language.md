---
title: How to Deploy Large Language Models on AWS Using TypeScript and CDK
authors: ["Trevor Cohen"]
description:  Learn how to deploy the HuggingFace Falco-07B model to AWS using Sagemaker, CDK, and Typescript 
tags: [ AWS, CDK, Typescript, Sagemaker, Machine Learning, HuggingFace]
publishDate: 2023-09-18
image: "/src/assets/sagemaker.jpg"
draft: true
---

### Introduction
For web developers seeking to add real-time language understand and generation we can use Amazon Sagemaker and deploy a large language model of our choice using Typescript and CDK.  No Python required!

### Overview
We are going to demonstrate how we can deploy a HuggingFace model Falcon-7B using Deep Learning Containers provided by AWS to have a real time inference endpoint.  We will define these resources using Typescript and AWS CDK.  

### Prequisites
You will need the following installed

* Node.js 14.15 or later
* AWS CDK v2 (We're specifically using v2.96.2)

### Setup
We're going to create a new directory called sagemaker and navigate to it

```bash
mkdir sagemaker
cd sagemaker
```

Now we are going to create a new CDK project

```bash
cdk init app --language typescript
```

This is going to scaffold a CDK project where we can focus on the file  `./bin/sagemaker-stack.ts`
### Deep Learning Containers with Hugging Face

When it comes to deploying models we need to specify a container for the model to run in.  Luckily AWS can provide us with Deep Learning Containers designed for Pytorch, HuggingFace, and Text Generation Inference (TGI)

To take advantage of the Deep Learning Container we need to install sagemaker-alpha for CDK.

```bash
npm i @aws-cdk/aws-sagemaker-alpha
```

To pull the image we need to have the repository name and tag.  We can find a [list of containers here](https://github.com/aws/deep-learning-containers/blob/master/available_images.md#huggingface-text-generation-inference-containers)

We are going to use version 1.0.3 of [Text Generation Interface (TGI)](https://github.com/huggingface/text-generation-inference)  and 2.0.1 of PyTorch.  For the repository name we are using  huggingface-pytorch-tgi-inference

We can define our `./bin/sagemaker-stack.ts` file to look like this.


```ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";

export class SagemakerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   const tgiVersion = "1.0.3";
   const pytorchVersion = "2.0.1";
   const repositoryName = "huggingface-pytorch-tgi-inference";
   const tag = `${pytorchVersion}-tgi${tgiVersion}-gpu-py39-cu118-ubuntu20.04`;
   const containerImage = sagemaker.ContainerImage.fromDlc(
     repositoryName,
     tag
    );
  }
}
```

### Defining the Sagemaker Model

Now that we have a container we can define a Sagemaker model where we can specify our environment variables for the container which contain the name of the HuggingFace model, and the number of GPUs we we are dedicating to the model.

```ts
const model = new sagemaker.Model(this, "FalconModel", {
	containers: [
		{
			image: containerImage,
			environment: {
				HF_MODEL_ID: "tiiuae/falcon-7b",
				SM_NUM_GPUS: "1",
			},
		},
	],
	modelName: "FalconMLSummary",
});
```

### Creating the Inference Endpoint


