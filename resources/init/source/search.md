<steelsky>
{
  "title":"Search site directory",
  "description":"A list of all assets on this website."
}
</steelsky>

# site search

<select id="filter" onchange="ssList.updateFilter()">
  <option value=".html">html</option> 
  <option value="all">all</option>
  <option value=".gif">gif</option>
  <option value=".png">png</option>
  <option value=".jpg">jpg</option>
  <option value=".txt">txt</option>
</select>
<input type="text" id="search" onchange="ssList.updateFilter()" placeholder="search term">

<div id="listing-area"></div>

<style>
.ss-listing-item-wrap{
  padding:0.75rem;
  margin:0.25rem;
}
.ss-listing-item-title{
  font-size:2rem;
}
.ss-listing-item-title a{
  text-decoration:none;
}
</style>

<script src="/ssList.js"></script>