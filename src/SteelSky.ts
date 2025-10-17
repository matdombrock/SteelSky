#!/usr/bin/env node
import showdown from "showdown";
import showdownHighlight from "showdown-highlight";
import fs from 'fs';
import path from 'path';

import ListItem from './ListItem.js';
import Config from './Config.js';
import RenderSections from './RenderSections.js';

interface OutMeta {
  processed: number;
  total: number;
}

class SteelSky {
  public cfg: Config = new Config;
  private sections: RenderSections;
  private converter: showdown.Converter;
  private outListing: Array<ListItem> = [];
  private outMeta: OutMeta = {
    processed: 0,
    total: 0,
  };
  constructor() {
    this.sections = new RenderSections(this.cfg.layoutPath, this.cfg.highlightStyle);
    this.converter = new showdown.Converter({
      extensions: [showdownHighlight({
        pre: true
      })],
      tables: true
    });
  }
  //
  // Public methods
  //
  public build(options: any): void {
    //
    if (options.target) {
      // Targets should always be in configured source dir
      const targetPath: string = this.cfg.sourcePath + '/' + options.target;
      if (!fs.existsSync(targetPath)) {
        console.log('Error: Target not found source dir: ' + options.target);
        process.exit();
      }
      const isDirectory: boolean = fs.lstatSync(targetPath).isDirectory();
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
  private buildFile(target: string): void {
    console.log('Building a single file:');
    console.log(target);
    this.loadListing();
    this.convert(target);
    this.writeMeta();
  }
  private buildDir(): void {
    console.log('Building from source dir:');
    console.log(this.cfg.sourcePath);
    const list = this.traverse(this.cfg.sourcePath, this.cfg.sourcePath);
    //console.log(list);
    if (!fs.existsSync(this.cfg.outPath)) {
      console.log('Creating out directory:');
      console.log(this.cfg.outPath);
      fs.mkdirSync(this.cfg.outPath, { recursive: true });
    }
    for (let item of list) {
      this.outMeta.total++;
      const res = this.convert(item);
      if (res !== "") {
        console.log("+ " + res);
        this.outMeta.processed++;
      }
    }
    console.log(
      'Processed: '
      + this.outMeta.processed
      + '/'
      + this.outMeta.total
    );
    this.writeMeta();
  }
  // Returns a list of all files in the target directory
  private traverse(path: string, rootPath: string, list: Array<string> = []): Array<string> {
    const listing: Array<string> = fs.readdirSync(path);
    for (let item of listing) {
      let itemPath: string = `${path}/${item}`;
      const isDirectory: boolean = fs.lstatSync(itemPath).isDirectory();
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
  private convert(fileLoc: string): string {
    let parsed: path.ParsedPath = path.parse(fileLoc);
    let noExt: string = parsed.dir + '/' + parsed.name;
    let ext: string = parsed.ext;
    const originalExt: string = ext;
    let html: string = '';
    let metaJSON: any = {};
    if (ext === '.md') {
      let file: string = fs.readFileSync(this.cfg.sourcePath + '/' + fileLoc, 'utf-8');
      ext = '.html';
      parsed.ext = '.html';
      // Parse meta data
      if (file.substring(0, 10) === '<steelsky>') {
        let meta: string = file.split('</steelsky>')[0];
        meta = meta.replace('<steelsky>', '');
        metaJSON = JSON.parse(meta);
        file = file.replace('<steelsky>', '<script>const ssmeta=');
        file = file.replace('</steelsky>', ';</script>');
      }
      html = this.buildHTML(file);
    }
    const writeLoc: string = this.cfg.outPath + '/' + noExt + ext;
    const realPath: string = path.parse(writeLoc).dir;
    if (!fs.existsSync(realPath)) {
      console.log('New Dir: ' + realPath);
      fs.mkdirSync(realPath, { recursive: true });
    }
    if (originalExt === '.md') {
      fs.writeFileSync(writeLoc, html, { encoding: 'utf-8' });
    }
    else {
      fs.copyFileSync(
        this.cfg.sourcePath + '/' + fileLoc,
        this.cfg.outPath + '/' + fileLoc
      );
    }
    if (noExt[0] === '/') {
      // Remove the first char
      noExt = noExt.substring(0);
    }
    const listingLoc: string = noExt.replace(/^\/+/g, '') + ext;//Remove leading slash
    let outListing: ListItem = {
      path: parsed,
      location: listingLoc,
      meta: {},
      originalExt: originalExt
    };
    if (originalExt === '.md') {
      outListing.meta = metaJSON;
    }
    // Check for existing entries
    let existing: boolean = false;
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
  private loadListing(): void {
    const listingPath: string = this.cfg.outPath + '/listing.json';
    if (!fs.existsSync(listingPath)) {
      console.log('Warning: No listing file found');
      return;
    }
    const listingRaw: string = fs.readFileSync(listingPath, 'utf-8');
    this.outListing = JSON.parse(listingRaw);
  }
  private buildHTML(file: string): string {
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
  // Build the RSS feed from this.outListing
  private buildRSS(): string {
    console.log('Building RSS feed...');
    function escapeXML(str: string): string {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }
    let rssItems = this.outListing
      .filter(item => item.originalExt === '.md' && item.location.startsWith('posts/') && item.meta.date)
      .sort((a, b) => {
        const dateA = new Date(a.meta.date || '').getTime();
        const dateB = new Date(b.meta.date || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 20)
      .map(item => {
        const meta = item.meta;
        return `
  <item>
    <title>${escapeXML(meta.title)}</title>
    <link>${this.cfg.rssURL}/${item.location}</link>
    <description>${escapeXML(meta.description) || ''}</description>
    <pubDate>${new Date(meta.date).toUTCString()}</pubDate>
  </item>`;
      }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(this.cfg.rssTitle)}</title>
    <link>${escapeXML(this.cfg.rssURL)}</link>
    <description>${escapeXML(this.cfg.rssDescription) || ''}</description>
${rssItems}
  </channel>
</rss>`;
    return rss;
  }
  private writeMeta(): void {
    // Write the RSS feed
    const rssData: string = this.buildRSS();
    fs.writeFileSync(this.cfg.outPath + '/rss.xml', rssData);
    // Write the listing data
    fs.writeFileSync(this.cfg.outPath + '/ss-listing.json', JSON.stringify(this.outListing, null, 2));
    // Copy the resources
    fs.copyFileSync(__dirname + '/../resources/ssAPI.js', this.cfg.outPath + '/ssAPI.js');
  }
}

export default SteelSky;
