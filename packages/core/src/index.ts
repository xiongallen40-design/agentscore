import { AuditReport, RuleResult } from './types';
import { semanticHtml } from './rules/semantic-html';

export { AuditReport, RuleResult, Score } from './types';

// TODO: Add more rules here as they are implemented
const rules: Array<(html: string) => RuleResult> = [
  semanticHtml,
];

/**
 * Audit a URL for agent-readability.
 * TODO: Accept options (rule selection, thresholds, etc.)
 */
export async function audit(url: string): Promise<AuditReport> {
  // TODO: Use a proper fetcher with timeout, retries, user-agent config
  const response = await fetch(url);
  const html = await response.text();

  const results = rules.map((rule) => rule(html));
  const score = results.length === 0
    ? 0
    : Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  return {
    url,
    timestamp: new Date().toISOString(),
    score,
    results,
  };
}
