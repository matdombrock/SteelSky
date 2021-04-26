const showdown = require('showdown');
const showdownHighlight = require("showdown-highlight");

const fs = require('fs');
const path = require('path');
const header = fs.readFileSync(__dirname+'/layout/header.html','utf-8');
const footer = fs.readFileSync(__dirname+'/layout/footer.html','utf-8');
const theme = fs.readFileSync(__dirname+'/layout/theme.css','utf-8');
const highlightStyle = fs.readFileSync(__dirname+'/node_modules/highlight.js/styles/a11y-dark.css','utf-8');

let outList = [];

// After requiring the module, use it as extension
let converter = new showdown.Converter({
    // That's it
    extensions: [showdownHighlight({
        // Whether to add the classes to the <pre> tag
        pre: true
    })]
});

function convert(fileLoc){
  const parsed = path.parse(fileLoc);
  let ext = parsed.ext;
  let html;
  if(ext === '.md'){
    const file = fs.readFileSync(__dirname+'/source/'+fileLoc,'utf-8');
    ext = '.html'
    html = header + '<style>' + highlightStyle +'</style>' + converter.makeHtml(file) + footer + '<style>' + theme +'</style>';
  }
  const noExt = parsed.dir + '/' + parsed.name;
  const writeLoc = __dirname+'/out/'+noExt+ext;
  const realPath = path.parse(writeLoc).dir;
  if (!fs.existsSync(realPath)){
    console.log('New Dir: '+realPath);
    fs.mkdirSync(realPath);
  }
  if(ext === '.html'){
    fs.writeFileSync(writeLoc, html);
  }else{
    fs.copyFileSync(__dirname + '/source/' + fileLoc, __dirname+'/out/'+fileLoc);
  }
  if(noExt[0]==='/'){
    noExt[0]='';
  }
  const listingLoc = noExt.replace(/^\/+/g, '')+ext;//Remove leading slash
  outList.push(listingLoc);
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
      itemPath = itemPath.replace(`${rootPath}/`, '');
      list.push(itemPath);
    }
  }
  return list;
}

const list = traverse(__dirname+'/source', __dirname+'/source');
console.log(list);

if (!fs.existsSync(__dirname+'/out')){
  console.log('Create Out Directory');
  fs.mkdirSync(__dirname+'/out');
}

for(let item of list){
  convert(item);
}

// Generate Directory Listing
let listHtml = '<div class="ss-listing-area">';
console.log(outList);
for(let item of outList){
  listHtml += '<a class="ss-listing" href="'+item+'">'+item+'</a><br>';
}
listHtml += '</div>';
const html = header + '<style>' + highlightStyle +'</style>' + listHtml + footer + '<style>' + theme +'</style>';
fs.writeFileSync(__dirname+'/out/listing.html', html);



