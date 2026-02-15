import * as cheerio from 'cheerio';
import { RuleResult, Issue } from '../types';

export function metaInfo(html: string): RuleResult {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];
  let score = 0;

  // 1. Title tag (20 pts)
  const title = $('title').text().trim();
  if (title) {
    score += 20;
  } else {
    issues.push({ severity: 'error', message: 'Missing <title> tag' });
  }

  // 2. Meta description (20 pts)
  const description = $('meta[name="description"]').attr('content')?.trim();
  if (description && description.length > 10) {
    score += 20;
  } else if (description) {
    score += 10;
    issues.push({ severity: 'warning', message: 'Meta description is too short' });
  } else {
    issues.push({ severity: 'warning', message: 'Missing meta description' });
  }

  // 3. Canonical URL (15 pts)
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical) {
    score += 15;
  } else {
    issues.push({ severity: 'info', message: 'No canonical URL specified' });
  }

  // 4. Open Graph / social meta (15 pts)
  const ogTitle = $('meta[property="og:title"]').length;
  const ogDesc = $('meta[property="og:description"]').length;
  const ogImage = $('meta[property="og:image"]').length;
  const ogCount = ogTitle + ogDesc + ogImage;
  if (ogCount >= 3) {
    score += 15;
  } else if (ogCount > 0) {
    score += Math.round((ogCount / 3) * 15);
    issues.push({ severity: 'info', message: `Partial Open Graph tags: ${ogCount}/3 (title, description, image)` });
  } else {
    issues.push({ severity: 'info', message: 'No Open Graph meta tags found' });
  }

  // 5. Language declaration (15 pts)
  const lang = $('html').attr('lang');
  if (lang) {
    score += 15;
  } else {
    issues.push({ severity: 'warning', message: 'Missing lang attribute on <html>' });
  }

  // 6. Viewport meta (15 pts)
  const viewport = $('meta[name="viewport"]').length;
  if (viewport > 0) {
    score += 15;
  } else {
    issues.push({ severity: 'info', message: 'No viewport meta tag' });
  }

  const message = `Meta: ${title ? '✓' : '✗'} title, ${description ? '✓' : '✗'} description, ${canonical ? '✓' : '✗'} canonical, ${lang ? '✓' : '✗'} lang`;

  return {
    rule: 'meta-info',
    score,
    message,
    issues,
    details: { hasTitle: !!title, hasDescription: !!description, hasCanonical: !!canonical, ogCount, hasLang: !!lang, hasViewport: viewport > 0 },
  };
}
