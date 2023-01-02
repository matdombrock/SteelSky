#!/usr/bin/env node
const showdown = require('showdown');
const showdownHighlight = require("showdown-highlight");
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(process.cwd()+'/config.js')){
  const configExample = {
    sourcePath: '<path>/source',
    layoutPath: '<path>/layout',
    highlightStyle: 'a11y-dark',
    outPath: '<path>/out',
  }
  console.log("Please create a 'config.js' file in this directory:");
  console.log('module.exports = ' + JSON.stringify(configExample, null, 2) + ';');
  console.log("An example config file will now be created in the current directory...");
  fs.copyFileSync(__dirname+'/resources/config.example.js', process.cwd()+'/config.example.js');
  console.log("Please edit this file and rename it to 'config.js' to continue.");
  console.log("Good bye!");
  return;
}

const {sourcePath, layoutPath, highlightStyle, outPath}  = require(process.cwd()+'/config');

const header = fs.readFileSync(layoutPath+'/header.html','utf-8');
const footer = fs.readFileSync(layoutPath+'/footer.html','utf-8');
const theme = fs.readFileSync(layoutPath+'/theme.css','utf-8');
const highlightStyleCSS = fs.readFileSync(__dirname+'/node_modules/highlight.js/styles/'+highlightStyle+'.css','utf-8');

let converter = new showdown.Converter({
    extensions: [showdownHighlight({
        pre: true
    })],
    tables: true
});

let cache;
if(fs.existsSync(process.cwd()+'/cache.json')){
  cache = require(process.cwd()+'/cache.json');
}
else{
  cache = {};
}

function traverse(path, rootPath, list = []){
  const listing = fs.readdirSync(path);
  for(let item of listing){
    let itemPath = `${path}/${item}`
    const isDirectory = fs.lstatSync(itemPath).isDirectory();
    if(isDirectory){
      list = traverse(itemPath,rootPath, list);
    }
    else{
      const itemPathSub = itemPath.replace(`${rootPath}/`, '');
      list.push(itemPathSub);
    }
  }
  return list;
}

function checkCache(itemPath, rootPath){
  const itemPathFull = rootPath +'/'+itemPath;
  const itemPathSub = itemPath.replace(`${rootPath}/`, '');
  let isCached = true;
  if(cache[itemPathSub]){
    if(Number(cache[itemPathSub].mtime) !== Number(fs.lstatSync(itemPathFull).mtime)){
      isCached = false;
    }
  }
  else{
    isCached = false;
  }
  if(!isCached){
    cache[itemPathSub] = {};
    cache[itemPathSub].mtime = Number(fs.lstatSync(itemPathFull).mtime);
  }
  else{
    console.log(Number(fs.lstatSync(itemPathFull).mtime));
  }
  
  return isCached;
}

function convert(fileLoc){
  const parsed = path.parse(fileLoc);
  const noExt = parsed.dir + '/' + parsed.name;
  let ext = parsed.ext;
  parsed.originalExt = ext;
  let html;
  let metaJSON = {};
  const isCached = checkCache(fileLoc, sourcePath);
  if(isCached){
    if(ext === '.md'){
      let file = fs.readFileSync(sourcePath+'/'+fileLoc,'utf-8');
      ext = '.html';
      parsed.ext = '.html';
      // Parse meta data
      if(file.substring(0,10)==='<steelsky>'){
        let meta = file.split('</steelsky>')[0];
        meta = meta.replace('<steelsky>','');
        metaJSON = JSON.parse(meta);
        file = file.replace('<steelsky>','<script>const ssmeta=');
        file = file.replace('</steelsky>',';</script>');
      }
      html = header + '<style>' + highlightStyleCSS +'</style>' + '<style>' + theme +'</style><div class="ss-content">' + converter.makeHtml(file) +'</div>'+ footer;
    }
    
    const writeLoc = outPath+'/'+noExt+ext;
    const realPath = path.parse(writeLoc).dir;
    if (!fs.existsSync(realPath)){
      console.log('New Dir: '+realPath);
      fs.mkdirSync(realPath, {recursive: true});
    }
    if(parsed.originalExt === '.md'){
      fs.writeFileSync(writeLoc, html, {encoding: 'utf-8'});
    }else{
      fs.copyFileSync(sourcePath+ '/' + fileLoc, outPath+'/'+fileLoc);
    }
    if(noExt[0]==='/'){
      noExt[0]='';
    }
  }
  const listingLoc = noExt.replace(/^\/+/g, '')+ext;//Remove leading slash
  let outListData = {
    path: parsed,
    location: listingLoc
  };
  if(parsed.originalExt === '.md'){
    outListData.meta = metaJSON;
  }
  outList.push(outListData);
  return isCached ? "" : fileLoc;
}

const list = traverse(sourcePath, sourcePath);
//console.log(list);

if (!fs.existsSync(outPath)){
  console.log('Create Out Directory');
  fs.mkdirSync(outPath, {recursive: true});
}

let outList = [];
let processed = 0;
let total = 0;
for(let item of list){
  total++;
  const res = convert(item);
  if(res !== ""){
    console.log("+ "+res);
    processed++;
  }
}
console.log('Processed: '+processed+'/'+total);

fs.writeFileSync(process.cwd()+'/cache.json', JSON.stringify(cache,null,2));

fs.writeFileSync(outPath+'/listing.json', JSON.stringify(outList,null,2));

fs.copyFileSync(__dirname+'/resources/ssList.js', outPath+'/ssList.js');

