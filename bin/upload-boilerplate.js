#!/usr/bin/env node

const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const fileName = 'boilerplate.zip';
const zipFile = fs.readFileSync(fileName);

const platformVersion = require('../package.json').version;

console.log(`Uploading boilerplate zip to S3 for version ${platformVersion}.`);

const options = {
  Bucket: 'zapier-dev-platform-cli-boilerplates',
  Key: `${platformVersion}.zip`,
  Body: zipFile,
  ACL: 'public-read'
};

s3.putObject(options, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
});
