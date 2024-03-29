#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const showdown_1 = __importDefault(require("showdown"));
const showdown_highlight_1 = __importDefault(require("showdown-highlight"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Config_js_1 = __importDefault(require("./Config.js"));
const RenderSections_js_1 = __importDefault(require("./RenderSections.js"));
class SteelSky {
    constructor() {
        this.cfg = new Config_js_1.default;
        this.outListing = [];
        this.outMeta = {
            processed: 0,
            total: 0,
        };
        this.sections = new RenderSections_js_1.default(this.cfg.layoutPath, this.cfg.highlightStyle);
        this.converter = new showdown_1.default.Converter({
            extensions: [(0, showdown_highlight_1.default)({
                    pre: true
                })],
            tables: true
        });
    }
    //
    // Public methods
    //
    build(options) {
        //
        if (options.target) {
            // Targets should always be in configured source dir
            const targetPath = this.cfg.sourcePath + '/' + options.target;
            if (!fs_1.default.existsSync(targetPath)) {
                console.log('Error: Target not found source dir: ' + options.target);
                process.exit();
            }
            const isDirectory = fs_1.default.lstatSync(targetPath).isDirectory();
            if (isDirectory) {
                // Change the cfg source dir
                this.buildDir();
                return;
            }
            else {
                this.buildFile(options.target);
                return;
            }
        }
        this.buildDir();
    }
    //
    // Private methods
    //
    buildFile(target) {
        console.log('Building a single file:');
        console.log(target);
        this.loadListing();
        this.convert(target);
        this.writeMeta();
    }
    buildDir() {
        console.log('Building from source dir:');
        console.log(this.cfg.sourcePath);
        const list = this.traverse(this.cfg.sourcePath, this.cfg.sourcePath);
        //console.log(list);
        if (!fs_1.default.existsSync(this.cfg.outPath)) {
            console.log('Creating out directory:');
            console.log(this.cfg.outPath);
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
        this.writeMeta();
    }
    // Returns a list of all files in the target directory
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
        let outListing = {
            path: parsed,
            location: listingLoc,
            meta: {},
            originalExt: originalExt
        };
        if (originalExt === '.md') {
            outListing.meta = metaJSON;
        }
        // Check for existing entries
        let existing = false;
        for (let [index, item] of this.outListing.entries()) {
            if (item.path === outListing.path) {
                this.outListing[index] = outListing;
                existing = true;
            }
        }
        if (existing === false) {
            this.outListing.push(outListing);
        }
        return fileLoc;
    }
    // Loads the listing from a listing file so it can be appended
    loadListing() {
        const listingPath = this.cfg.outPath + '/listing.json';
        if (!fs_1.default.existsSync(listingPath)) {
            console.log('Warning: No listing file found');
            return;
        }
        const listingRaw = fs_1.default.readFileSync(listingPath, 'utf-8');
        this.outListing = JSON.parse(listingRaw);
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
    writeMeta() {
        // Write the listing data
        fs_1.default.writeFileSync(this.cfg.outPath + '/listing.json', JSON.stringify(this.outListing, null, 2));
        // Copy the ssList file
        fs_1.default.copyFileSync(__dirname + '/../resources/ssList.js', this.cfg.outPath + '/ssList.js');
    }
}
exports.default = SteelSky;
