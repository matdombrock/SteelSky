# STEEL SKY

A *very* lightweight, no BS static site generator written in NodeJS.

Automatically converts an arbitrary directory structure containing markdown and other static assets into a static site with no external dependencies. 

## Features
* Handles bulk conversion of Markdown files to HTML
* Preserves original arbitrary directory structure
* Supports arbitrary static assets
* Simple vanilla HTML/CSS "templating" system
  * Add your own front-end frameworks!
* No lock-in
  * Your original markdown files stay perfectly intact and portable
* Automatically generates a JSON site index file
  * Useful for site searches ect.
* Generated files have no external dependencies and can work fully offline
* As minimalist as possible while remaining functional and modern

## Depends On

* Showdown
* Showdown-highlight

## Install
```
npm install steelsky
```

## Initialize
You can init a new SteelSky project in an empty directory like this:
```
steelsky init
``` 

## How it Works
A basic SteelSky directory structure looks like this:
```
root/
--sscfg.json
--source/
----PageA.md
----PageB.md
----PageC.html
----Images/
------Image.jpg
---- ...
--layout/
----header.html
----footer.html
----theme.css
--build/
---- ...
```

When you run the `steelsky` command you will get some output in your `./build` directory like this:
```
build/
--PageA.md
--PageB.md
--PageC.html
--Images/
----Image.jpg
-- ...
```

These files can be served with any web server software you want. Such as Apache or NGinx.

## Config
SteelSky uses a very simple config file:
```json
{
    "sourcePath": "./source",
    "layoutPath": "./layout",
    "highlightStyle": "monokai-sublime",
    "outPath": "./build/"
}
```

Each property is required and there are no other properties which are not listed here.

## Why did I write this? 
Over the years I've had my site running on several different systems. Off the top of my head:
* Wordpress
* Jekyll
* Wordpress (again)
* [A custom static site generator I wrote in python](https://github.com/NebulaCyberSolutions/IronSky)
* Wordpress (again, I think)
* [Hexo](https://hexo.io/)
* [CMS.js](https://www.npmjs.com/package/cmsjs)

I won't go into to detail about why each one of these systems wasn't what I was looking for because ultimately they all had the same problem. **They are all much more complex than then need to be.** 

What I was looking for a was a system that would offer these features:
* Turn Markdown into valid HTML
* Handle syntax highlighting
* Handle indexing/listing files 

I think that a static site generator should be as simple as possible only doing the bare minim required to generate the site. 