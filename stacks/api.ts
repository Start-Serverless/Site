import { StackContext, Api, use } from "sst/constructs";
import { HttpIntegrationSubType } from "aws-cdk"
import { StorageStack } from "./storage";
import { DomainStack } from "./domain";

export function ApiStack({ app, stack }: StackContext) {
    const table = use(StorageStack);
    const { certificate } =
        app.stage == "prod" ? use(DomainStack) : { certificate: undefined };
    const api = new Api(stack, "Api", {
		routes: {
			"POST /submit-contact": {
				type: "aws",
				cdk: {
					integration: {
						subtype:
					}
				}
		}
	});

    return {};
}
