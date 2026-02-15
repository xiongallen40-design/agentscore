/** Overall score: 0-100 */
export type Score = number;

/** A single issue found during audit */
export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
}

/** Result of a single rule check */
export interface RuleResult {
  rule: string;
  score: Score;
  message: string;
  issues: Issue[];
  details?: Record<string, unknown>;
}

/** Full audit report for a URL */
export interface AuditReport {
  url: string;
  timestamp: string;
  score: Score;
  results: RuleResult[];
}
