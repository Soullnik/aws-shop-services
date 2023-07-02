import { Construct } from "constructs";
import { RestApi, Cors, TokenAuthorizer, ResponseType } from "aws-cdk-lib/aws-apigateway";
import { AuthorizationService } from "../src/authorization";
import { createLambda } from "../src/utils/createLambda";

export class GatewayStack extends Construct {
    public api: RestApi
    public authorizer: TokenAuthorizer
    constructor(scope: Construct, id: string, envVariable: string) {
        super(scope, id);
        const authFunc = createLambda(this, {
            name: 'AuthorizationHandler',
            handlerPath: AuthorizationService.basicAuthorizer(),
        }, {
            soullnik: envVariable
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
                allowHeaders: ['*'],
                allowMethods: Cors.ALL_METHODS,
                allowCredentials: true,
                allowOrigins: ['https://d3ieob9tiqtawy.cloudfront.net'],
            },
        });

        const responseHeaders = {
            "Access-Control-Allow-Origin": "'https://d3ieob9tiqtawy.cloudfront.net'",
            "Access-Control-Allow-Methods": "'OPTIONS,GET'",
            "Access-Control-Allow-Headers": "'*'"
        }

        this.api.addGatewayResponse('GatewayResponseACCESS_DENIED', {
            type: ResponseType.ACCESS_DENIED,
            responseHeaders
        });

        this.api.addGatewayResponse('GatewayResponseUNAUTHORIZED', {
            type: ResponseType.UNAUTHORIZED,
            responseHeaders
        });
    }
}