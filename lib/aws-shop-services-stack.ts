import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ProductsServiceStack } from '../src/products/products-service-stack';

export class AwsShopServicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ProductsServiceStack(this, 'ProductsService')

  }
}
