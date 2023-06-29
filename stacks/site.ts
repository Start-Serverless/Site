import { DomainStack } from "./domain";
import { StackContext, AstroSite, use } from "sst/constructs";

export function SiteStack({ app, stack }: StackContext) {
    const { certificate, hostedZone } =
        app.stage == "prod"
            ? use(DomainStack)
            : { certificate: undefined, hostedZone: undefined };

    const site = new AstroSite(stack, "Site", {
        path: "web/",
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
