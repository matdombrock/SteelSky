#! /usr/bin/env node
/*
  Commander Setup
*/
import { Command } from 'commander'; // (normal include);
import SteelSky from './SteelSky.js';
import SSInit from './SSInit.js';
import SSWatch from './SSWatch.js';
import VERSION_NUMBER from './util/getPkgVer.js';
import ascii from './util/ascii.js';

const program = new Command();

console.log(ascii);

program
  .name('steelsky')
  .description(`			
SteelSky v${VERSION_NUMBER}	
A dead simple static site generator. 

GPL3 | Mathieu Dombrock 2023
`
  )
  //.helpOption(false)
  //.addHelpCommand(false)
  //.addHelpText('after','\nNote: All commands are prefixed with "." to avoid conflicting with prompts!')
  .showHelpAfterError('Use `steelsky --help` or `steelsky [cmd] --help` for more info.')
  .version('v' + VERSION_NUMBER);

program
  .command('help')
  .description('show help')
  .action(() => {
    console.log("HELP");
    program.help();
  });

program
  .command('build', { isDefault: true })
  .description('build all files or a single file')
  .option('-t, --target <path>', 'build the target file or directory')
  .action((options) => {
    const ss: SteelSky = new SteelSky;
    ss.build(options);
  });

program
  .command('watch')
  .description('watch for changes and build files')
  .action(() => {
    const ssWatch: SSWatch = new SSWatch;
    ssWatch.watch();
  });

program
  .command('init')
  .description('initialize a new steelsky project')
  .option('-m, --minimal', 'dont add example source files')
  .action((options) => {
    const ssInit: SSInit = new SSInit;
    ssInit.init(options);
  });

program
  .command('page')
  .description('create a new steelsky page in the current directory')
  .argument('<name>', 'the name of the page to create')
  .action((name) => {
    const ssInit: SSInit = new SSInit;
    ssInit.page(name);
  });

program.parse();
