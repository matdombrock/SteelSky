# SteelSky

SteelSky is a "no BS" minimalist static site generator built for small personal websites and blogs. 

## Features

- Build with an intuitive mix of Markdown and HTML
- Full TypeScript support
- Simple templating system
- Automatic RSS feed
- 100% vanilla TS/JS

## CLI

### Install

```sh
npm install -g steelsky
```

### Usage

```
λ steelsky

▄█████ ▄▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄    ▄█████ ▄▄ ▄▄ ▄▄ ▄▄ 
▀▀▀▄▄▄   ██   ██▄▄  ██▄▄  ██    ▀▀▀▄▄▄ ██▄█▀ ▀███▀ 
█████▀   ██   ██▄▄▄ ██▄▄▄ ██▄▄▄ █████▀ ██ ██   █   

Usage: steelsky [options] [command]

CLI for SteelSky - Static Site Generator

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  build <inputDir> <outputDir>  Build the static site
  init <targetDir>              Copy the skeleton files to a new directory for quick project setup
  help [command]                display help for command
```

## Site Structure

A very minimal site structure looks like this:

```sh
site/
    chrome/
        header.html
        footer.html
    content/
        favicon.ico
        index.md
    templates/
    ssconfig.json
```

A typical site structure might look something like this:

```sh
site/
    chrome/
        header.html
        footer.html
    content/
        css/
            site.css
        font/
            font.css
        img/
            img.png
            logo.png
        js/
            script.ts
        posts/
            post1.md
            post2.md
        about.md
        favicon.ico
        index.md
        posts.md
    templates/
        my_template.md
        my_template.css
        my_template.ts
    types/
        SSTypes.ts
    ssconfig.json
    tsconfig.json
```

## Chrome

The site "chrome" is the header and footer content which is automatically added to every single page. 

These two files go in `./chrome`. 

You don't need to worry about setting up your actual `<head>` element since SteelSky will handle that for you. 

### Header

Use this file to set up things like sticky headers, navigation etc. 

### Footer

Use this file to set up your footer info and layout.

## Templates

### Template Definition

Template definitions are `.md` files places in `site/templates/`. 

Templates are reusable code blocks which can take optional parameters to fill in their data. A template might look like this:

```md
My template: {{ content }}
```

Where `{{ content }}` represents a string which will be replaced by the `content` parameter. 

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
- Each parameter has a default value which will be used if none is provided. 
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


## Typescript

SteelSky can automatically compile TS files. Just add a `tsconfig.json` to the root of the site data and set `compileTS: true` in the config. 

See the skeleton projects for an example `tsconfig.json`.

## Config (`ssconfig.json`)

The `./ssconfig.json` file is what you use to configure your SteelSky site. 

An example config might look like:

```json
{
  "siteTitle": "SteelSky Demo",
  "siteDescription": "SteelSky Demo Site",
  "siteImage": "/img/icon.png",
  "highlightStyle": "a11y-dark",
  "compileTs": true
}
```

## Page Front Matter & Metadata

Each page on the site take optional front matter:

````md
```/front
title=Page Title
description=A short description
image=/img/page-image.png
date=2026-01-01
```
````

### Accessing page metadata

SteelSky also calculates some additional metadata about the page. This metadata (including the page front matter) is available on the `window` object as `pageMeta`.


## Site Listing (`listing.json`)

SteelSky automatically generates a `./listing.json` file which includes metadata about the entire site. 

This file can be fetched and used by scripts as needed. 

```json
[
  {
    "title": "about",
    "description": "the about page for this site",
    "image": "/img/icon.png",
    "date": "2026-03-23T17:55:25.350Z",
    "path": "/about.html",
    "ext": ".html"
  },
  {
    "title": "site.css",
    "description": "",
    "image": "",
    "date": "2026-03-23T17:55:25.417Z",
    "path": "/css/site.css",
    "ext": ".css"
  },
  {
    "title": "favicon.ico",
    "description": "",
    "image": "",
    "date": "2026-03-23T17:55:25.417Z",
    "path": "/favicon.ico",
    "ext": ".ico"
  },
  ...
]
```
