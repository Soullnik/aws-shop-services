import { Construct } from "constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export class SnsStack extends Construct {
    public createProductTopic: Topic
    constructor(scope: Construct, id: string, email: string) {
        super(scope, id);

        this.createProductTopic = new Topic(this, 'createProductTopic');
        this.createProductTopic.addSubscription(new EmailSubscription(email))
    }
}