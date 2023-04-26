import * as path from "path";
import { Construct } from "constructs";
import {  Stack, StackProps } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import * as appsync from "aws-cdk-lib/aws-appsync";

export interface AppsyncStackProps extends StackProps {
    table: ITable
}

export class AppsyncStack extends Stack {
    constructor(scope: Construct, id: string, props: AppsyncStackProps) {
        super(scope, id, props);

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
    }
}
