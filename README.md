# lib-launcher

> process launcher

## Install

```bash
$ npm install --save lib-launcher
```

## Usage

```javascript
var Launcher = require('lib-launcher');
var launcher = Launcher.New();

launcher.exec = 'node';
launcher.args = ['server.js'];

launcher.events.on('error', function (err) {
  console.log(err);
});

launcher.events.on('exit', function () {
  console.log("server restarting");
  launcher.start();
});

launcher.start();
```
