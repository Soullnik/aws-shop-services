import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponse } from '../../utils/responceHandler';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { AvailableProduct } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';



export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event)
    if (!event.body) {
        return generateResponse(400, `empty body`);
    }
    const db = new DynamoDBClient({});
    const client = DynamoDBDocumentClient.from(db);

    const requiredFields = ['description', 'price', 'title', 'count']
    const product = JSON.parse(event.body) as AvailableProduct;
    const hasAllFields = requiredFields.reduce((acc, field) => acc ? product.hasOwnProperty(field) : acc, true)
    if (!hasAllFields) {
        return generateResponse(400, `Error: You are missing parameters`);
    }
    const id = product.id ? product.id : uuidv4()
    const command = new TransactWriteCommand({
        TransactItems: [
            {
                Put: {
                    TableName: 'products',
                    Item: {
                        id: id,
                        title: product.title,
                        price: product.price,
                        description: product.description
                    }
                }
            },
            {
                Put: {
                    TableName: 'stocks',
                    Item: {
                        'product_id': id,
                        count: product.count
                    }
                }
            }
        ]
    })

    try {
        await client.send(command);
        return generateResponse(200, 'product added')
    } catch (error) {
        return generateResponse(500, error)
    }
};