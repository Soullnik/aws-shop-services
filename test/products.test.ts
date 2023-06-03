import { handler as getProductList } from "../src/products/getList/getList"
import { handler as getProductById } from "../src/products/getById/getById"
import { getMock } from '../src/layers/mock/nodejs/products';


describe('Products', () => {
    let event: any;

    describe('Get Products List', () => {
        it('should have correct responce', async () => {
            const responce = await getProductList(event)
            expect(responce.statusCode).toBe(200);
            expect(responce.body).toBe(JSON.stringify(getMock()))
        })
    })
    describe('Get Products By Id', () => {
        beforeEach(() => {
            event = {
                pathParameters: {
                    product: ''
                }
            };
        })
        it('should get first product', async () => {
            const expectedProduct = getMock()[0]
            event.pathParameters.product = expectedProduct.id
            const responce = await getProductById(event)
            expect(responce.statusCode).toBe(200);
            expect(responce.body).toBe(JSON.stringify(expectedProduct))
        })
        it('should return "Product not found"', async () => {
            const expectedResponce = "Product not found"
            const responce = await getProductById(event)
            expect(responce.statusCode).toBe(400);
            expect(responce.body).toBe(expectedResponce)
        })
    })
})