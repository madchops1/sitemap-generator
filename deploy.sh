#!/bin/bash
# Bucket Id for production: botmap.io
aws s3 sync ./dist s3://botmap.io --region="us-east-1" --exclude="Gruntfile.js" --exclude="package.json" --exclude="README.md" --exclude="bower.json" --exclude=".gitignore" --exclude=".DS_Store" --exclude="deploy.sh" --exclude=".git/*" --exclude="_sources/*" --exclude=".sass-cache/*" --exclude=".tmp/*" --exclude="node_modules/*"
