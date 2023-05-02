#!/usr/bin/env node
import showdown from "showdown";
import showdownHighlight from "showdown-highlight";
import fs from 'fs';
import path from 'path';

class Config{
    sourcePath: string = './';
    layoutPath: string = './';
    highlightStyle: string = './';
    outPath: string = './build/';
    constructor(){
        if(!fs.existsSync('./sscfg.json')){
            throw 'No Config ./sscfg.json';
            return;
        }
        const cfgRaw: string = fs.readFileSync('./sscfg.json', 'utf-8');
        const parsed:any = JSON.parse(cfgRaw);
        this.sourcePath = parsed.sourcePath;
        this.layoutPath = parsed.layoutPath;
        this.highlightStyle = parsed.highlightStyle;
        this.outPath = parsed.outPath; 
    }
}

class Sections{
    headerHTML:string = '';
    footerHTML:string = '';
    themeCSS:string = '';
    highlightCSS: string = '';
    constructor(layoutPath:string, highlightStyle:string){
        const lp:string = layoutPath;
        this.headerHTML = fs.readFileSync(lp+'/header.html', 'utf-8');
        this.footerHTML = fs.readFileSync(lp+'/footer.html', 'utf-8');
        this.themeCSS = fs.readFileSync(lp+'/theme.css', 'utf-8');
        this.headerHTML = fs.readFileSync(__dirname+'/node_modules/highlight.js/styles/'+highlightStyle+'.css','utf-8');
    }
}

interface OutMeta{
    processed:number;
    total:number;
}

interface ListData{
    path: path.ParsedPath;
    location:string;
    originalExt:string;
    meta:any;
}

class SteelSky{
    cfg: Config = new Config;
    sections: Sections;
    converter: showdown.Converter;
    outList:Array<ListData> = [];
    outMeta:OutMeta = {
        processed:0,
        total:0,
    };
    constructor(){
        this.sections = new Sections(this.cfg.layoutPath, this.cfg.highlightStyle);
        this.converter = new showdown.Converter({
            extensions: [showdownHighlight({
                pre: true
            })],
            tables: true
        });
    }
    run(){
        const list = this.traverse(this.cfg.sourcePath, this.cfg.sourcePath);
        //console.log(list);
        if (!fs.existsSync(this.cfg.outPath)){
            console.log('Create Out Directory');
            fs.mkdirSync(this.cfg.outPath, {recursive: true});
        }
        for(let item of list){
            this.outMeta.total++;
            const res = this.convert(item);
            if(res !== ""){
                console.log("+ "+res);
                this.outMeta.processed++;
            }
        }
        console.log(
            'Processed: '
            +this.outMeta.processed
            +'/'
            +this.outMeta.total
        );
        //fs.writeFileSync('./cache.json', JSON.stringify(cache,null,2));
        fs.writeFileSync(this.cfg.outPath+'/listing.json', JSON.stringify(this.outList,null,2));
        fs.copyFileSync(__dirname+'/resources/ssList.js', this.cfg.outPath+'/ssList.js');
    }
    traverse(path:string, rootPath:string, list:Array<string>=[]):Array<string>{
        const listing: Array<string> = fs.readdirSync(path);
        for(let item of listing){
            let itemPath: string = `${path}/${item}`;
            const isDirectory:boolean = fs.lstatSync(itemPath).isDirectory();
            if(isDirectory){
                list = this.traverse(itemPath, rootPath, list);
            }
            else{
                const itemPathSub = itemPath.replace(`${rootPath}/`, '');
                list.push(itemPathSub);
            }
        }
        return list;
    }
    convert(fileLoc:string):string{
        let parsed: path.ParsedPath = path.parse(fileLoc);
        let noExt:string = parsed.dir + '/' + parsed.name;
        let ext:string = parsed.ext;
        const originalExt:string = ext;
        let html:string = '';
        let metaJSON:any = {};
        if(ext === '.md'){
            let file:string = fs.readFileSync(this.cfg.sourcePath+'/'+fileLoc,'utf-8');
            ext = '.html';
            parsed.ext = '.html';
            // Parse meta data
            if(file.substring(0,10)==='<steelsky>'){
                let meta:string = file.split('</steelsky>')[0];
                meta = meta.replace('<steelsky>','');
                metaJSON = JSON.parse(meta);
                file = file.replace('<steelsky>','<script>const ssmeta=');
                file = file.replace('</steelsky>',';</script>');
            }
            html = this.buildHTML(file);
        }
        const writeLoc:string = this.cfg.outPath+'/'+noExt+ext;
        const realPath:string = path.parse(writeLoc).dir;
        if (!fs.existsSync(realPath)){
            console.log('New Dir: '+realPath);
            fs.mkdirSync(realPath, {recursive: true});
        }
        if(originalExt === '.md'){
            fs.writeFileSync(writeLoc, html, {encoding: 'utf-8'});
        }
        else{
            fs.copyFileSync(
                this.cfg.sourcePath+ '/' + fileLoc, 
                this.cfg.outPath+'/'+fileLoc
            );
        }
        if(noExt[0]==='/'){
            // Remove the first char
            noExt = noExt.substring(0);
        }
        const listingLoc:string = noExt.replace(/^\/+/g, '')+ext;//Remove leading slash
        let outListData: ListData = {
            path: parsed,
            location: listingLoc,
            meta: {},
            originalExt: originalExt
        };
        if(originalExt === '.md'){
            outListData.meta = metaJSON;
        }
        this.outList.push(outListData);
        return fileLoc;
    }
    buildHTML(file:string): string{
        const html = this.sections.headerHTML 
        + '<style>' 
        + this.sections.highlightCSS 
        +'</style>' 
        + '<style>' 
        + this.sections.themeCSS
        +'</style><div class="ss-content">' 
        + this.converter.makeHtml(file) 
        +'</div>'
        + this.sections.footerHTML;
        return html;
    }
}

const ss:SteelSky = new SteelSky;
ss.run();
