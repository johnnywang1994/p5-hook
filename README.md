# p5-hook

`p5-hook` is a tiny plugin which lets you create p5 canvas with structure & modulize.


## Install

Install by `CDN` or `npm/yarn`

```bash
npm install use-p5
// or
yarn add use-p5
```



## Usage

### Basic CDN usage

```html
<div id="canvas-box"></div>
```

```js
const { useP5, createProcess, Particle } = p5Hook;

// use hook
const { initCanvas, addProcess, startAnimate } = useP5({
  animateState: false, // animateState when canvas initialized
  width: window.innerWidth,
  height: window.innerHeight,
  bgColor: 0,
  // if you use any p5 method in process
  // remember to also define a specific p5 method here
  on: {
    setup(p) {},
    preload(e, p) {},
    mouseClicked(e, p) {},
  },
});

// create process
const circleProcess = createProcess({
  beforeSetup() {
    // do something before setup
  },
  setup() {
    // this action will be combined & run together with other process in `setup` once
  },
  draw() {
    // this action will be combined & run together with other process in `draw` looping
  },
  // other p5 methods can be set in `on`
  // do not define `setup` or `draw` here, this will not have effect
  on: {
    mouseClicked() {
      console.log('canvas clicked!');
    },
  },
});

// initialize p5 canvas
const app = initCanvas(document.getElementById('canvas-box'));

// add process
addProcess(circleProcess);

// startAnimate just turn `animateState` to `true`
// p5hook will check it before drawing the canvas
startAnimate();
```


### Create Item

#### create before setup

```js
const circleProcess = createProcess({
  beforeSetup() {
    this.item = {
      x: 30,
      y: 30,
      radius: 100,
    };
  },
  draw(p) {
    const { item } = this;
    p.circle(item.x, item.y, item.radius);
  },
});
```

#### create items by DOM event

```js
const clickProcess = createProcess({
  draw(p) {
    const { items } = this;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      p.circle(item.x, item.y, item.radius);
    }
  },
});

// custom method still have two default param
// p => p5 instance
// options => { width, height... }
clickProcess.addMethod('create', function(p, options, a, b) {
  // other params
  console.log(a, b);
  if (!this.items) {
    this.items = [];
  }
  this.items.push({
    x: p.mouseX,
    y: p.mouseY,
    radius: 10,
  });
})

window.addEventListener('click', function() {
  clickProcess.create(a, b);
});
```


### Preload Image

```js
const imageProcess = createProcess({
  on: {
    preload(p) {
      this.image = p.loadImage('./test.png');
    },
  },
  draw(p) {
    const { image } = this;
    p.image(image, 0, 0);
  },
});
```



## API Documentation

### useP5

  - format: `useP5(options)`

#### options key/value
| key | type | value | default | requirement | others |
| --- | --- | --- | --- | --- | --- |
| animateState | boolean | true/false | none | required | --- |
| width | number | 1000 | none | required | --- |
| height | number | 300 | none | required | --- |
| bgColor | number/string | 0/`black` | 255 | optional | --- |
| on | object | {} | none | optional | --- |
| on[key] | function(p, options) | --- | none | optional | p: p5 instance, key: can be `setup` or `draw` |

#### returned object key/value
| key | type | description | others |
| --- | --- | --- | --- |
| initCanvas | function(el) | init canvas with p5, return p5 instance | el: dom node |
| addProcess | function(process) | add process to hook(must after init) | process: process object created by `createProcess` |
| startAnimate | function | allow p5 to draw things in page | --- |


### createProcess

  - format: `createProcess(processOptions)`

#### processOptions key/value
| key | type | value | default | requirement | others |
| --- | --- | --- | --- | --- | --- |
| beforeSetup | function(p, options) | --- | --- | optional | --- |
| setup | function(p, options) | --- | --- | optional | --- |
| draw | function(p, options) | --- | --- | optional | --- |
| on | object | --- | --- | optional | --- |
| on[key] | function(p, options) | --- | none | optional | key: can not be `setup` or `draw` |

#### returned object key/value
| key | type | description | others |
| --- | --- | --- | --- |
| addMethod | function(name, fn) | add method to process with `p` & `options` injected | name: key of process, fn: function with `p` & `options` injected |

> be aware that you can still define method on process in other ways, but with `addMethod`, it helps you redirect `this` to processObject & inject tool `p` & `options` into params.


### createParticle

  - format: `createParticle(p, particleOptions)`

#### particleOptions key/value
| key | type | value | default | requirement | others |
| --- | --- | --- | --- | --- | --- |
| radius | object | 6 | 10 | optional | --- |
| position | object | {x: 10, y: 10} | {x: 0, y: 0} | optional | --- |
| speed | object | {x: 10, y: 10} | {x: 0, y: 0} | optional | velocity |
| acc | object | {x: 10, y: 10} | {x: 0, y: 0} | optional | acceleration |
| angle | number | 0-360 | 0 | optional | angle of particle rotation |
| rotateSpeed | number | 0-360 | 0 | optional | velocity of rotation |
| color | number/string | 0 | 255 | optional | color of particle |
| opacity | number | 0-1 | 1 | optional | opacity of particle |
| life | number | 100 | -1 | optional | frame numbers, -1: permanent |
| image | 

#### usage

##### basic

```js
const particleProcess = createProcess({
  beforeSetup(p) {
    this.items = [];
    for (let i = 0; i < 10; i++) {
      const particle = createParticle({
        position: { x: 0, y: 0 },
        speed: { x: p.random(1), y: p.random(1) },
        life: 60,
      });
      // if life is not -1, you can define onDead method on particle
      particle.onDead = () => {
        // remove particle
        items.splice(items.indexOf(particle), 1);
      };
      this.items.push(particle);
    }
  },
  draw() {
    const { items } = this;
    if (items.length <= 0) return;
    for (let i = 0; i < items.length; i++) {
      const particle = items[i];
      particle.run(); // this will auto update & move particle
    }
  },
});
```

##### image particle

since we need to wait for image loaded in `setup`, we need to change `beforeSetup` into `setup`, then bind the loaded image object to particle options.

Make sure you have `preload` method define in your `useP5` option.

```js
const { initCanvas } = useP5({
  on: {
    preload(e, p, options) {
      // you can also preload things here
    },
  },
});

const particleProcess = createProcess({
  on: {
    preload(e, p) {
      this.testImg = p.loadImage('./test.png');
    },
  },
  setup(p) {
    const image = this.testImg;
    this.items = [];
    for (let i = 0; i < 10; i++) {
      const particle = createParticle({
        position: { x: 0, y: 0 },
        speed: { x: p.random(1), y: p.random(1) },
        life: 60,
        image, // just bind the loaded image to particle options
      });
      // ...
    }
  },
  // ...
});
```

## Last Updated

Plugin was latest updated at `2021/03/05` by `johnnywang`.
