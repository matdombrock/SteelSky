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
const steelsky_js_1 = __importDefault(require("./steelsky.js"));
const ssMeta_js_1 = __importDefault(require("./ssMeta.js"));
const getPkgVer_js_1 = __importDefault(require("./util/getPkgVer.js"));
const program = new commander_1.Command();
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
v${getPkgVer_js_1.default}
`)
    //.helpOption(false)
    //.addHelpCommand(false)
    //.addHelpText('after','\nNote: All commands are prefixed with "." to avoid conflicting with prompts!')
    .showHelpAfterError('Use `steelsky --help` or `steeksky [cmd] --help` for more info.')
    .version(getPkgVer_js_1.default);
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
    .option('-l, --layout', 'only rebuild the layout files')
    .action((options) => {
    const ss = new steelsky_js_1.default;
    ss.build(options);
});
program
    .command('watch')
    .description('watch for changes and build files')
    .action(() => {
    const ss = new steelsky_js_1.default;
    ss.watch();
});
program
    .command('init')
    .description('initialize a new steelsky project')
    .option('-m, --minimal', 'dont add example source files')
    .action((options) => {
    const ssMeta = new ssMeta_js_1.default;
    ssMeta.init(options);
});
program.parse();
