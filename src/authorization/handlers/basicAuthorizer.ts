import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda"

export const handler = async (
    event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
    console.log(event)

    const principalId = 'user'
    if (!event.authorizationToken || !event.authorizationToken.includes('Basic ')) {
        return generateAuthorizedPolicy(principalId, 'Deny', event.methodArn)
    }
    const token = event.authorizationToken.replace('Basic ', '')
    const [userName, password] = atob(token).split(':')

    if (!userName || !password || (process.env[userName] !== password)) {
        return generateAuthorizedPolicy(principalId, 'Deny', event.methodArn)
    }

    return generateAuthorizedPolicy(principalId, 'Allow', event.methodArn)
};

const generateAuthorizedPolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
    return {
        "principalId": principalId,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource
                }
            ]
        }
    }
}