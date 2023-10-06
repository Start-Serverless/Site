import { StackContext, use } from "sst/constructs";
import { StorageStack } from "./storage.js";
import { DomainStack } from "./domain.js";
import {
    AwsIntegration,
    RestApi,
    Cors,
    LogGroupLogDestination,
    AccessLogFormat,
    PassthroughBehavior,
} from "aws-cdk-lib/aws-apigateway";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export function ApiStack({ app, stack }: StackContext) {
    const table = use(StorageStack);
    const { certificate } =
        app.stage == "prod" ? use(DomainStack) : { certificate: undefined };

    const role = new Role(stack, "ApiRole", {
        assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    table.cdk.table.grantWriteData(role);

    const putItem = new AwsIntegration({
        service: "dynamodb",
        action: "PutItem",
        options: {
            passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
            credentialsRole: role,
            integrationResponses: [
                {
                    statusCode: "200",
                    responseTemplates: {
                        "application/json": JSON.stringify({
                            message: "Contact created!",
                        }),
                    },
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin":
                            "'*'",
                    },
                },
                {
                    selectionPattern: "400",
                    statusCode: "400",
                    responseTemplates: {
                        "application/json": `{
							"error": "Bad input!"
						}`,
                    },
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin":
                            "'*'",
                    },
                },
                {
                    selectionPattern: "5\\d{2}",
                    statusCode: "500",
                    responseTemplates: {
                        "application/json": `{
							"error": "Internal Service Error!"
						}`,
                    },
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin":
                            "'*'",
                    },
                },
            ],
            requestTemplates: {
                "application/json": `
				{
					"Item": {
					  "pk": {
						"S": "CONTACT"
					  },
					  "sk": {
						"S": "EMAIL#$input.path('$.email')"
					  },
					  "name": {
						"S": "$input.path('$.name')"
					  },
					  "email": {
						"S": "$input.path('$.email')"
					  },
					  "phone": {
						"S": "$input.path('$.phone')"
					  }
					},
					"TableName": "${table.tableName}"
				  }`,
            },
        },
    });

    const logGroup = new LogGroup(stack, "Logs", {});

    const api = new RestApi(stack, "Api", {
        deployOptions: {
            accessLogDestination: new LogGroupLogDestination(logGroup),
            accessLogFormat: AccessLogFormat.custom(
                '{"requestTime":"$context.requestTime","requestId":"$context.requestId","httpMethod":"$context.httpMethod","path":"$context.path","resourcePath":"$context.resourcePath","status":$context.status,"responseLatency":$context.responseLatency}'
            ),
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: Cors.ALL_METHODS,
            allowHeaders: Cors.DEFAULT_HEADERS.concat(["x-api-key"]),
        },
    });
    const contact = api.root.addResource("contact");

    contact
        .addMethod("POST", putItem, {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin":
                            true,
                    },
                },
            ],
        })
        .addMethodResponse({
            statusCode: "200",
        });

    // api.root.addMethod(
    //     "ANY",
    //     new MockIntegration({
    //         integrationResponses: [{ statusCode: "200" }],
    //         passthroughBehavior: PassthroughBehavior.NEVER,
    //         requestTemplates: {
    //             "application/json": '{"statusCode": 200}',
    //         },
    //     }),
    //     {
    //         methodResponses: [{ statusCode: "200" }],
    //     }
    // );

    return {
        api,
    };
}
