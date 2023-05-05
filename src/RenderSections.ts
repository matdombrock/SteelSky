import fs from 'fs';

class RenderSections{
    headerHTML:string = '';
    footerHTML:string = '';
    themeCSS:string = '';
    highlightCSS: string = '';
    constructor(layoutPath:string, highlightStyle:string){
        const lp:string = layoutPath;
        this.headerHTML = fs.readFileSync(lp+'/header.html', 'utf-8');
        this.footerHTML = fs.readFileSync(lp+'/footer.html', 'utf-8');
        this.themeCSS = fs.readFileSync(lp+'/theme.css', 'utf-8');
        this.highlightCSS = fs.readFileSync(__dirname+'/../node_modules/highlight.js/styles/'+highlightStyle+'.css','utf-8');
    }
}
export default RenderSections;