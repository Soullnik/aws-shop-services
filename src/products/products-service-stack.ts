import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Duration } from 'aws-cdk-lib/core'
import path from "path";

export class ProductsServiceStack extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const productsTable = Table.fromTableName(this, 'producuts-table', 'products')
        const stocksTable = Table.fromTableName(this, 'stocks-table', 'stocks')

        const getProductList = this.createLambda('getListHandler', 'handlers/getList.ts', [new PolicyStatement({
            actions: ['dynamodb:Scan', 'dynamodb:GetItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn]
        })])
        const getProductById = this.createLambda('getByIdHandler', 'handlers/getById.ts', [new PolicyStatement({
            actions: ['dynamodb:GetItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn],
            conditions: {
                "ForAnyValue:StringEquals": {
                    "dynamodb:EnclosingOperation": [
                        "TransactGetItems"
                    ]
                }
            }
        })])
        const postProduct = this.createLambda('postProduct', 'handlers/postProduct.ts', [new PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [productsTable.tableArn, stocksTable.tableArn],
            conditions: {
                "ForAnyValue:StringEquals": {
                    "dynamodb:EnclosingOperation": [
                        "TransactWriteItems"
                    ]
                }
            }
        })])

        const api = new RestApi(this, 'products-api', {
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

        api.root.addResource('products').addMethod('GET', new LambdaIntegration(getProductList))
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