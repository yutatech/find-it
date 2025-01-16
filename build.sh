#!/bin/bash

# スクリプトが存在するディレクトリを取得
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# OS判定
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOSの場合
    HOSTNAME=$(scutil --get LocalHostName).local
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linuxの場合
    HOSTNAME=$(hostname)
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Building frontend..."

REACT_APP_API_URL=https://$HOSTNAME:8000
echo "REACT_APP_API_URL=$REACT_APP_API_URL"

npm --prefix $SCRIPT_DIR/frontend install
npm --prefix $SCRIPT_DIR/frontend run build
rm -rf $SCRIPT_DIR/backend/build
mv $SCRIPT_DIR/frontend/build $SCRIPT_DIR/backend/