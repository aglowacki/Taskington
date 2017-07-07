#!/bin/bash

# Taskington setup script for Bourne-type shells
# This file is typically sourced in user's .bashrc file

myDir=`dirname $BASH_SOURCE`
currentDir=`pwd` && cd $myDir
if [ ! -z "$TASKINGTON_ROOT_DIR" -a "$TASKINGTON_ROOT_DIR" != `pwd` ]; then
    echo "WARNING: Resetting TASKINGTON_ROOT_DIR environment variable (old value: $TASKINGTON_ROOT_DIR)" 
fi
export TASKINGTON_ROOT_DIR=`pwd`

if [ -z $TASKINGTON_INSTALL_DIR ]; then
    export TASKINGTON_INSTALL_DIR=$TASKINGTON_ROOT_DIR/..
    if [ -d $TASKINGTON_INSTALL_DIR ]; then
        cd $TASKINGTON_INSTALL_DIR
        export TASKINGTON_INSTALL_DIR=`pwd`
    fi
fi

# Establish machine architecture and host name
TASKINGTON_HOST_ARCH=`uname | tr [A-Z] [a-z]`-`uname -m`

# Check support setup
if [ -z $TASKINGTON_SUPPORT_DIR ]; then
    export TASKINGTON_SUPPORT_DIR=$TASKINGTON_INSTALL_DIR/support
    if [ -d $TASKINGTON_SUPPORT_DIR ]; then
        cd $TASKINGTON_SUPPORT_DIR
        export TASKINGTON_SUPPORT_DIR=`pwd`
    fi
fi
if [ ! -d $TASKINGTON_SUPPORT_DIR ]; then
    echo "Warning: $TASKINGTON_SUPPORT_DIR directory does not exist. Developers should point TASKINGTON_SUPPORT_DIR to the desired area."
fi

# Add to path only if directory exists.
prependPathIfDirExists() {
    _dir=$1
    if [ -d ${_dir} ]; then
        PATH=${_dir}:$PATH
    fi
}

prependPathIfDirExists $TASKINGTON_SUPPORT_DIR/nodejs/$TASKINGTON_HOST_ARCH/bin

# Done
cd $currentDir

