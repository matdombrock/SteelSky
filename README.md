# STEEL SKY

A *very* lightweight, no BS static site generator written in NodeJS.

Automatically converts an arbitrary directory structure containing markdown and other static assets into a static site with no external dependencies. 

## Install
```
npm install steelsky
```

## Features
* Handles bulk conversion of Markdown files to HTMl
* Preserves original arbitrary directory structure
* Supports arbitrary static assets
* Simple vanilla HTML/CSS "templating" system
  * Add your own front-end frameworks!
* No lock-in
  * Your original markdown files stay perfectly intact and portable
* Generated files have no external dependencies and can work fully offline
* Under 100 lines of code

## Depends On

* Showdown
* Showdown-highlight

## Example

See the [SteelSky Example Project Repo](https://github.com/matdombrock/SteelSkyExample) for an example of how to get started.

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