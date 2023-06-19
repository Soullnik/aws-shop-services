import { handler as getProductList } from "../src/products/handlers/getList"
import { handler as getProductById } from "../src/products/handlers/getById"
import { getMockAvailableProduct, getMockProducts, getMockStocks } from '../db/products.mock';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, TransactGetCommand } from "@aws-sdk/lib-dynamodb";



describe('Products', () => {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
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
})