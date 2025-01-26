# find-it frontend
## SSL通信
- `find-it/backend/README.md`を参照してbackend側の.pemファイルを生成してください。
- この手順は必須です。

## setup
```sh
cd find-it/frontend
npm install
```

下のようなエラーが出るが、気にしない。
```
8 vulnerabilities (2 moderate, 6 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

## 起動
```sh
npm start
```

- これで`localhost:3000`にfronendのサーバーが起動する。

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
  - `scutil --get LocalHostName`の結果がhostname

### mDNSサーバーの設定
- DNSサーバーが存在しないLAN内でもhostname.localで名前解決できるのは、各端末が自身のhostnameとIP Addressの紐付けをLAN内全体にmulticastしているから。この機能を mDNS (multicast DNS)という。各端末にmDNSのサーバーを立てておく必要がある。
- WSLではサーバーをインストールする必要があるかも。詳しくは[こちらを参照のこと](https://zenn.dev/dozo/articles/e16d29e89eadbf)。

### iOSのブラウザからアクセス
- 手元の環境では、初期状態ではfrontendからbackendへのアクセスが拒否されるので、ブラウザから直接backendに一回接続してブラウザが通信を拒否しないようにする必要がある。
- 「サーバー側端末のホスト名を調べる」で分かったホスト名をhostnameを表します。
1. `https://hostname.local:8000`にアクセス
2. 「接続はプライベートではありません」みたいな文言が表示されるので、詳細を表示 > このWebサイトを閲覧　をクリック
3. Not Foudと表示されればOK
4. `https://hostname.local:3000`にアクセス
5. 2.と同様に警告を突破してアクセスする