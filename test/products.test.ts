import { APIGatewayProxyEvent } from "aws-lambda"
import { handler } from "../src/products/getList/getList"
import { getMock } from '../src/layers/mock/nodejs/products';


describe('Products', () => {
    let event = null as unknown as APIGatewayProxyEvent
    beforeAll(() => {

    })
    describe('Get Products List', () => {
        it('', async () => {
            const responce = await handler(event)
            expect(responce.statusCode).toBe(200);
            expect(responce.body).toBe(JSON.stringify(getMock()))
        })
    })
})