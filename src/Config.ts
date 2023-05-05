import fs from 'fs';

class Config{
    sourcePath: string = './';
    layoutPath: string = './';
    highlightStyle: string = './';
    outPath: string = './build/';
    // Loads config file
    constructor(){
        this.load();
    }
    // Allows reloading
    public load(){
        if(!fs.existsSync('./sscfg.json')){
            console.log('Error: Missing config: ./sscfg.json');
            process.exit();
        }
        const cfgRaw: string = fs.readFileSync('./sscfg.json', 'utf-8');
        const parsed:any = JSON.parse(cfgRaw);
        this.sourcePath = parsed.sourcePath;
        this.layoutPath = parsed.layoutPath;
        this.highlightStyle = parsed.highlightStyle;
        this.outPath = parsed.outPath; 
    }
}
export default Config;