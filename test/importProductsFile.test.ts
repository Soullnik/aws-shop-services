import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { handler } from '../src/import/handlers/importProductsFile'
import { mockClient } from 'aws-sdk-client-mock';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock("@aws-sdk/s3-request-presigner");

const mockSignedUrl = "https://mock.s3.amazonaws.com/test-signed-url";
const s3Mock = mockClient(S3Client);
const getSignedUrlMock = getSignedUrl as jest.MockedFunction<
    typeof getSignedUrl
>;
getSignedUrlMock.mockImplementation(() => Promise.resolve(mockSignedUrl));

describe('ImoprtProductsFile', () => {
    const event = {
        queryStringParameters: {
            name: "test",
        },
    } as unknown as APIGatewayProxyEvent;

    beforeAll(() => {
        s3Mock
            .on(PutObjectCommand, { Bucket: "test", Key: "test.csv" })
            .resolves({});
    });

    it("should return signed url", async () => {
        // GIVEN
        // WHEN
        const response = await handler(event);
        const body = JSON.parse(response.body);

        // THEN
        expect(response.statusCode).toBe(200);
        expect(body).toBe(mockSignedUrl);
    });

    it("should return 400 name is not provided", async () => {
        // GIVEN
        const event = {
            queryStringParameters: {},
        } as unknown as APIGatewayProxyEvent;

        // WHEN
        const response = await handler(event);
        const body = JSON.parse(response.body);

        // THEN
        expect(response.statusCode).toBe(400);
        expect(body).toBe(`Error: You are missing the query parameter name`);
    });

    it("should return 500", async () => {
        // GIVEN
        const errorMessage = "test error";
        getSignedUrlMock.mockImplementationOnce(() =>
            Promise.reject(errorMessage)
        );

        // THEN
        const response = await handler(event);
        const body = JSON.parse(response.body);

        //WHEN
        expect(response.statusCode).toBe(500);
        expect(body).toBe(errorMessage);
    });
})