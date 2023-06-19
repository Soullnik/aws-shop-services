import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponse } from '../../utils/responceHandler';
import { DynamoDBDocumentClient, TransactGetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event)
    const requestedItemId = event.pathParameters?.product;
    if (!requestedItemId) {
        return generateResponse(400, `Error: You are missing the path parameter id`);
    }
    const db = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(db);
    const command = new TransactGetCommand({
        TransactItems: [
            {
                Get: {
                    TableName: 'products',
                    Key: {
                        id: requestedItemId
                    }
                }
            },
            {
                Get: {
                    TableName: 'stocks',
                    Key: {
                        'product_id': requestedItemId
                    }
                }
            }
        ]
    })

    try {
        const response = await client.send(command);
        if (response.Responses?.length) {
            const [product, stock] = response.Responses
            return generateResponse(200, {
                ...product.Item,
                count: stock.Item?.count || 0
            })
        } else {
            return generateResponse(404, "Product not found")
        }
    } catch (error) {
        return generateResponse(500, error)
    }
};