import path from 'path';

interface ListItem{
    path: path.ParsedPath;
    location:string;
    originalExt:string;
    meta:any;
}
export default ListItem;