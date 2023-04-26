#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DomainStack } from '../lib/domain';
import { StorageStack } from '../lib/storage';
import { AppsyncStack } from '../lib/appsync';
import { SiteStack } from '../lib/site';

const app = new cdk.App();
const isProd =
            process.env.STACK_BUILD_TARGET_ACCOUNT === "prod" ? true : false;
const domain = new DomainStack(app, "Domain", {isProd: isProd})
const storage = new StorageStack(app, "Storage", {})
const appsync = new AppsyncStack(app, "Appsync", {table: storage.table})
const site = new SiteStack(app, "Site", {
    bucket: storage.staticBucket,
    certificate: domain.certificate,
    zone: domain.zone,
    isProd: isProd
})

