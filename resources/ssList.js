const ssList = {};

ssList.queryString = window.location.search;
ssList.urlParams = new URLSearchParams(ssList.queryString);
ssList.searchParam = ssList.urlParams.get('search') || ssList.urlParams.get('s');

ssList.elements = {
  search: document.getElementById('search'),
  filter: document.getElementById('filter'),
  listingArea: document.getElementById('listing-area')
};
ssList.params = {
  search: ''
}
if(ssList.searchParam){
  ssList.elements.search.value = ssList.searchParam;
}

ssList.listing;

ssList.xhttp = new XMLHttpRequest();
ssList.xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      ssList.listing = JSON.parse(ssList.xhttp.responseText);
      ssList.updateFilter();
    }
};
ssList.xhttp.open("GET", "/listing.json", true);
ssList.xhttp.send();

ssList.updateFilter = ()=>{
  const filterType = ssList.elements.filter.value || 'all';
  const searchString = ssList.elements.search.value || '';
  history.pushState({}, null, '?s='+encodeURIComponent(searchString)); 

  const filtered = ssList.processListing(filterType, searchString);
  if(filterType === '.html'){
    ssList.renderListingPretty(filtered);
  }else{
    ssList.renderListing(filtered);
  }
}

ssList.renderListingPretty = (listing)=>{
  let html = '';
  if(listing.length === 0){
    html = "<strong>No results for this filter.</string>";
    ssList.elements.listingArea.innerHTML = html;
    return;
  }
  html += 'Showing <strong>'+listing.length+'</strong> results:<br>';
  for(let item of listing){
    const location = item.location;
    const ext = item.path.ext;
    html += '<div class="ss-listing-item-wrap">';
    const name = Object.keys(item.meta).length > 0 ? item.meta.title : item.path.name;
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
  ssList.elements.listingArea.innerHTML = html;
}

ssList.renderListing = (listing)=>{
  let html = "";
  if(listing.length === 0){
    html = "<strong>No results for this filter.</string>";
    ssList.elements.listingArea.innerHTML = html;
    return;
  }
  html += 'Showing <strong>'+listing.length+'</strong> results:<br>';
  for(let item of listing){
    const location = item.location;
    html += `<a href="${location}" class="ss-listing-item">${location}</a></br>`;
  }
  html += "<strong>End of listing.</string>";
  ssList.elements.listingArea.innerHTML = html;
}

ssList.processListing = (filterType='all', searchString='')=>{
  let filtered = [];
  if (!ssList.listing){
    alert("waiting for listing to load!");
    return;
  }
  let hasResults = false;
  for(let item of ssList.listing){
    const ext = item.path.ext;
    const location = item.location;
    console.log(`${filterType} -> ${ext}`);
    let passed = true;
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
      hasResults = true;
    }
  }
  return filtered;
}