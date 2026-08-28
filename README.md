# soltonigiri

English | [日本語](./README_ja.md)

I contribute to open source and build web apps and CLI tools using TypeScript and Python.

**Open to remote contract opportunities.**

[Portfolio](https://soltonigiri.pages.dev/) | [Contact](https://x.com/solt_onigiri_)

## Open-source contributions

### Merged

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

- [Jest #16380](https://github.com/jestjs/jest/pull/16380#pullrequestreview-5017415062):
  Verified a type error in custom matcher result types with TypeScript 5.4 and 5.9.
- [Jest #16359](https://github.com/jestjs/jest/pull/16359#pullrequestreview-4981957277):
  Confirmed that project configuration order changed coverage results and that
  projects without tests were omitted from aggregation.
- [Jest #9210](https://github.com/jestjs/jest/issues/9210#issuecomment-5408569604):
  Checked how unhandled Promise rejections are reported across Node.js 20 and
  24 and the Circus and Jasmine test runners.

### Open

- [LangChain.js #11329](https://github.com/langchain-ai/langchainjs/pull/11329):
  Fixed an issue where retry settings were not applied to Bedrock Converse.
- [Angular Components #33670](https://github.com/angular/components/pull/33670):
  Fixed an issue where an outdated template was used after a row definition changed.
- [OpenClaw #120658](https://github.com/openclaw/openclaw/pull/120658):
  Reproduced and fixed an issue where Active Memory `recall error` messages
  leaked into prompts.

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
