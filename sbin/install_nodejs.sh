#!/bin/sh

currentDir=`pwd`
MY_DIR=`dirname $0`

source $MY_DIR/configure_paths.sh

if [ ! -d $TASKINGTON_SUPPORT_DIR ]; then
    mkdir $TASKINGTON_SUPPORT_DIR
fi

cd $TASKINGTON_SUPPORT_DIR
echo $TASKINGTON_SUPPORT_DIR

NODE_VERSION=v6.11.0
# Set PROG_ARCH
if [ `uname -m` == "x86_64" ]; then
    PROG_ARCH=`uname | tr [A-Z] [a-z]`-x64
else
    PROG_ARCH=`uname | tr [A-Z] [a-z]`-`uname -m`
fi

# Version should increment up if a script should perform an update to current installs. (int)
INSTALL_SCRIPT_VERSION=1
HOST_ARCH=`uname | tr [A-Z] [a-z]`-`uname -m`
PROG_NAME='nodejs'
fullName=node-$NODE_VERSION-$PROG_ARCH
ARCHIVE_EXTENSION=tar.gz

srcDir=$TASKINGTON_SUPPORT_DIR/src
installDir=$TASKINGTON_SUPPORT_DIR/$PROG_NAME
fullInstallDir=$installDir/$HOST_ARCH
INSTALL_SCRIPT_VERSION_PATH=$fullInstallDir/installScriptVersion

DOWNLOAD_URL=https://nodejs.org/dist/$NODE_VERSION/$fullName.$ARCHIVE_EXTENSION

if [ -d $fullInstallDir ]; then
	if [ $INSTALL_SCRIPT_VERSION -gt `cat $INSTALL_SCRIPT_VERSION_PATH` ]; then 
		echo "$PROG_NAME needs to be updated"
	elif [ "x$1" == "x--force" ]; then 
    	echo "[WARNING] It appears that $PROG_NAME is already installed." >&2
    	echo "Would you like to remove the current installation of $PROG_NAME at $fullInstallDir"
		read -p "Remove and Continue (y/n)? " response
		case "$response" in 
		y|Y ) 
			echo "Removal confirmed: $fullInstallDir";;
		n|N )
			exit 1;;
		* ) 
			echo "Invalid response, $PROG_NAME will not be installed"
			exit 1;;
		esac
	else 
		echo "$PROG_NAME is already installed with the latest script"
		if [ ! x$1 == "x--silent" ]; then 
			echo "Running the install script with the switch --force to override install"
		fi
		exit 1
	fi	
else 
	echo "$PROG_NAME needs to be installed"
fi 

if [ x$1 == "x--silent" ]; then 
	exit 0
else
	echo "removing directory $fullInstallDir"
	rm -Rf $fullInstallDir
fi


if [ ! -d $srcDir ]; then
    mkdir $srcDir
fi

cd $srcDir
curl -O $DOWNLOAD_URL

mkdir -p $installDir
cd $installDir

tar zvxf $srcDir/$fullName.$ARCHIVE_EXTENSION
# rename the directory 
mv $fullName $HOST_ARCH

echo "$PROG_NAME has been installed in $fullInstallDir"
echo $INSTALL_SCRIPT_VERSION > $INSTALL_SCRIPT_VERSION_PATH

cd $currentDir