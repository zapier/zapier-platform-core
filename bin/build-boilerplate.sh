#!/usr/bin/env bash

# Usage like so:
# ./build-boilerplate.sh

FILE='boilerplate.zip'

# This allows us to avoid duplicating files in git
FILES_TO_COPY='zapierwrapper.js'

if [ -f $FILE ]
then
   rm -f $FILE
fi

# Copy files
cp include/$FILES_TO_COPY boilerplate/

# Get new version
NEW_VERSION="$(node -p "require('./package.json').version")"

FIND_DEP_STRING='"zapier-platform-core": "CORE_PLATFORM_VERSION"'
FIND_DEF_STRING='"platformVersion": "CORE_PLATFORM_VERSION"'
REPLACE_DEP_STRING='"zapier-platform-core": "'"$NEW_VERSION"'"'
REPLACE_DEF_STRING='"platformVersion": "'"$NEW_VERSION"'"'

# Update version
sed -i '' -e "s/$FIND_DEP_STRING/$REPLACE_DEP_STRING/g" boilerplate/package.json
sed -i '' -e "s/$FIND_DEF_STRING/$REPLACE_DEF_STRING/g" boilerplate/definition.json

# Install dependencies
cd boilerplate && npm install

# Build the zip file!
zip -R ../$FILE '*.js' '*.json'

# Revert copied files
rm -f $FILES_TO_COPY

# Remove node_modules
rm -fr node_modules && cd ..

# Revert version
sed -i '' -e "s/$REPLACE_DEP_STRING/$FIND_DEP_STRING/g" boilerplate/package.json
sed -i '' -e "s/$REPLACE_DEF_STRING/$FIND_DEF_STRING/g" boilerplate/definition.json
