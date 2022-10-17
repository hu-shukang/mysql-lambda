import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MysqlLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaAccessRole = iam.Role.fromRoleArn(
      this,
      'LambdaAccessRole',
      `arn:aws:iam::146114061358:role/LambdaAccessRole`,
      {mutable: false},
    );

    const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
      vpcId: 'vpc-04f09656c66e026c6',
      region: this.region,
    })

    const subnet1 = ec2.Subnet.fromSubnetId(this, 'subnet1', 'subnet-057a7ff5e67aa8af6')
    const subnet2 = ec2.Subnet.fromSubnetId(this, 'subnet2', 'subnet-0db93a05ca40370d4')

    const lambdaSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'LambdaSecurityGroup', 'sg-02c9ba8a2d63ad6d6', {
      mutable: false,
    })

    // lambda 共通レイヤー
    const layer = new lambda.LayerVersion(this, "shared_layer", {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset(path.join(__dirname, "../src/layer")),
      layerVersionName: "shared_layer",
    });

    // lambda定義
    const testLambda = new lambda.Function(this, "test", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../src/function/test")),
      functionName: "test_function",
      layers: [layer],
      timeout: cdk.Duration.minutes(15),
      securityGroups: [lambdaSecurityGroup],
      vpc: vpc,
      role: lambdaAccessRole,
      logRetentionRole: lambdaAccessRole,
      vpcSubnets: {
        subnets: [
          subnet1,
          subnet2
        ]
      }
    });
  }
}
