import path from 'path';

interface ListItem{
    path: path.ParsedPath;
    location:string;
    originalExt:string;
    meta:any;
}

class Elements{
    // Process should fail if these are not found
    search: HTMLInputElement = document.getElementById('search') as HTMLInputElement;
    filter: HTMLInputElement = document.getElementById('filter') as HTMLInputElement;
    listingArea: HTMLInputElement = document.getElementById('listing-area') as HTMLInputElement;
}

class SSList{
    private xhttp:XMLHttpRequest = new XMLHttpRequest;
    private listing:Array<ListItem> = [];
    private elements:Elements = new Elements;
    constructor(){
        this.xhttp.onreadystatechange = (response)=>{
            if(this.xhttp.readyState == 4 && this.xhttp.status == 200){
                this.listing = JSON.parse(this.xhttp.responseText);
                this.updateFilter();
            }
        };
        this.xhttp.open('GET', '/listing.json');
        this.xhttp.send();
    }
    updateFilter():void{
        const filterType:string = this.elements.filter.value || 'all';
        const searchString:string = this.elements.search.value || '';
        history.pushState({}, 'unused', '?s='+encodeURIComponent(searchString)); 
        const filtered:Array<ListItem> = this.processListing(filterType, searchString);
        if(filterType === '.html'){
            this.renderListingPretty(filtered);
        }else{
            this.renderListing(filtered);
        }
    }
    processListing(filterType:string, searchString:string):Array<ListItem>{
        let filtered:Array<ListItem> = [];
        if(this.listing.length === 0){
            alert('Waiting for list to load...');
            return filtered;
        }
        for(let item of this.listing){
            const ext:string = item.path.ext;
            const location:string = item.location;
            console.log(`${filterType} -> ${ext}`);
            let passed:boolean = true;
            // File filters
            if(ext !== filterType){
                passed = false;
            }
            if(filterType == 'all'){
                passed = true;
            }
            // Text filter
            if(!JSON.stringify(item).includes(searchString)){
                passed = false;
            }
            if(passed){
                filtered.push(item);
            }
        }
        return filtered;
    }
    renderListingPretty(listing:Array<ListItem>){
        let html:string = '';
        if(listing.length === 0){
            html = "<strong>No results for this filter.</string>";
            this.elements.listingArea.innerHTML = html;
            return;
        }
        html += 'Showing <strong>'+listing.length+'</strong> results:<br>';
        for(let item of listing){
            const location:string = item.location;
            const ext:string = item.path.ext;
            if(!item.path.name){
                continue;
            }
            if(!item.meta){
                continue;
            }
            html += '<div class="ss-listing-item-wrap">';
            const name:string = Object.keys(item.meta).length > 0 ? item.meta.title : item.path.name;
            html += '<div class="ss-listing-item-title"><a href="'+location+'">'+name+'</a></div>';
            html += `<a href="${location}" class="ss-listing-item">${location}</a></br>`;
            if(Object.keys(item.meta).length > 0){
                html += item.meta.description || '';
                html += "</br>";
                html += item.meta.tags || '';
            }
            html += '</div>';
        }
        html += "<strong>End of listing.</string>";
        this.elements.listingArea.innerHTML = html;
    }
    renderListing(listing:Array<ListItem>){
        let html:string = "";
        if(listing.length === 0){
            html = "<strong>No results for this filter.</string>";
            this.elements.listingArea.innerHTML = html;
            return;
        }
        html += 'Showing <strong>'+listing.length+'</strong> results:<br>';
        for(let item of listing){
            const location:string = item.location;
            html += `<a href="${location}" class="ss-listing-item">${location}</a></br>`;
        }
        html += "<strong>End of listing.</string>";
        this.elements.listingArea.innerHTML = html;
    }   
}

const ssList = new SSList;