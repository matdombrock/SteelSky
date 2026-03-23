import showdown from "showdown";
import showdownHighlight from "showdown-highlight";
import prettier from "prettier";
import fs from 'fs';
import path, * as Path from 'path';
import chalk from 'chalk';

import { spawnSync } from "child_process";

import Config from './Config';
import { PageMeta, FrontMatter } from './SSTypes';

const PAGE_FM_OPEN = '```/front';
const PAGE_FM_CLOSE = '```';
const TEMPLATE_OPEN = '```/';
const TEMPLATE_CLOSE = '```';

const DIR_CONTENT = 'content/';
const DIR_TEMPLATES = 'templates/';
const DIR_CHROME = 'chrome/';
const DIR_TS_DIST = 'ts-dist/';

const HEAD = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/hljs-theme.css">
    <link rel="stylesheet" href="/css/site.css">
`

type ChromeLocations = 'header' | 'footer' | 'top' | 'bottom';

class SSCore {
  constructor(inputRoot: string, outputRoot: string) {
    this.inputRoot = inputRoot;
    this.outputRoot = outputRoot;
    this.converter = new showdown.Converter({
      extensions: [showdownHighlight({ pre: true })],
    });
    this.templates = {};
    this.chrome = {};
    this.config = {} as Config;
  }
  public async build() {
    // Config
    this.log('Loading config', 'step');
    const cfgRaw = fs.readFileSync(Path.join(this.inputRoot, 'ssconfig.json'), 'utf-8');
    this.config = JSON.parse(cfgRaw) as Config;
    this.log(JSON.stringify(this.config, null, 2), 'info');

    // Compile TS files in the inputRoot
    if (this.config.compileTs) {
      this.log('Compiling TypeScript files in input directory', 'step');
      const tscPath = Path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');
      const tscConfigPath = Path.join(this.inputRoot, 'tsconfig.json');
      if (fs.existsSync(tscConfigPath)) {
        const result = spawnSync(tscPath, ['-p', tscConfigPath], { stdio: 'inherit' });
        if (result.status !== 0) {
          this.log('TypeScript compilation failed', 'error');
          process.exit(1);
        }
      } else {
        this.log('No tsconfig.json found in input directory, skipping TypeScript compilation', 'warn');
      }
    }

    // Load all templates into memory, so they can be used when converting content files
    this.log('Loading templates files', 'step');
    const templateFiles = this.listFiles(DIR_TEMPLATES);
    for (const filePath of templateFiles) {
      const ext = Path.extname(filePath);
      if (ext === '.md') {
        const templateName = Path.basename(filePath, ext);
        const templateContent = fs.readFileSync(filePath, 'utf-8');
        this.templates[templateName] = templateContent;
        this.log(`Found template: ${templateName}`);
      } else {
        this.copyFile(filePath);
      }
    }

    // Load the chrome
    // It is not converted from markdown until final render
    this.log('Loading chrome', 'step');
    const chromePath = Path.join(this.inputRoot, DIR_CHROME);
    const chromeListing = this.listFiles(chromePath);
    for (const filePath of chromeListing) {
      const ext = Path.extname(filePath);
      const name = Path.basename(filePath, ext);
      if (ext === '.md') {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.chrome[name] = content;
        this.log(`Loaded chrome ${name} from ${filePath}`);
      }
    }
    console.log(this.chrome);

    // Then we process all content files
    const contentList = this.listFiles(DIR_CONTENT);
    this.log('Processing content files', 'step');
    const pageMetas: PageMeta[] = [];
    for (const filePath of contentList) {
      const ext = Path.extname(filePath);
      let pageMeta: PageMeta;
      if (ext === '.md') {
        pageMeta = await this.convertFile(filePath);
      } else {
        pageMeta = this.copyFile(filePath);
      }
      pageMetas.push(pageMeta);
    }

    // Copy the highlight style
    const hljsStyleSrc = Path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles', `${this.config.highlightStyle}.css`);
    const hljsStyleDest = Path.join(this.outputRoot, 'css', 'hljs-theme.css');
    fs.mkdirSync(Path.dirname(hljsStyleDest), { recursive: true });
    this.log(`Copying highlight style`, 'step');
    this.log(`Copying from ${hljsStyleSrc} to ${hljsStyleDest}`);
    fs.copyFileSync(hljsStyleSrc, hljsStyleDest);

    // Write page metas to output directory for later use (e.g. sitemap, RSS, etc.)
    this.log('Writing page metas to output directory', 'step');
    const pageMetaOutputPath = Path.join(this.outputRoot, 'listing.json');
    fs.writeFileSync(pageMetaOutputPath, JSON.stringify(pageMetas, null, 2), 'utf-8');

    // Generate an RSS feed based on the page metas
    // Each page in `/posts/` with a date in the front matter is considered a blog post and will be included in the RSS feed
    this.log('Generating RSS feed', 'step');
    const posts = pageMetas.filter(meta => meta.path.startsWith('/posts/') && meta.date);
    const rssItems = posts.map(post => `
      <item>
        <title>${post.title}</title>
        <link>${post.path}</link>
        <description>${post.description}</description>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      </item>
    `).join('\n').trim();
    let rssContent = `
      <rss version="2.0">
        <channel>
          <title>${this.config.siteTitle}</title>
          <description>${this.config.siteDescription}</description>
          <link>/</link>
          ${rssItems}
        </channel>
      </rss>
    `.trim();
    const rssOutputPath = Path.join(this.outputRoot, 'rss.xml');
    fs.writeFileSync(rssOutputPath, rssContent, 'utf-8');

    // Cleanup
    this.log('Cleaning up temporary files', 'step');
    // Remove the dist folder where compiled JS files are stored
    const distPath = Path.join(this.inputRoot, DIR_TS_DIST);
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      this.log('Removed temporary dist folder', 'info');
    }

    // Done!
    this.log('Build completed', 'ok');
  }
  //
  // Private
  //
  private config: Config;
  private inputRoot: string;
  private outputRoot: string;
  private chrome: { [key: string]: string };
  private converter: showdown.Converter;
  private templates: Record<string, string>;
  private log(message: string, mode: 'info' | 'step' | 'warn' | 'ok' | 'error' = 'info') {
    const prefix = `[${mode.toUpperCase()}]`;
    let color;
    if (mode === 'info') {
      color = chalk.white;
    } else if (mode === 'step') {
      color = chalk.cyan;
    } else if (mode === 'warn') {
      color = chalk.yellow;
    } else if (mode === 'ok') {
      color = chalk.green;
    } else if (mode === 'error') {
      color = chalk.red;
    } else {
      color = chalk.reset; // fallback for unknown modes
    }
    console.log(color(`${prefix} ${message}`));
  }
  private newFrontMatter(): FrontMatter {
    return {
      title: this.config.siteTitle,
      description: this.config.siteDescription,
      image: this.config.siteImage,
      date: new Date().toISOString(),
    };
  }
  private newPageMeta(): PageMeta {
    return {
      ...this.newFrontMatter(),
      path: '',
      ext: '',
    };
  }
  // Recursively list all files in a directory
  private listFiles(dir: string): string[] {
    let results: string[] = [];
    // If dir is already absolute (starts with inputRoot), don't join again
    const listDir = Path.isAbsolute(dir) || dir.startsWith(this.inputRoot)
      ? dir
      : Path.join(this.inputRoot, dir);
    const list = fs.readdirSync(listDir);
    list.forEach((file) => {
      const filePath = Path.join(listDir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.listFiles(filePath));
      } else {
        results.push(filePath);
      }
    });
    return results;
  }
  private handleFrontMatter(content: string): FrontMatter {
    const fmStart = content.indexOf(PAGE_FM_OPEN);
    const fmEnd = content.indexOf(PAGE_FM_CLOSE, fmStart + PAGE_FM_OPEN.length);
    let fm = this.newFrontMatter();
    if (fmStart !== -1 && fmEnd !== -1) {
      const fmContent = content.substring(fmStart + PAGE_FM_OPEN.length, fmEnd).trim();
      const lines = fmContent.split('\n');
      for (const line of lines) {
        const sepIdx = line.indexOf('=');
        if (sepIdx !== -1) {
          const key = line.slice(0, sepIdx).trim();
          const value = line.slice(sepIdx + 1).trim();
          if (key && value) {
            // Assign any key here
            // End users can add custom keys in the front matter and they will be available in the page meta
            (fm as any)[key] = value;
          }
        }
      }
    }
    return fm;
  }
  private removeFrontMatter(content: string): string {
    const fmStart = content.indexOf(PAGE_FM_OPEN);
    const fmEnd = content.indexOf(PAGE_FM_CLOSE, fmStart + PAGE_FM_OPEN.length);
    if (fmStart !== -1 && fmEnd !== -1) {
      return content.substring(0, fmStart) + content.substring(fmEnd + PAGE_FM_CLOSE.length);
    }
    return content;
  }
  private handlePageMeta(filePath: string, content: string): PageMeta {
    const pageMeta = this.newPageMeta();
    pageMeta.ext = '.html';
    pageMeta.path = '/' + Path.relative(this.inputRoot, filePath).replace(/\\/g, '/').replace(/\.md$/, '.html').replace(DIR_CONTENT, '');
    // Look for page meta
    const frontMatter = this.handleFrontMatter(content);
    // Override page meta full with page meta
    Object.assign(pageMeta, frontMatter);
    // We now have the full page meta
    return pageMeta;
  }
  // Templates usage look like this:
  // {{templateName param1="value1" param2="value2"}}
  // Template defs look like this:
  // This is my template: {{param1}} and {{param2}}
  private handleTemplates(content: string, pageMeta: PageMeta): string {
    let result = content;

    // 0. Replace any front matter references in the content with actual values from the page meta
    result = result.replace(/```\/front:([\w-]+)```/g, (_, key) => {
      // Support nested keys if needed, for now just top-level
      return (pageMeta as any)[key] ?? '';
    });

    // 1. Find all markdown code blocks and replace them with placeholders
    const codeBlocks: string[] = [];
    result = result.replace(/```(markdown|md)\n[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODEBLOCK_PLACEHOLDER_${codeBlocks.length - 1}__`;
    });

    // 2. Render templates as before (outside code blocks)
    const templateRegex = new RegExp(`${TEMPLATE_OPEN}(\\w+)([^${TEMPLATE_CLOSE}]*)${TEMPLATE_CLOSE}`, 'g');
    let match;
    const includedCss = new Set<string>();
    let includeLinks = '';

    while ((match = templateRegex.exec(result)) !== null) {
      const [fullMatch, templateName, paramString] = match;
      let templateContent = this.templates[templateName];
      if (templateContent) {
        const cssFileName = `${templateName}.css`;
        const cssFilePath = Path.join(this.inputRoot, DIR_TEMPLATES, cssFileName);
        if (!includedCss.has(cssFileName) && fs.existsSync(cssFilePath)) {
          includeLinks += `<link rel="stylesheet" href="/templates/${cssFileName}">\n`;
          includedCss.add(cssFileName);
        }
        const jsFileName = `${templateName}.js`;
        const jsFilePath = Path.join(this.inputRoot, DIR_TEMPLATES, jsFileName);
        const jsFileDistPath = Path.join(this.inputRoot, DIR_TS_DIST, DIR_TEMPLATES, jsFileName);
        if (fs.existsSync(jsFilePath)) {
          includeLinks += `<script type="module" src="/templates/${jsFileName}" defer></script>\n`;
          templateContent = `<div class="template-${templateName}">\n${templateContent}\n</div>`;
        }
        if (fs.existsSync(jsFileDistPath)) {
          includeLinks += `<script type="module" src="/templates/${jsFileName}" defer></script>\n`;
          templateContent = `<div class="template-${templateName}">\n${templateContent}\n</div>`;
        }

        // Parse params from usage
        const params: Record<string, string> = {};
        const paramRegex = /(\w+)="([^"]*)"/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(paramString)) !== null) {
          const [, key, value] = paramMatch;
          params[key] = value;
        }

        // Parse default values from template definition: {{param = value}}
        const defaultParams: Record<string, string> = {};
        templateContent = templateContent.replace(/{{\s*(\w+)\s*=\s*([^}]+)\s*}}/g, (m, key, value) => {
          defaultParams[key] = value.trim();
          // Replace with a normal param placeholder for later replacement
          return `{{${key}}}`;
        });

        // Merge params: usage > default
        const mergedParams = { ...defaultParams, ...params };

        // Replace all {{param}} with merged values
        let renderedTemplate = templateContent;
        for (const [key, value] of Object.entries(mergedParams)) {
          renderedTemplate = renderedTemplate.replace(
            new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
            value
          );
        }
        result = result.replace(fullMatch, renderedTemplate);
      } else {
        this.log(`Template not found: ${templateName}`, 'warn');
      }
    }

    // 3. Prepend CSS/JS links if any
    if (includeLinks) {
      result = includeLinks + result;
    }

    // 4. Restore code blocks
    result = result.replace(/__CODEBLOCK_PLACEHOLDER_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)]);

    return result;
  }
  // Returns processed crhome for the given location
  private getChrome(loc: ChromeLocations, pageMeta: PageMeta): string {
    const basePath = Path.dirname(pageMeta.path).slice(1);
    let pathChrome = '';
    const chromeTarget = `${basePath}.${loc}`;
    if (this.chrome[chromeTarget]) {
      pathChrome = this.chrome[chromeTarget];
    }
    pathChrome = this.handleTemplates(pathChrome, pageMeta);
    pathChrome = this.converter.makeHtml(pathChrome);
    return pathChrome;
  }
  private buildHeader(pageMeta: PageMeta): string {
    // Check if we have a header for this path
    const pathHeader = this.getChrome('header', pageMeta);
    return `
      ${HEAD}
      <title>${pageMeta.title}</title>
      <meta name="description" content="${pageMeta.description}">
      <meta property="og:title" content="${pageMeta.title}">
      <meta property="og:description" content="${pageMeta.description}">
      <meta property="og:image" content="${pageMeta.image}">
      </head>
      <script>
          // Add pageMeta to window for later use
          window.pageMeta = ${JSON.stringify(pageMeta)};
      </script>
      <body>
      ${this.chrome.header}
      ${pathHeader}
      <div id="page-content">
      `.trim();
  }
  private async convertFile(filePath: string): Promise<PageMeta> {
    this.log(`Converting file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf-8');
    // Get the page meta based on front matter and file path
    const pageMeta = this.handlePageMeta(filePath, content);
    // We are done with the front matter, we can remove it from the content
    content = this.removeFrontMatter(content);
    // Handle templates in the content
    content = this.handleTemplates(content, pageMeta);
    // We can now use the page meta to build the page
    const converted = this.converter.makeHtml(content);
    const header = this.buildHeader(pageMeta);
    const pathTop = this.getChrome('top', pageMeta);
    const pathBottom = this.getChrome('bottom', pageMeta);
    const pathFooter = this.getChrome('footer', pageMeta);
    let fullContent = `
        ${header}
        ${pathTop}
        ${converted}
        ${pathBottom}
        </div> <!-- #page-content -->
        ${pathFooter}
        ${this.chrome.footer}
        </body>
        </html>`;
    fullContent = await prettier.format(fullContent, { parser: 'html' });
    // Write the full content to the output directory
    const relativePath = Path.relative(this.inputRoot, filePath);
    const outputPath = Path.join(this.outputRoot, relativePath.replace(/\.md$/, '.html')).replace(DIR_CONTENT, '');
    fs.mkdirSync(Path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, fullContent, 'utf-8');
    return pageMeta;

  }
  private copyFile(filePath: string): PageMeta {
    // Just copy the file to the output directory
    const ext = Path.extname(filePath);
    // Instead of copying ts files directly from source
    // Transfer them from the `dist` folder where tsc outputs them
    if (ext === '.ts') {
      const relativePath = Path.relative(this.inputRoot, filePath);
      const distPath = Path.join(this.inputRoot, DIR_TS_DIST, relativePath.replace(/\.ts$/, '.js'));
      if (fs.existsSync(distPath)) {
        return this.copyFile(distPath);
      } else {
        this.log(`Compiled JS file not found for ${filePath}, expected at ${distPath}`, 'error');
        process.exit(1);
      }
    }
    const relativePath = Path.relative(this.inputRoot, filePath);
    const outputPath = Path.join(this.outputRoot, relativePath).replace(DIR_CONTENT, '').replace(DIR_TS_DIST, '');
    this.log(`Copying file: ${relativePath} -> ${outputPath}`);
    fs.mkdirSync(Path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(filePath, outputPath);
    const meta = this.newPageMeta();
    meta.title = Path.basename(filePath);
    meta.description = '';
    meta.image = '';
    meta.path = '/' + relativePath.replace(/\\/g, '/').replace(DIR_CONTENT, '').replace(DIR_TS_DIST, '');
    meta.ext = ext;
    return meta;
  }
}

export default SSCore;
