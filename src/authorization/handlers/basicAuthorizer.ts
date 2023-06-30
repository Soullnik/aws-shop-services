import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda"

export const handler = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    console.log(event)
    let token = event.authorizationToken

    let effect = 'Deny'

    if (token == "sGLzdRxvZmw0ZXs0UGFzcw==") {
        effect = 'Allow'
    } else {
        effect = 'Deny'
    }

    let policy = {
        "principalId": "user",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": event.methodArn
                }
            ]
        }
    }
    return policy

};