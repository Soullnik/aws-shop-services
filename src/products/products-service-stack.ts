import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Duration } from 'aws-cdk-lib/core'
import path from "path";

export class ProductsServiceStack extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const productsTable = new Table(this, 'Products', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'products'
        })

        const stocksTable = new Table(this, 'Stocks', {
            partitionKey: { name: 'product_id', type: AttributeType.STRING },
            tableName: 'stocks'
        })

        const getProductList = this.createLambda('getListHandler', 'handlers/getList.ts', [new PolicyStatement({
            actions: ['dynamodb:Scan', 'dynamodb:GetItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn]
        })])
        const getProductById = this.createLambda('getByIdHandler', 'handlers/getById.ts', [new PolicyStatement({
            actions: ['dynamodb:GetItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn],
        })])
        const postProduct = this.createLambda('postProduct', 'handlers/postProduct.ts', [new PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn],
        })])

        const api = new RestApi(this, 'products-api', {
            description: 'products-api gateway',
            deployOptions: {
                stageName: 'dev',
            },
            defaultCorsPreflightOptions: {
                allowHeaders: Cors.DEFAULT_HEADERS,
                allowMethods: Cors.ALL_METHODS,
                allowCredentials: true,
                allowOrigins: Cors.ALL_ORIGINS,
            },
        });

        api.root.addResource('products').addMethod('GET', new LambdaIntegration(getProductList))
            .resource.addMethod('POST', new LambdaIntegration(postProduct))
            .resource.addResource('{product}').addMethod('GET', new LambdaIntegration(getProductById))
            .resource.addMethod('POST', new LambdaIntegration(postProduct));


    }

    private createLambda(name: string, handlerPath: string, policy: PolicyStatement[]): NodejsFunction {
        return new NodejsFunction(this, name, {
            runtime: Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            entry: path.join(__dirname, handlerPath),
            handler: 'handler',
            initialPolicy: policy
        });
    }
}