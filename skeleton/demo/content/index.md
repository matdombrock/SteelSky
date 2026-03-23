```/front 
title=home
description=the home page for this site
extra=this is some extra metadata
```

```/jumbo```

# Welcome

This is an index

![game screenshot](/img/gamess.png)

## Code

```js
// JS CODE
function listLocalStorageKeys() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key);
  }
}

listLocalStorageKeys();
```

## Template Demo

```/test content="my template content"```

````markdown
```/test
content="my template content"
```
````

## Posts

```/posts max="3"```

[More Posts](/posts) | [RSS](/rss.xml)

## Card Template

```/card 
url="#" 
title="my title"
image="/img/icon.png"
body="
hello world
"
```

```/card 
url="#" 
title="my title"
image="/img/icon.png"
body="
hello world
"
```

````markdown
```/card 
url="#" 
title="my title"
image="/img/icon.png"
body="
hello world
"
```
````

```/debug```
