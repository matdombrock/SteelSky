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
console.log(ASCII);

//
// Utility
//

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

//
// CLI
//

program
  .name('steelsky')
  .description('CLI for SteelSky - Static Site Generator')
  .version('1.0.0');

program
  .command('build <inputDir> <outputDir>')
  .description('Build the static site')
  .action(async (inputDir, outputDir) => {
    const inputRoot = path.resolve(inputDir);
    const outputRoot = path.resolve(outputDir);
    if (!fs.existsSync(inputRoot)) {
      console.error(`Input directory does not exist: ${inputRoot}`);
      process.exit(1);
    }
    const core = new SSCore(inputRoot, outputRoot);
    await core.build();
  });

program
  .command('init <targetDir>')
  .description('Copy the skeleton files to a new directory for quick project setup')
  .action((targetDir) => {
    const pathMod = require('path');
    const fsMod = require('fs');
    const skeletonDir = pathMod.resolve(__dirname, 'skeleton', 'demo');
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
