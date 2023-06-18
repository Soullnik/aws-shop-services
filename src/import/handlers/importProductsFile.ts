import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponse } from "src/utils/responceHandler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client, } from "@aws-sdk/client-s3";

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const name = event.queryStringParameters?.name
    const bucketName = process.env.BUCKET_NAME as string
    if (!name) return generateResponse(400, `Error: You are missing the path parameter name`);
    const client = new S3Client({})
    const command = new PutObjectCommand({ Bucket: bucketName, Key: `uploaded/${name}` });
    try {
        await client.send(command)
        const url = await getSignedUrl(client, command, { expiresIn: 3600 });
        return generateResponse(200, url);
    } catch (error) {
        return generateResponse(500, error);
    }
};