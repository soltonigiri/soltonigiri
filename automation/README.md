# Profile automation

Requires Node.js 22 or newer. No package installation is needed.

- `config.json`: introductions, links, project descriptions, and review descriptions.
- `activity.json`: public GitHub data and the last recorded successful check.
- `profile.mjs`: fetches data, generates pages, and checks the output.
- `profile.test.mjs`: offline regression tests and their fixtures.

Edit the descriptions in `config.json`, then regenerate:

```sh
node automation/profile.mjs generate
node automation/profile.mjs check
node --test automation/profile.test.mjs
```

To refresh public activity, run `node automation/profile.mjs update`.
An optional `GITHUB_TOKEN` increases the API rate limit. New items use their
original GitHub titles or descriptions; configured `en` and `ja` descriptions
take precedence.

Reviews of other authors' public PRs in external repositories are discovered
with `reviewed-by`. Each PR appears once: configured review links and descriptions
take priority; otherwise the latest submitted review link and PR title are used.
Review lists are paginated, including reviews with an empty body and inline
comments. Pending reviews and ordinary issue comments are not auto-discovered.
Additional review or discussion links can still be selected in `config.json`.

The workflow checks pull requests and updates main every three hours at :17,
on push, or through **Run workflow**. Scheduled times use UTC, corresponding to
00:17, 03:17, 06:17, 09:17, 12:17, 15:17, 18:17, and 21:17 JST. It
validates the generated pages before publishing and records a successful check
when content changes or 30 days have elapsed.

Failed collection leaves the saved pages intact. If main changes during an
update, a normal Git push rejects the stale commit; the next scheduled or manual
run starts from the latest main. Check failures and run results in Actions.
