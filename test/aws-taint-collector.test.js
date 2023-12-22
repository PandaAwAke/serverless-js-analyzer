const esprima = require('esprima');

const awsTaintCollector = require('../scripts/collectors/require-import-collector');

test('应该正常找出 aws sources', () => {
  var input = `
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

  expect(awsTaintSources[0].scopeName).toBe('global');
  expect(awsTaintSources[0].variable).toBe('S3Client');
  expect(awsTaintSources[1].scopeName).toBe('global');
  expect(awsTaintSources[1].variable).toBe('PutObjectCommand');
});
