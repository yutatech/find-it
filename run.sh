#!/bin/bash

# スクリプトが存在するディレクトリを取得
SCRIPT_DIR=$(dirname "$(realpath "$0")")

cd $SCRIPT_DIR/backend
python3 main.py