import type { AWS } from '@serverless/typescript';


const serverlessConfiguration: AWS = {
  service: 'mini-project2',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild',
  //'serverless-dynamodb-local',
  'serverless-offline'],

  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: [
            "dynamodb:DescribeTable",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Resource: "arn:aws:dynamodb:ddblocal:000000000000:table/ProductTable",
        }],
      },
    }
    
  },
  // import the function via paths
  functions: { 
    graphql: {
      handler: 'src/graphql/server.graphqlHandler',
      events: [
        {
          http: {
            path: 'graphql',
            method: 'ANY',
            cors: true,
          },
        },
      ],
   }
  },

  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    /*dynamodb: { 
      stages: ['dev'], 
      start: {
        migrate: true,
        port: 8000,
        noStart: true,
      }
    },*/
  },

  resources: {
    Resources: {
      MyDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'ProductTable',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'name', AttributeType: 'S' },
            { AttributeName: 'price', AttributeType: 'N' },
            { AttributeName: 'quantity', AttributeType: 'N' },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
    },
  },

};

module.exports = serverlessConfiguration;


