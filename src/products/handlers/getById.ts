import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getMock } from '../products.mock';
import { generateResponce } from '../utils';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const productId: string = event.pathParameters!.product!;
    const product = getMock().find((product: any) => product.id === productId)
    if (product) {
        return generateResponce(200, product)
    }
    return generateResponce(404, "Product not found")
};