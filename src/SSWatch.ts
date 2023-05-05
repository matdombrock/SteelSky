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
            .on('change', (path:string)=>{this.change(this, path)})
            .on('unlink', (path:string)=>{this.change(this, path)})
            .on('error', this.error)
    }
    add(ssWatch:SSWatch, path:string):void{
        path = ssWatch.rmSource(path);
        console.log('Found: '+path);
        this.ss.build({target: path});
    }
    change(ssWatch:SSWatch, path:string):void{
        console.log('Changed: '+path);
        this.ss.build({target: path});
    }
    unlink(ssWatch:SSWatch, path:string):void{
        console.log('Unlinked: '+path);
        console.log('No build action taken...');
        // this should remove from listing.json 
    }
    error(error:string):void{
        console.log(error);
    }
    rmSource(path:string):string{
        let sourcePath:string = this.ss.cfg.sourcePath;
        if(sourcePath[0] === '.'){
            sourcePath = sourcePath.substring(1);
        }
        if(sourcePath[0] === '/'){
            sourcePath = sourcePath.substring(1);
        }
        path = path.replace(sourcePath, '');
        if(path[0] === '/'){
            path = path.substring(1);
        }
        return path;
    }
}
export default SSWatch;