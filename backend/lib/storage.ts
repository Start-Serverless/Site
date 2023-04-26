import { Construct } from "constructs";
import {  Stack, StackProps } from "aws-cdk-lib";
import { Table, AttributeType, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";

export class StorageStack extends Stack {
    staticBucket: Bucket
    table: Table

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.staticBucket = new Bucket(this, "StaticFilesBucket", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        this.table = new Table(this, "Contacts", {
            partitionKey: { name: "pk", type: AttributeType.STRING },
            sortKey: { name: "sk", type: AttributeType.STRING },
            stream: StreamViewType.KEYS_ONLY,
        });
    }
}
