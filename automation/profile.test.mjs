import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderPages, nextCheck, json, DAY, PAGE_FILES, safeUrl, validateSnapshot, buildOutputs, writeOutputs, checkLinks, collect, createClient, searchPullRequests } from './profile.mjs';

const NOW = '2026-09-08T00:00:00.000Z';
function fixture() {
  const url = 'https://github.com/example/tool/pull/1';
  const reviewUrl = 'https://github.com/example/tool/pull/2#pullrequestreview-10';
  const config = {
    version: 1, user: 'alice', intro: { en: 'I make **tools**.', ja: '**ツール**を作っています。' },
    workTogether: { body: { en: 'Open to **work**.', ja: '**仕事**を募集しています。' }, label: { en: 'Contact →', ja: '連絡する →' }, url: 'https://example.com/contact' },
    links: [{ label: { en: 'Website', ja: 'サイト' }, url: 'https://example.com/' }],
    featuredContributions: [{ label: 'tool #1', url, status: { en: 'Open', ja: '進行中' }, summary: { en: 'Fixed `retry` handling.', ja: '`retry`の処理を修正。' } }],
    selectedProjects: ['alice/tool'],
    pullRequests: { [url]: { en: 'Fixed `retry` handling.', ja: '`retry`の処理を修正。' } },
    reviews: [{ url: reviewUrl, summary: { en: 'Verified the fix.', ja: '修正を検証。' } }],
    projects: { 'alice/tool': { summary: { en: 'A tool.', ja: 'ツール。' }, homeSummary: { en: 'A *featured* tool.', ja: '主な*ツール*。' }, homeLinks: [{ label: { en: 'Try →', ja: '試す →' }, url: 'https://example.com/tool' }], demo: 'https://example.com/tool' } },
    excludeProjects: ['alice/alice'],
  };
  const snapshot = {
    version: 1, user: 'alice',
    projects: [{ repo: 'alice/tool', description: 'A tool', homepage: null, archived: false }],
    pullRequests: [{ repo: 'example/tool', number: 1, url, title: 'Fix retry', state: 'open', draft: false, createdAt: '2026-08-01T00:00:00Z', mergedAt: null, closedAt: null }],
    reviews: [{ repo: 'example/tool', number: 2, url: reviewUrl, submittedAt: '2026-08-02T00:00:00Z' }],
  };
  return { config, snapshot };
}
function apiFixture() {
  const { config, snapshot } = fixture();
  const p = snapshot.pullRequests[0];
  const requests = [];
  const api = async path => {
    requests.push(path);
    if (path.startsWith('/users/')) return [
      { full_name: 'alice/tool', owner: { login: 'alice' }, fork: false, private: false, archived: false, description: 'A tool', homepage: null },
      { full_name: 'alice/fork', owner: { login: 'alice' }, fork: true, private: false, archived: false },
      { full_name: 'alice/private', owner: { login: 'alice' }, fork: false, private: true, archived: false },
      { full_name: 'alice/alice', owner: { login: 'alice' }, fork: false, private: false, archived: false },
    ];
    if (path.startsWith('/search/issues') && decodeURIComponent(path).includes('reviewed-by:')) return { total_count: 0, incomplete_results: false, items: [] };
    if (path.startsWith('/search/issues')) return { total_count: 1, incomplete_results: false, items: [{ html_url: p.url }] };
    if (path === '/repos/example/tool/pulls/1') return { number: 1, html_url: p.url, title: p.title, state: p.state, draft: p.draft, user: { login: 'alice' }, base: { repo: { private: false } }, created_at: p.createdAt, merged_at: p.mergedAt, closed_at: p.closedAt };
    if (path === '/repos/example/tool') return { private: false };
    if (path === '/repos/example/tool/pulls/2/reviews/10') return { user: { login: 'alice' }, html_url: config.reviews[0].url, submitted_at: snapshot.reviews[0].submittedAt };
    throw new Error(`Unexpected fixture request: ${path}`);
  };
  return { config, snapshot, api, requests };
}


async function workspace(t) {
  const root = await mkdtemp(join(tmpdir(), 'profile-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'automation'));
  const { config, snapshot } = fixture();
  await writeFile(join(root, 'automation/config.json'), json(config));
  await writeFile(join(root, 'automation/activity.json'), json({ ...snapshot, checkedAt: NOW }));
  return root;
}

test('all six pages have matching language navigation and retain editorial copy', () => {
  const { config, snapshot } = fixture();
  const pages = renderPages(config, snapshot);
  assert.deepEqual(Object.keys(pages).sort(), [...PAGE_FILES].sort());
  assert.match(pages['pages/contributions.md'], /Fixed `retry` handling/);
  assert.match(pages['pages/contributions_ja.md'], /`retry`の処理を修正/);
  assert.match(pages['README.md'], /\.\/README_ja\.md/);
  assert.match(pages['README.md'], /## 🚀 Open source/);
  assert.match(pages['README.md'], /\*\*tools\*\*/);
  assert.match(pages['README.md'], /tool #1/);
  assert.match(pages['README.md'], /A \*featured\* tool/);
  assert.match(pages['README_ja.md'], /## 🛠️ 主な作品/);
  for (const stem of ['contributions', 'projects']) {
    assert.match(pages[`pages/${stem}.md`], new RegExp(`\\./${stem}_ja\\.md`));
    assert.match(pages[`pages/${stem}_ja.md`], /\.\/README_ja\.md/);
  }
  const links = html => [...html.matchAll(/https:\/\/github.com\/[^)]+/g)].map(m => m[0]).sort();
  assert.deepEqual(links(pages['pages/contributions.md']), links(pages['pages/contributions_ja.md']));
  assert.deepEqual(links(pages['pages/projects.md']), links(pages['pages/projects_ja.md']));
});

test('PR addition, draft, merge, unmerged closure, and reopen render distinctly', () => {
  const { config, snapshot } = fixture();
  const p = snapshot.pullRequests[0];
  p.draft = true;
  let page = renderPages(config, snapshot)['pages/contributions.md'];
  assert.match(page, /## Open/); assert.match(page, /\*\*Draft\*\*/);
  p.draft = false; p.state = 'closed'; p.closedAt = p.mergedAt = NOW;
  page = renderPages(config, snapshot)['pages/contributions.md'];
  assert.match(page, /## Merged/); assert.doesNotMatch(page, /## Open/);
  p.mergedAt = null;
  page = renderPages(config, snapshot)['pages/contributions.md'];
  assert.match(page, /<summary>Closed without merge \(1\)<\/summary>/);
  p.state = 'open'; p.closedAt = null;
  snapshot.pullRequests.push({ ...p, number: 3, url: p.url.replace('/1', '/3'), title: 'New change', createdAt: NOW });
  page = renderPages(config, snapshot)['pages/contributions.md'];
  assert.match(page, /New change/); assert.doesNotMatch(page, /Closed without merge/);
  assert.ok(page.indexOf('/pull/3') < page.indexOf('/pull/1'));
});

test('new projects, missing descriptions, editorial demo, exclusions, and archives', () => {
  const { config, snapshot } = fixture();
  snapshot.projects.push({ repo: 'alice/new', description: null, homepage: null, archived: false }, { repo: 'alice/alice', description: 'Excluded', homepage: null, archived: false });
  let page = renderPages(config, snapshot)['pages/projects.md'];
  assert.match(page, /### new/); assert.match(page, /alice\/new/);
  assert.match(page, /https:\/\/example.com\/tool/); assert.doesNotMatch(page, /Excluded/);
  snapshot.projects[0].archived = true;
  page = renderPages(config, snapshot)['pages/projects.md'];
  assert.match(page, /<summary>Archived projects \(1\)/); assert.doesNotMatch(page, /## CLI tools/);
});

test('flat contribution groups retain repository identity and projects use separate links', () => {
  const { config, snapshot } = fixture();
  const p = snapshot.pullRequests[0];
  snapshot.pullRequests.push({ ...p, repo: 'another/widget', url: 'https://github.com/another/widget/pull/1', createdAt: NOW });
  config.projects['alice/tool'].name = 'Friendly Tool';
  config.projects['alice/tool'].demoLabel = { en: 'Try it', ja: '試す' };
  const pages = renderPages(config, snapshot);
  const contributions = pages['pages/contributions.md'];
  assert.equal(contributions.match(/^## Open$/gm).length, 1);
  assert.ok(contributions.includes('[widget \\#1]'));
  assert.ok(contributions.includes('[tool \\#1]'));
  assert.doesNotMatch(contributions, /<a id=|^### |\*\*Contributions\*\*/m);
  assert.equal(contributions.split('\n')[2], '[Home](../README.md) · [Personal projects](./projects.md) · [日本語](./contributions_ja.md)');
  assert.match(pages['pages/projects.md'], /### Friendly Tool\n\nA tool\.\n\n\[Try it\]/);
  assert.match(pages['pages/projects.md'], /\[GitHub\]\(https:\/\/github.com\/alice\/tool\)/);
});

test('API titles render as literal text, not links or HTML', () => {
  const { config, snapshot } = fixture();
  const original = '[click](javascript:alert(1)) <script> & `code` *bold* | # title';
  config.pullRequests = {};
  snapshot.pullRequests[0].title = original;
  snapshot.projects[0].description = original;
  delete config.projects['alice/tool'].summary;
  const page = renderPages(config, snapshot)['pages/contributions.md'];
  assert.doesNotMatch(page, /<script>|(?<!\\)\[click\]\(javascript:/);
  assert.match(page, /&lt;script&gt;/);
  assert.throws(() => safeUrl('javascript:alert(1)'));
  assert.throws(() => safeUrl('https://user:password@example.com/'));
  assert.equal(safeUrl('https://example.com/a(b)'), 'https://example.com/a%28b%29');
});

test('snapshot rejects duplicate identities and invalid merged state', () => {
  const { config, snapshot } = fixture();
  snapshot.pullRequests[0].mergedAt = NOW;
  assert.throws(() => validateSnapshot(snapshot, config), /Merged PR/);
  snapshot.pullRequests[0].mergedAt = null;
  snapshot.pullRequests.push(snapshot.pullRequests[0]);
  assert.throws(() => validateSnapshot(snapshot, config), /Duplicate/);
});

test('heartbeat changes on day 30, content changes, or first check only', () => {
  const previous = NOW;
  const after = days => new Date(Date.parse(NOW) + days * DAY).toISOString();
  assert.equal(nextCheck(previous, after(29), false), previous);
  assert.equal(nextCheck(previous, after(30), false), after(30));
  assert.equal(nextCheck(previous, after(1), true), after(1));
  assert.equal(nextCheck(null, NOW, false), NOW);
  assert.throws(() => nextCheck(previous, after(-1), false));
});

test('generation is deterministic and local page links resolve', async t => {
  const root = await workspace(t);
  const first = await buildOutputs(root);
  await writeOutputs(root, first);
  assert.deepEqual(await buildOutputs(root), first);
  await checkLinks(root, PAGE_FILES);
  await writeFile(join(root, 'README.md'), '# Broken\n\n[link](./missing.md)\n');
  await assert.rejects(checkLinks(root, ['README.md']), /ENOENT/);
});

test('failed collection leaves every saved output and heartbeat unchanged', async t => {
  const root = await workspace(t);
  await writeOutputs(root, await buildOutputs(root));
  const before = await readFile(join(root, 'README.md'), 'utf8');
  const { api } = apiFixture();
  await assert.rejects(buildOutputs(root, { refresh: true, now: NOW, api: path => path.startsWith('/search/') ? Promise.reject(new Error('network failure')) : api(path) }), /network failure/);
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), before);
  assert.equal(JSON.parse(await readFile(join(root, 'automation/activity.json'))).checkedAt, NOW);
});

test('output generation validates saved and fetched data before writing', async t => {
  const root = await workspace(t);
  await writeOutputs(root, await buildOutputs(root));
  const before = await readFile(join(root, 'README.md'), 'utf8');
  const saved = JSON.parse(await readFile(join(root, 'automation/activity.json'), 'utf8'));
  saved.pullRequests[0].mergedAt = NOW;
  await writeFile(join(root, 'automation/activity.json'), json(saved));
  await assert.rejects(buildOutputs(root), /Merged PR must be closed/);
  const { api } = apiFixture();
  await assert.rejects(buildOutputs(root, { refresh: true, now: NOW, api: async path => {
    const result = await api(path);
    if (path.endsWith('/pulls/1')) result.merged_at = NOW;
    return result;
  } }), /Merged PR must be closed/);
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), before);
});

test('live refresh no-op and monthly update use independent state', async t => {
  const root = await workspace(t);
  const { api } = apiFixture();
  await writeOutputs(root, await buildOutputs(root, { refresh: true, now: NOW, api }));
  const next = await buildOutputs(root, { refresh: true, now: new Date(Date.parse(NOW) + 29 * DAY).toISOString(), api });
  assert.equal(JSON.parse(next['automation/activity.json']).checkedAt, NOW);
  const monthly = await buildOutputs(root, { refresh: true, now: new Date(Date.parse(NOW) + 30 * DAY).toISOString(), api });
  assert.notEqual(monthly['automation/activity.json'], next['automation/activity.json']);
  for (const page of PAGE_FILES) assert.equal(monthly[page], next[page]);
});


test('collector only keeps public owned non-forks and verifies selected reviews', async () => {
  const { config, snapshot, api, requests } = apiFixture();
  assert.deepEqual(await collect(config, { api, now: NOW }), snapshot);
  assert.ok(requests.includes('/repos/example/tool/pulls/2/reviews/10'));
});

test('private or foreign-authored PRs and mismatched reviews abort collection', async () => {
  for (const variant of ['private', 'author', 'review']) {
    const { config, api } = apiFixture();
    const altered = async path => {
      const result = await api(path);
      if (path.endsWith('/pulls/1')) {
        if (variant === 'private') result.base.repo.private = true;
        if (variant === 'author') result.user.login = 'someone-else';
      }
      if (variant === 'review' && path.endsWith('/reviews/10')) result.html_url += '0';
      return result;
    };
    await assert.rejects(collect(config, { api: altered, now: NOW }), /Unexpected PR|mismatch/);
  }
});

function reviewFixture() {
  const base = apiFixture();
  const url = 'https://github.com/example/tool/pull/3';
  const review = { id: 20, user: { login: 'alice' }, state: 'COMMENTED', submitted_at: NOW, html_url: `${url}#pullrequestreview-20`, body: '' };
  const api = async path => {
    if (path.startsWith('/search/issues') && decodeURIComponent(path).includes('reviewed-by:')) {
      assert.match(decodeURIComponent(path), /reviewed-by:alice -author:alice -user:alice/);
      return { total_count: 2, incomplete_results: false, items: [{ html_url: base.config.reviews[0].url.split('#')[0] }, { html_url: url }] };
    }
    if (path === '/repos/example/tool/pulls/3') return { html_url: url, title: '<script>Review target</script>', user: { login: 'bob' }, base: { repo: { private: false } } };
    if (path.startsWith('/repos/example/tool/pulls/3/reviews?')) return [
      { ...review, id: 21, user: { login: 'bob' } },
      { ...review, id: 22, state: 'PENDING', submitted_at: null },
      { ...review, id: 19, html_url: `${url}#pullrequestreview-19`, submitted_at: '2026-08-01T00:00:00Z' },
      review,
    ];
    return base.api(path);
  };
  return { ...base, api, review };
}

test('automatic reviews keep one latest submitted review per PR and preserve configured copy', async () => {
  const { config, api, review } = reviewFixture();
  const data = await collect(config, { api, now: NOW });
  validateSnapshot(data, config);
  assert.equal(data.reviews.length, 2);
  assert.equal(data.reviews.find(r => r.number === 3).url, review.html_url);
  assert.equal(data.reviews.find(r => r.number === 2).url, config.reviews[0].url);
  const pages = renderPages(config, data);
  for (const lang of ['en', 'ja']) {
    const page = pages[`pages/contributions${lang === 'ja' ? '_ja' : ''}.md`];
    assert.ok(page.includes(config.reviews[0].summary[lang]));
    assert.match(page, /&lt;script&gt;Review target/);
    assert.doesNotMatch(page, /<script>/);
    assert.equal(page.split(review.html_url).length - 1, 1);
  }
});

test('review pagination finds the owner on later pages and rejects duplicate results', async () => {
  const { config, api, review } = reviewFixture();
  const first = Array.from({ length: 100 }, (_, i) => ({ ...review, id: 100 + i, user: { login: 'bob' } }));
  const paginated = async path => path.includes('/pulls/3/reviews?') ? path.endsWith('page=1') ? first : [review] : api(path);
  const data = await collect(config, { api: paginated, now: NOW });
  assert.equal(data.reviews.find(r => r.number === 3).url, review.html_url);
  await assert.rejects(collect(config, { now: NOW, api: path => path.includes('/pulls/3/reviews?') ? Promise.resolve(first) : api(path) }), /Review listing changed/);
});

test('automatic review collection rejects private or own-authored PRs and mismatched review sources', async () => {
  for (const variant of ['private', 'author', 'url', 'missing']) {
    const { config, api, review } = reviewFixture();
    await assert.rejects(collect(config, { now: NOW, api: async path => {
      const result = await api(path);
      if (path.endsWith('/pulls/3')) {
        if (variant === 'private') result.base.repo.private = true;
        if (variant === 'author') result.user.login = 'alice';
      }
      if (path.includes('/pulls/3/reviews?')) {
        if (variant === 'url') return [{ ...review, html_url: review.html_url.replace('/pull/3', '/pull/4') }];
        if (variant === 'missing') return [];
      }
      return result;
    } }), /Unexpected reviewed PR|Review URL mismatch|no submitted review/);
  }
});

test('search paginates beyond 100 without dropping items', async () => {
  const api = async path => {
    const page = Number(new URL(`https://example.com${path}`).searchParams.get('page'));
    return { total_count: 101, incomplete_results: false, items: Array.from({ length: page === 1 ? 100 : 1 }, (_, i) => ({ html_url: `https://github.com/example/tool/pull/${(page - 1) * 100 + i + 1}` })) };
  };
  assert.equal((await searchPullRequests(api, 'alice', NOW)).length, 101);
});

test('over 1000 search results splits non-overlapping creation windows', async () => {
  const windows = new Set();
  const api = async path => {
    const params = new URL(`https://example.com${path}`).searchParams;
    const window = params.get('q').split('created:')[1];
    windows.add(window);
    if (windows.size === 1) return { total_count: 1001, incomplete_results: false, items: [] };
    const count = windows.size === 2 ? 500 : 501;
    const offset = (Number(params.get('page')) - 1) * 100;
    return { total_count: count, incomplete_results: false, items: Array.from({ length: Math.min(100, count - offset) }, (_, i) => ({ html_url: `https://github.com/example/tool/pull/${(count === 500 ? 0 : 500) + offset + i + 1}` })) };
  };
  assert.equal((await searchPullRequests(api, 'alice', NOW)).length, 1001);
  const leftEnd = [...windows][1].split('..')[1];
  const rightStart = [...windows][2].split('..')[0];
  assert.equal(Date.parse(rightStart) - Date.parse(leftEnd), 1000);
});

test('a search count changing during subdivision aborts rather than silently truncating', async () => {
  let calls = 0;
  const api = async () => ({ total_count: ++calls === 1 ? 1001 : 0, incomplete_results: false, items: [] });
  await assert.rejects(searchPullRequests(api, 'alice', NOW), /changed while splitting/);
});

test('incomplete results, inconsistent totals, and duplicate search hits fail closed', async () => {
  await assert.rejects(searchPullRequests(async () => ({ total_count: 1, incomplete_results: true, items: [] }), 'alice', NOW), /Incomplete/);
  await assert.rejects(searchPullRequests(async () => ({ total_count: 2, incomplete_results: false, items: [{ html_url: 'same' }, { html_url: 'same' }] }), 'alice', NOW), /duplicate/);
  let count = 0;
  await assert.rejects(searchPullRequests(async () => ({ total_count: ++count === 1 ? 101 : 102, incomplete_results: false, items: [] }), 'alice', NOW), /changed during pagination/);
});

test('repository listing follows full pages and rejects duplicated pages', async () => {
  const { config, api } = apiFixture();
  const first = Array.from({ length: 100 }, (_, i) => ({ full_name: `alice/fork${i}`, owner: { login: 'alice' }, fork: true, private: false }));
  const result = await collect(config, { now: NOW, api: path => path.startsWith('/users/') ? path.endsWith('page=1') ? Promise.resolve(first) : api(path) : api(path) });
  assert.equal(result.projects.length, 1);
  await assert.rejects(collect(config, { now: NOW, api: path => path.startsWith('/users/') ? Promise.resolve(first) : api(path) }), /changed during pagination/);
});

test('bounded retries handle transient failures without logging response bodies', async () => {
  let attempts = 0;
  const sleeps = [];
  const api = createClient({ sleep: async ms => sleeps.push(ms), fetchImpl: async () => ++attempts === 1 ? new Response('untrusted response', { status: 503 }) : Response.json({ ok: true }) });
  assert.deepEqual(await api('/test'), { ok: true });
  assert.deepEqual(sleeps, [1000]);
  const denied = createClient({ fetchImpl: async () => new Response('sensitive response', { status: 401 }) });
  await assert.rejects(denied('/test'), error => error.message === 'GitHub request failed (HTTP 401)');
  const limited = createClient({ fetchImpl: async () => new Response('', { status: 429, headers: { 'retry-after': '60' } }) });
  await assert.rejects(limited('/test'), /HTTP 429/);
});
