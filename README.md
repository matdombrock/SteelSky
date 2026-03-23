## Templates

### Template Definition

Template defintions are `.md` files places in `site/templates/`. 

Templates are reusable code blocks which can take optional paramters to fill in their data. A template might look like this:

```md
My template: {{ content }}
```

Where `{{ content }}` represents a string which will be replaced by the `content` paramter. 

A more advanced template might look like this:

```md
<!-- ./templates/my_template.md -->
<div class="my-template"> 
    {{ content = "no content" }}
</div>

<script>
for (let i = 0; i < Number({{ count = 3 }}); i++) {
    console.log(i);
}
</script>

<style>
body {
    padding: 3rem;
}
</style>
```

Notes:
- Each paramter has a default value which will be used if none is provided. 
- All values are strings, so numbers must be converted.

### Template JS & CSS

Template files may include inline CSS and JS. However this will be duplicated each time the element is included on the page. Sometimes this is what you want, but often its better to write `<template>.css` and `<template>.js` files which will be included only once on a page where the template is used. 

It is also possible for the `<template>.md` file to include JS & CSS in addition to that which is included in the corresponding `.js` and `.css` files. 

### Template usage

In any `./content/*.md` file you can include a template into the page with this syntax:

```md
{{my_template 
content="my content!"
count="5"
}}
```

This will be replaced with the processed template content *before* the page is rendered from markdown to HTML. 
