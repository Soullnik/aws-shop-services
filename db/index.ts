import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const db = new DynamoDBClient({});
export const client = DynamoDBDocumentClient.from(db);