import { RuleResult } from '../types';

/** Non-semantic tags */
const GENERIC_TAGS = ['div', 'span'];

/** Semantic tags we reward */
const SEMANTIC_TAGS = ['section', 'article', 'nav', 'main', 'header', 'footer', 'aside', 'figure', 'figcaption', 'details', 'summary'];

/**
 * Count occurrences of tags in raw HTML.
 * TODO: Replace naive regex with proper HTML parser (e.g. cheerio / linkedom)
 */
function countTags(html: string, tags: string[]): number {
  let count = 0;
  for (const tag of tags) {
    const regex = new RegExp(`<${tag}[\\s>]`, 'gi');
    const matches = html.match(regex);
    count += matches ? matches.length : 0;
  }
  return count;
}

/**
 * Semantic HTML rule: measures the ratio of semantic vs generic tags.
 * Score = semantic / (semantic + generic) * 100, clamped to 0-100.
 */
export function semanticHtml(html: string): RuleResult {
  const genericCount = countTags(html, GENERIC_TAGS);
  const semanticCount = countTags(html, SEMANTIC_TAGS);
  const total = genericCount + semanticCount;

  const score = total === 0 ? 100 : Math.round((semanticCount / total) * 100);

  return {
    rule: 'semantic-html',
    score,
    message: `Semantic tag ratio: ${semanticCount}/${total} (${score}%)`,
    details: { genericCount, semanticCount, total },
  };
}
