import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import * as iam from "aws-cdk-lib/aws-iam";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export interface ComputeStackProps extends StackProps {
    table: Table;
}

export class ComputeStack extends Stack {
    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        const streamPipeRole = new iam.Role(this, "StreamPipeRole", {
            assumedBy: new iam.ServicePrincipal("pipes.amazonaws.com"),
        });
        props.table.grantStreamRead(streamPipeRole);

        const topic = new Topic(this, "Topic");
        topic.grantPublish(streamPipeRole);

        const streamPipe = new CfnPipe(this, "StreamPipe", {
            roleArn: streamPipeRole.roleArn,
            source: props.table.tableStreamArn!,
            target: topic.topicArn,
        });

        topic.addSubscription(
            new EmailSubscription("management-aws@startserverless.dev")
        );
    }
}
