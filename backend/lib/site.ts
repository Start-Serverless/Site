import { Construct } from "constructs";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ARecord, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import * as path from "path";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";

export interface SiteStackProps extends StackProps {
    certificate?: ICertificate;
    zone?: IHostedZone;
    isProd: boolean;
}

export class SiteStack extends Stack {
    constructor(scope: Construct, id: string, props: SiteStackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, "FrontEndBucket", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        const server = new Function(this, "SSRFunction", {
            memorySize: 512,
            runtime: Runtime.NODEJS_18_X,
            code: Code.fromAsset(path.resolve("../frontend/dist/lambda/")),
            handler: "entry.handler",
        });

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(
            this,
            "SSR-OIA"
        );
        bucket.grantRead(originAccessIdentity);

        const astroDistribution = new cloudfront.Distribution(
            this,
            "Distribution",
            {
                domainNames: props.isProd
                    ? ["www.startserverless.dev"]
                    : undefined,
                certificate: props?.certificate,
                defaultBehavior: {
                    cachePolicy: new cloudfront.CachePolicy(this, "Cache", {
                        defaultTtl: Duration.hours(12),
                    }),
                    origin: new S3Origin(bucket, {
                        originAccessIdentity: originAccessIdentity,
                    }),
                    responseHeadersPolicy:
                        cloudfront.ResponseHeadersPolicy
                            .CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                    originRequestPolicy:
                        cloudfront.OriginRequestPolicy
                            .USER_AGENT_REFERER_HEADERS,
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachedMethods:
                        cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
                    compress: true,
                    edgeLambdas: [
                        {
                            includeBody: true,
                            eventType:
                                cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                            functionVersion: server.currentVersion,
                        },
                    ],
                },
                errorResponses: [
                    {
                        httpStatus: 404,
                        responsePagePath: "/404",
                    },
                ],
            }
        );

        const deployment = new BucketDeployment(this, "AstroDeployment", {
            sources: [Source.asset("../frontend/dist/client/")],
            destinationBucket: bucket,
            distribution: astroDistribution,
        });

        if (props.isProd) {
            new ARecord(this, "AliasRecord", {
                zone: props.zone!,
                target: RecordTarget.fromAlias(
                    new CloudFrontTarget(astroDistribution)
                ),
            });
        }
    }
}
