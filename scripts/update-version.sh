#!/bin/bash

set -e

if [ ! $1 ]; then
  echo "ERROR: Specify a version update"
  exit 1
fi

git checkout master > /dev/null

git pull > /dev/null

# can be 'patch' 'minor' 'major' or new version semver
npm --no-git-tag-version version $1

new_version=$(cat package.json | grep \"version\" | awk '{print $2}' | tr -d \",)

echo "Bumping version to $new_version"

branch_name=version-update/$new_version

git checkout -b $branch_name > /dev/null

git add .

git commit -m "Bump version to $new_version"

git push --set-upstream origin $branch_name > /dev/null

git checkout master > /dev/null

echo ""
echo "Follow this link to create a PR"
echo ""
echo "  https://github.com/artificialsolutions/tie-api-client-js/compare/master...${branch_name}?quick_pull=1&title=Bump+version+to+${new_version}"
echo ""
