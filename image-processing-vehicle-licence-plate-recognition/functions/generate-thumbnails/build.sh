#!/bin/sh

apk add --no-cache zlib zlib-dev jpeg-dev

pip3 install -r ${SRC_PKG}/requirements.txt -t ${SRC_PKG} && cp -r ${SRC_PKG} ${DEPLOY_PKG}
