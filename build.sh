#!/bin/bash

# スクリプトが存在するディレクトリを取得
SCRIPT_DIR=$(dirname "$(realpath "$0")")

npm --prefix $SCRIPT_DIR/frontend install
npm --prefix $SCRIPT_DIR/frontend run build
mv $SCRIPT_DIR/frontend/build $SCRIPT_DIR/backend/