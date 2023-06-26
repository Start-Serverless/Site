import { DomainStack } from "./domain";
import { StackContext, AstroSite, use } from "sst/constructs";

export function SiteStack({ stack }: StackContext) {
    const { certificate, hostedZone } = use(DomainStack);
    //     const { appsync } = use(AppsyncStack);
    const site = new AstroSite(stack, "Site", {
        path: "web/",
        customDomain: {
            domainName: "www.startserverless.dev",
            isExternalDomain: true,
            cdk: {
                certificate: certificate,
                hostedZone: hostedZone,
            },
        },
    });
}
