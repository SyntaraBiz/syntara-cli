#!/usr/bin/env node

import { Command } from 'commander';
import { generateSitemapCommand } from '../src/commands/sitemap.js';
import { generatePwaIconsCommand } from '../src/commands/pwa.js';
import { optimizeImagesCommand } from '../src/commands/images.js';

const program = new Command();

program
  .name('syntara')
  .description('Herramientas internas CLI para proyectos web de SyntaraBiz')
  .version('1.0.0');

// Register Commands
generateSitemapCommand(program);
generatePwaIconsCommand(program);
optimizeImagesCommand(program);

program.parse(process.argv);
