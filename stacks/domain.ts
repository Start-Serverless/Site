import {
    Certificate,
    CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext } from "sst/constructs";

export function DomainStack({ stack }: StackContext) {
    const hostedZone = new HostedZone(stack, "HostedZone", {
        zoneName: "www.startserverless.dev",
    });

    const certificate = new Certificate(stack, "StartServerlessCert", {
        domainName: "*.startserverless.dev",
        subjectAlternativeNames: ["www.startserverless.dev"],
        validation: CertificateValidation.fromDns(),
    });

    return {
        hostedZone: hostedZone,
        certificate: certificate,
    };
}
