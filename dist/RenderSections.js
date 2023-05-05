"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class RenderSections {
    constructor(layoutPath, highlightStyle) {
        this.headerHTML = '';
        this.footerHTML = '';
        this.themeCSS = '';
        this.highlightCSS = '';
        const lp = layoutPath;
        this.headerHTML = fs_1.default.readFileSync(lp + '/header.html', 'utf-8');
        this.footerHTML = fs_1.default.readFileSync(lp + '/footer.html', 'utf-8');
        this.themeCSS = fs_1.default.readFileSync(lp + '/theme.css', 'utf-8');
        this.highlightCSS = fs_1.default.readFileSync(__dirname + '/../node_modules/highlight.js/styles/' + highlightStyle + '.css', 'utf-8');
    }
}
exports.default = RenderSections;
