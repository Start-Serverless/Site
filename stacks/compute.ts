import { StackContext, use, Topic, Queue } from "sst/constructs";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StorageStack } from "./storage.js";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export function ComputeStack({ stack }: StackContext) {
    const table = use(StorageStack);
    const streamPipeRole = new Role(stack, "StreamPipeRole", {
        assumedBy: new ServicePrincipal("pipes.amazonaws.com"),
    });
    table.cdk.table.grantStreamRead(streamPipeRole);

    const topic = new Topic(stack, "Topic", {});
    topic.cdk.topic.addSubscription(
        new EmailSubscription("management-aws@startserverless.dev")
    );

    topic.cdk.topic.grantPublish(streamPipeRole);

    const dlq = new Queue(stack, "DLQ");
    const streamPipe = new CfnPipe(stack, "StreamPipe", {
        roleArn: streamPipeRole.roleArn,
        source: table.cdk.table.tableStreamArn!,
        target: topic.topicArn,
        sourceParameters: {
            dynamoDbStreamParameters: {
                startingPosition: "LATEST",
            },
        },
    });
}
