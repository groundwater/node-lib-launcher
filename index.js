var assert = require('assert');

// constants
var PIPE = 'pipe';

//-----------------
// class definition
//-----------------

function Launcher(spawn) {
  this._spawn = spawn;

  // EventEmitter
  this.events = null;

  this.exec   = "";
  this.args   = [];
  this.envs   = {};
  this.cwd    = "";
  this.uid    = 0;
  this.gid    = 0;
}

//-----------------
// instance methods
//-----------------

/*

  start a process

  - emits a new process each time it's called
  - the on/exit events are proxied to the launcher
  - stdio is always piped

*/
Launcher.prototype.start = function start(){
  var events = this.events;

  var opts = {
    stdio : PIPE,
    cwd   : this.cwd,
    uid   : this.uid,
    gid   : this.gid
  };
  var proc = this._spawn(this.exec, this.args, opts);

  proc.on('exit', function (code, signal) {
    events.emit('exit', code, signal);
  });

  proc.on('error', function (err) {
    events.emit('error', err);
  });

  return proc;
};

//----------------------
// injected dependencies
//----------------------

Launcher.spawn = null;

//-------------------
// class constructors
//-------------------

Launcher.NewEmpty = function NewEmpty() {
  var launcher = new Launcher(this.spawn);

  return launcher;
};

Launcher.NewWithEmitter = function NewWithEmitter(ee) {
  var launcher = this.NewEmpty();

  launcher.events = ee;

  return launcher;
};

/*

  create a new launcher module

  - uid/gid/cwd are initialized to sensible defaults
  - a new event emitter is created to handle events

*/
Launcher.New = function New() {
  var ee   = this.emitter();
  var launcher = this.NewWithEmitter(ee);

  launcher.uid = this.process.getuid();
  launcher.gid = this.process.getgid();
  launcher.cwd = this.process.cwd();

  return launcher;
};

Launcher.NewFromObject = function NewFromObject(obj) {
  var launcher = this.New();
  for (key in obj) {
    if (launcher[key] !== undefined) launcher[key] = obj[key];
  }

  return launcher;
};

//--------------------
// module constructors
//--------------------

// custom injector
function inject(deps) {
  // assert dependencies
  assert(deps.spawn, 'spawn dependency required');

  return Object.create(Launcher, deps);
};

// default injector
function inject_default() {
  var spawn   = require('child_process').spawn;
  var emitter = require('events').EventEmitter;
  var deps  = {
    spawn: {
      value: spawn
    },
    emitter: {
      value: function () {
        return new emitter();
      }
    },
    process: {
      value: process
    }
  }
  return inject(deps);
};

// module method
function INIT(deps) {
  if (typeof deps === 'object') return inject(deps);
  else if (deps === undefined)  return inject_default();
  else                          throw new Error('bad dependency injection');
};

INIT.inject         = inject;
INIT.inject_default = inject_default;
INIT.Launcher       = Launcher;

module.exports = INIT;
