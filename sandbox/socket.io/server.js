const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Expressのインスタンスを生成
const app = express();

// HTTPサーバーを立ち上げる
const server = http.createServer(app);

// Socket.IOをHTTPサーバーにアタッチ
const io = socketIO(server);

// 簡易的にメモリ内に教師データを保持する例
let trainingDataStore = [];

// (1) 静的ファイルを配信する設定を追加
//    └ ここでは「server.js」と同じフォルダに「client.html」がある想定
+ app.use(express.static(__dirname));

// クライアントとの接続時の処理
io.on('connection', (socket) => {
  console.log('クライアントが接続しました:', socket.id);

  // --- 教師データの送信イベントを受け取る ---
  socket.on('send_training_data', (data) => {
    console.log('受信した教師データ:', data);
    trainingDataStore.push(data);
    socket.emit('send_training_data_success', { status: 'ok' });
  });

  // --- 教師データの要求イベントを受け取る ---
  socket.on('request_training_data', () => {
    console.log('クライアントから教師データを要求されました');
    socket.emit('receive_training_data', trainingDataStore);
  });

  // 切断時
  socket.on('disconnect', () => {
    console.log('クライアントが切断しました:', socket.id);
  });
});

// サーバーを3000番ポートで起動
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
