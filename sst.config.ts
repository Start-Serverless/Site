import { SSTConfig } from "sst";
import { DomainStack } from "./stacks/domain";
import { StorageStack } from "./stacks/storage";
import { AppsyncStack } from "./stacks/appsync";
import { SiteStack } from "./stacks/site";
import { ComputeStack } from "./stacks/compute";

export default {
    config(_input) {
        return {
            name: "start-serverless",
            region: "us-east-1",
            profile: "dev",
        };
    },
    stacks(app) {
        if (app.stage == "prod") {
            app.stack(DomainStack);
        }
        app.stack(StorageStack)
            .stack(AppsyncStack)
            .stack(SiteStack)
            .stack(ComputeStack);
    },
} satisfies SSTConfig;
