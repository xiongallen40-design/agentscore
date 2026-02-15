import { AuditReport, RuleResult } from './types';
import { semanticHtml } from './rules/semantic-html';
import { ariaCoverage } from './rules/aria-coverage';
import { selectorStability } from './rules/selector-stability';

export { AuditReport, RuleResult, Score, Issue } from './types';

interface RuleEntry {
  fn: (html: string) => RuleResult;
  weight: number;
}

const rules: RuleEntry[] = [
  { fn: semanticHtml, weight: 0.3 },
  { fn: ariaCoverage, weight: 0.3 },
  { fn: selectorStability, weight: 0.2 },
  // WebMCP reserved: 0.2
];

/**
 * Audit a URL for agent-readability.
 */
export async function audit(url: string): Promise<AuditReport> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  // Fetch HTML
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

  // Run rules
  const results = rules.map(r => r.fn(html));

  // Weighted score (remaining 20% for WebMCP defaults to 0)
  const totalWeight = rules.reduce((s, r) => s + r.weight, 0);
  const weightedScore = rules.reduce((s, r, i) => s + results[i].score * r.weight, 0);
  const score = Math.round(weightedScore / totalWeight * (totalWeight / 1.0));
  // Scale to account for missing WebMCP (80% of total weight available)
  const finalScore = Math.round(weightedScore);

  return {
    url,
    timestamp: new Date().toISOString(),
    score: finalScore,
    results,
  };
}
