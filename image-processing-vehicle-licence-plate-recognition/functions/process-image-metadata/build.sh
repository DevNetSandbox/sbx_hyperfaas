#!/bin/sh

#apk add python make g++
npm install --prefix ${SRC_PKG} ${SRC_PKG} && cp -a ${SRC_PKG}/. ${DEPLOY_PKG}
