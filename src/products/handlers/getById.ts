import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponce } from '../utils';

import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const requestedItemId = event.pathParameters?.id;
    if (!requestedItemId) {
        return generateResponce(400, `Error: You are missing the path parameter id`);
    }
    const params = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: requestedItemId
        }
    };
    try {
        const response = await db.get(params).promise();
        if (response.Item) {
            return generateResponce(200, response.Item)
        } else {
            return generateResponce(404, "Product not found")
        }
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};