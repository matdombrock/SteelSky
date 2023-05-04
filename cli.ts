#! /usr/bin/env node
/*
	Commander Setup
*/
import { Command } from 'commander'; // (normal include);
import SteelSky from './steelsky.js';
import SSMeta from './ssMeta.js';
import VERSION_NUMBER from './util/getPkgVer.js';

const program = new Command();

console.log(`
   _____ __            _______ __        
  / ___// /____  ___  / / ___// /____  __
  \\__ \\/ __/ _ \\/ _ \\/ /\\__ \\/ //_/ / / /
 ___/ / /_/  __/  __/ /___/ / ,< / /_/ / 
/____/\\__/\\___/\\___/_//____/_/|_|\\__, /  
                                /____/   
`);

program
	.name('steelsky')
	.description(`				
A dead simple static site generator. 
v${VERSION_NUMBER}
`
	)
	//.helpOption(false)
	//.addHelpCommand(false)
	//.addHelpText('after','\nNote: All commands are prefixed with "." to avoid conflicting with prompts!')
	.showHelpAfterError('Use `steelsky --help` or `steeksky [cmd] --help` for more info.')
	.version(VERSION_NUMBER);

program
	.command('help')
	.description('show help')
	.action(()=>{
        console.log("HELP");
		program.help();
	});

program
	.command('build', { isDefault: true })
	.description('build all files or a single file')
    .option('-t, --target <path>', 'build the target file or directory')
    .option('-l, --layout', 'only rebuild the layout files')
	.action((options)=>{
        const ss:SteelSky = new SteelSky;
		ss.build(options);
	});

program
	.command('watch')
	.description('watch for changes and build files')
	.action(()=>{
        const ss:SteelSky = new SteelSky;
		ss.watch();
	});

program
	.command('init')
	.description('initialize a new steelsky project')
    .option('-m, --minimal', 'dont add example source files')
	.action((options)=>{
        const ssMeta:SSMeta = new SSMeta;
		ssMeta.init(options);
	});

program.parse();