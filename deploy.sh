#!/bin/bash
# Bucket Id for production: botmap.io
grunt build
aws s3 cp ./dist s3://botmap.io --region="us-east-1" --acl public-read --recursive
