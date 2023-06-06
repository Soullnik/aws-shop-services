import express, { Express } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import swaggerJson from './swagger.json';
import { handler as getProductList } from "../src/products/handlers/getList"
import { handler as getProductById } from "../src/products/handlers/getById"


const app: Express = express();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.get('/api/products', async (req, res) => {
    const event: any = null
    const responce = await getProductList(event)
    res.send(JSON.parse(responce.body))
});

app.get('/api/products/:id', async (req, res) => {
    const event: any = {
        pathParameters: {
            product: req.params.id
        }
    };
    const responce = await getProductById(event)
    res.status(responce.statusCode).send(JSON.parse(responce.body));
});

app.listen(3080, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:3080/api-docs`);
});
