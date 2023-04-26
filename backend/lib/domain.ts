import { Construct } from "constructs";
import {  Stack, StackProps } from "aws-cdk-lib";
import {
    Certificate,
    CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { EmailIdentity, Identity } from "aws-cdk-lib/aws-ses";

export interface DomainStackProps extends StackProps {
    isProd: boolean
}

export class DomainStack extends Stack {
    zone: HostedZone;
    certificate: Certificate

    constructor(scope: Construct, id: string, props: DomainStackProps) {
        super(scope, id, props);

        if (props.isProd) {
            this.zone = new HostedZone(this, "HostedZone", {
                zoneName: "www.startserverless.dev",
            });

            this.certificate = new Certificate(this, "StartServerlessCert", {
                domainName: "*.startserverless.dev",
                subjectAlternativeNames: ["www.startserverless.dev"],
                validation: CertificateValidation.fromDns(),
            });
        }

        const emailIdentity = new EmailIdentity(this, 'Identity', {
            identity: Identity.publicHostedZone(this.zone)
        })
    }
}
