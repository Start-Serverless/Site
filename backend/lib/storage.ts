import { Construct } from "constructs";
import {  Stack, StackProps } from "aws-cdk-lib";
import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb";

export class StorageStack extends Stack {
    table: Table

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.table = new Table(this, "Contacts", {
            partitionKey: { name: "pk", type: AttributeType.STRING },
            sortKey: { name: "sk", type: AttributeType.STRING },
            stream: StreamViewType.KEYS_ONLY,
        });
    }
}
