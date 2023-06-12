import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateResponce } from '../../utils/responceHandler';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Client } from 'ts-postgres';


export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const host = process.env.DB_ENDPOINT_ADDRESS;
        const database = process.env.DB_NAME;
        const secretClient = new SecretsManagerClient({});
        const dbSecret = await secretClient.send(new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN }))
        const secretString = dbSecret.SecretString || '';
        if (!secretString) {
            throw new Error('secret string is empty');
        }
        const { password } = JSON.parse(secretString);
        console.log(host, database, password)
        const client = new Client({
            user: 'postgres',
            host,
            database,
            password,
            port: 5432,
        });
        await client.connect();
        try {
            const res = await client.query('SELECT * from products');
            const items = res.rows.map((value) => value)
            console.log(items)
            return generateResponce(200, items)
        } catch (error) {
            return generateResponce(500, error)
        } finally {
            await client.end();
        }
    } catch (error) {
        return generateResponce(500, error)
    }
};