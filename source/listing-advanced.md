# Advanced Listing Example

<select id="filter" onchange="processListing()">
  <option value="all">All</option>
  <option value=".html">HTML</option>
  <option value=".gif">GIF</option>
  <option value=".png">PNG</option>
  <option value=".jpg">JPG</option>
  <option value=".txt">TXT</option>
</select>
<input type="text" id="search" onchange="processListing()" placeholder="search term">

<div id="listing-area"></div>


<script>

let listing;

const xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      listing = JSON.parse(xhttp.responseText);
      processListing();
    }
};
xhttp.open("GET", "/testx/out/listing.json", true);
xhttp.send();

function processListing(){
  if (!listing){
    alert("waiting for listing to load!");
    return;
  }
  const filterType = document.getElementById('filter').value;
  const searchString = document.getElementById('search').value;
  let html = "";
  let hasResults = false;
  for(let item of listing){
    
    const location = item.location;
    const ext = item.path.ext;
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
    if(!location.includes(searchString)){
      passed = false;
    }
    if(passed){
      html += `<a href="${location}">${location}</a></br>`;
      hasResults = true;
    }
  }
  if(!hasResults){
    html += "<strong>No results for this filter.</string>";
  }
  document.getElementById('listing-area').innerHTML = html;
}

</script>