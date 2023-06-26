import { handler as getProductList } from "../src/products/handlers/getList"
import { handler as getProductById } from "../src/products/handlers/getById"
import { handler as catalogBatchProcess } from "../src/products/handlers/catalogBatchProcess"
import { getMockAvailableProduct, getMockProducts, getMockStocks } from '../db/products.mock';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, TransactGetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";



describe('Products', () => {
    const ddbMock = mockClient(DynamoDBDocumentClient);
    const snsMock = mockClient(SNSClient);

    beforeEach(() => {
        ddbMock.reset();
        snsMock.reset();
    });


    describe('Get Products List', () => {
        it('should have correct responce', async () => {
            // GIVEN
            ddbMock.on(ScanCommand).resolves({
                Items: getMockProducts()
            })
            ddbMock.on(GetCommand).callsFake((input) => {
                return { Item: getMockStocks().find(stock => stock.product_id === input.Key['product_id']) }
            })
            const event: any = null;
            const expectedBody = JSON.stringify(getMockAvailableProduct())

            // WHEN
            const responce = await getProductList(event)

            // THEN
            expect(responce.statusCode).toBe(200);
            expect(responce.body).toBe(expectedBody)
        })
    })
    describe('Get Products By Id', () => {
        let event: any;
        beforeEach(() => {
            ddbMock.reset();
            event = {
                pathParameters: {
                    product: ''
                }
            };
        })
        it('should get first product', async () => {
            // GIVEN
            const product = { Item: getMockProducts()[0] }
            const stock = { Item: getMockStocks()[0] }
            ddbMock.on(TransactGetCommand).resolves({
                Responses: [product, stock]
            })
            const expectedProduct = getMockAvailableProduct()[0]
            event.pathParameters.product = expectedProduct.id

            // WHEN
            const responce = await getProductById(event)

            // THEN
            expect(responce.statusCode).toBe(200);
            expect(responce.body).toBe(JSON.stringify(expectedProduct))
        })
        it('should return "Product not found"', async () => {
            // GIVEN
            ddbMock.on(TransactGetCommand).resolves({
                Responses: []
            })
            event.pathParameters.product = '0'
            const expectedResponce = "Product not found"

            // WHEN
            const responce = await getProductById(event)

            // THEN
            expect(responce.statusCode).toBe(404);
            expect(responce.body).toBe(JSON.stringify(expectedResponce))
        })
    })
    describe('Catalog Batch Process', () => {
        let event: any;
        beforeEach(() => {
            ddbMock.reset();
            snsMock.reset();
            event = {
                Records: [
                    {
                        messageId: 'test',
                        body: JSON.stringify(getMockAvailableProduct()[0])
                    }
                ]
            };
        })
        it('should create product and send message to sns', async () => {
            // GIVEN
            ddbMock.on(TransactWriteCommand).resolves({})
            snsMock.on(PublishCommand).resolves({})
            const expectedProduct = event.Records
            const expectedSubject = 'new product added'
            // WHEN
            const responce = await catalogBatchProcess(event)
            // THEN
            expect(responce.statusCode).toBe(200);
            expect(JSON.parse(responce.body)).toStrictEqual(expectedProduct)
            expect(ddbMock.commandCalls(TransactWriteCommand).length).toBe(1)
            expect(snsMock.commandCalls(PublishCommand).length).toBe(1)
            expect(snsMock.commandCalls(PublishCommand)[0].firstArg.input.Subject).toBe(expectedSubject)
        })
        it('should return error if TransactWriteCommand rejected', async () => {
            // GIVEN
            const expectedError = { message: 'TransactWriteCommand error' }
            ddbMock.on(TransactWriteCommand).rejects(expectedError)
            snsMock.on(PublishCommand).resolves({})

            // WHEN
            const responce = await catalogBatchProcess(event)
            // THEN
            expect(responce.statusCode).toBe(500);
            expect(JSON.parse(responce.body)).toStrictEqual(expectedError)
            expect(ddbMock.commandCalls(TransactWriteCommand).length).toBe(1)
            expect(snsMock.commandCalls(PublishCommand).length).toBe(0)
        })
        it('should return error if PublishCommand rejected', async () => {
            // GIVEN
            const expectedError = { message: 'PublishCommand error' }
            ddbMock.on(TransactWriteCommand).resolves({})
            snsMock.on(PublishCommand).rejects(expectedError)

            // WHEN
            const responce = await catalogBatchProcess(event)
            // THEN
            expect(responce.statusCode).toBe(500);
            expect(JSON.parse(responce.body)).toStrictEqual(expectedError)
            expect(ddbMock.commandCalls(TransactWriteCommand).length).toBe(1)
            expect(snsMock.commandCalls(PublishCommand).length).toBe(1)
        })
    })
})