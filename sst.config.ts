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
        };
    },
    stacks(app) {
        app.stack(DomainStack)
            .stack(StorageStack)
            .stack(AppsyncStack)
            .stack(SiteStack)
            .stack(ComputeStack);
    },
} satisfies SSTConfig;
