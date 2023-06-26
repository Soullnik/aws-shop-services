import { Construct } from "constructs";
import { Queue } from "aws-cdk-lib/aws-sqs";

export class SqsStack extends Construct {
    public catalogItemsQueue: Queue
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.catalogItemsQueue = new Queue(this, 'CatalogItemsQueue');
    }
}