# Contributions

[Home](../README.md) · [Personal projects](./projects.md) · [日本語](./contributions_ja.md)

## Merged

[OpenClaw \#120658](https://github.com/openclaw/openclaw/pull/120658)\
Reproduced and fixed an issue where Active Memory `recall error` messages leaked into prompts.

[pnpm \#13885](https://github.com/pnpm/pnpm/pull/13885)\
Updated the Rust implementation to support reading `.modules.yaml` files containing long dependency paths.

[Jest \#16322](https://github.com/jestjs/jest/pull/16322)\
Added support for rerunning tests at the `describe` level with `jest.retryTimes()`.

[Jest \#16344](https://github.com/jestjs/jest/pull/16344)\
Fixed an issue where retries also deleted inline snapshots outside the retried test.

[Jest \#16343](https://github.com/jestjs/jest/pull/16343)\
Fixed an issue where a late `done` callback affected subsequent tests.

[Jest \#16342](https://github.com/jestjs/jest/pull/16342)\
Fixed an issue where `currentlyRunningTest` remained set after skipped or todo tests.

[activist \#2335](https://github.com/activist-org/activist/pull/2335)\
Standardized sidebar icon sizes and added regression tests.

[mcp-migrate \#222](https://github.com/dheerajjha/mcp-migrate/pull/222)\
Displayed the number of hidden items in the list and added validation and tests for invalid values.

## Open

[Jest \#16431](https://github.com/jestjs/jest/pull/16431)\
Made coverage results, including untested files, available to custom reporters before their completion callbacks run.

[Jest \#16427](https://github.com/jestjs/jest/pull/16427)\
Documented why mocks can miss separately installed copies of a dependency and how to work around it.

[opentelemetry-js-contrib \#3710](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3710)\
Excluded empty context propagation attributes that cause SQS and SNS to reject messages, and corrected handling of the 10-attribute limit.

[oxc \#26160](https://github.com/oxc-project/oxc/pull/26160)\
Fixed false positives in `no-useless-spread` so spreads around `slice()` results are preserved when the receiver type is unknown.

[workerd \#7174](https://github.com/cloudflare/workerd/pull/7174)\
Added `console.trace()` stack output to worker logs while preserving existing Inspector and tail behavior.

[opentelemetry-js-contrib \#3707](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3707)\
Prevented duplicate span completion when an `ioredis` callback fires more than once.

[Jest \#16402](https://github.com/jestjs/jest/pull/16402)\
Added ESM support for `snapshotResolver` and `snapshotSerializers`.

[components \#33670](https://github.com/angular/components/pull/33670)\
Fixed stale row templates in `CdkTable` when `trackBy` preserves row identity but the row definition changes.

[langchainjs \#11329](https://github.com/langchain-ai/langchainjs/pull/11329)\
Made `ChatBedrockConverse` honor retry settings, limiting streaming retries to initialization to avoid duplicate output.

## Reviews and investigations

[Jest \#16428](https://github.com/jestjs/jest/pull/16428#pullrequestreview-5135474051)\
Verified error messages from `.mts` configs on Node.js 20, 22, 24, and 25, including hints when type stripping is unavailable and errors from config factories.

[Jest \#16409](https://github.com/jestjs/jest/pull/16409#pullrequestreview-5124351081)\
Identified a `Symbol.toStringTag` case that made `pretty-format` throw instead of displaying an assertion diff, and verified the fix.

[Jest \#16219](https://github.com/jestjs/jest/pull/16219#pullrequestreview-5060245801)\
Verified restoration after a throwing `.then` getter and identified `withImplementation` tests that did not exercise the changed source.

[Jest \#16345](https://github.com/jestjs/jest/pull/16345#pullrequestreview-5056029310)\
Found an insertion-order bug in overlapping table-key interpolation and verified the fix and regression tests.

[Jest \#16374](https://github.com/jestjs/jest/pull/16374#pullrequestreview-5047656739)\
Verified snapshot paths appear only in external snapshot failures, in both Circus and Jasmine.

[Jest \#16191](https://github.com/jestjs/jest/pull/16191#pullrequestreview-5017422388)\
Reproduced lost overload types when chaining spy helpers and verified a proposed type-signature change with TypeScript 5.4 and 5.9.

[Jest \#16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062)\
Verified a type error in custom matcher result types with TypeScript 5.4 and 5.9.

[Jest \#16372](https://github.com/jestjs/jest/pull/16372#pullrequestreview-5015687720)\
Verified coverage-threshold behavior for sharded and unsharded runs, report merging, and documentation of the remaining limitations.

[Jest \#16359](https://github.com/jestjs/jest/pull/16359#pullrequestreview-4981957277)\
Reproduced coverage results that depended on project order and missing coverage for projects with no test files.

[Jest \#16379](https://github.com/jestjs/jest/pull/16379#pullrequestreview-4981956156)\
Used a native addon to show that excluding all `CustomGC` handles can hide handles that keep Node.js running.

[Jest \#16373](https://github.com/jestjs/jest/pull/16373#pullrequestreview-4971117056)\
Found that the built-in async resolver could not reach the new optimization path and proposed a correction and regression test.

[Jest \#16340](https://github.com/jestjs/jest/pull/16340#pullrequestreview-4945115474)\
Reproduced assertion-state collisions between concurrent tests with identical titles and proposed a unique execution identifier.
