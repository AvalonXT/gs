Prototype: http://www.mode-games.com/

## Requirements ##

node, npm, grunt

## Installation and first run ##

```
#!bash

git clone git@bitbucket.org:gerkirill/game-space.git && cd game-space
npm install
grunt init
node app.js
```

Open http://localhost:3000/

## Development tools ##
Run the following in separate console in order to automatically rebuild .css files when you update .less:

```
#!bash
grunt watch-css
```