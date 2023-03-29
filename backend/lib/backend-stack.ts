import { Stack, StackProps } from "aws-cdk-lib";
import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda"
import { Bucket, BlockPublicAccess  } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";
import * as path from "path";

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

		const siteBucket = new Bucket(this, "StaticFilesBucket", {
			blockPublicAccess:  BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true
		})

		const server = new Function(this, "SSRFunction", {
			memorySize: 512,
			runtime: Runtime.NODEJS_18_X,
			code: Code.fromAsset(path.resolve("../frontend/dist/lambda/")),
			handler: "entry.handler"
		})

		const originAccessIdentity =  new cloudfront.OriginAccessIdentity(this, "SSR-OIA")
		siteBucket.grantRead(originAccessIdentity)

		const astroDistribution = new cloudfront.Distribution(this, "Distribution", {
			defaultBehavior: {
				origin: new S3Origin(siteBucket, {
					originAccessIdentity: originAccessIdentity,
				}),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
				cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
				compress: true,
				edgeLambdas: [
					{
						includeBody: true,
						eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
						functionVersion: server.currentVersion
					}
				]
			},	
			// domainNames: ['startserverless.dev'],
		})

		const deployment = new BucketDeployment(this, "AstroDeployment", {
			sources: [Source.asset('../frontend/dist/client/')],
			destinationBucket: siteBucket,
			distribution: astroDistribution
		})

        const table = new Table(this, "Contacts", {
            partitionKey: { name: "pk", type: AttributeType.STRING },
            sortKey: { name: "sk", type: AttributeType.STRING },
            stream: StreamViewType.KEYS_ONLY,
        });

        const api = new appsync.GraphqlApi(this, "WebsiteAPI", {
            name: "WebsiteApi",
            schema: appsync.SchemaFile.fromAsset(
                path.join(__dirname, "graphql/schema.graphql")
            ),
            logConfig: {
                fieldLogLevel: appsync.FieldLogLevel.ALL,
            },
        });

        const tableDataSource = api.addDynamoDbDataSource(
            "contactTable",
            table
        );

		tableDataSource.createResolver("SubmitContact", {
			typeName: "Mutation",
			fieldName: 'submitContact',
			requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
				new appsync.PrimaryKey( 
					new appsync.Assign("pk", '"CONTACT"'), 
					new appsync.Assign("sk", '"EMAIL#$!{input.email}"')
				),
				appsync.Values.projecting("input")
			),
			responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
		})
    }
}
