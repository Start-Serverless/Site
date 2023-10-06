import { DomainStack } from "./domain.js";
import { ApiStack } from "./api.js";
import { StackContext, AstroSite, use } from "sst/constructs";

export function SiteStack({ app, stack }: StackContext) {
    const { certificate, hostedZone } =
        app.stage == "prod"
            ? use(DomainStack)
            : { certificate: undefined, hostedZone: undefined };
    const { api } = use(ApiStack);

    const site = new AstroSite(stack, "Site", {
        path: "web/",
        environment: {
            PUBLIC_API_URL: api.url,
        },
        cdk: {
            distribution: {
                defaultRootObject: "index.html",
            },
        },
        customDomain:
            app.stage == "prod"
                ? {
                      domainName: "www.startserverless.dev",
                      isExternalDomain: true,
                      cdk: {
                          certificate: certificate,
                          hostedZone: hostedZone,
                      },
                  }
                : undefined,
    });
}
