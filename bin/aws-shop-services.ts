#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config'
import * as cdk from 'aws-cdk-lib';
import { AwsShopServicesStack } from '../lib/aws-shop-services-stack';

const app = new cdk.App();
new AwsShopServicesStack(app, 'AwsShopServicesStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  }
});
app.synth();