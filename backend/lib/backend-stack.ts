import { Stack, StackProps } from "aws-cdk-lib";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";
import * as path from "path";

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new Table(this, "Contacts", {
            partitionKey: { name: "pk", type: AttributeType.STRING },
            sortKey: { name: "sk", type: AttributeType.STRING },
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

        api.addDynamoDbDataSource("contactTable", table);
    }
}
