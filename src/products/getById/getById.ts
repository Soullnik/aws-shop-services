import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMock } from '/opt/nodejs/products';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const productId: string | undefined = event.pathParameters?.product;
    if (productId) {
        const product = getMock().find((product: any) => product.id === productId)
        if (product) {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            };
        }
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                "Content-Type": "text/plain"
            },
            body: 'Product not found'
        };
    }
    return {
        statusCode: 400,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            "Content-Type": "text/plain"
        },
        body: 'Product not found'
    };
};