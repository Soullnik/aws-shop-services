import { Construct } from "constructs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ImportService } from "../src/import";
import { createLambda } from "../src/utils/createLambda";
import { Bucket, EventType, HttpMethods } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ImportServiceStack extends Construct {
    constructor(scope: Construct, id: string, api: RestApi) {
        super(scope, id);

        const bucket = new Bucket(this, 'myBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            bucketName: 'import-aws-bucket',
            autoDeleteObjects: true,
            publicReadAccess: true,
            cors: [
                {
                    allowedMethods: [
                        HttpMethods.GET,
                        HttpMethods.POST,
                        HttpMethods.PUT,
                    ],
                    allowedOrigins: ['https://d3ieob9tiqtawy.cloudfront.net'],
                    allowedHeaders: ['*'],
                },
            ],
            blockPublicAccess: {
                blockPublicPolicy: false,
                restrictPublicBuckets: false,
                blockPublicAcls: false,
                ignorePublicAcls: false
            }
        })


        const importProductsFile = createLambda(this,
            {
                name: 'importProductsFile',
                handlerPath: ImportService.importProductsFile(),
            },
            {
                BUCKET_NAME: 'import-aws-bucket'
            }
        )



        const importFileParser = createLambda(this, {
            name: 'importFileParser',
            handlerPath: ImportService.importFileParser(),
        })

        bucket.grantReadWrite(importFileParser)
        bucket.grantDelete(importFileParser)
        bucket.grantReadWrite(importProductsFile)


        const s3PutEventSource = new S3EventSource(bucket, {
            events: [
                EventType.OBJECT_CREATED
            ],
            filters: [
                { prefix: 'uploaded/' }
            ]
        });

        importFileParser.addEventSource(s3PutEventSource);

        api.root.addResource('import').addMethod('GET', new LambdaIntegration(importProductsFile))
    }
}