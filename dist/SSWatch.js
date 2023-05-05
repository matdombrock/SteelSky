"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const SteelSky_1 = __importDefault(require("./SteelSky"));
class SSWatch {
    constructor() {
        this.ss = new SteelSky_1.default;
        this.sourcePath = '';
        this.sourcePath = this.ss.cfg.sourcePath;
        //console.log(this.sourcePath);
        this.watcher = chokidar_1.default.watch(this.sourcePath, { ignored: /^\./, persistent: true });
    }
    watch() {
        this.watcher
            .on('add', (path) => { this.add(this, path); })
            .on('change', this.change)
            .on('unlink', this.unlink)
            .on('error', this.error);
    }
    add(self, path) {
        path = SSWatch.rmSource(path, self.sourcePath);
        console.log('Found: ' + path);
        //this.ss.build({target: path});
    }
    change(path) {
        console.log('Changed: ' + path);
    }
    unlink(path) {
        console.log('Unlinked: ' + path);
    }
    error(error) {
    }
    static rmSource(path, sourcePath) {
        if (sourcePath[0] === '.') {
            sourcePath = sourcePath.substring(1);
        }
        if (sourcePath[0] === '/') {
            sourcePath = sourcePath.substring(1);
        }
        return path.replace(sourcePath, '');
    }
}
exports.default = SSWatch;
