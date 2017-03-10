#!/bin/bash

COMMAND=$1
BUILD_TAG=${2:-"dev"}

DOCKER_REPO="bartlettc"
CONTAINER_NAME="mpccontrollerservice"
LOCAL_PORT=8090

if [ $COMMAND == "build" ]; then 

  echo "Building container $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG..."
  docker build -t $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG ./

elif [ $COMMAND == "publish" ]; then

  echo "Pushing container $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG..."
  docker tag $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG $DOCKER_REPO/$CONTAINER_NAME:latest
  docker push $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG
  docker push $DOCKER_REPO/$CONTAINER_NAME:latest

elif [ $COMMAND == "run" ]; then

  # For local dev
  echo "Running container..."
  docker stop $CONTAINER_NAME > /dev/null 2>&1
  docker rm $CONTAINER_NAME > /dev/null 2>&1
  docker run \
          -d \
          --name $CONTAINER_NAME \
          -p $LOCAL_PORT:80 \
          -v $(pwd)/www:/usr/src/app \
          $DOCKER_REPO/$CONTAINER_NAME:$BUILD_TAG  

fi