import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponce } from '../utils';
import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const params = {
        TableName: TABLE_NAME
    };

    try {
        const response = await db.scan(params).promise();
        return generateResponce(200, response.Items)
    } catch (dbError) {
        return generateResponce(500, dbError)
    }
};