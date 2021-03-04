import { useP5, createProcess, Particle } from '../src';

const { initCanvas, addProcess, startAnimate } = useP5({
  animateState: false, // animateState when canvas initialized
  width: window.innerWidth,
  height: window.innerHeight,
  bgColor: 0,
  // if you use any p5 method in process
  // remember to also define a specific p5 method here
  on: {
    setup(p) {
      p.pixelDensity(1);
    },
    mouseClicked() {
      console.log(123);
    },
  },
});

const clickProcess = createProcess({
  draw(p) {
    const { items } = this;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      p.circle(item.x, item.y, item.radius);
    }
  },
  on: {
    mouseClicked() {
      this.create(1);
    },
  },
});

clickProcess.addMethod('create', function(p, options) {
  if (!this.items) {
    this.items = [];
  }
  this.items.push({
    x: p.mouseX,
    y: p.mouseY,
    radius: 10,
  });
});

// initialize p5 canvas
const app = initCanvas(document.getElementById('canvas-box'));

// add process
addProcess(clickProcess);

// startAnimate just turn `animateState` in options to `true`
// p5hook will check it before drawing the canvas
startAnimate();
