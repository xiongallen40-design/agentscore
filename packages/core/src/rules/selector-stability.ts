import * as cheerio from 'cheerio';
import { RuleResult, Issue } from '../types';

// Regex for CSS-in-JS hash patterns: class names with random hashes
const HASH_CLASS_RE = /^[a-zA-Z_][\w-]*[_-][a-zA-Z0-9]{5,}$/;
const TESTID_ATTRS = ['data-testid', 'data-cy', 'data-qa', 'data-test', 'data-test-id'];

export function selectorStability(html: string): RuleResult {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];

  // Consider meaningful elements (not script/style/meta/etc)
  const allElements = $('body *').not('script, style, link, meta, noscript, br, hr');
  const totalElements = allElements.length;

  if (totalElements === 0) {
    return { rule: 'selector-stability', score: 50, message: 'No elements found to analyze', issues: [], details: {} };
  }

  // 1. Test ID coverage
  let testIdCount = 0;
  allElements.each((_, el) => {
    for (const attr of TESTID_ATTRS) {
      if ($(el).attr(attr)) { testIdCount++; break; }
    }
  });

  // We don't expect 100% test-id coverage, but key interactive elements should have them
  const interactiveEls = $('button, a, input, select, textarea, [role="button"], [role="link"]');
  let interactiveWithTestId = 0;
  interactiveEls.each((_, el) => {
    for (const attr of TESTID_ATTRS) {
      if ($(el).attr(attr)) { interactiveWithTestId++; break; }
    }
  });
  const interactiveTestIdRatio = interactiveEls.length === 0 ? 1 : interactiveWithTestId / interactiveEls.length;

  if (interactiveEls.length > 0 && interactiveTestIdRatio < 0.1) {
    issues.push({ severity: 'warning', message: `Only ${interactiveWithTestId}/${interactiveEls.length} interactive elements have test IDs` });
  }

  // 2. CSS-in-JS hash class detection
  let hashClassElements = 0;
  let totalClassedElements = 0;
  allElements.each((_, el) => {
    const cls = $(el).attr('class');
    if (!cls) return;
    totalClassedElements++;
    const classes = cls.split(/\s+/);
    if (classes.some(c => HASH_CLASS_RE.test(c))) hashClassElements++;
  });

  const hashRatio = totalClassedElements === 0 ? 0 : hashClassElements / totalClassedElements;
  if (hashRatio > 0.5) {
    issues.push({ severity: 'warning', message: `${Math.round(hashRatio * 100)}% of classed elements have hash-like classes (CSS-in-JS)` });
  } else if (hashRatio > 0.2) {
    issues.push({ severity: 'info', message: `${Math.round(hashRatio * 100)}% of classed elements have hash-like classes` });
  }

  // Score: testId coverage on interactive (50%) + stability penalty from hash classes (50%)
  const testIdScore = Math.round(interactiveTestIdRatio * 100);
  const stabilityScore = Math.round((1 - hashRatio) * 100);
  const score = Math.round(testIdScore * 0.5 + stabilityScore * 0.5);

  return {
    rule: 'selector-stability',
    score,
    message: `Selectors: ${testIdCount} test IDs (${interactiveWithTestId}/${interactiveEls.length} interactive), ${Math.round(hashRatio * 100)}% hash classes`,
    issues,
    details: { testIdCount, interactiveWithTestId, interactiveTotal: interactiveEls.length, hashClassElements, totalClassedElements, hashRatio: Math.round(hashRatio * 100) },
  };
}
