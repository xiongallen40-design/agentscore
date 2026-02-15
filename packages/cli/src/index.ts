#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { audit, RuleResult } from '@agentlint/core';

const RULE_LABELS: Record<string, string> = {
  'semantic-html': 'Semantic HTML',
  'aria-coverage': 'ARIA Coverage',
  'selector-stability': 'Selector Stability',
  'webmcp-support': 'WebMCP / Structured Data',
  'meta-info': 'Meta Information',
};

const RULE_WEIGHTS: Record<string, number> = {
  'semantic-html': 25,
  'aria-coverage': 25,
  'selector-stability': 15,
  'webmcp-support': 20,
  'meta-info': 15,
};

const SUGGESTIONS: Record<string, string[]> = {
  'semantic-html': [
    'Replace generic <div> containers with <section>, <article>, <nav>, <main>',
    'Ensure a proper heading hierarchy (h1 → h2 → h3)',
    'Associate all form inputs with <label> elements',
  ],
  'aria-coverage': [
    'Add aria-label to icon-only buttons and links',
    'Ensure all <img> tags have descriptive alt attributes',
    'Use role attributes for custom interactive components',
  ],
  'selector-stability': [
    'Add data-testid attributes to key interactive elements',
    'Prefer semantic class names over CSS-in-JS generated hashes',
    'Use stable IDs for elements that agents need to target',
  ],
  'webmcp-support': [
    'Add JSON-LD structured data with schema.org vocabulary',
    'Consider implementing navigator.modelContext (WebMCP)',
    'Add <meta name="mcp-server"> for MCP endpoint discovery',
  ],
  'meta-info': [
    'Add a descriptive <title> and <meta name="description">',
    'Include Open Graph tags (og:title, og:description, og:image)',
    'Set lang attribute on <html> element',
  ],
};

function progressBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  if (score >= 80) return chalk.green(bar);
  if (score >= 60) return chalk.yellow(bar);
  return chalk.red(bar);
}

function colorScore(score: number): string {
  if (score >= 80) return chalk.green.bold(`${score}`);
  if (score >= 60) return chalk.yellow.bold(`${score}`);
  return chalk.red.bold(`${score}`);
}

function gradeEmoji(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

function severityIcon(severity: string): string {
  switch (severity) {
    case 'error': return chalk.red('✗');
    case 'warning': return chalk.yellow('⚠');
    case 'info': return chalk.blue('ℹ');
    default: return ' ';
  }
}

const program = new Command();

program
  .name('agentlint')
  .description('Audit web pages for AI-agent readability')
  .version('0.1.0');

program
  .command('audit <url>')
  .description('Run audit on a URL')
  .option('--json', 'Output results as JSON')
  .action(async (url: string, opts: { json?: boolean }) => {
    try {
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

      if (!opts.json) {
        console.log(chalk.dim(`\n  🔍 Auditing ${url}...\n`));
      }

      const report = await audit(url);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      // Big score display
      console.log(`  ${gradeEmoji(report.score)} ${chalk.bold.white('Agent-Readiness Score:')} ${colorScore(report.score)}${chalk.dim('/100')}\n`);
      console.log(chalk.dim('  ─────────────────────────────────────────────\n'));

      // Each dimension with progress bar
      for (const result of report.results) {
        const label = (RULE_LABELS[result.rule] || result.rule).padEnd(24);
        const weight = RULE_WEIGHTS[result.rule] || 0;
        console.log(`  ${label} ${progressBar(result.score)} ${colorScore(result.score)} ${chalk.dim(`(${weight}%)`)}`);
        if (result.issues.length > 0) {
          for (const issue of result.issues) {
            console.log(`    ${severityIcon(issue.severity)} ${chalk.dim(issue.message)}`);
          }
        }
      }

      // Top 3 improvement suggestions
      const sorted = [...report.results].sort((a, b) => a.score - b.score);
      const topSuggestions: string[] = [];
      for (const r of sorted) {
        const pool = SUGGESTIONS[r.rule] || [];
        for (const s of pool) {
          if (topSuggestions.length >= 3) break;
          topSuggestions.push(s);
        }
        if (topSuggestions.length >= 3) break;
      }

      if (topSuggestions.length > 0) {
        console.log(`\n${chalk.dim('  ─────────────────────────────────────────────')}`);
        console.log(`\n  ${chalk.bold('💡 Top Improvements:')}\n`);
        topSuggestions.forEach((s, i) => {
          console.log(`  ${chalk.cyan(`${i + 1}.`)} ${s}`);
        });
      }

      console.log(chalk.dim(`\n  Audited at ${report.timestamp}\n`));
    } catch (err) {
      console.error(chalk.red(`\n  ✗ ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse();
