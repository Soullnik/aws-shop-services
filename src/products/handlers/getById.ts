import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponce } from '../../utils/responceHandler';
import { TransactGetCommand } from '@aws-sdk/lib-dynamodb';
import { client } from 'db';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event)
    const requestedItemId = event.pathParameters?.product;
    if (!requestedItemId) {
        return generateResponce(400, `Error: You are missing the path parameter id`);
    }
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
            return generateResponce(200, {
                ...product.Item,
                count: stock.Item?.count || 0
            })
        } else {
            return generateResponce(404, "Product not found")
        }
    } catch (error) {
        return generateResponce(500, error)
    }
};