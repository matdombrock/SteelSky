#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    Commander Setup
*/
const commander_1 = require("commander"); // (normal include);
const SteelSky_js_1 = __importDefault(require("./SteelSky.js"));
const SSInit_js_1 = __importDefault(require("./SSInit.js"));
const SSWatch_js_1 = __importDefault(require("./SSWatch.js"));
const getPkgVer_js_1 = __importDefault(require("./util/getPkgVer.js"));
const ascii_js_1 = __importDefault(require("./util/ascii.js"));
const program = new commander_1.Command();
console.log(ascii_js_1.default);
program
    .name('steelsky')
    .description(`			
SteelSky v${getPkgVer_js_1.default}	
A dead simple static site generator. 

GPL3 | Mathieu Dombrock 2023
`)
    //.helpOption(false)
    //.addHelpCommand(false)
    //.addHelpText('after','\nNote: All commands are prefixed with "." to avoid conflicting with prompts!')
    .showHelpAfterError('Use `steelsky --help` or `steelsky [cmd] --help` for more info.')
    .version('v' + getPkgVer_js_1.default);
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
    const ss = new SteelSky_js_1.default;
    ss.build(options);
});
program
    .command('watch')
    .description('watch for changes and build files')
    .action(() => {
    const ssWatch = new SSWatch_js_1.default;
    ssWatch.watch();
});
program
    .command('init')
    .description('initialize a new steelsky project')
    .option('-m, --minimal', 'dont add example source files')
    .action((options) => {
    const ssInit = new SSInit_js_1.default;
    ssInit.init(options);
});
program.parse();
