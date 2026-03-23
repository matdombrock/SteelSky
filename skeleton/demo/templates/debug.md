## Metadata from this page
<pre>
    <code id="page-meta"></code>
</pre>

## Auto-generated metadata on all pages

<pre>
    <code id="page-metas"></code>
</pre>

<script>
async function grabMeta() {
    try {
      const response = await fetch('/listing.json');
      if (!response.ok) throw new Error('Failed to fetch page-metas.json');
      const data = await response.json();
      const pre = document.getElementById('page-metas');
      if (pre) {
        pre.textContent = '\n' + JSON.stringify(data, null, 2);
      }
    } catch (err) {
      console.error(err);
    }
}
grabMeta();
// We have pageMeta available on the window element
document.getElementById('page-meta').textContent = '\n' + JSON.stringify(pageMeta, null, 2);
</script>
