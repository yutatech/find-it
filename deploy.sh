#!/bin/bash

# スクリプトが存在するディレクトリを取得
SCRIPT_DIR=$(dirname "$(realpath "$0")")


export REACT_APP_API_URL="https://find-it.yutatech.jp"
echo "REACT_APP_API_URL=$REACT_APP_API_URL"

npm --prefix $SCRIPT_DIR/frontend install
npm --prefix $SCRIPT_DIR/frontend run build

scp -r $SCRIPT_DIR/frontend/build find-it:~/find-it/backend

ssh find-it "pkill -f main.py || true"

ssh find-it "
set -x &&
# デプロイ先ディレクトリへ移動
cd ~/find-it/backend &&

# 最新ファイルを取得
git pull&&
source ~/find-it/venv/bin/activate &&
cd ~/find-it/backend &&
(nohup python3 main.py > output.log 2>&1 &) &&
exit
"