# find-it

## About this app
このアプリは、カメラを使って探し物をしてくれるAIです。アプリを立ち上げて探しているものを選択すると、カメラの映像から探し物を見つけてくれます。
- [探し物探索システムの提案.pdf](./doc/探し物探索システムの提案.pdf)
- [Proposal_of_a_search_system.pdf](./doc/Proposal_of_a_search_system.pdf)

## App URL
[https://find-it.yutatech.jp](https://find-it.yutatech.jp)

## Demo
<p align="center">
<img src="./doc/demo.gif" width="300px" />
</p>

## Technologies
- YOLO
  - 物体検出にはPythonのYOLOを採用しています。YOLO v8nをベースに追加学習することで探し物に特化した物体検出モデルを作成しました。
- WebRTC
  - client -> Server の映像転送プロトコルにはWebRTCを採用しています。このシステムの映像転送にはリアルタイム性が重要なので、動的に画像サイズや通信経路を切り替えることで高速に映像を転送できるWebRTCを採用しました。
- Socket通信
  - Client <-> Server 間の検出結果の送信やWebRTCの通信確立の処理はSocket通信で実現しています。
- Optical Flow
  - 通信の遅延や物体検出の推論時間によって、検出結果の表示が実際の映像よりも遅れてしまいます。映像中の各ピクセルの変位を検出するOptical FLowという技術を用いて、クライアント側で画面全体の移動量を計算しています。クライアントで画像がサンプリングされてから検出結果が返ってくるまでの間に画面全体の移動量を補完して検出結果を表示しています。この仕組みによって、高いフレームレートで映像を表示しつつ、同じフレームレートで検出結果を物体に追従させています。
- React
  - アプリのフロントエンドの実装にはReactを採用しています。
- Bootstrap, MUI
  - アプリ中の Button や Select などの見た目の要素は Bootstrap と MUI を用いて実装しています。これら二つが使われている理由は、各要素の実装者の違いによるものです。
- Python
  - 物体検出とバックエンドのAPIの実装にはPythonを用いています。

## Setup
```shell
pip install fastapi python-socketio aiortc ultralytics opencv-python uvicorn
sudo apt install -y nodejs npm
```

## Build & Run
```shell
cd find-it
./build.sh
./run.sh
```

## About scripts
- `build.sh`
  - frontendをビルドして静的ファイルを生成する。成果物をbackendディレクトリにコピーして、backendからwebアプリを提供できるようにします。成果物はgitignoreされています。
- `run.sh`
  - 手元環境でbackendを起動します。localhost:8000からアクセスできます。
- `deploy.sh`
  - 本番環境にdeployします。`find-it`でサーバーにssh接続できるように設定しておく必要があります。
  - スクリプト中の`REACT_APP_API_URL`をアプリのURLに設定しておく必要があります。
  - このスクリプトで以下を実行します
    - サーバーで実行中のアプリを停止
    - サーバーでgit pull
    - ローカルでWEBアプリの英的ファイルを生成し、サーバーにコピー
    - サーバーでアプリを起動し、ssh終了

## Directories
- frontend
  - reactアプリのソースコード
  - 詳細は[./frontend/README.md](./frontend/README.md)参照のこと
- backend
  - backendサーバーのpythonスクリプト
  - 詳細は[./backend/README.md](./backend/README.md)参照のこと
- yolo
  - 機械学習のためのpythonスクリプト
  - 詳細は[./yolo/README.md](./yolo/README.md)参照のこと
- sanbox
  - 試行錯誤段階のソースコードを格納する directory

## Contributors
- Fujiyama Yuta / 藤山優太
- Koizumi Momoko / 小泉桃子
- Yamamoto Hinako / 山本陽奈子
- Koizumi Jigen / 小泉慈元
- Kitamura Shingo / 北村晨悟
- Ishii Ryotaro / 石井崚太郎
- Ishii Ryohei / 石井遼平
