# WebRTC client
## HTTPS化
`../server/README.md`を参照してserver側の.pemファイルを生成してください。
この手順は必須です。

## setup
```sh
npm install
```

下のようなエラーが出るが、気にしない。
```
8 vulnerabilities (2 moderate, 6 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

## プログラムの書き換え
App.jsの5行目、`server_url`の`yuta-air.local`の部分を自分のPCの`hostname.local`に書き換える

## 起動
```sh
npm start
```

## iOSからアクセスする
### サーバー端末のポート解放
#### Windowsの場合
- [＜Windows10・11＞ファイアウォールのポートの開放](http://www.fc-center.jp/support/index.php?%A5%CD%A5%C3%A5%C8%A5%EF%A1%BC%A5%AF%A5%BF%A5%A4%A5%D7/windows%A5%D5%A5%A1%A5%A4%A5%A2%A5%A6%A5%A9%A1%BC%A5%EB%A4%CE%A5%DD%A1%BC%A5%C8%A4%CE%B3%AB%CA%FC/Windows10%A1%A611%A5%D5%A5%A1%A5%A4%A5%A2%A5%A6%A5%A9%A1%BC%A5%EB%A4%CE%A5%DD%A1%BC%A5%C8%A4%CE%B3%AB%CA%FC)などを参考にWindowsの3000番Portと8000番Portを解放する

または
- [Windowsファイアウォールを無効にする方法](https://www.buffalo.jp/support/faq/detail/16417.html)などを参考にファイアウォールを無効化する

#### macOSの場合
- 設定アプリ > ネットワーク > ファイアウォール を開く
- ファイアウォールのトグルスイッチをOFFにする

### サーバー側端末のホスト名を調べる
- Windows
  - [【PC】クライアントPCの「ホスト名(コンピューター名)」を変更したい](https://faq01-fb.fujifilm.com/faq/show/85529?site_domain=default)などを参考に調べる
- macOS
  - ターミナルを開いた時に出ている文字の`username@hostname:~$`みたいな文字列のhostnameの部分がホスト名
### iOSのブラウザからアクセス
「サーバー側端末のホスト名を調べる」で分かったホスト名をhostnameを表します。
1. `https://hostname.local:8000`にアクセス
2. 「接続はプライベートではありません」みたいな文言が表示されるので、詳細を表示 > このWebサイトを閲覧　をクリック
3. Not Foudと表示されればOK
4. `https://hostname.local:3000`にアクセス
5. 2.と同様に警告を突破してアクセスする