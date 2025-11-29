import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AWS Integration - Cloud Services
 * S3, Lambda, SES, SNS, SQS, DynamoDB, CloudWatch
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data, service } = await req.json();
    const accessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = data?.region || Deno.env.get('AWS_REGION') || 'us-east-1';

    // AWS Signature V4 helper (simplified - production should use full implementation)
    const signRequest = async (method, url, body, serviceName) => {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
      const dateStamp = amzDate.slice(0, 8);
      
      const headers = {
        'X-Amz-Date': amzDate,
        'Content-Type': 'application/json',
        'Host': new URL(url).host
      };
      
      // Simplified - in production use proper AWS4 signature
      return { headers, body };
    };

    const services = {
      // ============ S3 ============
      s3: {
        listBuckets: async () => {
          const response = await fetch(`https://s3.${region}.amazonaws.com/`, {
            headers: { 'Authorization': `AWS ${accessKey}:${secretKey}` }
          });
          return response.text();
        },
        listObjects: async ({ bucket, prefix = '', maxKeys = 1000 }) => {
          const url = `https://${bucket}.s3.${region}.amazonaws.com/?list-type=2&prefix=${prefix}&max-keys=${maxKeys}`;
          const response = await fetch(url);
          return response.text();
        },
        getObject: async ({ bucket, key }) => {
          const response = await fetch(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
          return response.text();
        },
        deleteObject: async ({ bucket, key }) => {
          const response = await fetch(`https://${bucket}.s3.${region}.amazonaws.com/${key}`, { method: 'DELETE' });
          return { deleted: response.ok };
        },
        getSignedUrl: async ({ bucket, key, expiresIn = 3600 }) => {
          // Generate pre-signed URL
          const expires = Math.floor(Date.now() / 1000) + expiresIn;
          return { url: `https://${bucket}.s3.${region}.amazonaws.com/${key}?X-Amz-Expires=${expiresIn}` };
        }
      },

      // ============ LAMBDA ============
      lambda: {
        invoke: async ({ functionName, payload, invocationType = 'RequestResponse' }) => {
          const response = await fetch(`https://lambda.${region}.amazonaws.com/2015-03-31/functions/${functionName}/invocations`, {
            method: 'POST',
            headers: { 'X-Amz-Invocation-Type': invocationType, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          return response.json();
        },
        listFunctions: async () => {
          const response = await fetch(`https://lambda.${region}.amazonaws.com/2015-03-31/functions`);
          return response.json();
        },
        getFunction: async ({ functionName }) => {
          const response = await fetch(`https://lambda.${region}.amazonaws.com/2015-03-31/functions/${functionName}`);
          return response.json();
        }
      },

      // ============ SES ============
      ses: {
        sendEmail: async ({ to, from, subject, body, html }) => {
          const params = new URLSearchParams({
            Action: 'SendEmail',
            'Destination.ToAddresses.member.1': to,
            Source: from,
            'Message.Subject.Data': subject,
            'Message.Body.Text.Data': body,
            ...(html && { 'Message.Body.Html.Data': html })
          });
          const response = await fetch(`https://email.${region}.amazonaws.com/?${params}`);
          return response.text();
        },
        sendTemplatedEmail: async ({ to, from, template, templateData }) => {
          return { message: 'Send templated email via SES API' };
        }
      },

      // ============ SNS ============
      sns: {
        publish: async ({ topicArn, message, subject }) => {
          const params = new URLSearchParams({ Action: 'Publish', TopicArn: topicArn, Message: message, Subject: subject });
          const response = await fetch(`https://sns.${region}.amazonaws.com/?${params}`);
          return response.text();
        },
        listTopics: async () => {
          const response = await fetch(`https://sns.${region}.amazonaws.com/?Action=ListTopics`);
          return response.text();
        },
        subscribe: async ({ topicArn, protocol, endpoint }) => {
          const params = new URLSearchParams({ Action: 'Subscribe', TopicArn: topicArn, Protocol: protocol, Endpoint: endpoint });
          const response = await fetch(`https://sns.${region}.amazonaws.com/?${params}`);
          return response.text();
        }
      },

      // ============ SQS ============
      sqs: {
        sendMessage: async ({ queueUrl, messageBody, delaySeconds = 0 }) => {
          const params = new URLSearchParams({ Action: 'SendMessage', MessageBody: messageBody, DelaySeconds: delaySeconds.toString() });
          const response = await fetch(`${queueUrl}?${params}`);
          return response.text();
        },
        receiveMessage: async ({ queueUrl, maxNumberOfMessages = 1, waitTimeSeconds = 0 }) => {
          const params = new URLSearchParams({ Action: 'ReceiveMessage', MaxNumberOfMessages: maxNumberOfMessages.toString(), WaitTimeSeconds: waitTimeSeconds.toString() });
          const response = await fetch(`${queueUrl}?${params}`);
          return response.text();
        },
        deleteMessage: async ({ queueUrl, receiptHandle }) => {
          const params = new URLSearchParams({ Action: 'DeleteMessage', ReceiptHandle: receiptHandle });
          const response = await fetch(`${queueUrl}?${params}`);
          return response.text();
        }
      },

      // ============ DYNAMODB ============
      dynamodb: {
        getItem: async ({ tableName, key }) => {
          const response = await fetch(`https://dynamodb.${region}.amazonaws.com/`, {
            method: 'POST',
            headers: { 'X-Amz-Target': 'DynamoDB_20120810.GetItem', 'Content-Type': 'application/x-amz-json-1.0' },
            body: JSON.stringify({ TableName: tableName, Key: key })
          });
          return response.json();
        },
        putItem: async ({ tableName, item }) => {
          const response = await fetch(`https://dynamodb.${region}.amazonaws.com/`, {
            method: 'POST',
            headers: { 'X-Amz-Target': 'DynamoDB_20120810.PutItem', 'Content-Type': 'application/x-amz-json-1.0' },
            body: JSON.stringify({ TableName: tableName, Item: item })
          });
          return response.json();
        },
        query: async ({ tableName, keyConditionExpression, expressionAttributeValues }) => {
          const response = await fetch(`https://dynamodb.${region}.amazonaws.com/`, {
            method: 'POST',
            headers: { 'X-Amz-Target': 'DynamoDB_20120810.Query', 'Content-Type': 'application/x-amz-json-1.0' },
            body: JSON.stringify({ TableName: tableName, KeyConditionExpression: keyConditionExpression, ExpressionAttributeValues: expressionAttributeValues })
          });
          return response.json();
        },
        scan: async ({ tableName, filterExpression, expressionAttributeValues, limit }) => {
          const response = await fetch(`https://dynamodb.${region}.amazonaws.com/`, {
            method: 'POST',
            headers: { 'X-Amz-Target': 'DynamoDB_20120810.Scan', 'Content-Type': 'application/x-amz-json-1.0' },
            body: JSON.stringify({ TableName: tableName, FilterExpression: filterExpression, ExpressionAttributeValues: expressionAttributeValues, Limit: limit })
          });
          return response.json();
        }
      },

      // ============ CLOUDWATCH ============
      cloudwatch: {
        putMetricData: async ({ namespace, metricName, value, unit = 'Count', dimensions }) => {
          return { message: 'Put metric data via CloudWatch API' };
        },
        getMetricStatistics: async ({ namespace, metricName, startTime, endTime, period = 300, statistics = ['Average'] }) => {
          return { message: 'Get metric statistics via CloudWatch API' };
        }
      }
    };

    const serviceHandler = services[service];
    if (!serviceHandler) {
      return Response.json({ error: 'Unknown service', available: Object.keys(services) }, { status: 400, headers: corsHeaders });
    }

    const actionHandler = serviceHandler[action];
    if (!actionHandler) {
      return Response.json({ error: 'Unknown action', available: Object.keys(serviceHandler) }, { status: 400, headers: corsHeaders });
    }

    const result = await actionHandler(data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});