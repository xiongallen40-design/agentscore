import * as cheerio from 'cheerio';
import { RuleResult, Issue } from '../types';

export function ariaCoverage(html: string): RuleResult {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];

  // 1. Interactive elements with aria labels
  const interactive = $('button, a, input, select, textarea');
  let ariaLabeledCount = 0;
  interactive.each((_, el) => {
    const hasLabel = !!(
      $(el).attr('aria-label') ||
      $(el).attr('aria-labelledby') ||
      $(el).attr('title') ||
      $(el).text().trim()
    );
    if (hasLabel) ariaLabeledCount++;
  });
  const interactiveCount = interactive.length;
  const interactiveScore = interactiveCount === 0 ? 100 : Math.round((ariaLabeledCount / interactiveCount) * 100);
  if (interactiveCount > 0 && ariaLabeledCount < interactiveCount) {
    issues.push({
      severity: 'warning',
      message: `${interactiveCount - ariaLabeledCount}/${interactiveCount} interactive elements lack accessible names`,
    });
  }

  // 2. Images with alt
  const images = $('img');
  let altCount = 0;
  images.each((_, el) => {
    if ($(el).attr('alt') !== undefined) altCount++;
  });
  const imgCount = images.length;
  const imgScore = imgCount === 0 ? 100 : Math.round((altCount / imgCount) * 100);
  if (imgCount > 0 && altCount < imgCount) {
    issues.push({
      severity: 'error',
      message: `${imgCount - altCount}/${imgCount} images missing alt attribute`,
    });
  }

  // 3. Role attribute usage (bonus)
  const withRole = $('[role]').length;
  const roleBonus = Math.min(withRole * 2, 20); // up to 20 bonus points scaled down

  const baseScore = Math.round(interactiveScore * 0.6 + imgScore * 0.4);
  const score = Math.min(100, baseScore + Math.round(roleBonus * 0.1));

  return {
    rule: 'aria-coverage',
    score,
    message: `ARIA: ${ariaLabeledCount}/${interactiveCount} interactive labeled, ${altCount}/${imgCount} imgs with alt, ${withRole} role attrs`,
    issues,
    details: { interactiveCount, ariaLabeledCount, imgCount, altCount, withRole },
  };
}
