#!/bin/bash

set -e

if [ ! $1 ]; then
  echo "ERROR: Specify a version update"
  exit 1
fi

git checkout master

git pull

# can be 'patch' 'minor' 'major' or new version semver
npm version $1

new_version=$(cat package.json | grep \"version\" | awk '{print $2}' | tr -d \",)

branch_name=version-update/$new_version

git checkout -b $branch_name

git push --follow-tags --set-upstream origin $branch_name

git checkout master

git reset --hard HEAD^1

echo ""
echo "Follow this link to create a PR"
echo ""
echo "  https://github.com/artificialsolutions/tie-api-client-js/compare/master...${branch_name}?quick_pull=1"
echo ""
