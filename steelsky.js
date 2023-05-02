"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const showdown_1 = __importDefault(require("showdown"));
const showdown_highlight_1 = __importDefault(require("showdown-highlight"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Config {
    constructor() {
        this.sourcePath = './';
        this.layoutPath = './';
        this.highlightStyle = './';
        this.outPath = './build/';
        if (!fs_1.default.existsSync('./sscfg.json')) {
            throw 'No Config ./sscfg.json';
            return;
        }
        const cfgRaw = fs_1.default.readFileSync('./sscfg.json', 'utf-8');
        const parsed = JSON.parse(cfgRaw);
        this.sourcePath = parsed.sourcePath;
        this.layoutPath = parsed.layoutPath;
        this.highlightStyle = parsed.highlightStyle;
        this.outPath = parsed.outPath;
    }
}
class Sections {
    constructor(layoutPath, highlightStyle) {
        this.headerHTML = '';
        this.footerHTML = '';
        this.themeCSS = '';
        this.highlightCSS = '';
        const lp = layoutPath;
        this.headerHTML = fs_1.default.readFileSync(lp + '/header.html', 'utf-8');
        this.footerHTML = fs_1.default.readFileSync(lp + '/footer.html', 'utf-8');
        this.themeCSS = fs_1.default.readFileSync(lp + '/theme.css', 'utf-8');
        this.headerHTML = fs_1.default.readFileSync(__dirname + '/node_modules/highlight.js/styles/' + highlightStyle + '.css', 'utf-8');
    }
}
class SteelSky {
    constructor() {
        this.cfg = new Config;
        this.outList = [];
        this.outMeta = {
            processed: 0,
            total: 0,
        };
        this.sections = new Sections(this.cfg.layoutPath, this.cfg.highlightStyle);
        this.converter = new showdown_1.default.Converter({
            extensions: [(0, showdown_highlight_1.default)({
                    pre: true
                })],
            tables: true
        });
    }
    run() {
        const list = this.traverse(this.cfg.sourcePath, this.cfg.sourcePath);
        //console.log(list);
        if (!fs_1.default.existsSync(this.cfg.outPath)) {
            console.log('Create Out Directory');
            fs_1.default.mkdirSync(this.cfg.outPath, { recursive: true });
        }
        for (let item of list) {
            this.outMeta.total++;
            const res = this.convert(item);
            if (res !== "") {
                console.log("+ " + res);
                this.outMeta.processed++;
            }
        }
        console.log('Processed: '
            + this.outMeta.processed
            + '/'
            + this.outMeta.total);
        //fs.writeFileSync('./cache.json', JSON.stringify(cache,null,2));
        fs_1.default.writeFileSync(this.cfg.outPath + '/listing.json', JSON.stringify(this.outList, null, 2));
        fs_1.default.copyFileSync(__dirname + '/resources/ssList.js', this.cfg.outPath + '/ssList.js');
    }
    traverse(path, rootPath, list = []) {
        const listing = fs_1.default.readdirSync(path);
        for (let item of listing) {
            let itemPath = `${path}/${item}`;
            const isDirectory = fs_1.default.lstatSync(itemPath).isDirectory();
            if (isDirectory) {
                list = this.traverse(itemPath, rootPath, list);
            }
            else {
                const itemPathSub = itemPath.replace(`${rootPath}/`, '');
                list.push(itemPathSub);
            }
        }
        return list;
    }
    convert(fileLoc) {
        let parsed = path_1.default.parse(fileLoc);
        let noExt = parsed.dir + '/' + parsed.name;
        let ext = parsed.ext;
        const originalExt = ext;
        let html = '';
        let metaJSON = {};
        if (ext === '.md') {
            let file = fs_1.default.readFileSync(this.cfg.sourcePath + '/' + fileLoc, 'utf-8');
            ext = '.html';
            parsed.ext = '.html';
            // Parse meta data
            if (file.substring(0, 10) === '<steelsky>') {
                let meta = file.split('</steelsky>')[0];
                meta = meta.replace('<steelsky>', '');
                metaJSON = JSON.parse(meta);
                file = file.replace('<steelsky>', '<script>const ssmeta=');
                file = file.replace('</steelsky>', ';</script>');
            }
            html = this.buildHTML(file);
        }
        const writeLoc = this.cfg.outPath + '/' + noExt + ext;
        const realPath = path_1.default.parse(writeLoc).dir;
        if (!fs_1.default.existsSync(realPath)) {
            console.log('New Dir: ' + realPath);
            fs_1.default.mkdirSync(realPath, { recursive: true });
        }
        if (originalExt === '.md') {
            fs_1.default.writeFileSync(writeLoc, html, { encoding: 'utf-8' });
        }
        else {
            fs_1.default.copyFileSync(this.cfg.sourcePath + '/' + fileLoc, this.cfg.outPath + '/' + fileLoc);
        }
        if (noExt[0] === '/') {
            // Remove the first char
            noExt = noExt.substring(0);
        }
        const listingLoc = noExt.replace(/^\/+/g, '') + ext; //Remove leading slash
        let outListData = {
            path: parsed,
            location: listingLoc,
            meta: {},
            originalExt: originalExt
        };
        if (originalExt === '.md') {
            outListData.meta = metaJSON;
        }
        this.outList.push(outListData);
        return fileLoc;
    }
    buildHTML(file) {
        const html = this.sections.headerHTML
            + '<style>'
            + this.sections.highlightCSS
            + '</style>'
            + '<style>'
            + this.sections.themeCSS
            + '</style><div class="ss-content">'
            + this.converter.makeHtml(file)
            + '</div>'
            + this.sections.footerHTML;
        return html;
    }
}
const ss = new SteelSky;
ss.run();
