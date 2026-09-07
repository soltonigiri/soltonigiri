# Profile automation

Requires Node.js 22 or newer. No package installation is needed.

- `config.json`: introductions, links, project descriptions, and selected reviews.
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

The workflow checks pull requests and updates main daily at 09:17 JST, on push,
or through **Run workflow**. It validates the generated pages before publishing
and records a successful check when content changes or 30 days have elapsed.

Failed collection leaves the saved pages intact. If main changes during an
update, a normal Git push rejects the stale commit; the next scheduled or manual
run starts from the latest main. Check failures and run results in Actions.
