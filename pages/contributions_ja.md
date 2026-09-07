# OSSへの貢献

[ホーム](../README_ja.md) · [個人開発](./projects_ja.md) · [English](./contributions.md)

## マージ済み

[OpenClaw \#120658](https://github.com/openclaw/openclaw/pull/120658)\
Active Memoryの`recall error`がpromptに混ざる問題を再現し、修正。

[pnpm \#13885](https://github.com/pnpm/pnpm/pull/13885)\
長い依存パスを含む`.modules.yaml`をRust側でも読めるよう修正。

[Jest \#16322](https://github.com/jestjs/jest/pull/16322)\
`jest.retryTimes()`に`describe`単位の再実行を追加。

[Jest \#16344](https://github.com/jestjs/jest/pull/16344)\
再試行時に、対象外のinline snapshotまで削除される問題を修正。

[Jest \#16343](https://github.com/jestjs/jest/pull/16343)\
遅れて呼ばれた`done` callbackが後続テストへ影響する問題を修正。

[Jest \#16342](https://github.com/jestjs/jest/pull/16342)\
skipまたはtodoの後も`currentlyRunningTest`が残る問題を修正。

[activist \#2335](https://github.com/activist-org/activist/pull/2335)\
サイドバーのアイコンサイズを統一し、回帰テストを追加。

[mcp-migrate \#222](https://github.com/dheerajjha/mcp-migrate/pull/222)\
非表示項目数を一覧へ表示。不正値の検証とテストも追加。

## 進行中

[Jest \#16427](https://github.com/jestjs/jest/pull/16427)\
同じ依存モジュールが別々にインストールされているとモックが適用されない理由と、回避方法をドキュメントに追加。

[opentelemetry-js-contrib \#3710](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3710)\
SQS・SNSがメッセージを拒否する原因となる空のコンテキスト伝播属性を除外し、属性数の上限10件の判定も修正。

[oxc \#26160](https://github.com/oxc-project/oxc/pull/26160)\
`no-useless-spread`の誤検出を修正し、呼び出し元の型が不明な`slice()`の結果ではスプレッド構文を維持。

[workerd \#7174](https://github.com/cloudflare/workerd/pull/7174)\
worker logへ`console.trace()`のstackを追加し、Inspectorとtailの既存動作を維持。

[opentelemetry-js-contrib \#3707](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3707)\
`ioredis` callbackが複数回呼ばれてもspanを重複終了しないよう修正。

[Jest \#16402](https://github.com/jestjs/jest/pull/16402)\
`snapshotResolver`と`snapshotSerializers`のESM対応を追加。

[components \#33670](https://github.com/angular/components/pull/33670)\
`CdkTable`で`trackBy`による行の識別が変わらなくても、行定義が変わればテンプレートを更新するよう修正。

[langchainjs \#11329](https://github.com/langchain-ai/langchainjs/pull/11329)\
`ChatBedrockConverse`に再試行設定を反映し、ストリーミングでは出力の重複を避けるため再試行を初期化時に限定。

## レビュー・調査

[Jest \#16345](https://github.com/jestjs/jest/pull/16345#pullrequestreview-5056029310)\
prefixが重なるtable keyの補間に挿入順依存があることを指摘し、修正と回帰テストを確認。

[Jest \#16374](https://github.com/jestjs/jest/pull/16374#pullrequestreview-5047656739)\
外部スナップショットの失敗時だけパスを表示する変更を、CircusとJasmineで検証。

[Jest \#16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062)\
`custom matcher`の結果型で出る型エラーをTypeScript 5.4/5.9で確認。
