# WebRTC Server
## python moduleのインストール
```sh
pip3 install fastapi python-socketio aiohttp ultralytics opencv-python uvicorn
```

## HTTPS化
この手順の実行がserverとclientの起動に必須です。

### 証明書の発行
#### Ubuntu
```sh
cd server
sudo apt install mkcert
mkcert -install
mkcert webrtc-test
```

#### macOS
```sh
cd server
brew install mkcert
mkcert -install
mkcert webrtc-test
```

生成された.pemファイルをクライアント側でも使う

## プログラムの書き換え
server.pyの236行目、237行目の`yuta-air.local`の部分を自分のPCの`hostname.local`に書き換える

## 起動
```sh
cd server
python3 server.py
```