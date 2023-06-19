import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProductsServiceStack } from './products-service-stack';
import { GatewayStack } from './gateway-shop-stack';
import { ImportServiceStack } from './import-service-stack';

export class AwsShopServicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gateway = new GatewayStack(this, 'GatewayService')
    new ProductsServiceStack(this, 'ProductsService', gateway.api)
    new ImportServiceStack(this, 'ImportService', gateway.api)
  }
}
