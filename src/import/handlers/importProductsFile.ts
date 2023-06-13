import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponce } from "src/utils/responceHandler";

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event)
    return generateResponce(400, `empty body`);
};