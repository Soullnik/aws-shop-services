import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponse } from '../../utils/responceHandler';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { AvailableProduct, Product, Stock } from '../models';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';



export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event)
    const db = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(db);

    const command = new ScanCommand({
        TableName: 'products',
    });

    try {
        const response = await client.send(command);
        const items: AvailableProduct[] = []

        for (const item of response.Items as Product[]) {
            const commandStock = new GetCommand({
                TableName: 'stocks',
                Key: {
                    'product_id': item.id
                }
            });
            const stock = await client.send(commandStock);
            const stockItem = stock.Item as Stock
            if (stockItem) {
                items.push({
                    id: item.id,
                    description: item.description,
                    title: item.title,
                    price: item.price,
                    count: stockItem.count
                })
            }
        }
        return generateResponse(200, items)
    } catch (error) {
        return generateResponse(500, error)
    }
};