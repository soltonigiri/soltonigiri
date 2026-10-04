# Profile automation

Requires Node.js 22 or newer.

Edit descriptions and links in `config.json`, then regenerate and check the pages:

```sh
node automation/profile.mjs generate
node automation/profile.mjs check
```

`activity.json` stores the public GitHub data. Refresh it with:

```sh
node automation/profile.mjs update
```

An optional `GITHUB_TOKEN` increases the API rate limit. Configured English and
Japanese descriptions take precedence over GitHub titles and descriptions.

Reviews are discovered with `reviewed-by`, with one submitted review per PR.
Configured links take priority; otherwise the latest review is selected. Add
other review or discussion links in `config.json`.

The workflow updates pages every three hours at :17 UTC, on push, or through
**Run workflow**. It validates the output before publishing. A successful check
is recorded when content changes or 30 days have elapsed. Collection failures
leave the saved pages intact; run results are available in Actions.

Run the offline tests after changing the generator:

```sh
node --test automation/profile.test.mjs
```
