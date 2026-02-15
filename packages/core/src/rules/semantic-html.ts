import * as cheerio from 'cheerio';
import { RuleResult, Issue } from '../types';

const SEMANTIC_TAGS = ['section', 'article', 'nav', 'main', 'header', 'footer', 'aside', 'figure', 'figcaption', 'details', 'summary'];
const GENERIC_TAGS = ['div', 'span'];

export function semanticHtml(html: string): RuleResult {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];

  // 1. Semantic vs generic tag ratio
  let semanticCount = 0;
  for (const tag of SEMANTIC_TAGS) semanticCount += $(tag).length;
  let genericCount = 0;
  for (const tag of GENERIC_TAGS) genericCount += $(tag).length;
  const total = semanticCount + genericCount;
  const ratio = total === 0 ? 1 : semanticCount / total;

  if (ratio < 0.1) {
    issues.push({ severity: 'error', message: `Very low semantic tag ratio: ${semanticCount}/${total}` });
  } else if (ratio < 0.3) {
    issues.push({ severity: 'warning', message: `Low semantic tag ratio: ${semanticCount}/${total}` });
  }

  // 2. Heading hierarchy
  const headings: { level: number; text: string }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = (el as any).tagName as string;
    headings.push({ level: parseInt(tag[1]), text: $(el).text().trim().slice(0, 60) });
  });

  let headingScore = 100;
  if (headings.length === 0) {
    issues.push({ severity: 'warning', message: 'No headings found' });
    headingScore = 0;
  } else {
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({ severity: 'error', message: 'No <h1> found' });
      headingScore -= 30;
    } else if (h1Count > 1) {
      issues.push({ severity: 'warning', message: `Multiple <h1> tags found: ${h1Count}` });
      headingScore -= 15;
    }
    // Check for skipped levels
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level > headings[i - 1].level + 1) {
        issues.push({ severity: 'warning', message: `Heading level skipped: h${headings[i - 1].level} → h${headings[i].level}` });
        headingScore -= 10;
      }
    }
    headingScore = Math.max(0, headingScore);
  }

  // 3. Form label association
  const inputs = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
  let labeledCount = 0;
  inputs.each((_, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label') || $(el).attr('aria-labelledby');
    const hasWrappingLabel = $(el).closest('label').length > 0;
    const hasForLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
    if (ariaLabel || hasWrappingLabel || hasForLabel) labeledCount++;
  });
  const inputCount = inputs.length;
  const labelScore = inputCount === 0 ? 100 : Math.round((labeledCount / inputCount) * 100);
  if (inputCount > 0 && labeledCount < inputCount) {
    issues.push({ severity: 'warning', message: `${inputCount - labeledCount}/${inputCount} form inputs missing labels` });
  }

  // Weighted: ratio 50%, headings 30%, labels 20%
  const ratioScore = Math.round(Math.min(ratio * 3, 1) * 100); // 33%+ ratio = 100
  const score = Math.round(ratioScore * 0.5 + headingScore * 0.3 + labelScore * 0.2);

  return {
    rule: 'semantic-html',
    score,
    message: `Semantic: ${semanticCount} tags, ${headings.length} headings, ${labeledCount}/${inputCount} labeled inputs`,
    issues,
    details: { semanticCount, genericCount, headings: headings.length, labeledCount, inputCount },
  };
}
