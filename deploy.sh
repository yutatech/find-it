#!/bin/bash

# スクリプトが存在するディレクトリを取得
SCRIPT_DIR=$(dirname "$(realpath "$0")")


export REACT_APP_API_URL=https://find-it.yutatech.jp
echo "REACT_APP_API_URL=$REACT_APP_API_URL"

npm --prefix $SCRIPT_DIR/frontend install
npm --prefix $SCRIPT_DIR/frontend run build

scp -r $SCRIPT_DIR/frontend/build find-it:~/find-it/backend