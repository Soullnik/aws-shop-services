import { Construct } from "constructs";
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { ImportService } from "../src/import";
import { createLambda } from "../src/utils/createLambda";

export class ImportServiceStack extends Construct {
    constructor(scope: Construct, id: string, api: RestApi) {
        super(scope, id);

        // const bucker = new Bucket(this, 'myBucket', {
        //     removalPolicy: RemovalPolicy.DESTROY,
        //     bucketName: 'import-aws-service',
        //     publicReadAccess: true
        // })
        const importProductsFile = createLambda(this, {
            name: 'importProductsFile',
            handlerPath: ImportService.importProductsFile(),
            policy: []
        })
        const importFileParser = createLambda(this, {
            name: 'importFileParser',
            handlerPath: ImportService.importFileParser(),
            policy: []
        })

        api.root.addResource('import').addMethod('GET', new LambdaIntegration(importProductsFile))
    }
}