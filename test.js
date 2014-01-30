var assert = require('assert');

var Launcher = require('./index.js')();
var launcher = Launcher.New();

launcher.exec = process.argv[0];
launcher.args = ['-v'];

var i = 0;
launcher.events.on('exit', function () {
  if (i++ < 1) launcher.start();
});

launcher.start()

process.on('exit', function () {
  if (i !== 2) throw new Error('i should be 1, not ' + i);
  console.log('ok');
});
