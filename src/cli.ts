#!/usr/bin/env node
import { Command } from 'commander';
import SSCore from './Core';
import path from 'path';
import fs from 'fs';

const program = new Command();

const ASCII = `
                                                   
▄█████ ▄▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄    ▄█████ ▄▄ ▄▄ ▄▄ ▄▄ 
▀▀▀▄▄▄   ██   ██▄▄  ██▄▄  ██    ▀▀▀▄▄▄ ██▄█▀ ▀███▀ 
█████▀   ██   ██▄▄▄ ██▄▄▄ ██▄▄▄ █████▀ ██ ██   █   
                                                   
`
program
  .name('steelsky')
  .description('Static site generator CLI for SteelSky2')
  .version('1.0.0');

program
  .command('build')
  .description('Build the static site')
  .option('-i, --input <inputDir>', 'Input root directory', 'skeleton/demo')
  .option('-o, --output <outputDir>', 'Output directory', 'output')
  .action(async (opts) => {
    const inputRoot = path.resolve(opts.input);
    const outputRoot = path.resolve(opts.output);
    if (!fs.existsSync(inputRoot)) {
      console.error(`Input directory does not exist: ${inputRoot}`);
      process.exit(1);
    }
    console.log(ASCII);
    const core = new SSCore(inputRoot, outputRoot);
    await core.build();
  });

program
  .command('init <targetDir>')
  .description('Copy the skeleton files to a new directory for quick project setup')
  .action((targetDir) => {
    const pathMod = require('path');
    const fsMod = require('fs');
    const copyRecursiveSync = require('./skeleton_copy').default;
    const skeletonDir = pathMod.resolve(__dirname, 'skeleton');
    const destDir = pathMod.resolve(process.cwd(), targetDir);
    if (!fsMod.existsSync(skeletonDir)) {
      console.error('Skeleton directory not found:', skeletonDir);
      process.exit(1);
    }
    if (fsMod.existsSync(destDir)) {
      console.error('Target directory already exists:', destDir);
      process.exit(1);
    }
    copyRecursiveSync(skeletonDir, destDir);
    console.log(`Skeleton files copied to ${destDir}`);
  });

program.parse(process.argv);
