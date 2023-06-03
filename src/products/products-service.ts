import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";

export class ProductsService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const mockLayer = new lambda.LayerVersion(this, 'mock-layer', {
            compatibleRuntimes: [
                lambda.Runtime.NODEJS_18_X,
            ],
            code: lambda.Code.fromAsset(path.join(__dirname, 'layers/mock')),
            description: 'mock',
        });

        const getProductList = new lambda.Function(this, 'getListHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, 'getList')),
            handler: 'getList.handler',
            layers: [mockLayer]
        });

        const getProductById = new lambda.Function(this, 'getByIdHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, 'getById')),
            handler: 'getById.handler',
            layers: [mockLayer]
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