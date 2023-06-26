import { Construct } from "constructs";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { createLambda } from "../src/utils/createLambda";
import { ProductsService } from "../src/products";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Topic } from "aws-cdk-lib/aws-sns";

export class ProductsServiceStack extends Construct {
    constructor(scope: Construct, id: string, api: RestApi, catalogItemsQueue: Queue, createProductTopic: Topic) {
        super(scope, id);

        const productsTable = new Table(this, 'Products', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'products'
        })

        const stocksTable = new Table(this, 'Stocks', {
            partitionKey: { name: 'product_id', type: AttributeType.STRING },
            tableName: 'stocks'
        })

        const getProductList = createLambda(this, {
            name: 'getListHandler',
            handlerPath: ProductsService.getListHandlerPath(),
            policy: [new PolicyStatement({
                actions: ['dynamodb:Scan', 'dynamodb:GetItem'],
                resources: [productsTable.tableArn, stocksTable.tableArn]
            })]
        })

        const getProductById = createLambda(this, {
            name: 'getByIdHandler',
            handlerPath: ProductsService.getByIdHandlerPath(),
            policy: [new PolicyStatement({
                actions: ['dynamodb:GetItem'],
                resources: [productsTable.tableArn, stocksTable.tableArn],
            })]
        })

        const postProduct = createLambda(this, {
            name: 'postProduct',
            handlerPath: ProductsService.getPostProductHandlerPath(),
            policy: [new PolicyStatement({
                actions: ['dynamodb:PutItem'],
                resources: [productsTable.tableArn, stocksTable.tableArn],
            })]
        })

        const catalogBatchProcess = createLambda(this, {
            name: 'catalogBatchProcess',
            handlerPath: ProductsService.catalogBatchProcessHandlerPath(),
            policy: [new PolicyStatement({
                actions: ['dynamodb:PutItem'],
                resources: [productsTable.tableArn, stocksTable.tableArn],
            })]
        },
            {
                TOPIC_ARN: createProductTopic.topicArn
            })

        createProductTopic.grantPublish(catalogBatchProcess)
        catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, { batchSize: 5 }));

        api.root.addResource('products').addMethod('GET', new LambdaIntegration(getProductList))
            .resource.addMethod('POST', new LambdaIntegration(postProduct))
            .resource.addResource('{product}').addMethod('GET', new LambdaIntegration(getProductById))
            .resource.addMethod('POST', new LambdaIntegration(postProduct));

    }
}