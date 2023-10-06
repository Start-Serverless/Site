import { SSTConfig } from "sst";
import { DomainStack } from "./stacks/domain.js";
import { StorageStack } from "./stacks/storage.js";
import { ApiStack } from "./stacks/api.js";
import { SiteStack } from "./stacks/site.js";
import { ComputeStack } from "./stacks/compute.js";

export default {
    config(_input) {
        return {
            name: "start-serverless",
            region: "us-east-1",
            profile: _input.stage === "prod" ? "prod" : "dev",
        };
    },
    stacks(app) {
        if (app.stage == "prod") {
            app.stack(DomainStack);
        }
        app.stack(StorageStack)
            .stack(ApiStack)
            .stack(SiteStack)
            .stack(ComputeStack);
    },
} satisfies SSTConfig;
