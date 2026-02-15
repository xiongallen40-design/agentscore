import * as cheerio from 'cheerio';
import { RuleResult, Issue } from '../types';

export function webmcpSupport(html: string, url?: string): RuleResult {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];
  let score = 0;

  // 1. navigator.modelContext / WebMCP script detection (25 pts)
  let hasModelContext = false;
  $('script').each((_, el) => {
    const src = $(el).html() || '';
    if (/modelContext|model-context|webmcp/i.test(src)) {
      hasModelContext = true;
    }
  });
  if (hasModelContext) {
    score += 25;
  } else {
    issues.push({ severity: 'info', message: 'No WebMCP / navigator.modelContext scripts detected' });
  }

  // 2. <meta name="mcp-server"> or similar MCP declarations (25 pts)
  let hasMcpMeta = false;
  $('meta').each((_, el) => {
    const name = ($(el).attr('name') || '').toLowerCase();
    const httpEquiv = ($(el).attr('http-equiv') || '').toLowerCase();
    if (/mcp|model.?context/i.test(name) || /mcp/i.test(httpEquiv)) {
      hasMcpMeta = true;
    }
  });
  // Also check link tags for MCP discovery
  $('link').each((_, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase();
    if (/mcp|model.?context/i.test(rel)) {
      hasMcpMeta = true;
    }
  });
  if (hasMcpMeta) {
    score += 25;
  } else {
    issues.push({ severity: 'info', message: 'No <meta name="mcp-server"> or MCP link declarations found' });
  }

  // 3. JSON-LD / schema.org structured data (30 pts)
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const jsonLdCount = jsonLdScripts.length;
  let hasSchemaOrg = false;
  jsonLdScripts.each((_, el) => {
    const content = $(el).html() || '';
    if (/schema\.org/i.test(content)) hasSchemaOrg = true;
  });
  // Also check for microdata
  const microdataCount = $('[itemscope]').length;

  if (jsonLdCount > 0 && hasSchemaOrg) {
    score += 30;
  } else if (jsonLdCount > 0 || microdataCount > 0) {
    score += 20;
    issues.push({ severity: 'info', message: `Found ${jsonLdCount} JSON-LD blocks, ${microdataCount} microdata elements (consider adding schema.org)` });
  } else {
    issues.push({ severity: 'warning', message: 'No structured data (JSON-LD / microdata) found' });
  }

  // 4. AI/bot access meta (robots meta) (20 pts)
  let robotsScore = 0;
  const robotsMeta = $('meta[name="robots"]');
  if (robotsMeta.length > 0) {
    const content = (robotsMeta.attr('content') || '').toLowerCase();
    if (/noindex|nofollow/.test(content)) {
      issues.push({ severity: 'warning', message: `Robots meta restricts access: "${content}"` });
      robotsScore = 5;
    } else {
      robotsScore = 20;
    }
  } else {
    // No robots meta = default allow (decent)
    robotsScore = 15;
  }
  score += robotsScore;

  const message = `WebMCP: ${hasModelContext ? '✓' : '✗'} modelContext, ${hasMcpMeta ? '✓' : '✗'} MCP meta, ${jsonLdCount} JSON-LD, ${microdataCount} microdata`;

  return {
    rule: 'webmcp-support',
    score,
    message,
    issues,
    details: { hasModelContext, hasMcpMeta, jsonLdCount, hasSchemaOrg, microdataCount },
  };
}
