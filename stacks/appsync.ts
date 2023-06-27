import {
    MappingTemplate,
    PrimaryKey,
    Assign,
    Values,
    AuthorizationType,
} from "aws-cdk-lib/aws-appsync";
import { Expiration, Duration } from "aws-cdk-lib/core";
import { StackContext, AppSyncApi, use } from "sst/constructs";
import { StorageStack } from "./storage";
import { DomainStack } from "./domain";

export function AppsyncStack({ stack }: StackContext) {
    const table = use(StorageStack);
    const { certificate } = use(DomainStack);

    const api = new AppSyncApi(stack, "WebsiteAPI", {
        schema: "packages/functions/src/graphql/schema.graphql",
        cdk: {
            graphqlApi: {
                authorizationConfig: {
                    defaultAuthorization: {
                        authorizationType: AuthorizationType.API_KEY,
                        apiKeyConfig: {
                            expires: Expiration.after(Duration.days(365)),
                        },
                    },
                },
                domainName: {
                    certificate: certificate,
                    domainName: "api.startserverless.dev",
                },
            },
        },
        dataSources: {
            tableDS: {
                type: "dynamodb",
                table: table,
            },
        },
        resolvers: {
            "Mutation submitContact": {
                dataSource: "tableDS",
                cdk: {
                    resolver: {
                        requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
                            new PrimaryKey(
                                new Assign("pk", '"CONTACT"'),
                                new Assign("sk", '"EMAIL#$!{input.email}"')
                            ),
                            Values.projecting("input")
                        ),
                        responseMappingTemplate:
                            MappingTemplate.dynamoDbResultItem(),
                    },
                },
            },
        },
    });

    return {
        appsync: api,
    };
}
