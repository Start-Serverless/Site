import * as path from "path";
import { Construct } from "constructs";
import { CfnOutput, Duration, Expiration, Stack, StackProps } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";

export interface AppsyncStackProps extends StackProps {
    table: ITable;
    certificate: ICertificate;
}

export class AppsyncStack extends Stack {
    graphql: appsync.GraphqlApi;

    constructor(scope: Construct, id: string, props: AppsyncStackProps) {
        super(scope, id, props);

        this.graphql = new appsync.GraphqlApi(this, "WebsiteAPI", {
            name: "WebsiteApi",
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: Expiration.after(Duration.days(365)),
                    },
                },
            },
            schema: appsync.SchemaFile.fromAsset(
                path.join(__dirname, "graphql/schema.graphql")
            ),
            domainName: {
                certificate: props.certificate!,
                domainName: "api.startserverless.dev",
            },
            logConfig: {
                fieldLogLevel: appsync.FieldLogLevel.ALL,
            },
        });

        const tableDataSource = this.graphql.addDynamoDbDataSource(
            "contactTable",
            props.table
        );

        tableDataSource.createResolver("SubmitContact", {
            typeName: "Mutation",
            fieldName: "submitContact",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
                new appsync.PrimaryKey(
                    new appsync.Assign("pk", '"CONTACT"'),
                    new appsync.Assign("sk", '"EMAIL#$!{input.email}"')
                ),
                appsync.Values.projecting("input")
            ),
            responseMappingTemplate:
                appsync.MappingTemplate.dynamoDbResultItem(),
        });

        new CfnOutput(this, 'GraphQLAPIID', {
            value: this.graphql.apiId,
        })

        new CfnOutput(this, 'GraphQLURL', {
            value: this.graphql.graphqlUrl,
        })

        new CfnOutput(this, 'GraphQLAPIKey' {
            value: this.graphql.apiKey || ''
        })
    }
}
