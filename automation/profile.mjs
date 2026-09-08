import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Profile settings, public data, and Markdown formatting.
export const PAGE_FILES = ['README.md', 'README_ja.md', 'pages/contributions.md', 'pages/contributions_ja.md', 'pages/projects.md', 'pages/projects_ja.md'];
export const OUTPUT_FILES = [...PAGE_FILES, 'automation/activity.json'];
export const DAY = 86_400_000;
const repoPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const compare = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'en') || a.localeCompare(b, 'en');
export const json = value => `${JSON.stringify(value, null, 2)}\n`;
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
export function safeUrl(value) {
  const url = new URL(value);
  assert(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password, 'Expected a public HTTP(S) URL');
  return url.href.replace(/[()<>"'\s]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
export function text(value) {
  return String(value).replace(/\s+/g, ' ').trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\\`*_{}\[\]()#!|~]/g, '\\$&');
}
export function inline(value) {
  return text(value)
    .replace(/\\`([^`]+)\\`/g, (_, content) => `\`${content.replace(/\\([()])/g, '$1')}\``)
    .replace(/\\\*\\\*([^*]+)\\\*\\\*/g, '**$1**')
    .replace(/\\\*([^*]+)\\\*/g, '*$1*');
}
export const link = (label, url) => `[${text(label)}](${safeUrl(url)})`;
export function parseContributionUrl(value) {
  const m = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/(pull|issues)\/([1-9]\d*)(?:#(pullrequestreview-|issuecomment-|discussion_r)([1-9]\d*))?$/.exec(value);
  assert(m, 'Expected a GitHub pull request, issue, or comment URL');
  return { repo: m[1], kind: m[2], number: Number(m[3]), fragment: m[4], id: m[5] };
}
function bilingual(value) {
  return value && ['en', 'ja'].every(lang => typeof value[lang] === 'string' && value[lang].trim());
}
export function validateConfig(c) {
  assert(c?.version === 1 && /^[A-Za-z0-9-]+$/.test(c.user), 'Invalid profile identity');
  assert(bilingual(c.intro) && bilingual(c.workTogether?.body) && bilingual(c.workTogether?.label), 'Both profile languages are required');
  assert(Array.isArray(c.links) && Array.isArray(c.featuredContributions) && Array.isArray(c.selectedProjects) && Array.isArray(c.reviews) && Array.isArray(c.excludeProjects), 'Invalid profile lists');
  safeUrl(c.workTogether.url);
  assert(c.pullRequests && c.projects, 'Missing editorial settings');
  for (const item of c.links) { assert(bilingual(item.label), 'Missing link label'); safeUrl(item.url); }
  for (const item of c.featuredContributions) {
    assert(typeof item.label === 'string' && bilingual(item.status) && bilingual(item.summary), 'Invalid featured contribution');
    safeUrl(item.url);
  }
  for (const [url, summary] of Object.entries(c.pullRequests)) {
    const parsed = parseContributionUrl(url);
    assert(parsed.kind === 'pull' && !parsed.fragment && bilingual(summary), 'Invalid PR description');
  }
  const seen = new Set();
  for (const review of c.reviews) {
    const parsed = parseContributionUrl(review.url);
    assert(parsed.fragment && bilingual(review.summary) && !seen.has(review.url), 'Invalid or duplicate selected review');
    seen.add(review.url);
  }
  for (const repo of c.excludeProjects) assert(repoPattern.test(repo), 'Invalid excluded repository');
  for (const repo of c.selectedProjects) assert(repoPattern.test(repo), 'Invalid selected project');
  for (const [repo, item] of Object.entries(c.projects)) {
    assert(repoPattern.test(repo), 'Invalid project repository');
    if (item.name) assert(typeof item.name === 'string', 'Invalid project name');
    if (item.demoLabel) assert(bilingual(item.demoLabel), 'Demo label requires both languages');
    if (item.summary) assert(bilingual(item.summary), 'Project description requires both languages');
    if (item.homeSummary) assert(bilingual(item.homeSummary), 'Home project description requires both languages');
    if (item.demo) safeUrl(item.demo);
    if (item.homeLinks) for (const homeLink of item.homeLinks) {
      assert(bilingual(homeLink.label), 'Home project link requires both languages');
      safeUrl(homeLink.url);
    }
  }
  return c;
}
export function validateSnapshot(d, c) {
  assert(d?.version === 1 && d.user === c.user, 'Snapshot identity mismatch');
  assert(['pullRequests', 'projects', 'reviews'].every(key => Array.isArray(d[key])), 'Invalid snapshot collections');
  for (const key of ['pullRequests', 'projects', 'reviews']) {
    const ids = d[key].map(item => item.url ?? item.repo);
    assert(new Set(ids).size === ids.length, `Duplicate ${key}`);
  }
  for (const p of d.pullRequests) {
    const parsed = parseContributionUrl(p.url);
    assert(parsed.kind === 'pull' && !parsed.fragment && parsed.repo === p.repo && parsed.number === p.number, 'Invalid PR identity');
    assert(p.repo.split('/')[0].toLowerCase() !== c.user.toLowerCase(), 'Own PR in contributions');
    assert(typeof p.title === 'string' && typeof p.draft === 'boolean' && ['open', 'closed'].includes(p.state), 'Invalid PR fields');
    assert(Number.isFinite(Date.parse(p.createdAt)), 'Invalid PR date');
    for (const key of ['mergedAt', 'closedAt']) assert(p[key] === null || Number.isFinite(Date.parse(p[key])), 'Invalid PR status date');
    assert(!p.mergedAt || p.state === 'closed', 'Merged PR must be closed');
  }
  for (const p of d.projects) {
    assert(repoPattern.test(p.repo) && p.repo.split('/')[0].toLowerCase() === c.user.toLowerCase(), 'Invalid project identity');
    assert(typeof p.archived === 'boolean' && (p.description === null || typeof p.description === 'string'), 'Invalid project fields');
    if (p.homepage) safeUrl(p.homepage);
  }
  const expectedReviews = new Set(c.reviews.map(r => r.url));
  assert([...expectedReviews].every(url => d.reviews.some(r => r.url === url)), 'Selected reviews are incomplete');
  for (const r of d.reviews) {
    const parsed = parseContributionUrl(r.url);
    assert(parsed.fragment && parsed.repo === r.repo && parsed.number === r.number && Number.isFinite(Date.parse(r.submittedAt)), 'Invalid review');
    assert(parsed.repo.split('/')[0].toLowerCase() !== c.user.toLowerCase(), 'Own repository in reviews');
    assert(expectedReviews.has(r.url) || (parsed.kind === 'pull' && parsed.fragment === 'pullrequestreview-' && typeof r.title === 'string'), 'Missing review title');
  }
  return d;
}

const labels = {
  en: { home: 'Home', contributions: 'Contributions', projects: 'Personal projects', openSource: 'Open source', selectedProjects: 'Selected projects', moreContributions: 'More contributions, reviews, and investigations →', moreProjects: 'More projects →', workTogether: 'Work together', merged: 'Merged', open: 'Open', reviews: 'Reviews and investigations', closed: 'Closed without merge', archived: 'Archived projects', demo: 'Demo' },
  ja: { home: 'ホーム', contributions: 'OSSへの貢献', projects: '個人開発', openSource: 'OSSへの貢献', selectedProjects: '主な作品', moreContributions: 'その他の貢献・レビュー・調査 →', moreProjects: 'その他の作品 →', workTogether: '一緒に仕事をする', merged: 'マージ済み', open: '進行中', reviews: 'レビュー・調査', closed: '未マージで終了', archived: 'アーカイブ済みの作品', demo: 'デモ' },
};
const fileFor = (page, lang) => `${page === 'home' ? 'README' : `pages/${page}`}${lang === 'ja' ? '_ja' : ''}.md`;
const hrefFor = (page, lang, from = 'home') => {
  const path = relative(dirname(fileFor(from, lang)), fileFor(page, lang));
  return path.startsWith('.') ? path : `./${path}`;
};
const langNav = (page, lang) => lang === 'en' ? `English · [日本語](${hrefFor(page, 'ja', page)})` : `[English](${hrefFor(page, 'en', page)}) · 日本語`;
function header(page, lang, title) {
  if (page === 'home') return [`# ${title}`, langNav(page, lang)];
  const nav = ['home', 'contributions', 'projects'].filter(key => key !== page)
    .map(key => `[${labels[lang][key]}](${hrefFor(key, lang, page)})`);
  nav.push(lang === 'en' ? `[日本語](${hrefFor(page, 'ja', page)})` : `[English](${hrefFor(page, 'en', page)})`);
  return [`# ${title}`, nav.join(' · ')];
}
const newest = date => (a, b) => compare(date(b) ?? '', date(a) ?? '') || compare(a.url, b.url);
const projectName = repo => ({ jest: 'Jest', openclaw: 'OpenClaw' })[repo.split('/')[1]] ?? repo.split('/')[1];
export function renderPages(c, d) {
  const pages = {};
  for (const lang of ['en', 'ja']) {
    const l = labels[lang];
    const home = header('home', lang, `Hi, I'm ${text(c.user)} 👋`);
    home.push(inline(c.intro[lang]), c.links.map(item => link(item.label[lang], item.url)).join(' · '), `## 🚀 ${l.openSource}`);
    home.push(...c.featuredContributions.map(item => `**[${text(item.label).replace(/\\#/g, '#')}](${safeUrl(item.url)}) · ${text(item.status[lang])}**\\
${inline(item.summary[lang])}`));
    home.push(`[${l.moreContributions}](${hrefFor('contributions', lang)})`, `## 🛠️ ${l.selectedProjects}`);
    for (const repo of c.selectedProjects) {
      const settings = c.projects[repo];
      assert(settings?.homeSummary && settings.homeLinks, `Missing selected project settings for ${repo}`);
      home.push(`### ${link(settings.name ?? repo.split('/')[1], `https://github.com/${repo}`)}`, inline(settings.homeSummary[lang]), settings.homeLinks.map(item => link(item.label[lang], item.url)).join(' · '));
    }
    home.push(`[${l.moreProjects}](${hrefFor('projects', lang)})`, `## 💬 ${l.workTogether}`, inline(c.workTogether.body[lang]), link(c.workTogether.label[lang], c.workTogether.url));
    pages[fileFor('home', lang)] = `${home.join('\n\n')}\n`;

    const contributions = header('contributions', lang, l.contributions);
    const row = p => `${link(`${projectName(p.repo)} #${p.number}`, p.url)}${p.draft && p.state === 'open' ? ' **Draft**' : ''}\\
${c.pullRequests[p.url]?.[lang] ?? text(p.title)}`;
    for (const [label, subset, date] of [
      [l.merged, d.pullRequests.filter(p => p.mergedAt), p => p.mergedAt],
      [l.open, d.pullRequests.filter(p => p.state === 'open'), p => p.createdAt],
    ]) if (subset.length) contributions.push(`## ${label}`, [...subset].sort(newest(date)).map(row).join('\n\n'));
    const reviews = [...d.reviews].sort(newest(r => r.submittedAt));
    if (reviews.length) contributions.push(`## ${l.reviews}`, reviews.map(r => `${link(`${projectName(r.repo)} #${r.number}`, r.url)}\\
${c.reviews.find(item => item.url === r.url)?.summary[lang] ?? text(r.title)}`).join('\n\n'));
    const closed = d.pullRequests.filter(p => p.state === 'closed' && !p.mergedAt).sort(newest(p => p.closedAt));
    if (closed.length) contributions.push(`<details>\n<summary>${l.closed} (${closed.length})</summary>\n\n${closed.map(row).join('\n\n')}\n\n</details>`);
    pages[fileFor('contributions', lang)] = `${contributions.join('\n\n')}\n`;

    const projects = header('projects', lang, l.projects);
    const items = d.projects.filter(p => !c.excludeProjects.includes(p.repo)).sort((a, b) => compare(a.repo, b.repo));
    const projectRow = p => {
      const settings = c.projects[p.repo] ?? {};
      const summary = settings.summary?.[lang] ?? (p.description ? text(p.description) : '');
      const demo = settings.demo ?? p.homepage;
      const links = [link('GitHub', `https://github.com/${p.repo}`)];
      if (demo) links.unshift(link(settings.demoLabel?.[lang] ?? l.demo, demo));
      return [`### ${text(settings.name ?? p.repo.split('/')[1])}`, summary, links.join(' · ')].filter(Boolean).join('\n\n');
    };
    projects.push(...items.filter(p => !p.archived).map(projectRow));
    const archived = items.filter(p => p.archived);
    if (archived.length) projects.push(`<details>\n<summary>${l.archived} (${archived.length})</summary>\n\n${archived.map(projectRow).join('\n\n')}\n\n</details>`);
    pages[fileFor('projects', lang)] = `${projects.join('\n\n')}\n`;
  }
  return pages;
}

// Collect public activity from GitHub.

export function createClient({ token, fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  return async path => {
    assert(path.startsWith('/') && !path.startsWith('//'), 'Invalid API path');
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetchImpl(`https://api.github.com${path}`, {
        headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'soltonigiri-profile', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) return response.json();
      const retryAfter = Number(response.headers.get('retry-after') ?? 1);
      const rateLimited = response.status === 429 || (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after')));
      if (attempt < 2 && (rateLimited || response.status >= 500) && retryAfter <= 5) {
        await sleep(Math.max(1, retryAfter) * 1000 * (attempt + 1));
        continue;
      }
      // Response bodies and headers can contain sensitive operational details.
      throw new Error(`GitHub request failed (HTTP ${response.status})`);
    }
  };
}

export async function searchPullRequests(api, user, now, { reviewed = false } = {}) {
  const first = Date.parse('2008-01-01T00:00:00Z') / 1000;
  const last = Math.floor(Date.parse(now) / 1000);
  assert(Number.isFinite(last) && last >= first, 'Invalid search date');
  const iso = seconds => new Date(seconds * 1000).toISOString().replace('.000Z', 'Z');
  async function search(start, end) {
    const query = `is:pr is:public ${reviewed ? `reviewed-by:${user} -author:${user}` : `author:${user}`} -user:${user} created:${iso(start)}..${iso(end)}`;
    const prefix = `/search/issues?q=${encodeURIComponent(query)}&per_page=100&sort=created&order=asc`;
    const firstPage = await api(`${prefix}&page=1`);
    assert(firstPage.incomplete_results === false && Array.isArray(firstPage.items) && Number.isInteger(firstPage.total_count) && firstPage.total_count >= 0, 'Incomplete PR search');
    if (firstPage.total_count > 1000) {
      assert(start < end, 'PR search limit reached within one second');
      const middle = Math.floor((start + end) / 2);
      const results = [...await search(start, middle), ...await search(middle + 1, end)];
      assert(results.length === firstPage.total_count, 'PR search changed while splitting creation windows');
      return results;
    }
    const items = [...firstPage.items];
    for (let page = 2; page <= Math.ceil(firstPage.total_count / 100); page++) {
      const result = await api(`${prefix}&page=${page}`);
      assert(result.incomplete_results === false && result.total_count === firstPage.total_count && Array.isArray(result.items), 'PR search changed during pagination');
      items.push(...result.items);
    }
    assert(items.length === firstPage.total_count && new Set(items.map(p => p.html_url)).size === items.length, 'Missing or duplicate PR search results');
    return items;
  }
  const items = await search(first, last);
  assert(new Set(items.map(p => p.html_url)).size === items.length, 'Duplicate PR search windows');
  return items;
}

export async function collect(c, { api = createClient({ token: process.env.GITHUB_TOKEN }), now = new Date().toISOString() } = {}) {
  const repoCache = new Map();
  async function publicRepo(repo) {
    if (!repoCache.has(repo)) {
      const value = await api(`/repos/${repo}`);
      assert(value.private === false, 'Expected a public repository');
      repoCache.set(repo, value);
    }
    return repoCache.get(repo);
  }
  const projects = [];
  const seenRepos = new Set();
  for (let page = 1; ; page++) {
    const repos = await api(`/users/${c.user}/repos?type=owner&sort=full_name&per_page=100&page=${page}`);
    assert(Array.isArray(repos), 'Invalid repository list');
    for (const repo of repos) {
      assert(!seenRepos.has(repo.full_name), 'Repository listing changed during pagination');
      seenRepos.add(repo.full_name);
      if (repo.private !== false || repo.fork !== false || repo.owner?.login.toLowerCase() !== c.user.toLowerCase() || c.excludeProjects.includes(repo.full_name)) continue;
      if (repo.homepage) safeUrl(repo.homepage);
      projects.push({ repo: repo.full_name, description: repo.description ?? null, homepage: repo.homepage || null, archived: repo.archived });
    }
    if (repos.length < 100) break;
  }
  const pullRequests = [];
  for (const item of await searchPullRequests(api, c.user, now)) {
    const identity = parseContributionUrl(item.html_url);
    assert(identity.kind === 'pull' && !identity.fragment, 'Unexpected search result');
    const p = await api(`/repos/${identity.repo}/pulls/${identity.number}`);
    assert(p.base?.repo?.private === false && p.user?.login.toLowerCase() === c.user.toLowerCase(), 'Unexpected PR visibility or author');
    pullRequests.push({ repo: identity.repo, number: p.number, url: p.html_url, title: p.title, state: p.state, draft: p.draft, createdAt: p.created_at, mergedAt: p.merged_at, closedAt: p.closed_at });
  }
  const reviews = [];
  for (const selected of c.reviews) {
    const p = parseContributionUrl(selected.url);
    await publicRepo(p.repo);
    assert(p.repo.split('/')[0].toLowerCase() !== c.user.toLowerCase(), 'Selected review must be on an external repository');
    let endpoint;
    if (p.fragment === 'pullrequestreview-' && p.kind === 'pull') endpoint = `/repos/${p.repo}/pulls/${p.number}/reviews/${p.id}`;
    else if (p.fragment === 'issuecomment-') endpoint = `/repos/${p.repo}/issues/comments/${p.id}`;
    else if (p.fragment === 'discussion_r' && p.kind === 'pull') endpoint = `/repos/${p.repo}/pulls/comments/${p.id}`;
    else throw new Error('Unsupported selected contribution URL');
    const review = await api(endpoint);
    assert(review.user?.login.toLowerCase() === c.user.toLowerCase() && review.html_url === selected.url, 'Selected contribution author or URL mismatch');
    reviews.push({ repo: p.repo, number: p.number, url: selected.url, submittedAt: review.submitted_at ?? review.created_at });
  }
  // Configured contributions retain their source links and editorial copy.
  const selectedPulls = new Set(c.reviews.filter(r => parseContributionUrl(r.url).kind === 'pull').map(r => r.url.split('#')[0]));
  for (const item of await searchPullRequests(api, c.user, now, { reviewed: true })) {
    const identity = parseContributionUrl(item.html_url);
    assert(identity.kind === 'pull' && !identity.fragment && identity.repo.split('/')[0].toLowerCase() !== c.user.toLowerCase(), 'Unexpected reviewed PR');
    if (selectedPulls.has(item.html_url)) continue;
    const p = await api(`/repos/${identity.repo}/pulls/${identity.number}`);
    assert(p.html_url === item.html_url && p.base?.repo?.private === false && p.user?.login && p.user.login.toLowerCase() !== c.user.toLowerCase(), 'Unexpected reviewed PR visibility or author');
    const own = [];
    const seen = new Set();
    for (let page = 1; ; page++) {
      const items = await api(`/repos/${identity.repo}/pulls/${identity.number}/reviews?per_page=100&page=${page}`);
      assert(Array.isArray(items), 'Invalid review list');
      for (const review of items) {
        assert(!seen.has(review.id), 'Review listing changed during pagination');
        seen.add(review.id);
        if (review.user?.login.toLowerCase() !== c.user.toLowerCase() || review.state === 'PENDING' || !review.submitted_at) continue;
        const source = parseContributionUrl(review.html_url);
        assert(source.repo === identity.repo && source.number === identity.number && source.kind === 'pull' && source.fragment === 'pullrequestreview-', 'Review URL mismatch');
        own.push({ repo: identity.repo, number: identity.number, url: review.html_url, submittedAt: review.submitted_at, title: p.title });
      }
      if (items.length < 100) break;
    }
    assert(own.length, 'Reviewed PR has no submitted review by profile owner');
    reviews.push(own.sort(newest(r => r.submittedAt))[0]);
  }
  const result = { version: 1, user: c.user, projects: projects.sort((a, b) => compare(a.repo, b.repo)), pullRequests: pullRequests.sort((a, b) => compare(a.url, b.url)), reviews: reviews.sort((a, b) => compare(a.url, b.url)) };
  return result;
}

// Generate or check the same pages locally and in GitHub Actions.
export const ROOT = fileURLToPath(new URL('../', import.meta.url));
const load = async path => JSON.parse(await readFile(path, 'utf8'));

export function nextCheck(previous, now, changed) {
  const time = Date.parse(now);
  assert(Number.isFinite(time), 'Invalid check time');
  if (previous) assert(Number.isFinite(Date.parse(previous)) && Date.parse(previous) <= time, 'Invalid previous check time');
  return !previous || changed || time - Date.parse(previous) >= 30 * DAY ? new Date(time).toISOString() : previous;
}

export async function buildOutputs(root, { refresh = false, now = new Date().toISOString(), api } = {}) {
  const config = validateConfig(await load(resolve(root, 'automation/config.json')));
  const saved = await load(resolve(root, 'automation/activity.json'));
  const { checkedAt, ...previous } = saved;
  const data = validateSnapshot(refresh ? await collect(config, { now, api }) : previous, config);
  const outputs = renderPages(config, data);
  let changed = json(previous) !== json(data);
  for (const [path, value] of Object.entries(outputs)) {
    const current = await readFile(resolve(root, path), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (current !== value) changed = true;
  }
  outputs['automation/activity.json'] = json({ ...data, checkedAt: refresh ? nextCheck(checkedAt, now, changed) : checkedAt });
  return outputs;
}

export async function writeOutputs(root, outputs) {
  assert(Object.keys(outputs).every(path => OUTPUT_FILES.includes(path)), 'Unexpected generated path');
  // Collection and rendering complete before any saved file is replaced.
  for (const [path, value] of Object.entries(outputs)) {
    await mkdir(dirname(resolve(root, path)), { recursive: true });
    await writeFile(resolve(root, path), value);
  }
}

export async function checkLinks(root, files = PAGE_FILES) {
  // Check the inline links emitted by the page renderer.
  for (const file of files) {
    const source = await readFile(resolve(root, file), 'utf8');
    for (const match of source.matchAll(/(?<!\\)\[(?:\\.|[^\]\\])*\]\(([^)\s]+)\)/g)) {
      const href = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) { safeUrl(href); continue; }
      assert(!href.startsWith('//'), 'Protocol-relative link');
      const [path] = href.split('#');
      const target = path ? resolve(root, dirname(file), decodeURIComponent(path)) : resolve(root, file);
      assert(!relative(root, target).startsWith('..'), `Link leaves repository: ${file}`);
      await access(target);
    }
  }
}

export async function check(root = ROOT) {
  for (const [file, expected] of Object.entries(await buildOutputs(root))) {
    assert(await readFile(resolve(root, file), 'utf8') === expected, `Generated file is stale: ${file}`);
  }
  await checkLinks(root);
  const data = await load(resolve(root, 'automation/activity.json'));
  assert(Number.isFinite(Date.parse(data.checkedAt)), 'Invalid check date');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command = 'check', ...extra] = process.argv.slice(2);
    assert(['check', 'generate', 'update'].includes(command) && !extra.length, 'Usage: node automation/profile.mjs [check|generate|update]');
    if (command === 'check') await check();
    else await writeOutputs(ROOT, await buildOutputs(ROOT, { refresh: command === 'update' }));
    console.log(`Profile ${command} complete.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
