import chokidar from 'chokidar';

import SteelSky from './SteelSky';
class SSWatch{
    private ss: SteelSky = new SteelSky;
    private watcher:any;
    private sourcePath: string = '';
    constructor(){
        this.sourcePath = this.ss.cfg.sourcePath;
        //console.log(this.sourcePath);
        this.watcher = chokidar.watch(this.sourcePath, {ignored: /^\./, persistent: true});
    }
    watch():void{
        this.watcher
            .on('add', (path:string)=>{this.add(this, path)})
            .on('change', this.change)
            .on('unlink', this.unlink)
            .on('error', this.error)
    }
    add(self:SSWatch, path:string):void{
        path = SSWatch.rmSource(path, self.sourcePath);
        console.log('Found: '+path);
        //this.ss.build({target: path});
    }
    change(path:string):void{
        console.log('Changed: '+path);
    }
    unlink(path:string):void{
        console.log('Unlinked: '+path);
    }
    error(error:string):void{

    }
    static rmSource(path:string, sourcePath:string):string{
        if(sourcePath[0] === '.'){
            sourcePath = sourcePath.substring(1);
        }
        if(sourcePath[0] === '/'){
            sourcePath = sourcePath.substring(1);
        }
        return path.replace(sourcePath, '');
    }
}
export default SSWatch;