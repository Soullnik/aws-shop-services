import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration, RemovalPolicy } from 'aws-cdk-lib/core'
import path from "path";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { IVpc, InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class ProductsServiceStack extends Construct {
    port: number
    dbName: string
    dbUserName: string
    masterUserSecret: Secret
    dbInstance: DatabaseInstance
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const engine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_14_7 })
        const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO)
        this.port = Number(process.env.DB_PORT);
        this.dbName = process.env.DB_NAME as unknown as string;
        this.dbUserName = process.env.DB_USERNAME as unknown as string;


        this.masterUserSecret = new Secret(this, 'db-master-user-secret', {
            secretName: 'db-master-user-secret',
            description: 'database master user credentials',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: this.dbUserName }),
                generateStringKey: 'password',
                passwordLength: 16,
                excludePunctuation: true,
            }
        })

        const myVpc = new Vpc(this, 'my-shop-vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 1,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: 'private-subnet-1',
                    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
                {
                    name: 'public-subnet-1',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'isolated-subnet-1',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 28,
                },
            ],
        });

        const dbSecurityGroup = new SecurityGroup(this, "database-SG", {
            securityGroupName: 'database-SG',
            vpc: myVpc
        })

        dbSecurityGroup.addIngressRule(Peer.ipv4(myVpc.vpcCidrBlock), Port.tcp(this.port), `Allo port ${this.port}`)

        this.dbInstance = new DatabaseInstance(this, "DB-1", {
            vpc: myVpc,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
            instanceType,
            engine,
            port: this.port,
            securityGroups: [dbSecurityGroup],
            databaseName: this.dbName,
            credentials: Credentials.fromSecret(this.masterUserSecret),
            backupRetention: Duration.days(0),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY
        })

        const policy = [new PolicyStatement({
            actions: ['secretsmanager:GetSecretValue'],
            resources: [this.masterUserSecret.secretArn]
        })]

        const getProductList = this.createLambda('getListHandler', 'handlers/getList.ts', myVpc, dbSecurityGroup, policy)
        const getProductById = this.createLambda('getByIdHandler', 'handlers/getById.ts', myVpc, dbSecurityGroup, policy)
        const postProduct = this.createLambda('postProduct', 'handlers/postProduct.ts', myVpc, dbSecurityGroup, policy)

        const api = new RestApi(this, 'products-api', {
            description: 'products-api gateway',
            deployOptions: {
                stageName: 'dev',
            },
            defaultCorsPreflightOptions: {
                allowHeaders: Cors.DEFAULT_HEADERS,
                allowMethods: Cors.ALL_METHODS,
                allowCredentials: true,
                allowOrigins: Cors.ALL_ORIGINS,
            },
        });

        api.root.addResource('products').addMethod('GET', new LambdaIntegration(getProductList))
            .resource.addMethod('POST', new LambdaIntegration(postProduct))
            .resource.addResource('{product}').addMethod('GET', new LambdaIntegration(getProductById))
            .resource.addMethod('POST', new LambdaIntegration(postProduct));


    }

    private createLambda(name: string, handlerPath: string, vpc: IVpc, securityGroup: SecurityGroup, policy: PolicyStatement[]): NodejsFunction {
        return new NodejsFunction(this, name, {
            runtime: Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            entry: path.join(__dirname, handlerPath),
            handler: 'handler',
            vpc: vpc,
            securityGroups: [securityGroup],
            initialPolicy: policy,
            environment: {
                DB_SECRET_ARN: this.masterUserSecret.secretArn,
                DB_NAME: this.dbName,
                DB_ENDPOINT_ADDRESS: this.dbInstance.dbInstanceEndpointAddress,
            }
        });
    }
}