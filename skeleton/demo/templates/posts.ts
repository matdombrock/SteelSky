import type { PageMeta } from '../types/SSTypes';
export class Posts {
  private rootElement: HTMLElement | null;
  private posts: PageMeta[];
  private postsFiltered: PageMeta[];
  private maxPosts: number;
  private filterString: string;
  private randomOrder: boolean;
  private showSearchBar: boolean = true;
  constructor(rootElementId: string) {
    this.rootElement = document.getElementById(rootElementId);
    this.posts = [];
    this.postsFiltered = [];
    this.maxPosts = 999;
    this.filterString = '';
    this.randomOrder = false;
  }
  public setMaxPosts(max: number) {
    this.maxPosts = max;
  }
  public setFilterString(filter: string) {
    this.filterString = filter;
  }
  public setRandomOrder(random: 'true' | 'false') {
    const bool = random === 'true';
    this.randomOrder = bool;
  }
  public setShowSearchBar(show: 'true' | 'false') {
    const bool = show === 'true';
    this.showSearchBar = bool;
  }
  public async build() {
    await this.getPosts();
    this.filterPosts();
    if (this.showSearchBar) {
      this.renderSearchBar();
    }
    this.renderPosts();
  }
  private async getPosts() {
    try {
      const response = await fetch('/listing.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let res = await response.json();
      this.posts = res;
    }
    catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
  private filterPosts() {
    // Filter only posts (assuming posts are under /posts/)
    let filtered = this.posts.filter((post: PageMeta) => post.path.startsWith('/posts/'));

    // If filterString is set, filter posts by title
    if (this.filterString) {
      const filterLower = this.filterString.toLowerCase();
      filtered = filtered.filter((post: PageMeta) => {
        const descriptionLower = post.description.toLowerCase();
        const titleLower = post.title.toLowerCase();
        return titleLower.includes(filterLower)
          || descriptionLower.includes(filterLower)
          || filterLower.includes(titleLower)
          || filterLower.includes(descriptionLower);
      });
    }

    // Sort posts by date (newest first)
    filtered.sort((a: PageMeta, b: PageMeta) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Randomize order if randomOrder is true
    if (this.randomOrder) {
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    }
    // Limit the number of posts to maxPosts
    filtered = filtered.slice(0, this.maxPosts);
    this.postsFiltered = filtered;
  }
  private renderSearchBar() {
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search posts...';
    searchBar.className = 'search-bar';
    searchBar.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      this.setFilterString(target.value);
      this.filterPosts();
      // Clear existing posts
      const existingPostWrap = this.rootElement?.querySelectorAll('.posts-wrap-inner, .posts-wrap-inner + p');
      existingPostWrap?.forEach(wrap => wrap.remove());
      // Render filtered posts
      this.renderPosts();
    });
    this.rootElement?.appendChild(searchBar);
  }
  private renderPosts() {
    const postWrap = document.createElement('div');
    postWrap.className = 'posts-wrap-inner';
    this.rootElement?.appendChild(postWrap);
    if (this.postsFiltered.length === 0) {
      const noPostsElement = document.createElement('p');
      noPostsElement.className = 'no-posts';
      noPostsElement.textContent = 'No posts found.';
      postWrap.appendChild(noPostsElement);
    }
    else {
      this.postsFiltered.forEach(post => {
        const postElement = document.createElement('a');
        postElement.href = post.path;
        postElement.className = 'post';
        postElement.innerHTML = `
        <div class="post-info">
          <span class="post-title">${post.title}</span>
          <p class="post-date">${new Date(post.date).toLocaleDateString()}</p>
          <p class="post-description">${post.description}</p>
          <a href="${post.path}">Read more</a>
        </div>
        <div class="post-image" style="background-image: url('${post.image}')"></div>
      `;
        postWrap.appendChild(postElement);
      });
    }
  }
}
