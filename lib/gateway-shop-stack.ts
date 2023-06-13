import { Construct } from "constructs";
import { RestApi, Cors } from "aws-cdk-lib/aws-apigateway";

export class GatewayStack extends Construct {
    public api: RestApi
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.api = new RestApi(this, 'products-api', {
            description: 'import-api gateway',
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
    }
}