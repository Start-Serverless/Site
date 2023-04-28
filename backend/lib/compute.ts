import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export interface ComputeStackProps extends StackProps {
    table: Table;
}

export class ComputeStack extends Stack {
    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        const streamPipeRole = new iam.Role(this, "StreamPipeRole", {
            assumedBy: new iam.ServicePrincipal("pipes.amazonaws.com"),
        });

        const bus = new EventBus(this, "Bus", {});
        bus.grantPutEventsTo(streamPipeRole);

        const streamPipe = new CfnPipe(this, "StreamPipe", {
            roleArn: streamPipeRole.roleArn,
            source: props.table.tableStreamArn!,
            target: bus.eventBusArn,
        });

        const rule = new Rule(this, "NewLeadRule", {
            eventBus: bus,
        });

        const emailNewLeads = new Function(this, "EmailNewLeadsFunction", {
            memorySize: 512,
            runtime: Runtime.NODEJS_18_X,
            code: Code.fromAsset(path.resolve("/src/emailNewLeads.ts")),
            handler: "entry.handler",
        });

        const dlq = new Queue(this, "DLQ");

        rule.addTarget(
            new LambdaFunction(emailNewLeads, {
                deadLetterQueue: dlq,
                retryAttempts: 2,
            })
        );
    }
}
