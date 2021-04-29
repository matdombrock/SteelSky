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
    })]
});

function traverse(path, rootPath, list = []){
  const listing = fs.readdirSync(path);
  for(let item of listing){
    let itemPath = `${path}/${item}`
    const isDirectory = fs.lstatSync(itemPath).isDirectory();
    if(isDirectory){
      list = traverse(itemPath,rootPath, list);
    }
    else{
      itemPath = itemPath.replace(`${rootPath}/`, '');
      list.push(itemPath);
    }
  }
  return list;
}

function convert(fileLoc){
  const parsed = path.parse(fileLoc);
  let ext = parsed.ext;
  parsed.originalExt = ext;
  let html;
  let metaJSON = {};
  if(ext === '.md'){
    let file = fs.readFileSync(sourcePath+'/'+fileLoc,'utf-8');
    ext = '.html';
    parsed.ext = '.html';
    // Parse meta data
    if(file.substring(0,10)==='<steelsky>'){
      let meta = file.split('</steelsky>')[0];
      meta = meta.replace('<steelsky>','');
      metaJSON = JSON.parse(meta);
      //let metaLength = meta.length + 10;
      //file = file.substring(metaLength, file.length);
      file = file.replace('<steelsky>','<script>const ssmeta=');
      file = file.replace('</steelsky>',';</script>');
    }
    html = header + '<style>' + highlightStyleCSS +'</style>' + converter.makeHtml(file) + footer + '<style>' + theme +'</style>';
  }
  const noExt = parsed.dir + '/' + parsed.name;
  const writeLoc = outPath+'/'+noExt+ext;
  const realPath = path.parse(writeLoc).dir;
  if (!fs.existsSync(realPath)){
    console.log('New Dir: '+realPath);
    fs.mkdirSync(realPath);
  }
  if(parsed.originalExt === '.md'){
    fs.writeFileSync(writeLoc, html);
  }else{
    fs.copyFileSync(sourcePath+ '/' + fileLoc, outPath+'/'+fileLoc);
  }
  if(noExt[0]==='/'){
    noExt[0]='';
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
}

const list = traverse(sourcePath, sourcePath);
console.log(list);

if (!fs.existsSync(outPath)){
  console.log('Create Out Directory');
  fs.mkdirSync(outPath);
}

let outList = [];
for(let item of list){
  convert(item);
}

fs.writeFileSync(outPath+'/listing.json', JSON.stringify(outList, null, 2));



