var assert = require('assert');

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

//---------------
// object methods
//---------------

var PIPE = 'pipe';

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
  var proc = new Launcher(this.spawn);

  return proc;
};

Launcher.NewWithEmitter = function NewWithEmitter(ee) {
  var proc = this.NewEmpty();

  proc.events = ee;

  return proc;
};

Launcher.New = function New() {
  var ee   = this.emitter();
  var proc = this.NewWithEmitter(ee);

  proc.uid = this.process.getuid();
  proc.gid = this.process.getgid();
  proc.cwd = this.process.cwd();

  return proc;
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
