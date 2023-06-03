import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMock } from '/opt/nodejs/products';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getMock())
        };
    } catch (err) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                "Content-Type": "application/json"
            },
            body: JSON.stringify(err)
        };
    }
};