(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('p5')) :
  typeof define === 'function' && define.amd ? define(['exports', 'p5'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.p5Hook = {}, global.p5));
}(this, (function (exports, p5) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var p5__default = /*#__PURE__*/_interopDefaultLegacy(p5);

  /**
   * Particle
   * @param {object} p p5 instance
   * @param {object} options particleOptions
   */

  function createParticle(p, options) {
    return new Particle(p, options);
  }

  function Particle(p, options) {
    this.options = Object.assign({
      acc: {
        x: 0,
        y: 0
      },
      speed: {
        x: 0,
        y: 0
      },
      position: {
        x: 0,
        y: 0
      },
      // width: 10,
      // height: 10,
      // image
      angle: 0,
      rotateSpeed: 0,
      color: 255,
      opacity: 1,
      radius: 10,
      life: -1 // -1: infinite

    }, options);
    var _this$options = this.options,
        acc = _this$options.acc,
        speed = _this$options.speed,
        position = _this$options.position,
        angle = _this$options.angle,
        rotateSpeed = _this$options.rotateSpeed,
        life = _this$options.life;
    this.p = p;
    this.graphic = this.initGraphic();
    this.acceleration = p.createVector(acc.x, acc.y);
    this.velocity = p.createVector(speed.x, speed.y);
    this.position = p.createVector(position.x, position.y);
    this.rotateSpeed = rotateSpeed;
    this.angle = angle;
    this.life = life;
  }

  Particle.prototype.initGraphic = function () {
    var p = this.p,
        options = this.options;
    var width = options.width,
        height = options.height,
        radius = options.radius,
        image = options.image;
    var useWidth = width && height;
    var graphic = useWidth ? p.createGraphics(width, height) : p.createGraphics(radius * 2, radius * 2);

    if (image) {
      if (useWidth) {
        graphic.image(image, -1, 0, width + 2, height);
      } else {
        graphic.image(image, -1, 0, radius * 2 + 2, radius * 2);
      }
    }

    return graphic;
  };

  Particle.prototype.run = function () {
    this.update();
    this.display();
  };

  Particle.prototype.update = function () {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.angle += this.rotateSpeed;
    if (this.life === -1) return;
    this.life -= 1;

    if (this.life <= 0) {
      this.onDead && this.onDead();
    }
  };

  Particle.prototype.display = function () {
    var p = this.p,
        graphic = this.graphic,
        position = this.position,
        options = this.options,
        angle = this.angle;
    var radius = options.radius,
        opacity = options.opacity,
        color = options.color,
        width = options.width,
        height = options.height,
        image = options.image;

    if (image) {
      // rotate image with graphic
      p.imageMode(p.CENTER);
      p.push();
      p.translate(position.x, position.y);
      p.rotate(p.PI / 180 * angle);
      p.image(graphic, 0, 0);
      p.pop();
      return;
    }

    p.stroke(255, 0);
    p.strokeWeight(1);
    p.fill(color, opacity * 255);

    if (radius) {
      p.circle(position.x, position.y, radius);
    } else {
      p.ellipse(position.x, position.y, width, height);
    }
  };
  /**
   * createProcess
   * @param {object} processOptions 
   */


  function createProcess(processOptions) {
    return new CanvasProcess(processOptions);
  }

  function CanvasProcess(processOptions) {
    var self = this;
    self.options = processOptions;
    self.items = [];
    self.app = null;
    self.context = null;
  }

  CanvasProcess.prototype.init = function initProcess(app, context) {
    var options = this.options;
    this.app = app;
    this.context = context;
    options.beforeSetup && options.beforeSetup.call(this, app, context);
  };

  CanvasProcess.prototype.setup = function setupItem() {
    var options = this.options,
        app = this.app,
        context = this.context;

    if (options.setup) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      options.setup.apply(this, [app, context].concat(args));
    }
  };

  CanvasProcess.prototype.draw = function drawItem() {
    var options = this.options,
        app = this.app,
        context = this.context;

    if (options.draw) {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      options.draw.apply(this, [app, context].concat(args));
    }
  };

  CanvasProcess.prototype.addMethod = function addMethod(name, fn) {
    var process = this;

    if (process[name]) {
      throw Error('[p5-hook] property already defined in process.');
    }

    process[name] = function processMethod() {
      var app = process.app,
          context = process.context;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      fn.apply(process, [app, context].concat(args));
    };
  };
  /**
   * createSketch
   * @param {object} options 
   */


  function createSketch(options) {
    var width = options.width,
        height = options.height,
        _options$bgColor = options.bgColor,
        bgColor = _options$bgColor === void 0 ? 255 : _options$bgColor,
        container = options.container,
        on = options.on;
    return function (p) {
      // setup
      p.setup = function setupCanvas() {
        p.createCanvas(width, height);
        on.setup && on.setup.call(p, p, options);

        for (var i = 0; i < container.length; i++) {
          var process = container[i];
          process.setup();
        }
      }; // draw


      p.draw = function drawCanvas() {
        if (!options.animateState) return;
        p.background(bgColor);
        on.draw && on.draw.call(p, p, options);

        for (var i = 0; i < container.length; i++) {
          var process = container[i];
          process.draw();
        }
      }; // events or other p5 function


      var _loop = function _loop(key) {
        if (['setup', 'draw'].includes(key)) return "continue";

        p[key] = function (event) {
          on[key].call(p, event, p, options); // loop process event

          for (var i = 0; i < container.length; i++) {
            var process = container[i];
            if (!process.options.on) continue;

            if (process.options.on[key]) {
              process.options.on[key].call(process, event, p, options);
            }
          }
        };
      };

      for (var key in on) {
        var _ret = _loop(key);

        if (_ret === "continue") continue;
      }
    };
  }
  /**
   * useP5
   * @param {object} options 
   */


  function useP5(options) {
    var app;
    var processContainer = options.container = [];
    var sketch = createSketch(options);
    var context = options;

    function initCanvas(container) {
      app = new p5__default['default'](sketch, container);
      return app;
    }

    function addProcess() {
      if (!app) {
        throw Error('[p5-hook] please initCanvas before adding process');
      }

      for (var _len4 = arguments.length, processes = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        processes[_key4] = arguments[_key4];
      }

      for (var i = 0; i < processes.length; i++) {
        processes[i].init(app, context);
      }

      processContainer.push.apply(processContainer, processes);
    }

    function startAnimate() {
      options.animateState = true;
    }

    return {
      startAnimate: startAnimate,
      initCanvas: initCanvas,
      addProcess: addProcess
    };
  }

  exports.createParticle = createParticle;
  exports.createProcess = createProcess;
  exports.useP5 = useP5;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
