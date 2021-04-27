# Simple Listing Example

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
  let html = "";
  let hasResults = false;
  for(let item of listing){
    const location = item.location;
    html += `<a href="${location}">${location}</a></br>`;
    hasResults = true;
  }
  if(!hasResults){
    html += "<strong>No results.</string>";
  }
  document.getElementById('listing-area').innerHTML = html;
}

</script>