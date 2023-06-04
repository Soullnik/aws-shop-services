import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMock } from '../products.mock';
import { generateResponce } from '../utils';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        return generateResponce(200, getMock())
    } catch (err) {
        return generateResponce(400, err)
    }
};