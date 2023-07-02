import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProductsServiceStack } from './products-service-stack';
import { GatewayStack } from './gateway-shop-stack';
import { ImportServiceStack } from './import-service-stack';
import { SqsStack } from './sqs-service-stack';
import { SnsStack } from './sns-service-stack';
import 'dotenv/config'

export class AwsShopServicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const gateway = new GatewayStack(this, 'GatewayService', process.env.soullnik as string)
    const sqs = new SqsStack(this, 'SqsService')
    const sns = new SnsStack(this, 'SnsService', process.env.SNS_EMAIL as string)
    new ProductsServiceStack(this, 'ProductsService', gateway, sqs.catalogItemsQueue, sns.createProductTopic)
    new ImportServiceStack(this, 'ImportService', gateway, sqs.catalogItemsQueue)
  }
}
