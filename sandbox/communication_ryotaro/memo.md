# 画像アップロードシステム

このプロジェクトは、画像をサーバーにアップロードし、ファイルパスをクライアントに返却するシンプルなシステムです。サーバーはFastAPIを使用しており、クライアントはReact.jsで構築されています。サーバーとクライアントの2つの部分に分かれており、個別に実行できます。

## サーバーサイド (FastAPI)

サーバーサイドは`find-it/sandbox/communication_ryotaro/server`ディレクトリ内で動作します。FastAPIを使用して画像アップロードのAPIを提供します。`upload_images`に画像が保存される．

### 必要なもの

- Python 3.12+
- FastAPI
- Uvicorn
- その他依存関係

### セットアップ手順

1. サーバーを起動します。次のコマンドを実行します。

    ```bash
    cd find-it/sandbox/communication_ryotaro/server
    uvicorn server:app --reload --host 0.0.0.0 --port 8000
    ```

    サーバーが`http://localhost:8000`で動作します。APIのエンドポイントは、`POST /upload/`です。

3. サーバーが正常に起動したら、クライアント側と通信を開始できます。

### サーバー側だけでテスト
1. 次のコマンドを実行します。
    ```bash
    curl -X POST "http://localhost:8000/upload/" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "file=@uploading_images/TokyoTower.jpg"
    ```
---

## クライアントサイド (React)

クライアントサイドは`find-it/sandbox/communication_ryotaro/client/image-upload-app`ディレクトリ内にあります。React.jsを使用して画像アップロードフォームを作成しています。

### 必要なもの

- Node.js
- npm (Node Package Manager)

### セットアップ手順


1. 開発用サーバーを起動します。

    ```bash
    cd find-it/sandbox/communication_ryotaro/client/image-upload-app
    npm start
    ```

    開発サーバーが`http://localhost:3000`で動作し、クライアント側のUIが表示されます。画像を選択してアップロードできます。

---

## 使用方法

1. クライアント側で画像を選択し、アップロードボタンをクリックします。
2. クライアントは、選択した画像をFastAPIサーバーに送信します。
3. サーバーは受け取った画像を保存し、保存されたファイルのパスをクライアントに返します。
4. クライアントは返却されたファイルパスを表示します。
---
パスは表示できない

## 今後

- WebSocket通信にする
- 機械学習らへんをどこに入れるのか
- 動画の通信はどうするのか→WebRTC？
- WibSocketとWebRTCの関係は？

