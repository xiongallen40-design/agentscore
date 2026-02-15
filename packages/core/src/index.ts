import { AuditReport, RuleResult } from './types';
import { semanticHtml } from './rules/semantic-html';
import { ariaCoverage } from './rules/aria-coverage';
import { selectorStability } from './rules/selector-stability';
import { webmcpSupport } from './rules/webmcp-support';
import { metaInfo } from './rules/meta-info';

export { AuditReport, RuleResult, Score, Issue } from './types';

interface RuleEntry {
  fn: (html: string) => RuleResult;
  weight: number;
}

const rules: RuleEntry[] = [
  { fn: semanticHtml, weight: 0.25 },
  { fn: ariaCoverage, weight: 0.25 },
  { fn: selectorStability, weight: 0.15 },
  { fn: webmcpSupport, weight: 0.20 },
  { fn: metaInfo, weight: 0.15 },
];

/**
 * Audit a URL for agent-readability.
 */
export async function audit(url: string): Promise<AuditReport> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  let html: string;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AgentLint/0.1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    html = await response.text();
  } catch (err) {
    if ((err as Error).message.includes('HTTP ')) throw err;
    throw new Error(`Failed to fetch ${url}: ${(err as Error).message}`);
  }

  const results = rules.map(r => r.fn(html));
  const finalScore = Math.round(rules.reduce((s, r, i) => s + results[i].score * r.weight, 0));

  return {
    url,
    timestamp: new Date().toISOString(),
    score: finalScore,
    results,
  };
}
