"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Config {
    // Loads config file
    constructor() {
        this.sourcePath = './';
        this.layoutPath = './';
        this.highlightStyle = './';
        this.outPath = './build/';
        if (!fs_1.default.existsSync('./sscfg.json')) {
            console.log('Error: Missing config: ./sscfg.json');
            process.exit();
        }
        const cfgRaw = fs_1.default.readFileSync('./sscfg.json', 'utf-8');
        const parsed = JSON.parse(cfgRaw);
        this.sourcePath = parsed.sourcePath;
        this.layoutPath = parsed.layoutPath;
        this.highlightStyle = parsed.highlightStyle;
        this.outPath = parsed.outPath;
    }
}
exports.default = Config;
