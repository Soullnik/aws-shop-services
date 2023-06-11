import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponce } from '../../utils/responceHandler';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { AvailableProduct } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { client } from 'db';



export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return generateResponce(400, `empty body`);
    }

    const requiredFields = ['description', 'price', 'title', 'count']
    const product = JSON.parse(event.body) as AvailableProduct;
    const hasAllFields = requiredFields.reduce((acc, field) => acc ? product.hasOwnProperty(field) : acc, true)
    if (!hasAllFields) {
        return generateResponce(400, `Error: You are missing parameters`);
    }
    const id = uuidv4()
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
        return generateResponce(200, 'product added')
    } catch (error) {
        return generateResponce(500, error)
    }
};