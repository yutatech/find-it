# find-it backend

## スクリプトについて
- main.py
  - deploy用サーバーでの実行スクリプト。deploy用サーバーでは Nginx + Let's Encrypt でSSL通信を実装しているのでuvicornでSSLの設定は不要
- main_debug.py
  - 手元のPCで実行する用の、uvicornでosSSL通信を行うスクリプト。

## python moduleのインストール
```sh
pip3 install fastapi python-socketio aiohttp ultralytics opencv-python uvicorn
```

## SSL通信
- iOS Safariでカメラを使うにはHTTPSが必須です。
- 手元のPCで実行する場合、この手順の実行がserverとclientの起動に必須です。

### 証明書の発行
#### Ubuntu
```sh
cd find-it/backend
sudo apt install mkcert
mkcert -install
mkcert webrtc-test
```

#### macOS
```sh
cd find-it/backend
brew install mkcert
mkcert -install
mkcert webrtc-test
```

生成された.pemファイルをクライアント側でも使う

## プログラムの書き換え

## 起動
```sh
cd find-it/backend
python3 main_debug.py
```