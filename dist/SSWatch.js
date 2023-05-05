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
            .on('change', (path) => { this.change(this, path); })
            .on('unlink', (path) => { this.change(this, path); })
            .on('error', this.error);
    }
    add(ssWatch, path) {
        path = ssWatch.rmSource(path);
        console.log('Found: ' + path);
        this.ss.build({ target: path });
    }
    change(ssWatch, path) {
        console.log('Changed: ' + path);
        this.ss.build({ target: path });
    }
    unlink(ssWatch, path) {
        console.log('Unlinked: ' + path);
        console.log('No build action taken...');
        // this should remove from listing.json 
    }
    error(error) {
        console.log(error);
    }
    rmSource(path) {
        let sourcePath = this.ss.cfg.sourcePath;
        if (sourcePath[0] === '.') {
            sourcePath = sourcePath.substring(1);
        }
        if (sourcePath[0] === '/') {
            sourcePath = sourcePath.substring(1);
        }
        path = path.replace(sourcePath, '');
        if (path[0] === '/') {
            path = path.substring(1);
        }
        return path;
    }
}
exports.default = SSWatch;
