import { APIGatewayProxyResult } from 'aws-lambda';
import { generateResponse } from '../../utils/responceHandler';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { AvailableProduct } from '../models';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSEvent } from "aws-lambda";


export const handler = async (
    event: SQSEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const records = event.Records
        const db = new DynamoDBClient({});
        const dbClient = DynamoDBDocumentClient.from(db);
        const snsClient = new SNSClient({});
        for (const record of records) {
            const id = record.messageId
            const product = JSON.parse(record.body) as AvailableProduct
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
            await dbClient.send(command);
            const snsCommand = new PublishCommand({
                Subject: 'new product added',
                Message: record.body,
                TopicArn: process.env.TOPIC_ARN,
            })
            await snsClient.send(snsCommand)
        }
        return generateResponse(200, records)
    } catch (error) {
        return generateResponse(500, error)
    }

};