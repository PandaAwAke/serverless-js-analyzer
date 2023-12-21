const esprima = require('esprima');

const awsTaintCollector = require('../scripts/collectors/aws-taint-collector');
const taintAnalysis = require('../scripts/taint-analysis');

test('应该正常找出所有污点-test1', () => {
  var input = `const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const {axios} = require('axios');

const destinationBucketName = process.env.BucketName;

exports.lambdaHandler = async (event) => {

  console.log(JSON.stringify(event, null, 4));

  const cloudFrontUrl = event.detail.video.playbackUrl;
  // Split the string using the delimiter '/'
  const urlParts = cloudFrontUrl.split('/ivs');
  // Get the last item (which is the object key)
  const destinationKey = urlParts[1];

  try {
    // Download the object from CloudFront using axios
    const response = await axios.get(cloudFrontUrl, { responseType: 'arraybuffer' });
    const cloudFrontObject = response.data;

    // Save the object to the destination S3 bucket
    const s3 = new S3Client({});
    await s3.send(
      new PutObjectCommand({
        Bucket: destinationBucketName,
        Key: destinationKey,
        Body: cloudFrontObject,
      })
    );
    var b;
    b = s3.a;

    console.log('Object downloaded from CloudFront and saved to S3 successfully.');

    return {
      statusCode: 200,
      body: destinationKey,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error downloading and saving the object.' }),
    };
  }
};
`;
  var ast = esprima.parseScript(input, {loc: true});

  var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
  
  var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources);

  console.log(taintObjects)

  expect(taintObjects.at(0).variable).toBe('S3Client');
  expect(taintObjects.at(1).variable).toBe('PutObjectCommand');
  expect(taintObjects.at(2).variable).toBe('s3');
  expect(taintObjects.at(3).variable).toBe('b');

  var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

  var taintLineNumbers = [...taintLineNumberSet];
  expect(taintLineNumbers.join(',')).toBe('1,23,24,25,31,32');
});


test('应该正常找出所有污点-test2', () => {
  var input = `const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

  exports.lambdaHandler = async (event) => {
  
    //  Log the event.
    console.log(JSON.stringify(event, null, 4));
  
    // Extract duration and taskToken from the incoming event
    const duration = event.detail.video.durationmillis;
    const taskToken = event.detail.taskToken;
  
    // Determine video validity based on duration
    let valid;
    if (duration > 10000) {
      valid = {
        "valid": true
      };
    } else {
      valid = {
        "valid": false,
        "reason": "video is too short"
      };
    }
  
    // Configure the EventBridge client
    const eventBridgeClient = new EventBridgeClient();
  
    // Define the event to be sent to EventBridge
    const eventToSend = {
      Source: 'serverlessVideo.plugin.duration_plugin',
      DetailType: 'plugin-complete',
      EventBusName: "default",
      Detail: JSON.stringify({"TaskToken": taskToken,"Message":valid})
    };
  
    console.log('Event to send', JSON.stringify(eventToSend, null, 4));
  
    // Create a command to put the event
    const putEventCommand = new PutEventsCommand({
      Entries: [eventToSend]
    });
  
    try {
      // Put the event on EventBridge
      await eventBridgeClient.send(putEventCommand);
      console.log('Event successfully sent to EventBridge');
    } catch (error) {
      console.error('Error sending event:', error);
      // Handle the error
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify(valid), // Ensure the body is stringified
    };
  };
`;
  var ast = esprima.parseScript(input, {loc: true});

  var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
  
  var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources);

  expect(taintObjects.at(0).variable).toBe('EventBridgeClient');
  expect(taintObjects.at(1).variable).toBe('PutEventsCommand');
  expect(taintObjects.at(2).variable).toBe('eventBridgeClient');
  expect(taintObjects.at(3).variable).toBe('putEventCommand');

  var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

  var taintLineNumbers = [...taintLineNumberSet];
  expect(taintLineNumbers.join(',')).toBe('1,26,39,45');
});


test('应该正常找出所有污点-test3-import', () => {
  var input = `import { QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
  import { DynamoDB } from "./dynamodb-doc-client.js";
  import _ from 'lodash';
  
  const SEARCH_INDEX_TABLE_NAME = process.env.SEARCH_INDEX_TABLE_NAME || 'search index table name not set';
  const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  
  /**
    * Super simple autocomplete indexing algorithm. It just breaks the
    * input project name into fragments, generates a score for each fragment
    * where the score is roughly equivalent to how much of each token is
    # made up of the fragment.
  **/
  export const addToIndex = async function (changelog) {
    var keywords = changelog.split(/[\/-]/g);
    var frags = [];
    var keyword;
    var fragMap = {};
    var frag;
  
    // This is used to set the TTL for each autocomplete. This causes
    // autocomplete fragments to automatically expire out of the table
    // unless they are reindexed at least once a day.
    var validUntil = Math.floor(Date.now() / 1000) + ONE_DAY_IN_SECONDS;
  
    // Generate a bunch of typing fragements, starting from
    // two characters up to an entire keyword from the project name
    for (keyword of keywords) {
      for (var i = 2; i <= keyword.length; i++) {
        frag = keyword.substr(0, i);
        if (fragMap[frag]) {
          continue;
        }
  
        // Add the frag to the list
        frags.push({
          fragment: frag,
          score: 0,
          complete: changelog
        });
  
        // Remember that we already have this frag
        fragMap[frag] = true;
      }
    }
  
    // Generate a score for each fragment and how relevant it is to this result
    // The goal is to store them with the fragment as the primary key and the
    // score as the secondary key, such that it can easily return the highest
    // scored fragment for each primary key fragment we search for.
    for (frag of frags) {
      for (keyword of keywords) {
        if (keyword.startsWith(frag.fragment)) {
          frag.score = Math.max(frag.score, (frag.fragment.length / keyword.length));
        }
      }
    }
  
    // Convert all the scores to fixed length strings
    // This allows them to be easily sorted by the secondary index
    for (frag of frags) {
      frag.score = frag.score.toFixed(10);
    }
  
    // We can write up to 25 items per batch
    var fragChunks = _.chunk(frags, 25);
    var promises = [];
  
    for (var fragChunk of fragChunks) {
      var batchOperation = {
        RequestItems: {}
      };
  
      batchOperation.RequestItems[SEARCH_INDEX_TABLE_NAME] = fragChunk.map(function (frag) {
        return {
          PutRequest: {
            Item: {
              fragment: frag.fragment,
              validUntil: validUntil
            }
          }
        };
      });
  
      promises.push(DynamoDB.send(new BatchWriteCommand(batchOperation)));
    }
  
    // Wait for all the batch operations to finish
    await Promise.all(promises);
  };
  
  /**
    * For a given fragment return potentially relevant completions
  **/
  export const completion = async function (fragment) {
    // This is used to filter out expired fragments that haven't
    // yet been physically removed from the table by DynamoDB
    var now = Math.floor(Date.now() / 1000);
  
    var results = await DynamoDB.send(new QueryCommand({
      TableName: SEARCH_INDEX_TABLE_NAME,
      KeyConditionExpression: 'fragment = :frag',
      FilterExpression: 'validUntil > :now',
      ExpressionAttributeValues: {
        ':frag': fragment,
        ':now': now
      },
      Limit: 10,
      ScanIndexForward: false
    }));
  
    // Post process the results to split the completion back out from
    // the score, and turn the score back into a real number
    var toReturn = [];
    for (var i of results.Items) {
      var components = i.score.split(':');
  
      toReturn.push({
        score: parseFloat(components[0]),
        completion: components[1]
      });
    }
  
    return toReturn;
  }; 
  `;
  var ast = esprima.parseScript(input, {loc: true, tolerant: true});

  var awsTaintSources = awsTaintCollector.collectTaintSourceObjects(ast);
  
  var taintObjects = taintAnalysis.collectTaintObjects(ast, awsTaintSources);

  console.log(taintObjects)

  expect(taintObjects.at(0).scopeName).toBe("global");
  expect(taintObjects.at(0).variable).toBe("QueryCommand");
  expect(taintObjects.at(1).scopeName).toBe("global");
  expect(taintObjects.at(1).variable).toBe('BatchWriteCommand');
  expect(taintObjects.at(2).scopeName).toBe("global");
  expect(taintObjects.at(2).variable).toBe('DynamoDB');
  expect(taintObjects.at(3).scopeName).toBe("global");
  expect(taintObjects.at(3).variable).toBe('addToIndex');
  expect(taintObjects.at(4).scopeName).toBe("anonymous#95");
  expect(taintObjects.at(4).variable).toBe('results');
  expect(taintObjects.at(5).scopeName).toBe("global");
  expect(taintObjects.at(5).variable).toBe('completion');

  var taintLineNumberSet = taintAnalysis.collectTaintObjectsLineNumbers(ast, taintObjects);

  var taintLineNumbers = [...taintLineNumberSet];
  expect(taintLineNumbers.join(',')).toBe('1,2,14,85,95,100,115,120');

  console.log(taintObjects, taintLineNumbers)
});
