"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Elements {
    constructor() {
        // Process should fail if these are not found
        this.search = document.getElementById('search');
        this.filter = document.getElementById('filter');
        this.listingArea = document.getElementById('listing-area');
    }
}
class SSList {
    constructor() {
        this.xhttp = new XMLHttpRequest;
        this.listing = [];
        this.elements = new Elements;
        this.xhttp.onreadystatechange = (response) => {
            if (this.xhttp.readyState == 4 && this.xhttp.status == 200) {
                this.listing = JSON.parse(this.xhttp.responseText);
                this.updateFilter();
            }
        };
        this.xhttp.open('GET', '/listing.json');
        this.xhttp.send();
    }
    updateFilter() {
        const filterType = this.elements.filter.value || 'all';
        const searchString = this.elements.search.value || '';
        history.pushState({}, 'unused', '?s=' + encodeURIComponent(searchString));
        const filtered = this.processListing(filterType, searchString);
        if (filterType === '.html') {
            this.renderListingPretty(filtered);
        }
        else {
            this.renderListing(filtered);
        }
    }
    processListing(filterType, searchString) {
        let filtered = [];
        if (this.listing.length === 0) {
            alert('Waiting for list to load...');
            return filtered;
        }
        for (let item of this.listing) {
            const ext = item.path.ext;
            const location = item.location;
            console.log(`${filterType} -> ${ext}`);
            let passed = true;
            // File filters
            if (ext !== filterType) {
                passed = false;
            }
            if (filterType == 'all') {
                passed = true;
            }
            // Text filter
            if (!JSON.stringify(item).includes(searchString)) {
                passed = false;
            }
            if (passed) {
                filtered.push(item);
            }
        }
        return filtered;
    }
    renderListingPretty(listing) {
        let html = '';
        if (listing.length === 0) {
            html = "<strong>No results for this filter.</string>";
            this.elements.listingArea.innerHTML = html;
            return;
        }
        html += 'Showing <strong>' + listing.length + '</strong> results:<br>';
        for (let item of listing) {
            const location = item.location;
            const ext = item.path.ext;
            if (!item.path.name) {
                continue;
            }
            if (!item.meta) {
                continue;
            }
            html += '<div class="ss-listing-item-wrap">';
            const name = Object.keys(item.meta).length > 0 ? item.meta.title : item.path.name;
            html += '<div class="ss-listing-item-title"><a href="' + location + '">' + name + '</a></div>';
            html += `<a href="${location}" class="ss-listing-item">${location}</a></br>`;
            if (Object.keys(item.meta).length > 0) {
                html += item.meta.description || '';
                html += "</br>";
                html += item.meta.tags || '';
            }
            html += '</div>';
        }
        html += "<strong>End of listing.</string>";
        this.elements.listingArea.innerHTML = html;
    }
    renderListing(listing) {
        let html = "";
        if (listing.length === 0) {
            html = "<strong>No results for this filter.</string>";
            this.elements.listingArea.innerHTML = html;
            return;
        }
        html += 'Showing <strong>' + listing.length + '</strong> results:<br>';
        for (let item of listing) {
            const location = item.location;
            html += `<a href="${location}" class="ss-listing-item">${location}</a></br>`;
        }
        html += "<strong>End of listing.</string>";
        this.elements.listingArea.innerHTML = html;
    }
}
const ssList = new SSList;
