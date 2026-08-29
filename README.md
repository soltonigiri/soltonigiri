# Hi, I'm soltonigiri 👋

English | [日本語](./README_ja.md)

I contribute to open source and build web apps and CLI tools using TypeScript and Python.

**Open to remote contract opportunities.**

[Portfolio](https://soltonigiri.pages.dev/) | [Contact](https://x.com/solt_onigiri_)

## Open-source contributions

### Merged

- [OpenClaw #120658](https://github.com/openclaw/openclaw/pull/120658):
  Reproduced and fixed an issue where Active Memory `recall error` messages
  leaked into prompts.
- [pnpm #13885](https://github.com/pnpm/pnpm/pull/13885):
  Updated the Rust implementation to support reading `.modules.yaml` files
  containing long dependency paths.
- [Jest #16322](https://github.com/jestjs/jest/pull/16322):
  Added support for rerunning tests at the `describe` level with `jest.retryTimes()`.
- [Jest #16344](https://github.com/jestjs/jest/pull/16344):
  Fixed an issue where retries also deleted inline snapshots outside the
  retried test.
- [Jest #16343](https://github.com/jestjs/jest/pull/16343):
  Fixed an issue where a late `done` callback affected subsequent tests.
- [Jest #16342](https://github.com/jestjs/jest/pull/16342):
  Fixed an issue where `currentlyRunningTest` remained set after skipped or
  todo tests.
- [activist #2335](https://github.com/activist-org/activist/pull/2335):
  Standardized sidebar icon sizes and added regression tests.
- [mcp-migrate #222](https://github.com/dheerajjha/mcp-migrate/pull/222):
  Displayed the number of hidden items in the list and added validation and
  tests for invalid values.

### Reviews and investigations

- [Jest #16374](https://github.com/jestjs/jest/pull/16374#pullrequestreview-5047656739):
  Verified that external snapshot failures include the resolved snapshot path
  while inline snapshot failures do not, across Circus and Jasmine.
- [Jest #16345](https://github.com/jestjs/jest/pull/16345#pullrequestreview-5056029310):
  Found an insertion-order bug in overlapping table-key interpolation and
  verified the fix and regression tests.
- [Jest #16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062):
  Verified a type error in custom matcher result types with TypeScript 5.4 and 5.9.

### Open

- [Jest #16402](https://github.com/jestjs/jest/pull/16402):
  Added ESM support for `snapshotResolver` and `snapshotSerializers`.
- [OpenTelemetry JS Contrib #3707](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/3707):
  Prevented duplicate span completion when an `ioredis` callback fires more
  than once.
- [workerd #7174](https://github.com/cloudflare/workerd/pull/7174):
  Added `console.trace()` stack output to worker logs while preserving existing
  Inspector and tail behavior.

## Personal projects

- [youtube-markdown-archiver](https://github.com/soltonigiri/youtube-markdown-archiver):
  A local CLI that archives video metadata, subtitles, speech-to-text
  transcripts, and text extracted from images as Markdown.
- [余命.exe](https://github.com/soltonigiri/yomei-exe):
  Estimates remaining lifetime and free time based on official Japanese
  statistics. All inputs are processed locally.
- [scp-mcp](https://github.com/soltonigiri/scp-mcp):
  A read-only MCP server for searching the SCP Wiki and retrieving source,
  author, and licensing information.
