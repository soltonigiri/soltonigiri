# soltonigiri

[English](./README.md) | 日本語

TypeScriptとPythonを使い、OSSへのコントリビュートやWebアプリ・CLIの開発をしています。

**リモートの業務委託案件を募集しています。**

[ポートフォリオ](https://soltonigiri.pages.dev/) | [連絡先](https://x.com/solt_onigiri_)

## OSSへの貢献

### Merged

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

- [Jest #16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062)：
  `custom matcher`の結果型で出る型エラーをTypeScript 5.4/5.9で確認。
- [Jest #16359](https://github.com/jestjs/jest/pull/16359#pullrequestreview-4981957277)：
  projectの設定順でcoverage結果が変わる問題と、テストがないprojectの集計漏れを確認。
- [Jest #9210](https://github.com/jestjs/jest/issues/9210#issuecomment-5408569604)：
  未処理のPromise rejectionの表示を、Node.js 20/24とCircus/Jasmineで確認。

### Open

- [LangChain.js #11329](https://github.com/langchain-ai/langchainjs/pull/11329)：
  Bedrock Converseでretry設定が反映されない問題を修正。
- [Angular Components #33670](https://github.com/angular/components/pull/33670)：
  `row definition`変更後も古いtemplateが使われる問題を修正。
- [OpenClaw #120658](https://github.com/openclaw/openclaw/pull/120658)：
  Active Memoryの`recall error`がpromptに混ざる問題を再現し、修正。

## 個人開発

- [youtube-markdown-archiver](https://github.com/soltonigiri/youtube-markdown-archiver)：
  動画の情報、字幕、音声認識、画像内の文字をMarkdownで保存するローカルCLI。
- [余命.exe](https://github.com/soltonigiri/yomei-exe)：
  日本の公的統計から、統計上の残り時間と自由時間を計算。入力内容は端末内だけで処理。
- [scp-mcp](https://github.com/soltonigiri/scp-mcp)：
  SCP Wikiを検索し、出典、作者、ライセンス情報を取得する読み取り専用MCPサーバー。
