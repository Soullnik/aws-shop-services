import { AttributeDefinition, CreateTableCommand, DynamoDBClient, KeySchemaElement, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { AvailableProduct } from "../src/products/models";
import { getMock } from "./products.mock";


const db = new DynamoDBClient({});
export const client = DynamoDBDocumentClient.from(db);

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

const putItems = async (items: AvailableProduct[]) => {
    for (const item of items) {
        const command = new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: 'products',
                        Item: {
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            description: item.description
                        }
                    }
                },
                {
                    Put: {
                        TableName: 'stocks',
                        Item: {
                            'product_id': item.id,
                            count: item.count
                        }
                    }
                }
            ]
        })
        try {
            await client.send(command);
        } catch (err) {
            console.log(err)
        }
    }

}


const migration = async (products: AvailableProduct[]) => {
    try {
        await putItems(products)
        console.log(`items added`)
    } catch (error) {
        console.log(error)
    }
};

migration(getMock())


