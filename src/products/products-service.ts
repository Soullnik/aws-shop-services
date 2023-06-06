import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export class ProductsService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const getProductList = new NodejsFunction(this, 'getListHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(5),
            entry: path.join(__dirname, 'handlers/getList.ts'),
            handler: 'handler',
        });

        const getProductById = new NodejsFunction(this, 'getByIdHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(5),
            entry: path.join(__dirname, 'handlers/getById.ts'),
            handler: 'handler',
        });

        const api = new apigateway.RestApi(this, 'products-api', {
            description: 'products-api gateway',
            deployOptions: {
                stageName: 'dev',
            },
            defaultCorsPreflightOptions: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                ],
                allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allowCredentials: true,
                allowOrigins: ['http://localhost:3000'],
            },
        });

        const products = api.root.addResource('products')
        products.addMethod('GET', new apigateway.LambdaIntegration(getProductList))

        const product = products.addResource('{product}')
        product.addMethod('GET', new apigateway.LambdaIntegration(getProductById));
    }


}