import fs from 'fs';
class SSInit{
    public init(options:any):void{
        if(fs.existsSync('./sscfg.json')){
            console.log('Error: This directory already contains SteelSky files');
            console.log('If you want to re-initialize this directory please delete the sscfg.json file!');
            console.log('Aborting init');
            process.exit();
        }
        this.cp('sscfg.json');
        fs.mkdirSync('./layout');
        this.cp('layout/header.html');
        this.cp('layout/footer.html');
        this.cp('layout/theme.css');
        fs.mkdirSync('./source');
        this.cp('source/index.md');
        if(options.minimal){
            // Dont copy the rest of the files
            return;
        }
        this.cp('source/pageA.md');
        this.cp('source/pageB.md');
        this.cp('source/pageC.html');
        this.cp('source/search.md');
        this.cp('source/image.jpg');
        this.cp('source/text.txt');
        this.cp('source/blob');
        this.cp('source/favicon.ico');
    }
    private cp(target:string):void{
        fs.copyFileSync(__dirname+'/../resources/init/'+target, './'+target);
    }
}

export default SSInit;