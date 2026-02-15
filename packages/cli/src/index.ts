#!/usr/bin/env node
import { Command } from 'commander';
import { audit } from '@agentlint/core';

const program = new Command();

program
  .name('agentlint')
  .description('Audit web pages for AI-agent readability')
  .version('0.1.0');

program
  .command('audit <url>')
  .description('Run audit on a URL')
  // TODO: Add options: --format json|text, --rules, --threshold
  .action(async (url: string) => {
    try {
      console.log(`🔍 Auditing ${url}...\n`);
      const report = await audit(url);

      console.log(`Score: ${report.score}/100\n`);
      for (const result of report.results) {
        const icon = result.score >= 70 ? '✅' : result.score >= 40 ? '⚠️' : '❌';
        console.log(`${icon} [${result.rule}] ${result.message}`);
      }

      // TODO: Exit with non-zero code if below threshold
    } catch (err) {
      console.error('Audit failed:', (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
