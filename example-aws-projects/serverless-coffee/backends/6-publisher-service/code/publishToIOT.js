/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})
const iotdata = new AWS.IotData({ endpoint: process.env.IOT_DATA_ENDPOINT })

// Publishes the message to the IoT topic (admin)
const iotPublish = async function (baseTopic, event) {

  try {
    const eventId = event.detail.eventId
    const topic = `${baseTopic}-${eventId}`
    console.log({ eventId }, { topic })

    const params = {
      topic,
      qos: 1,
      payload: JSON.stringify({
        type: event['detail-type'],
        detail: event.detail
      })
    }
    console.log('Params: ', params)
    const result = await iotdata.publish(params).promise()
    console.log('iotPublish success: ', topic, process.env.IOT_DATA_ENDPOINT, result)
  } catch (err) {
    console.error('iotPublish error:', err)
  }
}

exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  await iotPublish(process.env.IOT_TOPIC, event)
}
