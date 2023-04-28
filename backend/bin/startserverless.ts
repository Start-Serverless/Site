#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { DomainStack } from "../lib/domain";
import { StorageStack } from "../lib/storage";
import { AppsyncStack } from "../lib/appsync";
import { SiteStack } from "../lib/site";
import { ComputeStack } from "../lib/compute";

const app = new App();
const isProd = process.env.STACK_BUILD_TARGET_ACCOUNT === "prod" ? true : false;
let domain;
if (isProd) {
    domain = new DomainStack(app, "Domain", {});
}

const storage = new StorageStack(app, "Storage", {});
const appsync = new AppsyncStack(app, "Appsync", {
    table: storage.table,
    certificate: domain?.certificate,
    isProd: isProd,
});
const site = new SiteStack(app, "Site", {
    certificate: domain?.certificate,
    zone: domain?.zone,
    graphql: appsync.graphql,
    isProd: isProd,
});

// if (isProd) {
//     const compute = new ComputeStack(app, "Compute", {
//         table: storage.table,
//     });
// }
