import { Stack, StackProps } from "aws-cdk-lib";
import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import * as iam from "aws-cdk-lib/aws-iam";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";
import * as path from "path";

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new Table(this, "Contacts", {
            partitionKey: { name: "pk", type: AttributeType.STRING },
            sortKey: { name: "sk", type: AttributeType.STRING },
            stream: StreamViewType.KEYS_ONLY,
        });

        const api = new appsync.GraphqlApi(this, "WebsiteAPI", {
            name: "Websiteapi",
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

        tableDataSource.createResolver("MutationSubmitcontact", {
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

        // const sourcePolicy
    }
}
