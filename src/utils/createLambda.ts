import { Duration } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export type NodejsFunctionOpts = {
    name: string,
    handlerPath: string
    policy?: PolicyStatement[]
}

export const createLambda = (scope: Construct, opts: NodejsFunctionOpts, env?: Record<string, any>): NodejsFunction => {
    return new NodejsFunction(scope, opts.name, {
        runtime: Runtime.NODEJS_18_X,
        memorySize: 1024,
        timeout: Duration.seconds(5),
        entry: opts.handlerPath,
        handler: 'handler',
        initialPolicy: opts.policy,
        environment: env
    });
}