#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { audit, RuleResult } from '@agentlint/core';

function colorScore(score: number): string {
  if (score >= 80) return chalk.green.bold(`${score}`);
  if (score >= 60) return chalk.yellow.bold(`${score}`);
  return chalk.red.bold(`${score}`);
}

function severityIcon(severity: string): string {
  switch (severity) {
    case 'error': return chalk.red('✗');
    case 'warning': return chalk.yellow('⚠');
    case 'info': return chalk.blue('ℹ');
    default: return ' ';
  }
}

function ruleIcon(score: number): string {
  if (score >= 80) return chalk.green('✅');
  if (score >= 60) return chalk.yellow('⚠️');
  return chalk.red('❌');
}

function printRule(result: RuleResult): void {
  console.log(`  ${ruleIcon(result.score)} ${chalk.bold(result.rule)} ${colorScore(result.score)}/100`);
  console.log(`    ${chalk.dim(result.message)}`);
  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      console.log(`    ${severityIcon(issue.severity)} ${issue.message}`);
    }
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
  .action(async (url: string) => {
    try {
      // Auto-prepend https:// if missing
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

      console.log(chalk.dim(`\n🔍 Auditing ${url}...\n`));
      const report = await audit(url);

      console.log(`  ${chalk.bold('Overall Score:')} ${colorScore(report.score)}/100\n`);
      console.log(chalk.dim('  ─────────────────────────────────\n'));

      for (const result of report.results) {
        printRule(result);
        console.log();
      }

      console.log(chalk.dim(`  Audited at ${report.timestamp}\n`));
    } catch (err) {
      console.error(chalk.red(`\n  ✗ ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse();
