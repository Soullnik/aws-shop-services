import 'dotenv/config'
import { getMock } from "./products.mock";
import { Product } from 'src/products/models';
import { Client } from 'ts-postgres';

const host = process.env.M_DB_HOST as string;
const database = process.env.DB_NAME as string;
const user = process.env.DB_USERNAME as string;
const password = process.env.M_DB_PASSWORD as string;
const port = Number(process.env.DB_PORT);

const migration = async (products: Product[]) => {
    const client = new Client({
        user,
        host,
        database,
        password,
        port
    });

    try {
        await client.connect();
        // const res = await client.query(`
        // CREATE TABLE products (
        // id UUID PRIMARY KEY,
        // description VARCHAR ( 255 ) NOT NULL,
        // price INTEGER NOT NULL,
        // title VARCHAR ( 255 ) NOT NULL)`)
        console.log('connect')
    } catch (error) {
        console.log(error)
    }

}

migration(getMock())