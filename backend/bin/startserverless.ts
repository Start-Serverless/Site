#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { DomainStack } from "../lib/domain";
import { StorageStack } from "../lib/storage";
import { AppsyncStack } from "../lib/appsync";
import { SiteStack } from "../lib/site";
import { ComputeStack } from "../lib/compute";

const app = new App();
let domain;
domain = new DomainStack(app, "Domain", {});

const storage = new StorageStack(app, "Storage", {});
const appsync = new AppsyncStack(app, "Appsync", {
    table: storage.table,
    certificate: domain?.certificate,
});
const site = new SiteStack(app, "Site", {
    certificate: domain?.certificate,
    zone: domain?.zone,
    graphql: appsync.graphql,
});

// if (isProd) {
//     const compute = new ComputeStack(app, "Compute", {
//         table: storage.table,
//     });
// }
