import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageBatchCommand, SendMessageBatchRequestEntry } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import { Readable } from "stream";
import csv from "csv-parser";
import { AvailableProduct } from "src/products/models";
import { v4 as uuidv4 } from 'uuid';

export const handler = async (
    event: S3Event
): Promise<any> => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const parsedKey = key.replace('uploaded', 'parsed')
    const params = {
        Bucket: bucket,
        Key: key,
    };
    const queueUrl = process.env.QUEUE_URL as string
    const sqsClient = new SQSClient({})
    const client = new S3Client({})
    const getCommand = new GetObjectCommand(params);
    const deleteCommand = new DeleteObjectCommand(params);
    const copyCommand = new CopyObjectCommand({
        CopySource: `${bucket}/${key}`,
        Bucket: bucket,
        Key: parsedKey,
    });
    const parser = csv({
        mapHeaders: (({ header }) => {
            if (header.charCodeAt(0) === 0xFEFF) {
                header = header.substr(1);
            }
            return header;
        })
    })
    try {
        const response = await client.send(getCommand);
        const readStream = response.Body as Readable
        const sqsEntries: SendMessageBatchRequestEntry[] = []
        await new Promise((resolve) => {
            readStream.pipe(parser)
                .on('data', (data) => {
                    const product = data as AvailableProduct
                    sqsEntries.push(
                        {
                            Id: uuidv4(),
                            MessageBody: JSON.stringify(product)
                        }
                    )
                })
                .on('end', async () => {
                    const sqsCommand = new SendMessageBatchCommand({
                        QueueUrl: queueUrl,
                        Entries: sqsEntries
                    })
                    await sqsClient.send(sqsCommand)
                    await client.send(copyCommand);
                    await client.send(deleteCommand);
                    resolve(null)
                });
        })
    } catch (err) {
        console.log(err)
    }
};
