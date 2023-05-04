#! /usr/bin/env node
/*
	Commander Setup
*/
import { Command } from 'commander'; // (normal include);
import SteelSky from './steelsky.js';
import VERSION_NUMBER from './util/getPkgVer.js';

const program = new Command();

const ss:SteelSky = new SteelSky;


program
	.name('steelsky')
	.description(`				
A dead simple static site generator. 
v${VERSION_NUMBER}
`
	)
	//.helpOption(false)
	.addHelpCommand(false)
	.addHelpText('after','\nNote: All commands are prefixed with "." to avoid conflicting with prompts!')
	.showHelpAfterError('Use `sllm --help` or `sllm [cmd] --help` for more info.')
	.version(VERSION_NUMBER);

program
	.command('help')
	.description('show help')
	.action(()=>{
		program.help();
	});

program
	.command('build', { isDefault: true })
	.description('build all files or a single file')
	.action(()=>{
		program.help();
	});

program
	.command('watch')
	.description('watch for changes and build files')
	.action(()=>{
		ss.run();
	});

program
	.command('init')
	.description('initialize a new steelsky project')
	.action(()=>{
		ss.run();
	});