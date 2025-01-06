const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 静的ファイルの配信 (同じフォルダにある client.html が対象)
app.use(express.static(__dirname));

// 簡易的にメモリで教師データを保持
let trainingDataStore = [];

io.on('connection', (socket) => {
  console.log('クライアントが接続しました:', socket.id);

  socket.on('send_training_data', (data) => {
    // data.label, data.imageBase64 (Base64文字列)
    console.log('受信した教師データ:', {
      label: data.label,
      imageBase64First50: data.imageBase64?.slice(0, 50) + '...'
    });

    // 格納 (必要に応じてDBやファイル保存)
    trainingDataStore.push({
      label: data.label,
      imageBase64: data.imageBase64
    });

    // 応答を返す
    socket.emit('send_training_data_success', { status: 'ok' });
  });
});

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});

