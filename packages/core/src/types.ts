/** Overall score: 0-100 */
export type Score = number;

/** Result of a single rule check */
export interface RuleResult {
  /** Rule identifier, e.g. "semantic-html" */
  rule: string;
  /** 0-100 */
  score: Score;
  /** Human-readable summary */
  message: string;
  /** Optional details / evidence */
  details?: Record<string, unknown>;
}

/** Full audit report for a URL */
export interface AuditReport {
  url: string;
  /** ISO timestamp */
  timestamp: string;
  /** Aggregate score (average of rule scores) */
  score: Score;
  /** Individual rule results */
  results: RuleResult[];
}
