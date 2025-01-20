# PoliteKey

PoliteKeyは、選択したテキストを丁寧な表現に変換するElectronアプリケーションです。OpenAIのAPIを使用して、テキストをより親しみやすい表現に変換します。

## 機能
- ショートカットキー `Command + P` で選択したテキストを変換
- 変換後のテキストをクリップボードにコピー
- トレイアイコンをクリックしてアプリケーションを操作
- グローバル通知機能でリマインダーを設定

## インストール

1. リポジトリをクローンします。

   ```bash
   git clone https://github.com/yourusername/politekey.git
   cd politekey
   ```

2. 依存関係をインストールします。

   ```bash
   yarn install
   ```

3. 環境変数を設定します。`.env`ファイルを作成し、OpenAIのAPIキーを設定します。

   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## 使用方法

1. アプリケーションを起動します。

   ```bash
   yarn start
   ```

2. `Command + C`で対象のテキストをクリップボードにコピーします。
3. `Command + P` を押して、選択したテキストを変換してクリップボードを更新します。
4. `Command + V`で、クリップボードにある変換後のテキストを貼り付けます。

## 開発
TODO

- [ ] モデル選択メニューの追加
- [ ] ユーザーが期待する出力を伝えられるようにする。

### ビルド

アプリケーションをパッケージ化します。
