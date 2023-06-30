import { Construct } from "constructs";
import { RestApi, Cors, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { AuthorizationService } from "../src/authorization";
import { createLambda } from "../src/utils/createLambda";

export class GatewayStack extends Construct {
    public api: RestApi
    public authorizer: TokenAuthorizer
    constructor(scope: Construct, id: string) {
        super(scope, id);
        const authFunc = createLambda(this, {
            name: 'AuthorizationHandler',
            handlerPath: AuthorizationService.basicAuthorizer(),
        })

        this.authorizer = new TokenAuthorizer(this, 'reques-authorizer', {
            handler: authFunc,
            identitySource: 'method.request.header.AuthorizeToken'
        })

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