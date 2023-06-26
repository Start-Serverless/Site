import { StackContext, use, Topic } from "sst/constructs";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StorageStack } from "./storage";

export function ComputeStack({ stack }: StackContext) {
    const table = use(StorageStack);
    const streamPipeRole = new Role(stack, "StreamPipeRole", {
        assumedBy: new ServicePrincipal("pipes.amazonaws.com"),
    });
    const topic = new Topic(stack, "Topic", {
        // subscribers: {
        //     emailNotifications: "management-aws@startserverless.dev",
        // },
    });
    table.attachPermissions([streamPipeRole]);
    topic.cdk.topic.grantPublish(streamPipeRole);
    // const streamPipe = new CfnPipe(stack, "StreamPipe", {
    //     roleArn: streamPipeRole.roleArn,
    //     source: table.cdk.table.tableStreamArn!,
    //     target: topic.topicArn,
    //     sourceParameters: {
    //         dynamoDbStreamParameters: {
    //             startingPosition: "LATEST",
    //         },
    //     },
    // });
}
