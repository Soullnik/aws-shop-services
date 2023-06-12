import { AttributeDefinition, CreateTableCommand, KeySchemaElement, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Product } from "../src/products/models";
import { getMock } from "./products.mock";
import { client } from "db";


const hasTable = async (tableName: string): Promise<boolean | undefined> => {
    const command = new ListTablesCommand({});
    try {
        const response = await client.send(command);
        return response.TableNames?.includes(tableName)
    } catch (error) {
        throw new Error(JSON.stringify(error))
    }

}

const createTable = async (tableName: string, attributes: AttributeDefinition[], keySchema: KeySchemaElement[]) => {
    const command = new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: attributes,
        KeySchema: keySchema,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        }
    })
    try {
        await client.send(command);
    } catch (error) {
        console.log(error)
    }
}

const putItems = async (items: Record<string, any>[], tableName: string) => {
    for (const item of items) {
        const command = new PutCommand({
            TableName: tableName,
            Item: item,
        });
        try {
            const contents = await client.send(command);
            console.log(`code: ${contents.$metadata.httpStatusCode}, item added`)
        } catch (err) {
            console.log(err)
        }
    }

}


const migrationProducts = async (products: Product[]) => {
    const tableName = "products"
    try {
        const tableExists = await hasTable(tableName)
        if (!tableExists) {
            await createTable(tableName, [
                {
                    AttributeName: "id",
                    AttributeType: "S",
                },
            ], [
                {
                    AttributeName: "id",
                    KeyType: "HASH",
                },
            ])
        }
        await putItems(products, tableName)
    } catch (error) {
        console.log(error)
    }
};

const migrationStock = async (products: Product[]) => {
    const tableName = "stocks"
    try {
        const tableExists = await hasTable(tableName)
        if (!tableExists) {
            await createTable(tableName, [
                {
                    AttributeName: "product_id",
                    AttributeType: "S",
                },
            ], [
                {
                    AttributeName: "product_id",
                    KeyType: "HASH",
                },
            ])
        }
        await putItems(products.map((product) => ({ 'product_id': product.id, count: Math.floor(product.price / 2) })), tableName)
    } catch (error) {
        console.log(error)
    }
};


const products = getMock()
migrationProducts(products)
migrationStock(products)


