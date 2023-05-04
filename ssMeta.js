"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class SSMeta {
    init(options) {
        if (fs_1.default.existsSync('./sscfg.json')) {
            console.log('Error: This directory already contains SteelSky files');
            console.log('If you want to re-initialize this directory please delete the sscfg.json file!');
            console.log('Aborting init');
            process.exit();
        }
        this.cp('sscfg.json');
        fs_1.default.mkdirSync('./layout');
        this.cp('layout/header.html');
        this.cp('layout/footer.html');
        this.cp('layout/theme.css');
        fs_1.default.mkdirSync('./source');
        this.cp('source/index.md');
        if (options.minimal) {
            // Dont copy the rest of the files
            return;
        }
        this.cp('source/pageA.md');
        this.cp('source/pageB.md');
        this.cp('source/pageC.html');
        this.cp('source/search.md');
        this.cp('source/image.jpg');
        this.cp('source/text.txt');
        this.cp('source/blob');
        this.cp('source/favicon.ico');
    }
    cp(target) {
        fs_1.default.copyFileSync(__dirname + '/resources/init/' + target, './' + target);
    }
}
exports.default = SSMeta;
