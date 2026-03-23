<!--
Some templates may have JS inline and specify a global JS file for the template
-->

<div id="posts-wrap"></div>

<script type="module">
import { Posts } from '/templates/posts.js';
window.onload = function() {
    const posts = new Posts('posts-wrap');
    posts.setMaxPosts(Number({{max = 999}}));
    posts.setRandomOrder('{{random = false}}');
    posts.setShowSearchBar('{{search = false}}')
    posts.build();
};
</script>

