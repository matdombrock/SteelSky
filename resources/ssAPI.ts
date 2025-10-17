class SSAPI {
  elements = {
    search: document.getElementById('ss-search') as HTMLInputElement | null,
    filter: document.getElementById('ss-filter') as HTMLSelectElement | null,
    listingArea: document.getElementById('ss-listing-area')
  };
  constructor() {
    if (this.elements.search) {
      const params = new URLSearchParams(window.location.search);
      this.elements.search.value = params.get('s') || '';
    }
  }
  async listingUpdate() {
    if (!this.elements.search || !this.elements.filter) {
      console.error('Search or filter element not found');
      return;
    }
    const filterType = this.elements.filter.value || 'all';
    const searchString = this.elements.search.value || '';
    history.pushState({}, 'unused', '?s=' + encodeURIComponent(searchString));
    const filtered = await this.listingProcess(filterType, searchString);
    if (filterType === '.html') {
      this.listingRenderPretty(filtered);
    }
    else {
      this.listingRenderPlain(filtered);
    }
  }
  private async listingProcess(filterType: string, searchString: string): Promise<any[]> {
    const listing = await this.fetchListing();
    let filtered: any[] = [];
    if (listing.length === 0) {
      alert('Waiting for list to load...');
      return filtered;
    }
    for (let item of listing) {
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
  private listingRenderPretty(listing: any): void {
    if (!this.elements.listingArea) {
      console.error('Listing area element not found');
      return;
    }
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
  private listingRenderPlain(listing: any): void {
    if (!this.elements.listingArea) {
      console.error('Listing area element not found');
      return;
    }
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
  // Render posts into the ss-post-area element
  async postsRender(): Promise<void> {
    if (!this.elements.listingArea) {
      console.error('Post area element not found');
      return;
    }
    const posts = await this.postsGetJSON();
    let htmlContent = '';
    for (const post of posts) {
      if (post.meta.title === 'Posts') {
        continue; // Skip the index post
      }
      const postDate = post.meta.date ? new Date(post.meta.date) : null;
      const formattedDate = postDate
        ? postDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
        })
        : 'Unknown date';
      const postHTML = `
      <div class="ss-post-item">
        <h2><a href="/${post.location}">${post.meta.title || 'Untitled Post'}</a></h2>
        <p class="ss-post-date">${formattedDate}</p>
        <p class="ss-post-description">${post.meta.description || ''}</p>
        <hr/>
      </div>
    `;
      htmlContent += postHTML;
    }
    this.elements.listingArea.innerHTML = htmlContent;
  }
  // Get a list of posts from listing.json as JSON
  async postsGetJSON(): Promise<any> {
    const listing = await this.fetchListing();
    if (!listing) {
      alert('Failed to load listing data.');
      return;
    }
    let posts = [];
    for (const item of listing) {
      const dir = item.path.dir;
      if (dir === 'posts') {
        posts.push(item);
      }
    }
    // Sort posts by date
    const oldDate = '2020-01-01'; // Applied to missing dates
    posts.sort((a, b) => {
      const dateA = new Date(a.meta.date || oldDate);
      const dateB = new Date(b.meta.date || oldDate);
      return dateB.getTime() - dateA.getTime(); // Sort descending
    });
    console.log('Sorted posts:', posts);
    return posts;
  }
  // Grab the listing.json data from /listing.json
  async fetchListing(): Promise<any> {
    try {
      const response = await fetch('/ss-listing.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }
}
