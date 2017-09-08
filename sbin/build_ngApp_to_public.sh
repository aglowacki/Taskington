#!/bin/sh

currentDir=`pwd`
MY_DIR=`dirname $0`

source $MY_DIR/configure_paths.sh

path_to_npm=`which npm`

if [ -z $path_to_npm ]; then
    >&2 echo "ERROR: Could not find npm. Please run install_nodejs.sh and try again."
    exit 1
fi

ngAppDir=$TASKINGTON_ROOT_DIR/ngApp

cd $ngAppDir

path_to_ng=`which ng`
if [ -z $path_to_ng ]; then
    npm install -g @angular/cli
fi

# Update any dependencies
npm install

ng build --target=production --environment=prod --base-href=/new-static/ --output-path=../new-public

cd $currentDir
