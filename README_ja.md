# Hi, I'm soltonigiri 👋

[English](./README.md) | 日本語

TypeScriptとPythonを使い、OSSへのコントリビュートやWebアプリ・CLIの開発をしています。

**リモートの業務委託案件を募集しています。**

[ポートフォリオ](https://soltonigiri.pages.dev/) | [連絡先](https://x.com/solt_onigiri_)

## OSSへの貢献

### Merged

- [OpenClaw #120658](https://github.com/openclaw/openclaw/pull/120658)：
  Active Memoryの`recall error`がpromptに混ざる問題を再現し、修正。
- [pnpm #13885](https://github.com/pnpm/pnpm/pull/13885)：
  長い依存パスを含む`.modules.yaml`をRust側でも読めるよう修正。
- [Jest #16322](https://github.com/jestjs/jest/pull/16322)：
  `jest.retryTimes()`に`describe`単位の再実行を追加。
- [Jest #16344](https://github.com/jestjs/jest/pull/16344)：
  再試行時に、対象外のinline snapshotまで削除される問題を修正。
- [Jest #16343](https://github.com/jestjs/jest/pull/16343)：
  遅れて呼ばれた`done` callbackが後続テストへ影響する問題を修正。
- [Jest #16342](https://github.com/jestjs/jest/pull/16342)：
  skipまたはtodoの後も`currentlyRunningTest`が残る問題を修正。
- [activist #2335](https://github.com/activist-org/activist/pull/2335)：
  サイドバーのアイコンサイズを統一し、回帰テストを追加。
- [mcp-migrate #222](https://github.com/dheerajjha/mcp-migrate/pull/222)：
  非表示項目数を一覧へ表示。不正値の検証とテストも追加。

### レビューと調査

- [Jest #16374](https://github.com/jestjs/jest/pull/16374#pullrequestreview-5047656739)：
  external snapshotの失敗情報に解決済みpathが入り、inline snapshotには入らないことをCircus/Jasmineで確認。
- [Jest #16345](https://github.com/jestjs/jest/pull/16345#pullrequestreview-5056029310)：
  prefixが重なるtable keyの補間に挿入順依存があることを指摘し、修正と回帰テストを確認。
- [Jest #16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062)：
  `custom matcher`の結果型で出る型エラーをTypeScript 5.4/5.9で確認。

### Open

- [Jest #16402](https://github.com/jestjs/jest/pull/16402)：
  `snapshotResolver`と`snapshotSerializers`のESM対応を追加。
- [OpenTelemetry JS Contrib #3707](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3707)：
  `ioredis` callbackが複数回呼ばれてもspanを重複終了しないよう修正。
- [workerd #7174](https://github.com/cloudflare/workerd/pull/7174)：
  worker logへ`console.trace()`のstackを追加し、Inspectorとtailの既存動作を維持。

## 個人開発

- [youtube-markdown-archiver](https://github.com/soltonigiri/youtube-markdown-archiver)：
  動画の情報、字幕、音声認識、画像内の文字をMarkdownで保存するローカルCLI。
- [余命.exe](https://github.com/soltonigiri/yomei-exe)：
  日本の公的統計から、統計上の残り時間と自由時間を計算。入力内容は端末内だけで処理。
- [scp-mcp](https://github.com/soltonigiri/scp-mcp)：
  SCP Wikiを検索し、出典、作者、ライセンス情報を取得する読み取り専用MCPサーバー。
