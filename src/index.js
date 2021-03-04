import p5 from 'p5'

/**
 * Particle
 * @param {object} p p5 instance
 * @param {object} options particleOptions
 */
export function createParticle(p, options) {
  return new Particle(p, options);
}

function Particle(p, options) {
  this.options = Object.assign({
    acc: { x: 0, y: 0 },
    speed: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    // width: 10,
    // height: 10,
    // image
    angle: 0,
    rotateSpeed: 0,
    color: 255,
    opacity: 1,
    radius: 10,
    life: -1, // -1: infinite
  }, options);
  const { acc, speed, position, angle, rotateSpeed, life } = this.options;
  this.p = p;
  this.graphic = this.initGraphic();
  this.acceleration = p.createVector(acc.x, acc.y);
  this.velocity = p.createVector(speed.x, speed.y);
  this.position = p.createVector(position.x, position.y);
  this.rotateSpeed = rotateSpeed;
  this.angle = angle;
  this.life = life;
};

Particle.prototype.initGraphic = function() {
  const { p, options } = this;
  const { width, height, radius, image } = options;
  const useWidth = width && height;
  const graphic = useWidth
    ? p.createGraphics(width, height)
    : p.createGraphics(radius * 2, radius * 2);
  if (image) {
    if (useWidth) {
      graphic.image(image, -1, 0, width + 2, height);
    } else {
      graphic.image(image, -1, 0, radius * 2 + 2, radius * 2);
    }
  }
  return graphic;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

Particle.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.angle += this.rotateSpeed;
  if (this.life === -1) return;
  this.life -= 1;
  if (this.life <= 0) {
    this.onDead && this.onDead();
  }
};

Particle.prototype.display = function() {
  const { p, graphic, position, options, angle } = this;
  const { radius, opacity, color, width, height, image } = options;
  if (image) {
    // rotate image with graphic
    p.imageMode(p.CENTER);
    p.push();
    p.translate(position.x, position.y);
    p.rotate(p.PI/180 * angle);
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
export function createProcess(processOptions) {
  return new CanvasProcess(processOptions);
}

function CanvasProcess(processOptions) {
  const self = this;
  self.options = processOptions;
  self.items = [];
  self.app = null;
  self.context = null;
}

CanvasProcess.prototype.init = function initProcess(app, context) {
  const { options } = this;
  this.app = app;
  this.context = context;
  options.beforeSetup && options.beforeSetup.call(this, app, context);
}

CanvasProcess.prototype.setup = function setupItem(...args) {
  const { options, app, context } = this;
  if (options.setup) {
    options.setup.apply(this, [app, context, ...args]);
  }
}

CanvasProcess.prototype.draw = function drawItem(...args) {
  const { options, app, context } = this;
  if (options.draw) {
    options.draw.apply(this, [app, context, ...args]);
  }
}

CanvasProcess.prototype.addMethod = function addMethod(name, fn) {
  const process = this;
  if (process[name]) {
    throw Error('[p5-hook] property already defined in process.');
  }
  process[name] = function processMethod(...args) {
    const { app, context } = process;
    fn.apply(process, [app, context, ...args]);
  };
}


/**
 * createSketch
 * @param {object} options 
 */
function createSketch(options) {
  const { width, height, bgColor = 255, container, on } = options;
  return (p) => {
    // setup
    p.setup = function setupCanvas() {
      p.createCanvas(width, height);
      on.setup && on.setup.call(p, p, options);
      for (let i = 0; i < container.length; i++) {
        const process = container[i];
        process.setup();
      }
    };

    // draw
    p.draw = function drawCanvas() {
      if (!options.animateState) return;
      p.background(bgColor);
      on.draw && on.draw.call(p, p, options);
      for (let i = 0; i < container.length; i++) {
        const process = container[i];
        process.draw();
      }
    };

    // events or other p5 function
    for (let key in on) {
      if (['setup', 'draw'].includes(key)) continue;
      p[key] = function(event) {
        on[key].call(p, event, p, options);
        // loop process event
        for (let i = 0; i < container.length; i++) {
          const process = container[i];
          if (!process.options.on) continue;
          if (process.options.on[key]) {
            process.options.on[key].call(process, event, p, options);
          }
        }
      };
    }
  };
}


/**
 * useP5
 * @param {object} options 
 */
export function useP5(options) {
  let app;
  const processContainer = options.container = [];
  const sketch = createSketch(options);
  const context = options;

  function initCanvas(container) {
    app = new p5(sketch, container);
    return app;
  }

  function addProcess(...processes) {
    if (!app) {
      throw Error('[p5-hook] please initCanvas before adding process');
    }
    for (let i = 0; i < processes.length; i++) {
      processes[i].init(app, context);
    }
    processContainer.push(...processes);
  }

  function startAnimate() {
    options.animateState = true;
  }

  return {
    startAnimate,
    initCanvas,
    addProcess,
  };
}
