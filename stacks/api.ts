import { StackContext, use } from "sst/constructs";
import { StorageStack } from "./storage.js";
import { DomainStack } from "./domain.js";
import {
    AwsIntegration,
    RestApi,
    Cors,
    LogGroupLogDestination,
    AccessLogFormat,
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
            credentialsRole: role,
            integrationResponses: [
                {
                    statusCode: "200",
                    responseTemplates: {
                        "application/json": '{ "message": "Contact created!" }',
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
                },
                {
                    selectionPattern: "5\\d{2}",
                    statusCode: "500",
                    responseTemplates: {
                        "application/json": `{
							"error": "Internal Service Error!"
						}`,
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
    });
    const contact = api.root.addResource("contact");
    contact.addCorsPreflight({
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
    });

    contact.addMethod("POST", putItem, {}).addMethodResponse({
        statusCode: "200",
    });

    return {
        api,
    };
}
